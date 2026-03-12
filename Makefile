.PHONY: up down logs clean

# start everything
up:
	@echo "🚀 Démarrage des conteneurs..."
	docker compose up --build -d

# shutdown everything
down:
	@echo "🛑 Arrêt des conteneurs..."
	docker compose down

# print the logs of the API
logs:
	@echo "📜 Affichage des logs de l'API..."
	docker compose logs -f todo-list

# clean the workspace
clean:
	@echo "🔥 Nettoyage complet (conteneurs, volumes et réseaux)..."
	docker compose down -v --rmi local
	@echo "Nettoyage terminé."

# rebuild the api and restart it directly on the logs
restart: down clean up logs
	@echo "✅ Services redémarrés."