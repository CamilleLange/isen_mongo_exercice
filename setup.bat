@echo off
setlocal

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="ps" goto ps
if "%1"=="attach" goto attach
if "%1"=="clean" goto clean
goto help

:help
echo Available commands:
echo   setup.bat up      - Start the services
echo   setup.bat down    - Stop the services
echo   setup.bat logs    - Follow the logs
echo   setup.bat ps      - List running containers
echo   setup.bat attach  - Attach shell to container
echo   setup.bat clean   - Stop and remove everything
goto end

:up
echo Starting MongoDB container...
docker-compose up -d
goto end

:down
echo Stopping MongoDB container without removing the local database ...
docker-compose down
goto end

:logs
echo Following logs...
docker-compose logs -f
goto end

:ps
echo Current container status:
docker-compose ps
goto end

:attach
docker-compose exec mongo bash
goto end

:clean
echo Cleaning up the environment completely...
echo This will permanently delete the database data.
docker-compose down -v
echo Cleanup complete.
goto end

:end
endlocal