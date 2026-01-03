#!/bin/bash
# MetaBuilder Quick Deployment Script
# One-command deployment for development or production
# Usage: ./deploy.sh [dev|prod|monitoring|all] [--bootstrap]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="${1:-dev}"
BOOTSTRAP=false

# Parse arguments
for arg in "$@"; do
    case $arg in
        --bootstrap)
            BOOTSTRAP=true
            ;;
    esac
done

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed"
        exit 1
    fi

    log_success "Prerequisites met"
}

# Setup environment
setup_environment() {
    local env_file="$1"
    local example_file="$2"

    if [ ! -f "$env_file" ]; then
        if [ -f "$example_file" ]; then
            log_warn "Environment file not found, copying from example"
            cp "$example_file" "$env_file"
            log_warn "Please edit $env_file with your configuration"
        else
            log_warn "No example environment file found: $example_file"
        fi
    fi
}

# Deploy development stack
deploy_dev() {
    log_info "Deploying development stack..."

    setup_environment \
        "$PROJECT_ROOT/.env.development" \
        "$SCRIPT_DIR/env/.env.development.example"

    docker-compose \
        -f "$SCRIPT_DIR/docker/docker-compose.development.yml" \
        up -d

    log_success "Development stack deployed"
    log_info "Access at: http://localhost:5173"
}

# Deploy production stack
deploy_prod() {
    log_info "Deploying production stack..."

    setup_environment \
        "$PROJECT_ROOT/.env" \
        "$SCRIPT_DIR/env/.env.production.example"

    if [ ! -f "$PROJECT_ROOT/.env" ]; then
        log_error "Please configure .env file before deploying to production"
        exit 1
    fi

    docker-compose \
        -f "$SCRIPT_DIR/docker/docker-compose.production.yml" \
        up -d

    log_success "Production stack deployed"
    log_info "Access at: http://localhost (or your configured domain)"
}

# Deploy monitoring stack
deploy_monitoring() {
    log_info "Deploying monitoring stack..."

    docker-compose \
        -f "$SCRIPT_DIR/docker/docker-compose.monitoring.yml" \
        up -d

    log_success "Monitoring stack deployed"
    log_info "Grafana: http://localhost:3001"
    log_info "Prometheus: http://localhost:9090"
}

# Deploy all stacks
deploy_all() {
    log_info "Deploying full stack (production + monitoring)..."

    deploy_prod
    deploy_monitoring
}

# Run bootstrap
run_bootstrap() {
    local compose_file="$1"
    log_info "Running bootstrap process..."

    docker-compose -f "$compose_file" \
        run --rm metabuilder-tools \
        /app/scripts/bootstrap-system.sh --env "${MODE}"

    log_success "Bootstrap complete"
}

# Show status
show_status() {
    local compose_files=()

    case $MODE in
        dev)
            compose_files+=("-f" "$SCRIPT_DIR/docker/docker-compose.development.yml")
            ;;
        prod)
            compose_files+=("-f" "$SCRIPT_DIR/docker/docker-compose.production.yml")
            ;;
        monitoring)
            compose_files+=("-f" "$SCRIPT_DIR/docker/docker-compose.monitoring.yml")
            ;;
        all)
            compose_files+=("-f" "$SCRIPT_DIR/docker/docker-compose.production.yml")
            compose_files+=("-f" "$SCRIPT_DIR/docker/docker-compose.monitoring.yml")
            ;;
    esac

    if [ ${#compose_files[@]} -gt 0 ]; then
        log_info "Service status:"
        docker-compose "${compose_files[@]}" ps
    fi
}

# Main deployment logic
main() {
    echo ""
    echo "╔════════════════════════════════════════╗"
    echo "║   MetaBuilder Deployment Script       ║"
    echo "╚════════════════════════════════════════╝"
    echo ""

    check_prerequisites

    case $MODE in
        dev)
            log_info "Mode: Development"
            deploy_dev
            ;;
        prod)
            log_info "Mode: Production"
            deploy_prod
            ;;
        monitoring)
            log_info "Mode: Monitoring"
            deploy_monitoring
            ;;
        all)
            log_info "Mode: Full Stack (Production + Monitoring)"
            deploy_all
            ;;
        *)
            log_error "Invalid mode: $MODE"
            echo "Usage: $0 [dev|prod|monitoring|all] [--bootstrap]"
            exit 1
            ;;
    esac

    # Run bootstrap if requested
    if [ "$BOOTSTRAP" = true ]; then
        echo ""
        case $MODE in
            dev)
                run_bootstrap "$SCRIPT_DIR/docker/docker-compose.development.yml"
                ;;
            prod|all)
                run_bootstrap "$SCRIPT_DIR/docker/docker-compose.production.yml"
                ;;
            monitoring)
                log_warn "Bootstrap not applicable for monitoring stack only"
                ;;
        esac
    fi

    echo ""
    log_success "Deployment complete!"
    echo ""

    # Show status
    show_status

    echo ""
    log_info "Useful commands:"
    log_info "  View logs:    docker-compose -f $SCRIPT_DIR/docker/docker-compose.*.yml logs -f"
    log_info "  Stop stack:   docker-compose -f $SCRIPT_DIR/docker/docker-compose.*.yml down"
    log_info "  Shell access: docker-compose -f $SCRIPT_DIR/docker/docker-compose.*.yml exec <service> sh"
    echo ""
}

# Run main
main
