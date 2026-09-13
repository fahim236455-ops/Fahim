@echo off
echo =======================================================
echo Earnora Platform - Auto Setup and Run Script
echo =======================================================
echo.
echo Installing required files (Please wait)...
call npm install

echo.
echo Starting the server...
echo Please open http://localhost:3000 in your browser!
echo.
call npm run dev
pause
