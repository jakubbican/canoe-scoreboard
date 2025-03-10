@echo off
echo ===================================
echo Canoe Scoreboard Build Script
echo ===================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: Node.js is not installed or not in the PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found: 
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: npm is not installed or not in the PATH.
    echo This is unusual as npm is typically installed with Node.js.
    pause
    exit /b 1
)

echo npm found:
npm --version
echo.

REM Check if this script is running from the project directory
if not exist "package.json" (
    echo ERROR: package.json not found.
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo ===================================
echo Installing dependencies...
echo ===================================
call npm install
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to install dependencies.
    pause
    exit /b 1
)
echo.

echo ===================================
echo Preparing assets...
echo ===================================
if not exist "scripts\prepare-assets.js" (
    echo ERROR: Asset preparation script not found.
    pause
    exit /b 1
)

node scripts\prepare-assets.js
if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to prepare assets.
    pause
    exit /b 1
)
echo.

echo ===================================
echo Building for production...
echo ===================================
call npm run build
if %ERRORLEVEL% neq 0 (
    echo ERROR: Build failed.
    pause
    exit /b 1
)
echo.

echo ===================================
echo Build completed successfully!
echo ===================================
echo The production files are in the 'dist' directory.
echo.

REM Ask if the user wants to preview the build
set /p PREVIEW="Do you want to preview the build? (Y/N): "
if /i "%PREVIEW%"=="Y" (
    echo Starting preview server...
    start npm run preview
    echo Preview server started. Opening browser...
    timeout /t 3 > nul
    start http://localhost:4173
)

REM Ask if the user wants to copy the build to a specific location
set /p COPY="Do you want to copy the build to another location? (Y/N): "
if /i "%COPY%"=="Y" (
    set /p DEST="Enter destination path: "
    if not exist "%DEST%" (
        echo Creating directory %DEST%...
        mkdir "%DEST%"
    )
    
    echo Copying files to %DEST%...
    xcopy "dist\*" "%DEST%" /E /I /Y
    
    if %ERRORLEVEL% neq 0 (
        echo ERROR: Failed to copy files.
    ) else (
        echo Files copied successfully to %DEST%
    )
)

echo.
echo ===================================
echo Thank you for using Canoe Scoreboard!
echo ===================================
pause