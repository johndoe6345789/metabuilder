.PHONY: help build up down logs stop restart clean health test

# Phase 8 Email Client - Docker Development Makefile

help:
	@echo "Phase 8 Email Client - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Start all services (development mode)"
	@echo "  make logs             - Tail service logs"
	@echo "  make stop             - Stop all services"
	@echo "  make clean            - Remove containers and volumes (WARNING: data loss)"
	@echo ""
	@echo "Building & Deployment:"
	@echo "  make build            - Build all Docker images"
	@echo "  make build-email      - Build only email-service image"
	@echo "  make push             - Push images to registry (requires credentials)"
	@echo ""
	@echo "Diagnostics:"
	@echo "  make health           - Check service health status"
	@echo "  make ps               - List running containers"
	@echo "  make shell-app        - Open shell in email-service container"
	@echo "  make shell-db         - Open PostgreSQL shell"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run pytest in email-service"
	@echo "  make test-health      - Test health endpoint"
	@echo "  make test-db          - Test database connectivity"
	@echo ""
	@echo "Database:"
	@echo "  make db-reset         - Reset database (WARNING: data loss)"
	@echo "  make db-backup        - Backup PostgreSQL database"
	@echo "  make db-restore FILE  - Restore PostgreSQL database from backup"
	@echo ""
	@echo "Logs & Debugging:"
	@echo "  make logs-email       - Tail email-service logs"
	@echo "  make logs-db          - Tail PostgreSQL logs"
	@echo "  make logs-redis       - Tail Redis logs"
	@echo "  make logs-celery      - Tail Celery worker logs"
	@echo ""

# Configuration
COMPOSE_FILE ?= docker-compose.yml
DOCKER_REGISTRY ?= docker.io
IMAGE_NAME ?= emailclient-email-service
IMAGE_TAG ?= latest

# Development targets

dev: build up
	@echo "Phase 8 Email Client is running"
	@echo "API: http://localhost:5000"
	@echo "Database: localhost:5433"
	@echo "Redis: localhost:6379"
	@echo ""
	@echo "Press Ctrl+C to stop, or run: make stop"

up:
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "Services started"

down:
	docker-compose -f $(COMPOSE_FILE) down
	@echo "Services stopped"

stop: down

restart:
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "Services restarted"

logs:
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-email:
	docker-compose -f $(COMPOSE_FILE) logs -f email-service

logs-db:
	docker-compose -f $(COMPOSE_FILE) logs -f postgres

logs-redis:
	docker-compose -f $(COMPOSE_FILE) logs -f redis

logs-celery:
	docker-compose -f $(COMPOSE_FILE) logs -f celery-worker celery-beat

ps:
	docker-compose -f $(COMPOSE_FILE) ps

# Building targets

build:
	docker-compose -f $(COMPOSE_FILE) build

build-email:
	docker-compose -f $(COMPOSE_FILE) build email-service

build-no-cache:
	docker-compose -f $(COMPOSE_FILE) build --no-cache

# Health & diagnostics

health:
	@echo "Checking service health..."
	@docker-compose -f $(COMPOSE_FILE) ps --format "table {{.Names}}\t{{.Status}}"
	@echo ""
	@echo "Testing email-service health endpoint..."
	@curl -s http://localhost:5000/health | python -m json.tool || echo "Service not responding"

test-health:
	curl -v http://localhost:5000/health

test-db:
	docker-compose -f $(COMPOSE_FILE) exec postgres \
		psql -U emailclient -d emailclient_db -c "SELECT 1 as health_check"

shell-app:
	docker-compose -f $(COMPOSE_FILE) exec email-service /bin/bash

shell-db:
	docker-compose -f $(COMPOSE_FILE) exec postgres \
		psql -U emailclient -d emailclient_db

# Testing targets

test:
	docker-compose -f $(COMPOSE_FILE) exec email-service \
		pytest tests/ -v --cov=src

test-watch:
	docker-compose -f $(COMPOSE_FILE) exec email-service \
		pytest tests/ --watch

# Database targets

db-reset: down
	rm -rf data/postgres
	$(MAKE) up
	@echo "Database reset complete"

db-backup:
	mkdir -p backups
	docker-compose -f $(COMPOSE_FILE) exec -T postgres \
		pg_dump -U emailclient emailclient_db > backups/emailclient_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up to backups/"

db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make db-restore FILE=backups/emailclient_YYYYMMDD_HHMMSS.sql"; \
		exit 1; \
	fi
	docker-compose -f $(COMPOSE_FILE) exec -T postgres \
		psql -U emailclient emailclient_db < $(FILE)
	@echo "Database restored from $(FILE)"

# Cleanup targets

clean: down
	docker-compose -f $(COMPOSE_FILE) down -v
	rm -rf data/ logs/
	@echo "All data removed (WARNING: irreversible)"

prune-images:
	docker image prune -a --force
	@echo "Unused images removed"

prune-volumes:
	docker volume prune -f
	@echo "Unused volumes removed"

prune-all: prune-images prune-volumes
	docker system prune -f
	@echo "All Docker resources pruned"

# Deployment targets

push:
	@if [ "$$CI" != "true" ]; then \
		echo "Error: push target only for CI/CD pipelines"; \
		exit 1; \
	fi
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Pushed $(IMAGE_NAME):$(IMAGE_TAG)"

# Utility targets

install-hooks:
	@echo "Installing git hooks..."
	cp deployment/docker/email-service/Dockerfile .git/hooks/pre-commit || true
	@echo "Hooks installed"

version:
	@docker-compose -f $(COMPOSE_FILE) ps --format "table {{.Names}}\t{{.Image}}"

env-setup:
	@if [ ! -f .env ]; then \
		cp deployment/docker/email-service/.env.example .env; \
		echo "Created .env file from template"; \
		echo "IMPORTANT: Edit .env with your configuration"; \
	else \
		echo ".env already exists"; \
	fi

# CI/CD targets

ci-build:
	docker build -f deployment/docker/email-service/Dockerfile \
		--tag $(IMAGE_NAME):$(IMAGE_TAG) \
		--label ci.build.date=$$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
		--label ci.build.commit=$$(git rev-parse --short HEAD) \
		.

ci-test:
	docker run --rm \
		-v /var/run/docker.sock:/var/run/docker.sock \
		$(IMAGE_NAME):$(IMAGE_TAG) \
		pytest tests/ -v --cov=src

ci-push: ci-build
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	@echo "Pushed to $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)"

# Default target
.DEFAULT_GOAL := help
