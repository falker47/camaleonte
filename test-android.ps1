param(
  [switch]$NoPull,
  [switch]$SkipBuild,
  [switch]$NoLaunch
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$packageName = 'com.falker.camaleonte'
$repoRoot = $PSScriptRoot
$androidDir = Join-Path $repoRoot 'android'

if (-not $env:LOCALAPPDATA) {
  throw 'LOCALAPPDATA non disponibile: impossibile trovare Android SDK.'
}

$adb = Join-Path $env:LOCALAPPDATA 'Android\Sdk\platform-tools\adb.exe'
if (-not (Test-Path $adb)) {
  throw "ADB non trovato: $adb"
}

function Assert-LastExitCode([string]$step) {
  if ($LASTEXITCODE -ne 0) {
    throw "$step fallito (exit code $LASTEXITCODE)."
  }
}

Push-Location $repoRoot
try {
  Write-Host ''
  Write-Host '=== Camaleonte Android test runner ===' -ForegroundColor Cyan

  if (-not $NoPull) {
    Write-Host '[1/5] Aggiorno il repository...'
    & git pull --ff-only
    Assert-LastExitCode 'git pull --ff-only'
  } else {
    Write-Host '[1/5] Git pull saltato (-NoPull).'
  }

  $deviceLines = @(& $adb devices)
  Assert-LastExitCode 'adb devices'
  $devices = @($deviceLines | Where-Object { $_ -match '\tdevice$' })

  if ($devices.Count -eq 0) {
    throw 'Nessun telefono Android disponibile via ADB. Collega il telefono, abilita debug USB e autorizza il PC.'
  }
  if ($devices.Count -gt 1) {
    throw 'Sono collegati piu dispositivi ADB. Lascia collegato solo il telefono da testare.'
  }

  Write-Host '[2/5] Telefono ADB rilevato.'

  if (-not $SkipBuild) {
    if (-not (Test-Path (Join-Path $repoRoot 'node_modules'))) {
      Write-Host '[3/5] Dipendenze mancanti: eseguo npm ci...'
      & npm.cmd ci
      Assert-LastExitCode 'npm ci'
    } else {
      Write-Host '[3/5] Dipendenze gia presenti.'
    }

    Write-Host '[4/5] Build web + sync Capacitor + APK debug...'
    & npm.cmd run build:android
    Assert-LastExitCode 'npm run build:android'

    Push-Location $androidDir
    try {
      & .\gradlew.bat installDebug
      Assert-LastExitCode 'gradlew installDebug'
    }
    finally {
      Pop-Location
    }
  } else {
    Write-Host '[3/5] Build saltata (-SkipBuild).'
    Write-Host '[4/5] Reinstallo l APK debug esistente...'
    $apk = Join-Path $repoRoot 'android\app\build\outputs\apk\debug\app-debug.apk'
    if (-not (Test-Path $apk)) {
      throw "APK non trovato: $apk. Riesegui senza -SkipBuild."
    }
    & $adb install -r $apk
    Assert-LastExitCode 'adb install -r'
  }

  if (-not $NoLaunch) {
    Write-Host '[5/5] Avvio Camaleonte sul telefono...'
    & $adb shell am force-stop $packageName | Out-Null
    Assert-LastExitCode 'adb force-stop'
    & $adb shell am start -n "$packageName/.MainActivity" | Out-Null
    Assert-LastExitCode 'adb start'
  } else {
    Write-Host '[5/5] Avvio app saltato (-NoLaunch).'
  }

  Write-Host ''
  Write-Host 'Pronto: build installata. Testa ora sul telefono.' -ForegroundColor Green
}
finally {
  Pop-Location
}
