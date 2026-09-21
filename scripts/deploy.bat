@echo off
setlocal

rem ============================================================
rem  CULT - update repository and deploy to Vercel.
rem  Double-click: unpacks the update, copies it into the repo,
rem  commits and pushes to GitHub. Vercel then rebuilds itself.
rem  ASCII only and CRLF line endings on purpose: cmd.exe breaks
rem  batch files with UTF-8 text or Unix line endings.
rem ============================================================

set "DL=%USERPROFILE%\Downloads"
set "PKG=%DL%\cult-update.zip"
set "WORKDIR=%DL%\cult-tmp"
set "REPO=%DL%\cult-restaurant"

echo.
echo   CULT - project update
echo   =====================
echo.

if not exist "%PKG%" (
  echo   [!] Not found: %PKG%
  goto fail
)
if not exist "%REPO%\.git" (
  echo   [!] No git repository in %REPO%
  goto fail
)

echo   [1/4] Unpacking update...
if exist "%WORKDIR%\" rmdir /s /q "%WORKDIR%"
powershell -NoProfile -Command "Expand-Archive -LiteralPath '%PKG%' -DestinationPath '%WORKDIR%' -Force"
if errorlevel 1 goto fail
if not exist "%WORKDIR%\cult-restaurant\package.json" (
  echo   [!] Archive has unexpected layout.
  goto fail
)

echo   [2/4] Copying files into the repository...
robocopy "%WORKDIR%\cult-restaurant" "%REPO%" /E /XD node_modules .git build data /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 goto fail

echo   [3/4] Creating commit...
pushd "%REPO%"
git add -A
git diff --cached --quiet
if errorlevel 1 (
  git commit -q -m "Update CULT menu"
) else (
  echo         Nothing changed, no commit needed.
)

echo   [4/4] Pushing to GitHub...
git push
if errorlevel 1 (
  popd
  goto fail
)
popd

if exist "%WORKDIR%\" rmdir /s /q "%WORKDIR%"

echo.
echo   DONE. Vercel will start a new build in a few seconds.
echo.
goto end

:fail
echo.
echo   [!] Something went wrong. Copy the lines above and send them.
echo.

:end
pause
