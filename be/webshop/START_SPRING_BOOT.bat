@echo off
echo Starting Spring Boot Application...
echo.
echo Make sure you have:
echo 1. MariaDB running on port 3306
echo 2. Database 'webshop' created
echo 3. Maven dependencies downloaded (run: mvnw clean install)
echo.
pause

cd /d "%~dp0"
call mvnw.cmd spring-boot:run

pause
