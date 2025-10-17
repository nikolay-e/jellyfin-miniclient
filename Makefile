# Makefile for MP3 Player Docker Container

# Variables
IMAGE_NAME = mp3-player
CONTAINER_NAME = mp3-player-container
PORT = 8080
MUSIC_DIR = $(CURDIR)

.PHONY: help build run stop clean restart logs open

help:
	@echo "MP3 Player - Available commands:"
	@echo "  make build         - Build the Docker image"
	@echo "  make run           - Run the container (builds if needed)"
	@echo "  make stop          - Stop the running container"
	@echo "  make restart       - Restart the container"
	@echo "  make clean         - Stop and remove container and image"
	@echo "  make logs          - Show container logs"
	@echo "  make open          - Open the music player in browser"
	@echo "  make all           - Build and run the container"
	@echo ""
	@echo "Configuration:"
	@echo "  PORT=8080          - Port to run the server on"
	@echo "  MUSIC_DIR=\$$(pwd)   - Directory containing MP3 files to mount"
	@echo ""
	@echo "Example: make run MUSIC_DIR=/path/to/your/music"

build:
	@echo "Building Docker image..."
	docker build -t $(IMAGE_NAME) .
	@echo "Build complete!"

run: build
	@echo "Starting MP3 Player container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):80 \
		-v $(MUSIC_DIR):/usr/share/nginx/html/music:ro \
		$(IMAGE_NAME)
	@echo "MP3 Player is running at http://localhost:$(PORT)"
	@echo "Music directory mounted from: $(MUSIC_DIR)"
	@echo "Use 'make logs' to view logs"
	@echo "Use 'make open' to open in browser"

stop:
	@echo "Stopping container..."
	@docker stop $(CONTAINER_NAME) 2>/dev/null || true
	@docker rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "Container stopped"

clean: stop
	@echo "Removing Docker image..."
	@docker rmi $(IMAGE_NAME) 2>/dev/null || true
	@echo "Cleanup complete"

restart: stop run

logs:
	@docker logs -f $(CONTAINER_NAME)

open:
	@echo "Opening MP3 Player in browser..."
	@which open > /dev/null && open http://localhost:$(PORT) || \
	 which xdg-open > /dev/null && xdg-open http://localhost:$(PORT) || \
	 echo "Please open http://localhost:$(PORT) in your browser"

all: run

# Development helpers
dev-logs:
	@docker logs $(CONTAINER_NAME)

status:
	@echo "Container status:"
	@docker ps -a --filter "name=$(CONTAINER_NAME)" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
