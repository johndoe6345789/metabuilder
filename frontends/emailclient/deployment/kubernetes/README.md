# Kubernetes Deployment Guide - Phase 8 Email Client

**Status:** Complete
**Last Updated:** 2026-01-24
**Version:** 1.0.0

## Overview

This directory contains comprehensive Kubernetes manifests for deploying the Phase 8 Email Client infrastructure with production-ready features:

- **Horizontal Pod Autoscaling** (2-10 replicas for email-service)
- **StatefulSets** for PostgreSQL and Redis
- **Rolling Updates** with 25% maxUnavailable
- **Health Checks** (liveness, readiness, startup probes)
- **Resource Limits** and requests per container
- **PersistentVolumes** for data persistence
- **Service Discovery** via Kubernetes DNS
- **Network Policies** for security
- **Pod Disruption Budgets** for HA
- **RBAC** for service accounts

## File Structure

```
kubernetes/
├── email-service-deployment.yaml    # All manifests (single file for simplicity)
├── kustomization.yaml              # Kustomize configuration
├── README.md                        # This file
├── deploy.sh                        # Deployment helper script
├── scale.sh                         # Scaling helper script
└── monitoring/
    ├── prometheus-values.yaml       # Prometheus Helm values
    └── grafana-values.yaml         # Grafana Helm values
```

## Quick Start

### Prerequisites

```bash
# 1. Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# 2. Configure kubectl context
kubectl config use-context your-cluster-name

# 3. Verify connection
kubectl cluster-info
kubectl get nodes
```

### Deploy Email Client

```bash
# 1. Create namespace and deploy all manifests
kubectl apply -f email-service-deployment.yaml

# 2. Verify deployment
kubectl get all --namespace=emailclient

# 3. Watch rollout
kubectl rollout status deployment/email-service --namespace=emailclient

# 4. Check pod logs
kubectl logs -f deployment/email-service --namespace=emailclient
```

### Using Deploy Script

```bash
# Make script executable
chmod +x deployment/kubernetes/deploy.sh

# Deploy with auto-retry
./deployment/kubernetes/deploy.sh

# Deploy with custom namespace
./deployment/kubernetes/deploy.sh --namespace=production

# Verify deployment
./deployment/kubernetes/deploy.sh --verify

# Clean up
./deployment/kubernetes/deploy.sh --clean
```

## Configuration Management

### Environment Variables (ConfigMap)

Edit `email-service-config` ConfigMap:

```bash
# View current configuration
kubectl get configmap email-service-config -n emailclient -o yaml

# Edit configuration
kubectl edit configmap email-service-config -n emailclient

# Replace entire ConfigMap
kubectl create configmap email-service-config \
  --from-file=.env.prod \
  --namespace=emailclient \
  --dry-run=client -o yaml | kubectl apply -f -
```

Key configuration parameters:

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `FLASK_ENV` | production | Flask environment |
| `DB_POOL_SIZE` | 20 | PostgreSQL connection pool |
| `GUNICORN_WORKERS` | 4 | WSGI worker processes |
| `IMAP_POOL_SIZE` | 10 | IMAP connection pool |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | 60 | API rate limit |
| `ENABLE_IMAP_SYNC` | true | Enable email sync |
| `LOG_LEVEL` | INFO | Logging verbosity |

### Secrets Management

Override default secrets in production:

```bash
# Create secrets from files
kubectl create secret generic email-service-secrets \
  --from-literal=DB_USER=emailclient \
  --from-literal=DB_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=ENCRYPTION_KEY=$(openssl rand -base64 32) \
  --namespace=emailclient \
  --dry-run=client -o yaml | kubectl apply -f -
```

**IMPORTANT:** Override these before production deployment:
- `DB_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - JWT signing key
- `ENCRYPTION_KEY` - Data encryption key

## Scaling & Load Balancing

### Horizontal Pod Autoscaler (HPA)

The email-service automatically scales based on metrics:

```bash
# View current HPA status
kubectl get hpa -n emailclient

# Get detailed HPA metrics
kubectl describe hpa email-service-hpa -n emailclient

# Manually scale (overrides HPA)
kubectl scale deployment email-service --replicas=5 -n emailclient
```

**HPA Configuration:**
- **Min Replicas:** 2 (for HA)
- **Max Replicas:** 10 (cost control)
- **CPU Target:** 70% utilization
- **Memory Target:** 80% utilization
- **Scale Up:** Double pods or add 2 per minute
- **Scale Down:** Reduce to 50% or remove 1 per minute

### Manual Scaling

```bash
# Scale email-service to 5 replicas
kubectl scale deployment email-service --replicas=5 -n emailclient

# Scale celery-worker to 8 replicas
kubectl scale deployment celery-worker --replicas=8 -n emailclient

# View replica status
kubectl get pods -n emailclient -l component=email-service
```

### Load Balancing

Email-service uses service-based load balancing:

```bash
# View service endpoints
kubectl get endpoints email-service -n emailclient

# Test load balancing (from within cluster)
kubectl exec -it <pod-name> -n emailclient -- \
  curl email-service:5000/health
```

## Monitoring & Observability

### Health Checks

```bash
# Check liveness probe
kubectl get pod <pod-name> -n emailclient -o jsonpath='{.status.containerStatuses[0].state}'

# Check readiness
kubectl logs <pod-name> -n emailclient | grep -i "ready"

# Manual health check
kubectl port-forward svc/email-service 5000:5000 -n emailclient
curl http://localhost:5000/health
```

### Pod Logs

```bash
# Stream logs from all email-service pods
kubectl logs -f deployment/email-service -n emailclient

# Tail specific pod
kubectl logs -f <pod-name> -n emailclient

# Get logs since 10 minutes ago
kubectl logs --since=10m deployment/email-service -n emailclient

# Export logs to file
kubectl logs deployment/email-service -n emailclient > logs.txt
```

### Metrics

```bash
# View resource usage
kubectl top pods -n emailclient

# View node usage
kubectl top nodes

# Monitor HPA decisions
watch kubectl describe hpa email-service-hpa -n emailclient
```

### Prometheus & Grafana

```bash
# Install Prometheus (via Helm)
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace=monitoring \
  --create-namespace

# Install Grafana
helm install grafana grafana/grafana \
  --namespace=monitoring \
  --create-namespace

# Port-forward Prometheus
kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring

# Port-forward Grafana
kubectl port-forward svc/grafana 3000:3000 -n monitoring
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n emailclient

# Check events
kubectl get events -n emailclient --sort-by='.lastTimestamp'

# Check image pull (ImagePullBackOff)
kubectl logs <pod-name> -n emailclient

# Verify image exists in registry
docker pull emailclient/email-service:latest
```

### Database Connection Issues

```bash
# Test PostgreSQL connectivity
kubectl run -it --rm debug --image=postgres:16-alpine \
  --restart=Never -n emailclient -- \
  psql -h postgres -U emailclient -d emailclient_db

# Check database service
kubectl get svc postgres -n emailclient

# Verify StatefulSet
kubectl get statefulset postgres -n emailclient
kubectl describe statefulset postgres -n emailclient
```

### Redis Connection Issues

```bash
# Test Redis connectivity
kubectl run -it --rm debug --image=redis:7-alpine \
  --restart=Never -n emailclient -- \
  redis-cli -h redis ping

# Check Redis service
kubectl get svc redis -n emailclient

# Monitor Redis
kubectl exec -it redis-0 -n emailclient -- redis-cli INFO
```

### Persistent Volume Issues

```bash
# List PVCs
kubectl get pvc -n emailclient

# Check PV status
kubectl get pv -n emailclient

# Describe PVC for events
kubectl describe pvc postgres-pvc -n emailclient

# Check storage class
kubectl get storageclass
```

### High CPU/Memory Usage

```bash
# Identify high-usage pods
kubectl top pods -n emailclient --sort-by=memory

# Check resource limits
kubectl describe deployment email-service -n emailclient | grep -A 10 "Limits"

# View HPA scaling decisions
kubectl get hpa email-service-hpa -n emailclient -o yaml

# Check vertical pod autoscaling recommendations
kubectl describe vpa email-service -n emailclient 2>/dev/null || echo "VPA not enabled"
```

### Network Issues

```bash
# Test DNS resolution
kubectl run -it --rm debug --image=busybox \
  --restart=Never -n emailclient -- \
  nslookup email-service

# Check network policies
kubectl get networkpolicy -n emailclient

# Test connectivity between pods
kubectl exec <pod1> -n emailclient -- \
  curl <pod2-ip>:5000/health
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update secrets (DB_PASSWORD, JWT_SECRET, ENCRYPTION_KEY)
- [ ] Configure storage class for production (SSD recommended)
- [ ] Set resource limits appropriate for your cluster
- [ ] Configure ingress with TLS certificates
- [ ] Enable network policies
- [ ] Set up monitoring (Prometheus, Grafana)
- [ ] Configure backup policy for PostgreSQL
- [ ] Test disaster recovery procedures
- [ ] Plan capacity (CPU, memory, storage)

### Deployment Steps

```bash
# 1. Create production namespace
kubectl create namespace emailclient-prod

# 2. Apply production secrets
kubectl create secret generic email-service-secrets \
  --from-literal=DB_PASSWORD=$(openssl rand -base64 32) \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --from-literal=ENCRYPTION_KEY=$(openssl rand -base64 32) \
  --namespace=emailclient-prod

# 3. Deploy manifests
kubectl apply -f email-service-deployment.yaml -n emailclient-prod

# 4. Monitor deployment
kubectl rollout status deployment/email-service -n emailclient-prod

# 5. Verify all pods running
kubectl get pods -n emailclient-prod
```

### Backup & Recovery

```bash
# Backup database
kubectl exec -it postgres-0 -n emailclient -- \
  pg_dump -U emailclient emailclient_db | gzip > backup.sql.gz

# Restore database
gunzip -c backup.sql.gz | \
  kubectl exec -i postgres-0 -n emailclient -- \
  psql -U emailclient emailclient_db

# Backup PersistentVolumes
kubectl get pvc -n emailclient -o name | \
  xargs -I {} kubectl exec -i {} -- tar czf - / | \
  gzip > pvc-backup.tar.gz
```

## Rolling Updates & Blue-Green Deployment

### Rolling Update (Default)

```bash
# Update image
kubectl set image deployment/email-service \
  email-service=emailclient/email-service:v2.0.0 \
  -n emailclient

# Monitor rollout
kubectl rollout status deployment/email-service -n emailclient

# Rollback if needed
kubectl rollout undo deployment/email-service -n emailclient
```

### Blue-Green Deployment

```bash
# 1. Deploy green version alongside blue
kubectl apply -f email-service-deployment-green.yaml -n emailclient

# 2. Switch traffic to green
kubectl patch service email-service \
  -p '{"spec":{"selector":{"version":"green"}}}' \
  -n emailclient

# 3. Verify green is healthy
kubectl get pods -l version=green -n emailclient

# 4. Keep blue running for quick rollback
kubectl patch service email-service \
  -p '{"spec":{"selector":{"version":"blue"}}}' \
  -n emailclient
```

## Cost Optimization

### Resource Requests & Limits

```bash
# Right-size requests/limits based on actual usage
kubectl top pods -n emailclient

# Update resource limits
kubectl set resources deployment email-service \
  --requests=cpu=500m,memory=512Mi \
  --limits=cpu=2000m,memory=2Gi \
  -n emailclient
```

### Node Affinity

```bash
# Prefer cheaper node pools for non-critical workloads
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
            - key: node.kubernetes.io/instance-type
              operator: In
              values:
                - t3.medium
                - t3.large
```

### Spot Instances

```bash
# Use spot instances for stateless workloads
affinity:
  nodeAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        preference:
          matchExpressions:
            - key: kubernetes.io/arch
              operator: In
              values:
                - amd64
      - weight: 50
        preference:
          matchExpressions:
            - key: karpenter.sh/capacity-type
              operator: In
              values:
                - spot
```

## Maintenance

### Regular Tasks

```bash
# Weekly: Check resource usage
kubectl top nodes
kubectl top pods -n emailclient

# Monthly: Update images
kubectl set image deployment/email-service \
  email-service=emailclient/email-service:latest \
  -n emailclient

# Quarterly: Review and update resource limits
kubectl describe deployment email-service -n emailclient

# Yearly: Major version upgrades
kubectl apply -f email-service-deployment.yaml --record -n emailclient
```

### Cleanup

```bash
# Remove old completed jobs
kubectl delete job --field-selector status.successful=1 -n emailclient

# Remove old pods
kubectl delete pod --field-selector status.phase=Failed -n emailclient

# Remove complete namespace
kubectl delete namespace emailclient
```

## References

- [Kubernetes Deployment](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [StatefulSets](https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/)
- [HorizontalPodAutoscaler](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/)
- [Resource Management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [Ingress](https://kubernetes.io/docs/concepts/services-networking/ingress/)

## Support

For issues or questions:

1. Check pod logs: `kubectl logs -f deployment/email-service -n emailclient`
2. Describe problematic resource: `kubectl describe pod <name> -n emailclient`
3. Review events: `kubectl get events -n emailclient --sort-by='.lastTimestamp'`
4. Contact: [email-client-support@metabuilder.com](mailto:support@metabuilder.com)
