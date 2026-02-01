#!/bin/bash
# ============================================================================
# Email Client - Kubernetes Scaling Script
# Phase 8 - Auto-scaling and manual replica management
# ============================================================================
#
# Usage:
#   ./scale.sh --component email-service --replicas 5
#   ./scale.sh --component celery-worker --replicas 8
#   ./scale.sh --component postfix --replicas 3
#   ./scale.sh --enable-autoscale email-service
#   ./scale.sh --disable-autoscale celery-worker
#   ./scale.sh --show-metrics
#   ./scale.sh --stress-test
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="emailclient"
COMPONENT=""
REPLICAS=""
ENABLE_AUTOSCALE=""
SHOW_METRICS=false
STRESS_TEST=false
SHOW_STATUS=false

# Functions
print_header() {
    echo -e "\n${BLUE}=====================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}=====================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

check_prerequisites() {
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi

    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster."
        exit 1
    fi

    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_error "Namespace $NAMESPACE not found."
        exit 1
    fi
}

validate_component() {
    local valid_components=("email-service" "celery-worker" "celery-beat" "postfix" "dovecot")
    local found=false

    for comp in "${valid_components[@]}"; do
        if [ "$COMPONENT" = "$comp" ]; then
            found=true
            break
        fi
    done

    if [ "$found" = false ]; then
        print_error "Invalid component: $COMPONENT"
        echo "Valid components: ${valid_components[*]}"
        exit 1
    fi

    # Verify deployment exists
    if ! kubectl get deployment "$COMPONENT" -n "$NAMESPACE" &> /dev/null; then
        print_error "Deployment not found: $COMPONENT"
        exit 1
    fi
}

get_deployment_type() {
    # Determine if this is a regular deployment or statefulset
    if kubectl get statefulset "$COMPONENT" -n "$NAMESPACE" &> /dev/null; then
        echo "statefulset"
    elif kubectl get deployment "$COMPONENT" -n "$NAMESPACE" &> /dev/null; then
        echo "deployment"
    else
        echo "unknown"
    fi
}

scale_replicas() {
    print_header "Scaling $COMPONENT to $REPLICAS replicas"

    local type=$(get_deployment_type)

    print_info "Current replica count:"
    kubectl get "$type" "$COMPONENT" -n "$NAMESPACE" \
        -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,CURRENT:.status.replicas

    print_info "Scaling to $REPLICAS replicas..."

    if kubectl scale "$type" "$COMPONENT" \
        --replicas="$REPLICAS" \
        -n "$NAMESPACE"; then
        print_success "Scaling command submitted"
    else
        print_error "Failed to scale $COMPONENT"
        exit 1
    fi

    # Wait for scaling to complete
    print_info "Waiting for scaling to complete..."
    local max_retries=60
    local retry_count=0
    local desired=$REPLICAS
    local ready=0

    while [ $ready -lt $desired ] && [ $retry_count -lt $max_retries ]; do
        ready=$(kubectl get "$type" "$COMPONENT" -n "$NAMESPACE" \
            -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
        if [ -z "$ready" ]; then
            ready=0
        fi
        echo -ne "Ready replicas: $ready/$desired\r"
        sleep 5
        ((retry_count++))
    done

    echo ""
    if [ $retry_count -eq $max_retries ]; then
        print_warning "Scaling timed out after $max_retries attempts"
    else
        print_success "Scaling completed successfully"
    fi

    # Show final status
    print_info "Final replica status:"
    kubectl get "$type" "$COMPONENT" -n "$NAMESPACE" \
        -o custom-columns=NAME:.metadata.name,DESIRED:.spec.replicas,CURRENT:.status.replicas,READY:.status.readyReplicas
}

enable_autoscale() {
    print_header "Enabling Autoscaling for $COMPONENT"

    local type=$(get_deployment_type)

    # Check if HPA already exists
    if kubectl get hpa "${COMPONENT}-hpa" -n "$NAMESPACE" &> /dev/null; then
        print_warning "HPA already exists for $COMPONENT"
        kubectl get hpa "${COMPONENT}-hpa" -n "$NAMESPACE"
        return
    fi

    # Determine HPA parameters based on component
    local min_replicas=2
    local max_replicas=10
    local cpu_target=70
    local memory_target=80

    case "$COMPONENT" in
        celery-worker)
            max_replicas=8
            cpu_target=75
            ;;
        celery-beat)
            min_replicas=1
            max_replicas=2
            cpu_target=80
            ;;
        postfix|dovecot)
            max_replicas=5
            ;;
    esac

    print_info "Creating HPA:"
    print_info "  Min replicas: $min_replicas"
    print_info "  Max replicas: $max_replicas"
    print_info "  CPU target: $cpu_target%"
    print_info "  Memory target: $memory_target%"

    if kubectl autoscale "$type" "$COMPONENT" \
        --min="$min_replicas" \
        --max="$max_replicas" \
        --cpu-percent="$cpu_target" \
        -n "$NAMESPACE"; then
        print_success "Autoscaling enabled for $COMPONENT"
    else
        print_error "Failed to enable autoscaling"
        exit 1
    fi

    # Show HPA status
    sleep 2
    kubectl get hpa -n "$NAMESPACE"
}

disable_autoscale() {
    print_header "Disabling Autoscaling for $COMPONENT"

    local hpa_name="${COMPONENT}-hpa"

    if ! kubectl get hpa "$hpa_name" -n "$NAMESPACE" &> /dev/null; then
        print_warning "No HPA found for $COMPONENT"
        return
    fi

    print_info "Deleting HPA: $hpa_name"

    if kubectl delete hpa "$hpa_name" -n "$NAMESPACE"; then
        print_success "Autoscaling disabled for $COMPONENT"
    else
        print_error "Failed to disable autoscaling"
        exit 1
    fi
}

show_metrics() {
    print_header "Resource Metrics"

    print_info "Pod resource usage:"
    echo ""
    if kubectl top pods -n "$NAMESPACE" 2>/dev/null; then
        echo ""
    else
        print_warning "Metrics not available. Is metrics-server installed?"
        echo "Install with: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml"
        return
    fi

    print_info "HPA status:"
    echo ""
    kubectl get hpa -n "$NAMESPACE" || echo "No HPA found"
    echo ""

    # Show detailed HPA status
    print_info "Detailed HPA metrics:"
    for hpa in $(kubectl get hpa -n "$NAMESPACE" -o name 2>/dev/null | cut -d/ -f2); do
        echo ""
        echo "HPA: $hpa"
        kubectl describe hpa "$hpa" -n "$NAMESPACE" | grep -E "Metrics:|Current|Target"
    done
}

show_scaling_status() {
    print_header "Scaling Status"

    local components=("email-service" "celery-worker" "celery-beat" "postfix" "dovecot")

    print_info "Deployment replicas:"
    echo ""
    printf "%-20s %-10s %-10s %-10s\n" "COMPONENT" "DESIRED" "CURRENT" "READY"
    echo "-----------------------------------------------------------"

    for comp in "${components[@]}"; do
        if kubectl get deployment "$comp" -n "$NAMESPACE" &> /dev/null; then
            local desired=$(kubectl get deployment "$comp" -n "$NAMESPACE" \
                -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
            local current=$(kubectl get deployment "$comp" -n "$NAMESPACE" \
                -o jsonpath='{.status.replicas}' 2>/dev/null || echo "0")
            local ready=$(kubectl get deployment "$comp" -n "$NAMESPACE" \
                -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")

            printf "%-20s %-10s %-10s %-10s\n" "$comp" "$desired" "$current" "$ready"
        fi
    done
    echo ""

    print_info "HPA status:"
    echo ""
    if kubectl get hpa -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l | grep -q ^0$; then
        print_warning "No HPAs configured"
    else
        kubectl get hpa -n "$NAMESPACE" -o wide
    fi
}

stress_test() {
    print_header "Stress Test - Triggering Autoscaling"

    if [ "$COMPONENT" = "" ]; then
        COMPONENT="email-service"
    fi

    print_warning "This will generate high CPU load to test autoscaling"
    read -p "Continue? (y/N): " -r confirm
    if [ "$confirm" != "y" ]; then
        print_info "Stress test cancelled"
        return
    fi

    print_info "Getting first pod of $COMPONENT..."
    local pod=$(kubectl get pods -n "$NAMESPACE" \
        -l component="$COMPONENT" \
        -o name | head -1 | cut -d/ -f2)

    if [ -z "$pod" ]; then
        print_error "No pods found for $COMPONENT"
        exit 1
    fi

    print_info "Starting stress test on pod: $pod"
    echo ""

    # Run stress test in background
    kubectl exec -i "$pod" -n "$NAMESPACE" -- \
        sh -c "dd if=/dev/zero of=/tmp/stressfile bs=1M count=100 2>/dev/null; rm /tmp/stressfile" \
        &

    local pid=$!

    # Monitor metrics during stress test
    print_info "Monitoring metrics (5 iterations, 30 seconds apart):"
    for i in {1..5}; do
        echo ""
        echo "=== Iteration $i ==="
        kubectl top pods -n "$NAMESPACE" -l component="$COMPONENT" 2>/dev/null || \
            echo "Metrics not available"

        if ! kill -0 $pid 2>/dev/null; then
            print_success "Stress test completed"
            wait $pid
            break
        fi

        if [ $i -lt 5 ]; then
            sleep 30
        fi
    done

    # Show HPA status
    echo ""
    print_info "HPA response:"
    kubectl describe hpa "${COMPONENT}-hpa" -n "$NAMESPACE" 2>/dev/null | \
        grep -E "Metrics:|Current|Target" || echo "HPA not configured"
}

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
    -c, --component NAME        Specify component (email-service, celery-worker, etc.)
    -r, --replicas COUNT        Scale to specified number of replicas
    -e, --enable-autoscale      Enable autoscaling for component
    -d, --disable-autoscale     Disable autoscaling for component
    -m, --metrics               Show resource metrics and HPA status
    -s, --status                Show current scaling status
    -t, --stress-test           Run stress test to trigger autoscaling
    -n, --namespace NAME        Use specified namespace (default: emailclient)
    -h, --help                  Show this help message

EXAMPLES:
    # Scale email-service to 5 replicas
    $0 --component email-service --replicas 5

    # Scale celery-worker to 8 replicas
    $0 --component celery-worker --replicas 8

    # Enable autoscaling for email-service
    $0 --component email-service --enable-autoscale

    # Disable autoscaling
    $0 --component celery-worker --disable-autoscale

    # Show resource metrics
    $0 --metrics

    # Show current scaling status
    $0 --status

    # Run stress test
    $0 --component email-service --stress-test

VALID COMPONENTS:
    email-service  (min: 2, max: 10 replicas)
    celery-worker  (min: 2, max: 8 replicas)
    celery-beat    (always 1 replica)
    postfix        (min: 1, max: 5 replicas)
    dovecot        (min: 1, max: 5 replicas)

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -c|--component)
            COMPONENT="$2"
            shift 2
            ;;
        -r|--replicas)
            REPLICAS="$2"
            shift 2
            ;;
        -e|--enable-autoscale)
            ENABLE_AUTOSCALE="enable"
            shift
            ;;
        -d|--disable-autoscale)
            ENABLE_AUTOSCALE="disable"
            shift
            ;;
        -m|--metrics)
            SHOW_METRICS=true
            shift
            ;;
        -s|--status)
            SHOW_STATUS=true
            shift
            ;;
        -t|--stress-test)
            STRESS_TEST=true
            shift
            ;;
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main execution
print_header "Email Client - Kubernetes Scaling"

check_prerequisites

# Handle different operations
if [ "$SHOW_METRICS" = true ]; then
    show_metrics
elif [ "$SHOW_STATUS" = true ]; then
    show_scaling_status
elif [ "$STRESS_TEST" = true ]; then
    [ -n "$COMPONENT" ] || COMPONENT="email-service"
    validate_component
    stress_test
elif [ -n "$COMPONENT" ]; then
    validate_component

    if [ -n "$ENABLE_AUTOSCALE" ]; then
        if [ "$ENABLE_AUTOSCALE" = "enable" ]; then
            enable_autoscale
        else
            disable_autoscale
        fi
    elif [ -n "$REPLICAS" ]; then
        scale_replicas
    else
        print_error "Please specify either --replicas or --enable-autoscale/--disable-autoscale"
        show_help
        exit 1
    fi
else
    print_error "Please specify a component or use --metrics/--status"
    show_help
    exit 1
fi

exit 0
