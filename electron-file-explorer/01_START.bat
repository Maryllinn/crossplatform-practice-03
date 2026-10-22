@echo off
set "ELECTRON_RUN_AS_NODE="
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found. Install Node.js LTS 24.x and reopen this file.
  pause
  exit /b 1
)
echo Installing dependencies (first run may take a few minutes)...
call npm install
if errorlevel 1 (
  echo Installation failed. Please copy the full error text.
  pause
  exit /b 1
)
echo Starting Electron...
call npm start
if errorlevel 1 echo Electron exited with an error.
pause
