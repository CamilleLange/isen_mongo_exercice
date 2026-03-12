@echo off
setlocal

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="up" goto up
if "%1"=="down" goto down
if "%1"=="logs" goto logs
if "%1"=="clean" goto clean
goto help

:help
echo Available commands:
echo   setup.bat up      - Start the services
echo   setup.bat down    - Stop the services
echo   setup.bat logs    - Follow the logs
echo   setup.bat clean   - Stop and remove everything
goto end

:up
echo Démarrage des conteneurs...
docker-compose up --build -d
goto end

:down
echo Arrêt des conteneurs...
docker-compose down
goto end

:logs
echo Affichage des logs de l'API...
docker-compose logs -f todo-list
goto end

:clean
echo Nettoyage complet (conteneurs, volumes et réseaux)...
docker-compose down -v --rmi local
echo Nettoyage terminé.
goto end

:end
endlocal