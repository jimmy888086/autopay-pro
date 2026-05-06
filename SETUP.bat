@echo off
title AutoPay Pro - GitHub Setup
color 0A
echo.
echo ================================================
echo   AutoPay Pro - Auto Upload to GitHub
echo ================================================
echo.

git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install from https://git-scm.com/download/win
    pause
    exit
)

echo Git found OK
echo.

set /p GITHUB_USER=Enter your GitHub username (jimmy888086): 
if "%GITHUB_USER%"=="" set GITHUB_USER=jimmy888086

echo.
echo You need a GitHub Personal Access Token.
echo Go to: https://github.com/settings/tokens/new
echo Check: repo + workflow
echo.
set /p GITHUB_TOKEN=Paste your token here: 

if "%GITHUB_TOKEN%"=="" (
    echo ERROR: Token cannot be empty!
    pause
    exit
)

echo.
echo Setting up repository...
echo.

git init
git config user.email "autopay@pro.com"
git config user.name "%GITHUB_USER%"

mkdir src 2>nul
copy App.jsx src\App.jsx >nul
copy main.jsx src\main.jsx >nul
mkdir .github\workflows 2>nul
copy build-apk.yml .github\workflows\build-apk.yml >nul

REM Copy icon files
if exist android-icons (
    xcopy android-icons android-icons /E /I /Y >nul 2>&1
)

git add .
git commit -m "AutoPay Pro - Initial upload"

git remote remove origin 2>nul
git remote add origin https://%GITHUB_TOKEN%@github.com/%GITHUB_USER%/autopay-pro.git

echo.
echo Uploading to GitHub...
echo.

git branch -M main
git push -u origin main --force

if errorlevel 1 (
    echo.
    echo UPLOAD FAILED. Please check your token and try again.
    pause
    exit
)

echo.
echo ================================================
echo   SUCCESS! Files uploaded to GitHub!
echo ================================================
echo.
echo Now go to:
echo https://github.com/%GITHUB_USER%/autopay-pro/actions
echo.
echo Wait 10-15 minutes for the green checkmark.
echo Then download your APK!
echo.
pause
