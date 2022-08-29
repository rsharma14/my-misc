@echo off
SET SDTIME=100
SET /p "SDTIME=Enter time to shutdown:"
echo "System will be shutdown after %SDTIME% sec."
shutdown /a
shutdown /s /t %SDTIME% /f