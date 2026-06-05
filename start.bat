@echo off
setlocal
set "ROOT=%~dp0"

goto :main

:: ── Функция: нужна ли пересборка? ──────────────────────────────────────────
:: Аргумент %1 — папка проекта (client-screen или client-phone)
:: Возвращает ERRORLEVEL 1 = нужна сборка, 0 = всё актуально
:needs_rebuild
set "CHECK_DIR=%~1"
if not exist "%CHECK_DIR%\build" ( exit /b 1 )
powershell -NoProfile -Command "$d='%CHECK_DIR%'; $f=(Get-ChildItem($d+'\src') -Recurse -File | Sort-Object LastWriteTime | Select-Object -Last 1); if(!$f){exit 0}; if($f.LastWriteTime -gt (Get-Item($d+'\build')).LastWriteTime){exit 1}else{exit 0}"
exit /b %ERRORLEVEL%

:main
echo ================================================
echo   Trickster -- zapusk
echo ================================================
echo.

:: ── [1/3] client-screen ─────────────────────────────────────────────────────
echo [1/3] client-screen...
call :needs_rebuild "%ROOT%client-screen"
if %ERRORLEVEL% equ 1 (
    echo   Izmenenia naydeni -- peresborka...
    cd /d "%ROOT%client-screen"
    call npm install --silent
    if errorlevel 1 ( echo OSHIBKA npm install & pause & exit /b 1 )
    call npm run build
    if errorlevel 1 ( echo OSHIBKA npm build & pause & exit /b 1 )
    echo   Gotovo.
) else (
    echo   Bez izmeneniy -- propuskaem.
)
echo.

:: ── [2/3] client-phone ──────────────────────────────────────────────────────
echo [2/3] client-phone...
call :needs_rebuild "%ROOT%client-phone"
if %ERRORLEVEL% equ 1 (
    echo   Izmenenia naydeni -- peresborka...
    cd /d "%ROOT%client-phone"
    call npm install --silent
    if errorlevel 1 ( echo OSHIBKA npm install & pause & exit /b 1 )
    call npm run build
    if errorlevel 1 ( echo OSHIBKA npm build & pause & exit /b 1 )
    echo   Gotovo.
) else (
    echo   Bez izmeneniy -- propuskaem.
)
echo.

:: ── [3/3] server ────────────────────────────────────────────────────────────
echo [3/3] Server...
cd /d "%ROOT%server"
if not exist "node_modules" (
    echo   Ustanavlivaem zavisimosti...
    call npm install --silent
    if errorlevel 1 ( echo OSHIBKA & pause & exit /b 1 )
) else (
    echo   Zavisimosti uzhe ustanovleni.
)
echo.
echo ================================================
echo   Server zapushen. Ctrl+C dlya ostanovki.
echo ================================================
echo.
powershell -NoProfile -Command "& { node src/index.js }"

cd /d "%ROOT%"
echo.
echo Server ostanovlen.
pause > nul
exit /b 0
