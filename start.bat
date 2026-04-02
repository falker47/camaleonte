@echo off
title Mr. White - Dev Server
cd /d "%~dp0"

echo.
echo  ===================================
echo   Mr. White - Avvio server locale
echo  ===================================
echo.
echo  [1] Dev server  (rapido, no PWA)
echo  [2] Preview PWA (build + test PWA)
echo.
set /p scelta="Scegli [1/2]: "

if "%scelta%"=="2" goto preview

:dev
echo.
echo  Avvio dev server...
echo  App disponibile su: http://localhost:5173
echo.
start "" "http://localhost:5173"
npm run dev
goto fine

:preview
echo.
echo  Build in corso...
npm run build
if errorlevel 1 (
  echo.
  echo  ERRORE durante la build!
  pause
  exit /b 1
)
echo.
echo  Avvio preview server...
echo  App disponibile su: http://localhost:4173
echo  Per testare su telefono: http://[tuo-ip]:4173
echo.
start "" "http://localhost:4173"
npm run preview

:fine
pause
