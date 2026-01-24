#!/bin/bash

# Celery Worker Management Script
# Phase 8: Email Service Background Task Processing
#
# Usage: ./manage.sh [command] [options]
# Examples:
#   ./manage.sh up              # Start all services
#   ./manage.sh logs -f worker  # Follow worker logs
#   ./manage.sh stats           # Show worker statistics
#   ./manage.sh tasks active    # List active tasks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
COMPOSE_FILE="${SCRIPT_DIR}/docker-compose.yml"
COMPOSE_DEV="${PROJECT_ROOT}/deployment/docker/docker-compose.development.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Helper functions
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check if Docker is available
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose is not installed or not in PATH"
        exit 1
    fi
}

# Show help
show_help() {
    cat << 'EOF'
Celery Worker Management Script - Phase 8 Email Service

USAGE:
  ./manage.sh [command] [options]

COMMANDS:

  Lifecycle:
    up                      Start all services (worker, beat, flower, redis)
    down                    Stop all services
    restart                 Restart all services
    rebuild                 Rebuild Docker images

  Monitoring:
    logs [service]          Show logs (default: worker)
                           Services: worker, beat, flower, redis
    stats                   Show worker statistics
    health                  Check health of all services
    ps                      Show running containers

  Tasks:
    tasks [state]           List tasks by state
                           States: active, reserved, registered, failed
    task:run <name>         Run task manually (experimental)
    task:revoke <id>        Cancel a running task
    task:purge              Clear all pending tasks (DANGEROUS)
    task:status <id>        Check status of a task

  Queue:
    queue:status            Show queue depth
    queue:flush             Flush all queues (DANGEROUS)
    queue:list              List all queues

  Worker:
    worker:ping             Check if worker is responsive
    worker:reload           Reload worker configuration
    worker:shutdown         Gracefully shutdown worker
    worker:info             Show worker information

  Beat:
    beat:status             Check beat scheduler status
    beat:restart            Restart beat scheduler

  Flower:
    flower:open             Open Flower in browser (http://localhost:5556)

  Development:
    dev:logs                Follow all logs (Ctrl+C to stop)
    dev:shell               Open Python shell in worker container
    dev:test                Run test tasks

  Maintenance:
    clean:logs              Clear log files
    clean:redis             Flush Redis cache
    clean:db                Clear Redis results database
    clean:all               Clean all temporary data

  Other:
    help                    Show this help message
    version                 Show version information

EXAMPLES:

  # Start all services
  ./manage.sh up

  # Follow worker logs
  ./manage.sh logs -f worker

  # Check active tasks
  ./manage.sh tasks active

  # Get worker statistics
  ./manage.sh stats

  # Open Flower dashboard
  ./manage.sh flower:open

  # Stop all services
  ./manage.sh down

EOF
}

# ============================================================================
# LIFECYCLE COMMANDS
# ============================================================================

cmd_up() {
    print_info "Starting Celery worker stack..."
    cd "${PROJECT_ROOT}"
    docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" up -d

    print_success "Services started"
    print_info "Waiting for services to be healthy..."
    sleep 5

    # Show status
    cmd_health
}

cmd_down() {
    print_info "Stopping all services..."
    cd "${PROJECT_ROOT}"
    docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" down
    print_success "Services stopped"
}

cmd_restart() {
    print_info "Restarting all services..."
    cmd_down
    sleep 2
    cmd_up
}

cmd_rebuild() {
    print_info "Rebuilding Docker images..."
    cd "${PROJECT_ROOT}"
    docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" build --no-cache celery-worker celery-beat
    print_success "Images rebuilt"
}

# ============================================================================
# MONITORING COMMANDS
# ============================================================================

cmd_logs() {
    local service="${1:-worker}"
    local follow="${2:-}"

    case "$service" in
        worker|beat|flower|redis)
            print_info "Showing logs for celery-${service}..."
            cd "${PROJECT_ROOT}"
            docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" logs $follow "celery-${service}"
            ;;
        all)
            print_info "Following all logs (Ctrl+C to stop)..."
            cd "${PROJECT_ROOT}"
            docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" logs -f
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available: worker, beat, flower, redis, all"
            exit 1
            ;;
    esac
}

cmd_stats() {
    print_info "Worker Statistics"
    echo ""

    docker exec metabuilder-celery-worker \
        celery -A tasks.celery_app inspect stats || print_error "Worker not responding"
}

cmd_health() {
    print_info "Health Check"
    echo ""

    local services=("postgres" "redis" "celery-worker" "celery-beat" "celery-flower")

    for service in "${services[@]}"; do
        local container_name="metabuilder-${service}"
        if docker ps --filter "name=${container_name}" --filter "status=running" | grep -q "${container_name}"; then
            print_success "${service} is running"
        else
            print_error "${service} is not running"
        fi
    done
}

cmd_ps() {
    print_info "Running Containers"
    echo ""
    cd "${PROJECT_ROOT}"
    docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" ps
}

# ============================================================================
# TASK COMMANDS
# ============================================================================

cmd_tasks() {
    local state="${1:-active}"

    print_info "Tasks ($state)"
    echo ""

    case "$state" in
        active)
            docker exec metabuilder-celery-worker \
                celery -A tasks.celery_app inspect active || print_error "Worker not responding"
            ;;
        reserved)
            docker exec metabuilder-celery-worker \
                celery -A tasks.celery_app inspect reserved || print_error "Worker not responding"
            ;;
        registered)
            docker exec metabuilder-celery-worker \
                celery -A tasks.celery_app inspect registered || print_error "Worker not responding"
            ;;
        failed)
            print_info "Failed tasks (from Flower database)"
            echo "Open http://localhost:5556 and check the Tasks tab"
            ;;
        *)
            print_error "Unknown state: $state"
            echo "Available: active, reserved, registered, failed"
            exit 1
            ;;
    esac
}

cmd_task_status() {
    local task_id="$1"

    if [ -z "$task_id" ]; then
        print_error "Task ID required"
        exit 1
    fi

    print_info "Task Status: $task_id"
    echo ""

    docker exec metabuilder-celery-worker \
        python -c "
from tasks.celery_app import celery_app
from celery.result import AsyncResult

result = AsyncResult('$task_id', app=celery_app)
print(f'Status: {result.status}')
print(f'Result: {result.result}')
print(f'Ready: {result.ready()}')
print(f'Successful: {result.successful()}')
print(f'Failed: {result.failed()}')
" || print_error "Failed to get task status"
}

cmd_task_revoke() {
    local task_id="$1"

    if [ -z "$task_id" ]; then
        print_error "Task ID required"
        exit 1
    fi

    print_warning "Revoking task $task_id..."

    docker exec metabuilder-celery-worker \
        celery -A tasks.celery_app revoke "$task_id" --terminate || print_error "Failed to revoke task"

    print_success "Task revoked"
}

cmd_task_purge() {
    print_warning "About to purge ALL pending tasks!"
    read -p "Are you sure? (yes/no) " -n 3 -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        docker exec metabuilder-celery-worker \
            celery -A tasks.celery_app purge || print_error "Failed to purge tasks"
        print_success "All tasks purged"
    else
        print_info "Cancelled"
    fi
}

# ============================================================================
# QUEUE COMMANDS
# ============================================================================

cmd_queue_status() {
    print_info "Queue Status"
    echo ""

    docker exec metabuilder-celery-worker \
        celery -A tasks.celery_app inspect stats | \
        grep -E "(pool|queue)" || print_error "Worker not responding"
}

cmd_queue_list() {
    print_info "Registered Queues"
    echo ""

    docker exec metabuilder-celery-worker \
        python -c "
from tasks.celery_app import celery_app
for queue in celery_app.conf.task_queues:
    print(f'{queue.name} (priority: {queue.priority})')
" || print_error "Failed to list queues"
}

# ============================================================================
# WORKER COMMANDS
# ============================================================================

cmd_worker_ping() {
    print_info "Pinging worker..."

    docker exec metabuilder-celery-worker \
        celery -A tasks.celery_app inspect ping || print_error "Worker not responding"

    print_success "Worker is responsive"
}

cmd_worker_info() {
    print_info "Worker Information"
    echo ""

    docker exec metabuilder-celery-worker \
        celery -A tasks.celery_app inspect stats || print_error "Worker not responding"
}

# ============================================================================
# FLOWER COMMANDS
# ============================================================================

cmd_flower_open() {
    print_info "Opening Flower dashboard..."

    # Try to detect OS and open browser
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://localhost:5556"
    elif command -v open &> /dev/null; then
        open "http://localhost:5556"
    elif command -v start &> /dev/null; then
        start "http://localhost:5556"
    else
        print_info "Open http://localhost:5556 in your browser"
    fi
}

# ============================================================================
# DEVELOPMENT COMMANDS
# ============================================================================

cmd_dev_logs() {
    print_info "Following all logs (Ctrl+C to stop)..."
    echo ""
    cd "${PROJECT_ROOT}"
    docker-compose -f "${COMPOSE_DEV}" -f "${COMPOSE_FILE}" logs -f
}

cmd_dev_shell() {
    print_info "Opening Python shell in worker container..."

    docker exec -it metabuilder-celery-worker python
}

cmd_dev_test() {
    print_info "Running test tasks..."
    echo ""

    docker exec metabuilder-celery-worker python << 'EOF'
from tasks.celery_app import sync_emails, send_email

# Test sync_emails task
print("Testing sync_emails task...")
task = sync_emails.delay(
    email_client_id='test-client',
    tenant_id='test-tenant',
    user_id='test-user'
)
print(f"Task ID: {task.id}")
print(f"Status: {task.status}")
EOF
}

# ============================================================================
# MAINTENANCE COMMANDS
# ============================================================================

cmd_clean_logs() {
    print_warning "Clearing log files..."

    docker exec metabuilder-celery-worker \
        rm -f /app/logs/celery-worker.log /app/logs/celery-beat.log

    print_success "Logs cleared"
}

cmd_clean_redis() {
    print_warning "Flushing Redis cache..."

    docker exec metabuilder-redis \
        redis-cli FLUSHDB || print_error "Failed to flush Redis"

    print_success "Redis flushed"
}

cmd_clean_all() {
    print_warning "This will clear all temporary data!"
    read -p "Are you sure? (yes/no) " -n 3 -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        cmd_clean_logs
        cmd_clean_redis
        print_success "All temporary data cleared"
    else
        print_info "Cancelled"
    fi
}

# ============================================================================
# MAIN
# ============================================================================

main() {
    check_docker

    local command="${1:-help}"

    case "$command" in
        # Lifecycle
        up)
            cmd_up
            ;;
        down)
            cmd_down
            ;;
        restart)
            cmd_restart
            ;;
        rebuild)
            cmd_rebuild
            ;;

        # Monitoring
        logs)
            shift
            cmd_logs "$@"
            ;;
        stats)
            cmd_stats
            ;;
        health)
            cmd_health
            ;;
        ps)
            cmd_ps
            ;;

        # Tasks
        tasks)
            shift
            cmd_tasks "$@"
            ;;
        task:status)
            shift
            cmd_task_status "$@"
            ;;
        task:revoke)
            shift
            cmd_task_revoke "$@"
            ;;
        task:purge)
            cmd_task_purge
            ;;

        # Queue
        queue:status)
            cmd_queue_status
            ;;
        queue:list)
            cmd_queue_list
            ;;

        # Worker
        worker:ping)
            cmd_worker_ping
            ;;
        worker:info)
            cmd_worker_info
            ;;

        # Flower
        flower:open)
            cmd_flower_open
            ;;

        # Development
        dev:logs)
            cmd_dev_logs
            ;;
        dev:shell)
            cmd_dev_shell
            ;;
        dev:test)
            cmd_dev_test
            ;;

        # Maintenance
        clean:logs)
            cmd_clean_logs
            ;;
        clean:redis)
            cmd_clean_redis
            ;;
        clean:all)
            cmd_clean_all
            ;;

        # Help
        help|-h|--help)
            show_help
            ;;
        version)
            echo "Celery Worker Management Script v1.0.0"
            ;;

        *)
            print_error "Unknown command: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
