# Use docker-compose as the command, can be switched to 'docker compose' if needed
COMPOSE = docker-compose

.PHONY: help up down logs ps clean

help: ## Display this help screen
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Start the services in detached mode
	@echo "Starting MongoDB container..."
	@$(COMPOSE) up -d

down: ## Stop the services
	@echo "Stopping MongoDB container..."
	@$(COMPOSE) down

logs: ## Follow the logs of the services
	@echo "Following logs..."
	@$(COMPOSE) logs -f

ps: ## List running containers for this project
	@echo "Current container status:"
	@$(COMPOSE) ps

attach: ## Attach a shell from the container to your terminal
	@$(COMPOSE) exec -it mongo bash 

clean: ## Stop and remove all containers, networks, and the data volume
	@echo "Cleaning up the environment completely..."
	@echo "This will permanently delete the database data."
	@$(COMPOSE) down -v
	@echo "Cleanup complete."