# Build a signed Google Play Android App Bundle using ONLY local signing files.
# Never put signing.properties, *.jks or *.keystore in Git or GitHub Actions.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot
$allowedBranches = @('master', 'release/camaleonte-1.1.3-play')
$branch = (& git -C $repoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -notin $allowedBranches) {
  throw "Usa il branch master aggiornato o release/camaleonte-1.1.2-play. Branch corrente: $branch"
}

# Capacitor sync regenerates these two tracked files even without a manual edit.
# Accept ONLY unstaged modifications to these precise generated paths.
# Keep all other staged, unstaged, deleted or untracked changes blocking.
function Get-UnexpectedWorktreeChanges {
  param([string[]]$Changes = @())
  @($Changes | Where-Object {
    $_ -ne ' M android/app/capacitor.build.gradle' -and
    $_ -ne ' M android/capacitor.settings.gradle'
  })
}

$dirty = @(& git -C $repoRoot status --porcelain)
if ($LASTEXITCODE -ne 0) { throw 'Impossibile verificare lo stato Git prima della build.' }
$unexpected = @(Get-UnexpectedWorktreeChanges -Changes $dirty)
if ($unexpected.Count -gt 0) {
  throw "Il repository contiene modifiche non previste: $($unexpected -join ', '). Verificale prima della build."
}
if ($dirty.Count -gt 0) {
  Write-Host 'Preflight Git: consentite soltanto modifiche non staged ai due file Gradle generati da Capacitor.' -ForegroundColor Cyan
}

$gradlePath = Join-Path $repoRoot 'android\app\build.gradle'
$gradle = Get-Content -LiteralPath $gradlePath -Raw
if ($gradle -notmatch '(?m)^\s*versionCode\s+14\s*$' -or
    $gradle -notmatch '(?m)^\s*versionName\s+"1\.1\.3"\s*$') {
  throw 'Versione Android inattesa: questa candidata deve essere 1.1.3 (14).'
}

$signingProps = Join-Path $repoRoot 'android\app\signing.properties'
if (-not (Test-Path -LiteralPath $signingProps -PathType Leaf)) {
  throw 'Manca android\app\signing.properties. Usa il file di firma locale già utilizzato per le precedenti release Play; non inviarlo in chat o GitHub.'
}

$propsText = Get-Content -LiteralPath $signingProps -Raw
foreach ($key in @('storeFile', 'storePassword', 'keyAlias', 'keyPassword')) {
  if ($propsText -notmatch "(?m)^\s*$key\s*=\s*\S+") {
    throw "Il file signing.properties non contiene il campo obbligatorio $key."
  }
}

$nodeVersionText = (& node --version)
if ($LASTEXITCODE -ne 0) { throw 'Node.js non trovato. Installa Node.js 22 o superiore.' }
$nodeMajor = [int](($nodeVersionText.TrimStart('v') -split '\.')[0])
if ($nodeMajor -lt 22) { throw 'Capacitor 8 richiede Node.js >= 22.' }

# Android/Capacitor compiles Java 21. Resolve a local JDK 21 BEFORE the
# expensive npm/web steps, so an older JAVA_HOME cannot fail after minutes.
function Get-UsableJdk21 {
  $homes = New-Object 'System.Collections.Generic.List[string]'
  $parents = New-Object 'System.Collections.Generic.List[string]'

  foreach ($candidate in @($env:JAVA_HOME, $env:JDK_HOME)) {
    if (-not [string]::IsNullOrWhiteSpace($candidate)) { $homes.Add($candidate) }
  }

  $javacOnPath = Get-Command javac.exe -ErrorAction SilentlyContinue
  if ($javacOnPath -and $javacOnPath.Source) {
    $homes.Add((Split-Path -Parent (Split-Path -Parent $javacOnPath.Source)))
  }

  if ($env:ProgramFiles) {
    $homes.Add((Join-Path $env:ProgramFiles 'Android\Android Studio\jbr'))
    foreach ($folder in @('Eclipse Adoptium', 'Java', 'Microsoft', 'Amazon Corretto', 'Zulu', 'BellSoft', 'AdoptOpenJDK')) {
      $parents.Add((Join-Path $env:ProgramFiles $folder))
    }
  }
  if ($env:LOCALAPPDATA) {
    $parents.Add((Join-Path $env:LOCALAPPDATA 'Programs\Eclipse Adoptium'))
    $parents.Add((Join-Path $env:LOCALAPPDATA 'Programs\Java'))
  }
  if ($env:USERPROFILE) {
    $parents.Add((Join-Path $env:USERPROFILE '.jdks'))
  }

  foreach ($parent in $parents) {
    if (-not (Test-Path -LiteralPath $parent -PathType Container)) { continue }
    foreach ($child in @(Get-ChildItem -LiteralPath $parent -Directory -ErrorAction SilentlyContinue)) {
      $homes.Add($child.FullName)
    }
  }

  foreach ($jdkCandidate in @($homes | Select-Object -Unique)) {
    $jdkCandidate = $jdkCandidate.Trim().Trim('"')
    $compiler = Join-Path $jdkCandidate 'bin\javac.exe'
    $java = Join-Path $jdkCandidate 'bin\java.exe'
    if (-not (Test-Path -LiteralPath $compiler -PathType Leaf) -or
        -not (Test-Path -LiteralPath $java -PathType Leaf)) { continue }

    try {
      $version = (& $compiler -version 2>&1) -join ' '
      if ($LASTEXITCODE -eq 0 -and $version -match '(?i)\bjavac\s+21(?:[.\s]|$)') {
        return $jdkCandidate
      }
    } catch {
      # Try the next local installation.
    }
  }
  return $null
}

$java21Home = Get-UsableJdk21
if (-not $java21Home) {
  throw 'JDK 21 non trovato. Installa Eclipse Temurin 21 con: winget install --id EclipseAdoptium.Temurin.21.JDK --exact --source winget. Riapri PowerShell, aggiorna il repo e riesegui build-play-release.ps1. Se JDK 21 e gia installato in una cartella non standard, imposta JAVA_HOME a tale cartella.'
}

$env:JAVA_HOME = $java21Home
$env:Path = "$(Join-Path $java21Home 'bin');$env:Path"
Write-Host "JDK 21 selezionato: $java21Home" -ForegroundColor Cyan

Push-Location -LiteralPath $repoRoot
try {
  & npm.cmd ci
  if ($LASTEXITCODE -ne 0) { throw 'npm ci fallito.' }
  & npm.cmd run test:core
  if ($LASTEXITCODE -ne 0) { throw 'Test falliti, rilascio bloccato.' }
  & npm.cmd run build:android
  if ($LASTEXITCODE -ne 0) { throw 'Build web/sync Android fallita.' }

  Push-Location -LiteralPath (Join-Path $repoRoot 'android')
  try {
    & .\gradlew.bat --no-daemon "-Dorg.gradle.java.home=$java21Home" :app:bundleRelease
    if ($LASTEXITCODE -ne 0) { throw 'Gradle bundleRelease fallito.' }
  } finally { Pop-Location }

  $bundle = Join-Path $repoRoot 'android\app\build\outputs\bundle\release\app-release.aab'
  if (-not (Test-Path -LiteralPath $bundle -PathType Leaf)) {
    throw 'App Bundle non trovato dopo la compilazione.'
  }

  $verification = @(& jarsigner '-J-Duser.language=en' '-J-Duser.country=US' -verify -verbose $bundle 2>&1)
  if ($LASTEXITCODE -ne 0 -or (($verification -join "`n") -notmatch 'jar verified')) {
    throw 'Firma AAB non verificata. Non caricare questo file su Google Play.'
  }

  $fileInfo = Get-Item -LiteralPath $bundle
  $hash = Get-FileHash -LiteralPath $bundle -Algorithm SHA256
  Write-Host ''
  Write-Host 'BUILD PLAY 1.1.3 (14): FIRMATA E VERIFICATA' -ForegroundColor Green
  Write-Host "AAB: $($fileInfo.FullName)"
  Write-Host "Dimensione: $($fileInfo.Length) byte"
  Write-Host "SHA256: $($hash.Hash)"
  Write-Host 'Caricare solo dopo avere ricontrollato Panoramica della pubblicazione in Play Console.'
} finally { Pop-Location }
