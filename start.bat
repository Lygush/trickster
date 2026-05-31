@echo off
set ROOT=%~dp0

echo Building client-screen...
cd "%ROOT%client-screen"
call npm install --silent
call npm run build
if errorlevel 1 ( echo ERROR: client-screen build failed & pause & exit /b 1 )

echo Building client-phone...
cd "%ROOT%client-phone"
call npm install --silent
call npm run build
if errorlevel 1 ( echo ERROR: client-phone build failed & pause & exit /b 1 )

echo Installing server deps...
cd "%ROOT%server"
call npm install --silent
if errorlevel 1 ( echo ERROR: server npm install failed & pause & exit /b 1 )

echo Starting server... (Ctrl+C to stop)
node src/index.js
