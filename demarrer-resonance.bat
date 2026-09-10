@echo off
chcp 65001 >nul
echo ===============================
echo  RESONANCE - demarrage
echo ===============================
echo  API : http://localhost:3001/api/health
echo  JEU : http://localhost:5173
echo.

REM API
start "RESONANCE API :3001" cmd /k "cd /d "%~dp0app\server" && npm run dev"

REM JEU
start "RESONANCE JEU :5173" cmd /k "cd /d "%~dp0app\client" && npm run dev"

echo Attente du demarrage (5s)...
timeout /t 5 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Pret. Laisse les 2 fenetres ouvertes.
echo Ferme-les pour arreter.
pause
