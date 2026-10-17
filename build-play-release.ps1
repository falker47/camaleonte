# Build a signed Google Play Android App Bundle using ONLY local signing files.
# Never put signing.properties, *.jks or *.keystore in Git or GitHub Actions.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = $PSScriptRoot
$allowedBranches = @('master', 'release/camaleonte-1.1.1-play')
$branch = (& git -C $repoRoot branch --show-current).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -notin $allowedBranches) {
  throw "Usa il branch master aggiornato o release/camaleonte-1.1.1-play. Branch corrente: $branch"
}

$dirty = @(& git -C $repoRoot status --porcelain)
if ($LASTEXITCODE -ne 0 -or $dirty.Count -gt 0) {
  throw 'Il repository contiene modifiche non salvate. Verificale prima della build.'
}

$gradlePath = Join-Path $repoRoot 'android\app\build.gradle'
$gradle = Get-Content -LiteralPath $gradlePath -Raw
if ($gradle -notmatch '(?m)^\s*versionCode\s+12\s*$' -or
    $gradle -notmatch '(?m)^\s*versionName\s+"1\.1\.1"\s*$') {
  throw 'Versione Android inattesa: questa candidata deve essere 1.1.1 (12).'
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
    & .\gradlew.bat --no-daemon :app:bundleRelease
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
  Write-Host 'BUILD PLAY 1.1.1 (12): FIRMATA E VERIFICATA' -ForegroundColor Green
  Write-Host "AAB: $($fileInfo.FullName)"
  Write-Host "Dimensione: $($fileInfo.Length) byte"
  Write-Host "SHA256: $($hash.Hash)"
  Write-Host 'Caricare solo dopo avere ricontrollato Panoramica della pubblicazione in Play Console.'
} finally { Pop-Location }
