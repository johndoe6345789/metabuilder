#!/bin/bash
# MetaBuilder Full Stack Startup Script
#
# Core:       nginx gateway, PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch,
#             DBAL C++, WorkflowUI, CodeForge, Pastebin, Postgres Dashboard,
#             Email Client, Exploded Diagrams, Storybook, Frontend App,
#             Postfix, Dovecot, SMTP Relay, Email Service,
#             phpMyAdmin, Mongo Express, RedisInsight, Kibana
# Monitoring: Prometheus, Grafana, Loki, Promtail, exporters, Alertmanager
# Media:      Media daemon (FFmpeg/radio/retro), Icecast, HLS streaming
#
# Portal:     http://localhost (nginx welcome page with links to all apps)
#
# Usage:
#   ./start-stack.sh [COMMAND] [--monitoring] [--media] [--all]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Pull a single image with exponential backoff retries.
# Skips silently if the image is already present and up-to-date.
pull_with_retry() {
    local image="$1"
    local max_attempts=5
    local delay=5

    for attempt in $(seq 1 $max_attempts); do
        if docker pull "$image" 2>&1; then
            return 0
        fi
        if [ "$attempt" -lt "$max_attempts" ]; then
            echo -e "${YELLOW}  Pull failed (attempt $attempt/$max_attempts), retrying in ${delay}s...${NC}"
            sleep "$delay"
            delay=$((delay * 2))
        fi
    done

    echo -e "${RED}  Failed to pull $image after $max_attempts attempts${NC}"
    return 1
}

# Pull all external (non-built) images for the requested profiles.
# Built images (dbal, workflowui, etc.) are skipped — they're local.
pull_external_images() {
    local profiles=("$@")

    local core_images=(
        "postgres:15-alpine"
        "redis:7-alpine"
        "docker.elastic.co/elasticsearch/elasticsearch:8.11.0"
        "mysql:8.0"
        "mongo:7.0"
        "phpmyadmin:latest"
        "mongo-express:latest"
        "redis/redisinsight:latest"
        "docker.elastic.co/kibana/kibana:8.11.0"
        "boky/postfix:latest"
        "nginx:alpine"
    )

    local monitoring_images=(
        "prom/prometheus:latest"
        "grafana/grafana:latest"
        "grafana/loki:latest"
        "grafana/promtail:latest"
        "prom/node-exporter:latest"
        "prometheuscommunity/postgres-exporter:latest"
        "oliver006/redis_exporter:latest"
        "gcr.io/cadvisor/cadvisor:latest"
        "prom/alertmanager:latest"
    )

    local media_images=(
        "libretime/icecast:2.4.4"
    )

    local images=("${core_images[@]}")

    local want_monitoring=false
    local want_media=false
    for p in "${profiles[@]}"; do
        [[ "$p" == "monitoring" ]] && want_monitoring=true
        [[ "$p" == "media" ]]      && want_media=true
    done

    $want_monitoring && images+=("${monitoring_images[@]}")
    $want_media      && images+=("${media_images[@]}")

    local total=${#images[@]}
    echo -e "${YELLOW}Pre-pulling $total external images (with retry on flaky connections)...${NC}"

    local failed=0
    for i in "${!images[@]}"; do
        local img="${images[$i]}"
        echo -e "  [$(( i + 1 ))/$total] $img"
        pull_with_retry "$img" || failed=$((failed + 1))
    done

    if [ "$failed" -gt 0 ]; then
        echo -e "${RED}Warning: $failed image(s) failed to pull. Stack may be incomplete.${NC}"
    else
        echo -e "${GREEN}All images ready.${NC}"
    fi
    echo ""
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.stack.yml"

# Parse arguments
COMMAND=""
PROFILES=()

for arg in "$@"; do
    case "$arg" in
        --monitoring) PROFILES+=("--profile" "monitoring") ;;
        --media)      PROFILES+=("--profile" "media") ;;
        --all)        PROFILES+=("--profile" "monitoring" "--profile" "media") ;;
        *)
            if [ -z "$COMMAND" ]; then
                COMMAND="$arg"
            fi
            ;;
    esac
done

COMMAND=${COMMAND:-up}

# Check docker compose
if ! docker compose version &> /dev/null; then
    echo -e "${RED}docker compose not found${NC}"
    exit 1
fi

case "$COMMAND" in
    up|start)
        echo -e "${BLUE}Starting MetaBuilder stack...${NC}"

        # Collect profile names for the image pre-pull
        PROFILE_NAMES=()
        for p in "${PROFILES[@]}"; do
            [[ "$p" == "--profile" ]] && continue
            PROFILE_NAMES+=("$p")
        done
        pull_external_images "${PROFILE_NAMES[@]}"
        ;;
    down|stop)
        echo -e "${YELLOW}Stopping MetaBuilder stack...${NC}"
        docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" down
        echo -e "${GREEN}Stack stopped${NC}"
        exit 0
        ;;
    build)
        echo -e "${YELLOW}Building MetaBuilder stack...${NC}"
        PROFILE_NAMES=()
        for p in "${PROFILES[@]}"; do
            [[ "$p" == "--profile" ]] && continue
            PROFILE_NAMES+=("$p")
        done
        pull_external_images "${PROFILE_NAMES[@]}"
        docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" up -d --build
        echo -e "${GREEN}Stack built and started${NC}"
        exit 0
        ;;
    logs)
        docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" logs -f ${2:-}
        exit 0
        ;;
    restart)
        docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" restart
        echo -e "${GREEN}Stack restarted${NC}"
        exit 0
        ;;
    ps|status)
        docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" ps
        exit 0
        ;;
    clean)
        echo -e "${RED}This will remove all containers and volumes!${NC}"
        read -p "Are you sure? (yes/no): " -r
        if [[ $REPLY == "yes" ]]; then
            docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" down -v
            echo -e "${GREEN}Stack cleaned${NC}"
        fi
        exit 0
        ;;
    help|--help|-h)
        echo "Usage: ./start-stack.sh [COMMAND] [--monitoring] [--media] [--all]"
        echo ""
        echo "Commands:"
        echo "  up, start    Start the stack (default)"
        echo "  build        Build and start the stack"
        echo "  down, stop   Stop the stack"
        echo "  restart      Restart all services"
        echo "  logs [svc]   Show logs (optionally for specific service)"
        echo "  ps, status   Show service status"
        echo "  clean        Stop and remove all containers and volumes"
        echo "  help         Show this help message"
        echo ""
        echo "Profiles:"
        echo "  --monitoring   Add Prometheus, Grafana, Loki, exporters, Alertmanager"
        echo "  --media        Add media daemon, Icecast, HLS streaming"
        echo "  --all          Enable all profiles"
        echo ""
        echo "Core services (always started):"
        echo "  nginx               80    Gateway + welcome portal (http://localhost)"
        echo "  postgres           5432    PostgreSQL database"
        echo "  mysql              3306    MySQL database"
        echo "  mongodb           27017    MongoDB database"
        echo "  redis              6379    Cache layer"
        echo "  elasticsearch      9200    Search layer"
        echo "  dbal               8080    DBAL C++ backend"
        echo "  workflowui         3001    Visual workflow editor (/workflowui)"
        echo "  codegen            3002    CodeForge IDE (/codegen)"
        echo "  pastebin           3003    Code snippet sharing (/pastebin)"
        echo "  postgres-dashboard 3004    PostgreSQL admin (/postgres)"
        echo "  emailclient-app    3005    Email client (/emailclient)"
        echo "  exploded-diagrams  3006    3D diagram viewer (/diagrams)"
        echo "  storybook          3007    Component library (/storybook)"
        echo "  frontend-app       3008    Main application (/app)"
        echo "  phpmyadmin         8081    MySQL admin (/phpmyadmin/)"
        echo "  mongo-express      8082    MongoDB admin (/mongo-express/)"
        echo "  redisinsight       8083    Redis admin (/redis-insight/)"
        echo "  kibana             5601    Elasticsearch admin (/kibana/)"
        echo "  postfix            1025    SMTP relay"
        echo "  dovecot            1143    IMAP/POP3"
        echo "  smtp-relay         2525    SMTP relay (dashboard: 8025)"
        echo "  email-service      8500    Flask email API"
        echo ""
        echo "Monitoring services (--monitoring):"
        echo "  prometheus          9090    Metrics"
        echo "  grafana             3009    Dashboards"
        echo "  loki                3100    Log aggregation"
        echo "  promtail            -       Log shipper"
        echo "  node-exporter       9100    Host metrics"
        echo "  postgres-exporter   9187    DB metrics"
        echo "  redis-exporter      9121    Cache metrics"
        echo "  cadvisor            8084    Container metrics"
        echo "  alertmanager        9093    Alert routing"
        echo ""
        echo "Media services (--media):"
        echo "  media-daemon    8090    FFmpeg, radio, retro gaming"
        echo "  icecast         8000    Radio streaming"
        echo "  nginx-stream    8088    HLS/DASH streaming"
        exit 0
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo "Run './start-stack.sh help' for usage"
        exit 1
        ;;
esac

# Start
docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" up -d

echo ""
echo -e "${GREEN}Stack started!${NC}"
echo ""

# Count expected healthy services
# Core: postgres, redis, elasticsearch, mysql, mongodb (5)
# Admin tools: phpmyadmin, mongo-express, redisinsight, kibana (4)
# Backend: dbal, email-service (2)
# Mail: postfix, dovecot, smtp-relay (3)
# Gateway: nginx (1)
# Apps: workflowui, codegen, pastebin, postgres-dashboard, emailclient-app,
#       exploded-diagrams, storybook, frontend-app (8)
# Total: 23
CORE_COUNT=23
PROFILE_INFO="core"

for arg in "$@"; do
    case "$arg" in
        --monitoring) CORE_COUNT=$((CORE_COUNT + 9)); PROFILE_INFO="core + monitoring" ;;
        --media)      CORE_COUNT=$((CORE_COUNT + 3)); PROFILE_INFO="core + media" ;;
        --all)        CORE_COUNT=$((CORE_COUNT + 12)); PROFILE_INFO="core + monitoring + media" ;;
    esac
done

echo -e "${YELLOW}Waiting for services ($PROFILE_INFO)...${NC}"

MAX_WAIT=120
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    HEALTHY=$(docker compose -f "$COMPOSE_FILE" "${PROFILES[@]}" ps --format json 2>/dev/null | grep -c '"healthy"' || true)

    if [ "$HEALTHY" -ge "$CORE_COUNT" ]; then
        echo -e "\n${GREEN}All $CORE_COUNT services healthy!${NC}"
        echo ""
        echo -e "Portal: ${BLUE}http://localhost${NC}"
        echo ""
        echo "Quick commands:"
        echo "  ./start-stack.sh logs         View all logs"
        echo "  ./start-stack.sh logs dbal    View DBAL logs"
        echo "  ./start-stack.sh stop         Stop the stack"
        echo "  ./start-stack.sh restart      Restart services"
        exit 0
    fi

    echo -ne "\r  Services healthy: $HEALTHY/$CORE_COUNT (${ELAPSED}s)"
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

echo ""
echo -e "${YELLOW}Timeout waiting for all services. Check with:${NC}"
echo "  ./start-stack.sh status"
echo "  ./start-stack.sh logs"
