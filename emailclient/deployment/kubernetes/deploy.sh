#!/bin/bash
# ============================================================================
# Email Client - Kubernetes Deployment Script
# Phase 8 - Complete deployment automation
# ============================================================================
#
# Usage:
#   ./deploy.sh                    # Deploy to 'emailclient' namespace
#   ./deploy.sh --namespace prod   # Deploy to 'prod' namespace
#   ./deploy.sh --verify           # Verify deployment without applying
#   ./deploy.sh --dry-run          # Show what would be applied
#   ./deploy.sh --clean            # Remove all resources
#   ./deploy.sh --wait             # Wait for rollout to complete
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
MANIFEST_FILE="email-service-deployment.yaml"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DRY_RUN=false
VERIFY_ONLY=false
CLEAN=false
WAIT=false

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
    print_header "Checking Prerequisites"

    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    print_success "kubectl installed: $(kubectl version --client --short)"

    # Check cluster connection
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster. Please configure kubectl."
        exit 1
    fi
    print_success "Connected to cluster: $(kubectl cluster-info | head -1)"

    # Check manifest file
    if [ ! -f "$SCRIPT_DIR/$MANIFEST_FILE" ]; then
        print_error "Manifest file not found: $SCRIPT_DIR/$MANIFEST_FILE"
        exit 1
    fi
    print_success "Manifest file found: $MANIFEST_FILE"
}

validate_manifest() {
    print_header "Validating Manifest"

    if kubectl apply -f "$SCRIPT_DIR/$MANIFEST_FILE" \
        --namespace="$NAMESPACE" \
        --dry-run=client \
        --validate=true &> /dev/null; then
        print_success "Manifest validation passed"
    else
        print_error "Manifest validation failed"
        kubectl apply -f "$SCRIPT_DIR/$MANIFEST_FILE" \
            --namespace="$NAMESPACE" \
            --dry-run=client \
            --validate=true
        exit 1
    fi
}

deploy_resources() {
    print_header "Deploying Resources"

    if [ "$DRY_RUN" = true ]; then
        print_info "Dry-run mode enabled"
        kubectl apply -f "$SCRIPT_DIR/$MANIFEST_FILE" \
            --namespace="$NAMESPACE" \
            --dry-run=client \
            -o yaml
        print_success "Dry-run completed"
        return
    fi

    # Create namespace if it doesn't exist
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_info "Creating namespace: $NAMESPACE"
        kubectl create namespace "$NAMESPACE"
        print_success "Namespace created"
    else
        print_info "Namespace already exists: $NAMESPACE"
    fi

    # Apply manifests
    print_info "Applying manifests to namespace: $NAMESPACE"
    if kubectl apply -f "$SCRIPT_DIR/$MANIFEST_FILE" --namespace="$NAMESPACE" --record; then
        print_success "Resources deployed successfully"
    else
        print_error "Failed to deploy resources"
        exit 1
    fi
}

verify_deployment() {
    print_header "Verifying Deployment"

    # Check if all pods are running
    print_info "Checking pod status..."
    local max_retries=30
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        local ready_count=$(kubectl get pods -n "$NAMESPACE" \
            --no-headers 2>/dev/null | grep -c "Running" || echo "0")
        local expected_count=$(kubectl get pods -n "$NAMESPACE" \
            --no-headers 2>/dev/null | wc -l)

        if [ "$ready_count" -eq "$expected_count" ] && [ "$expected_count" -gt "0" ]; then
            print_success "All pods are running ($ready_count/$expected_count)"
            break
        fi

        print_info "Waiting for pods to be ready ($ready_count/$expected_count)..."
        sleep 10
        ((retry_count++))
    done

    if [ $retry_count -eq $max_retries ]; then
        print_warning "Some pods are not ready after $max_retries attempts"
        kubectl get pods -n "$NAMESPACE"
        return 1
    fi

    # Verify services
    print_info "Checking services..."
    local service_count=$(kubectl get svc -n "$NAMESPACE" --no-headers | wc -l)
    print_success "Services created: $service_count"

    # Verify PVCs
    print_info "Checking persistent volumes..."
    local pvc_count=$(kubectl get pvc -n "$NAMESPACE" --no-headers | wc -l)
    print_success "Persistent volume claims: $pvc_count"

    # Verify ConfigMaps
    print_info "Checking ConfigMaps..."
    local cm_count=$(kubectl get cm -n "$NAMESPACE" --no-headers | wc -l)
    print_success "ConfigMaps: $cm_count"

    # Verify Secrets
    print_info "Checking Secrets..."
    local secret_count=$(kubectl get secret -n "$NAMESPACE" --no-headers | wc -l)
    print_success "Secrets: $secret_count"

    return 0
}

wait_for_rollout() {
    print_header "Waiting for Rollout"

    local deployments=("email-service" "celery-worker" "celery-beat" "postfix" "dovecot")

    for deployment in "${deployments[@]}"; do
        print_info "Waiting for deployment: $deployment"
        if kubectl rollout status deployment/"$deployment" \
            --namespace="$NAMESPACE" \
            --timeout=5m; then
            print_success "Deployment $deployment rolled out successfully"
        else
            print_warning "Deployment $deployment did not roll out in time"
        fi
    done
}

show_status() {
    print_header "Deployment Status"

    print_info "Namespace: $NAMESPACE"
    echo ""

    print_info "Pods:"
    kubectl get pods -n "$NAMESPACE" --no-headers || echo "No pods found"
    echo ""

    print_info "Services:"
    kubectl get svc -n "$NAMESPACE" --no-headers || echo "No services found"
    echo ""

    print_info "StatefulSets:"
    kubectl get statefulset -n "$NAMESPACE" --no-headers || echo "No StatefulSets found"
    echo ""

    print_info "Deployments:"
    kubectl get deployment -n "$NAMESPACE" --no-headers || echo "No Deployments found"
    echo ""

    print_info "HorizontalPodAutoscalers:"
    kubectl get hpa -n "$NAMESPACE" --no-headers || echo "No HPAs found"
    echo ""

    print_info "PersistentVolumeClaims:"
    kubectl get pvc -n "$NAMESPACE" --no-headers || echo "No PVCs found"
    echo ""
}

test_connectivity() {
    print_header "Testing Connectivity"

    # Test email-service
    print_info "Testing email-service connectivity..."
    if kubectl port-forward svc/email-service 5000:5000 -n "$NAMESPACE" \
        &> /dev/null &
        local pf_pid=$!
        sleep 2
        if curl -s http://localhost:5000/health &> /dev/null; then
            print_success "email-service is responsive"
        else
            print_warning "email-service health check failed"
        fi
        kill $pf_pid 2>/dev/null || true
    fi

    # Test PostgreSQL
    print_info "Testing PostgreSQL connectivity..."
    local db_pod=$(kubectl get pods -n "$NAMESPACE" -l component=postgres \
        --no-headers 2>/dev/null | awk '{print $1}' | head -1)
    if [ -n "$db_pod" ]; then
        if kubectl exec -it "$db_pod" -n "$NAMESPACE" -- \
            psql -U emailclient -d emailclient_db -c "SELECT 1" &> /dev/null; then
            print_success "PostgreSQL is responsive"
        else
            print_warning "PostgreSQL is not responsive"
        fi
    fi

    # Test Redis
    print_info "Testing Redis connectivity..."
    local redis_pod=$(kubectl get pods -n "$NAMESPACE" -l component=redis \
        --no-headers 2>/dev/null | awk '{print $1}' | head -1)
    if [ -n "$redis_pod" ]; then
        if kubectl exec -it "$redis_pod" -n "$NAMESPACE" -- \
            redis-cli ping &> /dev/null; then
            print_success "Redis is responsive"
        else
            print_warning "Redis is not responsive"
        fi
    fi
}

clean_resources() {
    print_header "Cleaning Up Resources"

    print_warning "This will delete all resources in namespace: $NAMESPACE"
    read -p "Are you sure? (type 'yes' to confirm): " -r confirm
    echo
    if [ "$confirm" != "yes" ]; then
        print_info "Cleanup cancelled"
        return
    fi

    print_info "Deleting namespace: $NAMESPACE"
    if kubectl delete namespace "$NAMESPACE" --ignore-not-found; then
        print_success "Namespace deleted successfully"
    else
        print_error "Failed to delete namespace"
        exit 1
    fi

    # Wait for namespace to be deleted
    print_info "Waiting for namespace to be fully deleted..."
    local max_retries=30
    local retry_count=0
    while kubectl get namespace "$NAMESPACE" &> /dev/null && [ $retry_count -lt $max_retries ]; do
        sleep 2
        ((retry_count++))
    done

    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        print_success "Namespace fully deleted"
    else
        print_warning "Namespace still exists after timeout"
    fi
}

show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

OPTIONS:
    -n, --namespace NAME    Deploy to specified namespace (default: emailclient)
    -v, --verify            Verify deployment without applying changes
    -d, --dry-run           Show what would be applied without making changes
    -c, --clean             Remove all resources (with confirmation)
    -w, --wait              Wait for rollout to complete after deployment
    -t, --test              Test connectivity after deployment
    -h, --help              Show this help message

EXAMPLES:
    # Deploy to default 'emailclient' namespace
    $0

    # Deploy to 'production' namespace
    $0 --namespace production

    # Verify deployment without applying
    $0 --verify

    # Perform dry-run
    $0 --dry-run

    # Deploy and wait for rollout
    $0 --wait

    # Deploy, test connectivity, and show status
    $0 --test

    # Clean up all resources
    $0 --clean

EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--namespace)
            NAMESPACE="$2"
            shift 2
            ;;
        -v|--verify)
            VERIFY_ONLY=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -c|--clean)
            CLEAN=true
            shift
            ;;
        -w|--wait)
            WAIT=true
            shift
            ;;
        -t|--test)
            TEST=true
            shift
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
print_header "Email Client - Kubernetes Deployment"
print_info "Namespace: $NAMESPACE"
print_info "Manifest: $MANIFEST_FILE"
echo ""

# Check prerequisites
check_prerequisites

# Validate manifest
validate_manifest

# Clean up if requested
if [ "$CLEAN" = true ]; then
    clean_resources
    exit 0
fi

# Deploy resources
deploy_resources

# Only run remaining checks if not a dry-run and not verify-only
if [ "$DRY_RUN" = false ] && [ "$VERIFY_ONLY" = false ]; then
    # Verify deployment
    if ! verify_deployment; then
        print_warning "Deployment verification returned status code 1"
    fi

    # Wait for rollout if requested
    if [ "$WAIT" = true ]; then
        wait_for_rollout
    fi

    # Test connectivity if requested
    if [ "$TEST" = true ]; then
        test_connectivity
    fi

    # Show final status
    show_status

    print_header "Deployment Complete"
    print_success "Email Client deployed successfully to namespace: $NAMESPACE"
    echo ""
    print_info "Next steps:"
    echo "  1. Verify pods are running: kubectl get pods -n $NAMESPACE"
    echo "  2. Check pod logs: kubectl logs -f deployment/email-service -n $NAMESPACE"
    echo "  3. Port-forward to service: kubectl port-forward svc/email-service 5000:5000 -n $NAMESPACE"
    echo "  4. Monitor with: kubectl get all -n $NAMESPACE"
    echo ""
fi

exit 0
