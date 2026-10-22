@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js not found. Install Node.js LTS 24.x first.
  pause
  exit /b 1
)
if not exist "node_modules" (
  echo Dependencies are not installed yet. Installing...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)
echo Building Windows installer...
call npm run dist:win
if errorlevel 1 (
  echo Build failed. Check the error shown above.
  pause
  exit /b 1
)
echo.
echo Build complete. Find the installer in dist folder.
start "" "%~dp0dist"
pause
