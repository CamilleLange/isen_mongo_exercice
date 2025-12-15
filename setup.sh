#!/bin/bash

COMPOSE=docker-compose

help() {
    echo "Available commands:"
    echo "  ./setup.sh up      - Start the services"
    echo "  ./setup.sh down    - Stop the services"
    echo "  ./setup.sh logs    - Follow the logs"
    echo "  ./setup.sh ps      - List running containers"
    echo "  ./setup.sh attach  - Attach shell to container"
    echo "  ./setup.sh clean   - Stop and remove everything"
}

case "$1" in
    up)
        echo "Starting MongoDB container..."
        $COMPOSE up -d
        ;;
    down)
        echo "Stopping MongoDB container without removing the local database ..."
        $COMPOSE down
        ;;
    logs)
        echo "Following logs..."
        $COMPOSE logs -f
        ;;
    ps)
        echo "Current container status:"
        $COMPOSE ps
        ;;
    attach)
        $COMPOSE exec mongo bash
        ;;
    clean)
        echo "Cleaning up the environment completely..."
        echo "This will permanently delete the database data."
        $COMPOSE down -v
        echo "Cleanup complete."
        ;;
    *)
        help
        ;;
esac