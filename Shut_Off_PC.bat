@echo off
SET SDTIME=1
SET /p "SDTIME=Enter time to shutdown in sec:"
echo "System will be shutdown after %SDTIME% sec."
shutdown /a
shutdown /s /t %SDTIME% /f