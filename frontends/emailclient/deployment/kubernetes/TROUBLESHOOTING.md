# Troubleshooting Guide - Phase 8 Email Client Kubernetes Deployment

## Table of Contents

1. [Pod Issues](#pod-issues)
2. [Database Issues](#database-issues)
3. [Cache Issues](#cache-issues)
4. [Network Issues](#network-issues)
5. [Storage Issues](#storage-issues)
6. [Scaling Issues](#scaling-issues)
7. [Performance Issues](#performance-issues)
8. [Security Issues](#security-issues)
9. [Monitoring & Debugging](#monitoring--debugging)

---

## Pod Issues

### Pods Not Starting (Pending State)

**Symptoms:**
```bash
$ kubectl get pods -n emailclient
NAME                            READY   STATUS    RESTARTS
email-service-5d4f7c6b8-xyz     0/1     Pending   0
```

**Diagnosis:**
```bash
# Check pod events
kubectl describe pod email-service-5d4f7c6b8-xyz -n emailclient

# Check node resources
kubectl top nodes
kubectl describe node <node-name>

# Check resource quotas
kubectl describe resourcequota -n emailclient
```

**Common Causes & Solutions:**

| Cause | Solution |
|-------|----------|
| **Insufficient CPU** | Scale down replicas: `kubectl scale deployment email-service --replicas=1 -n emailclient` |
| **Insufficient Memory** | Add node or reduce memory requests: `kubectl set resources deployment email-service --limits=memory=1Gi -n emailclient` |
| **Image not found** | Check registry: `docker pull emailclient/email-service:latest` |
| **PVC not bound** | Check storage class: `kubectl get storageclass` |

### Pods Crashing (CrashLoopBackOff)

**Symptoms:**
```bash
$ kubectl get pods -n emailclient
NAME                            READY   STATUS            RESTARTS
email-service-5d4f7c6b8-xyz     0/1     CrashLoopBackOff  5
```

**Diagnosis:**
```bash
# View logs
kubectl logs -f email-service-5d4f7c6b8-xyz -n emailclient

# View last log before crash
kubectl logs --previous email-service-5d4f7c6b8-xyz -n emailclient

# Describe pod for events
kubectl describe pod email-service-5d4f7c6b8-xyz -n emailclient
```

**Common Causes:**

**1. Database Connection Failed**
```bash
# Check logs for error
kubectl logs email-service-5d4f7c6b8-xyz -n emailclient | grep -i "database\|postgresql\|connection"

# Verify PostgreSQL is running
kubectl get pods -n emailclient -l component=postgres

# Test connection
kubectl run -it --rm debug --image=postgres:16-alpine --restart=Never -n emailclient -- \
  psql -h postgres -U emailclient -d emailclient_db -c "SELECT 1"
```

**Solution:**
```bash
# Wait for database to be ready
kubectl rollout status statefulset/postgres -n emailclient --timeout=5m

# Restart email-service
kubectl rollout restart deployment/email-service -n emailclient
```

**2. Environment Variables Missing**
```bash
# Check ConfigMap
kubectl get configmap email-service-config -n emailclient -o yaml

# Check Secret
kubectl get secret email-service-secrets -n emailclient -o yaml

# Verify pod has variables
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- env | grep DATABASE_URL
```

**Solution:**
```bash
# Update ConfigMap
kubectl edit configmap email-service-config -n emailclient

# Restart pods to pick up changes
kubectl rollout restart deployment/email-service -n emailclient
```

**3. Port Already in Use**
```bash
# Check logs
kubectl logs email-service-5d4f7c6b8-xyz -n emailclient | grep "Address already in use\|Bind error"

# Check for port conflicts
kubectl get svc -n emailclient
```

**Solution:**
```bash
# Kill existing processes or use different port
# Or scale down conflicting deployment
kubectl scale deployment postfix --replicas=0 -n emailclient
```

### Pods Not Ready (ImagePullBackOff)

**Symptoms:**
```bash
$ kubectl describe pod email-service-5d4f7c6b8-xyz -n emailclient
# Shows: Failed to pull image "emailclient/email-service:latest"
```

**Diagnosis:**
```bash
# Check image availability
docker pull emailclient/email-service:latest

# Check registry credentials
kubectl get secret docker-registry -n emailclient -o yaml

# Check container status
kubectl get pod email-service-5d4f7c6b8-xyz -n emailclient -o jsonpath='{.status.containerStatuses[0].state}'
```

**Solutions:**

```bash
# 1. Push image to registry
docker tag emailclient/email-service:dev emailclient/email-service:latest
docker push emailclient/email-service:latest

# 2. Update image pull policy
kubectl patch deployment email-service \
  -p '{"spec":{"template":{"spec":{"containers":[{"name":"email-service","imagePullPolicy":"IfNotPresent"}]}}}}' \
  -n emailclient

# 3. Add registry credentials
kubectl create secret docker-registry docker-registry \
  --docker-server=<registry> \
  --docker-username=<user> \
  --docker-password=<pass> \
  -n emailclient
```

---

## Database Issues

### PostgreSQL Pod Not Starting

```bash
# Check logs
kubectl logs -f postgres-0 -n emailclient

# Check PVC binding
kubectl get pvc -n emailclient
kubectl describe pvc postgres-pvc -n emailclient

# Check data directory permissions
kubectl exec -it postgres-0 -n emailclient -- ls -la /var/lib/postgresql/data
```

**Solution:**
```bash
# Fix permissions
kubectl exec -it postgres-0 -n emailclient -- chmod 700 /var/lib/postgresql/data

# If PVC corrupt, delete and recreate
kubectl delete pvc postgres-pvc -n emailclient
kubectl apply -f email-service-deployment.yaml -n emailclient
```

### Database Connection Timeout

**Symptoms:**
```bash
ERROR: connection to server at "postgres" (172.25.0.2), port 5432 failed
```

**Diagnosis:**
```bash
# Check PostgreSQL service
kubectl get svc postgres -n emailclient

# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n emailclient -- \
  nslookup postgres

# Check PostgreSQL logs
kubectl logs postgres-0 -n emailclient

# Test raw connection
kubectl run -it --rm debug --image=postgres:16-alpine --restart=Never -n emailclient -- \
  psql -h postgres -U emailclient -d emailclient_db
```

**Solutions:**
```bash
# 1. Increase connection timeout in ConfigMap
kubectl edit configmap email-service-config -n emailclient
# Change: DB_POOL_TIMEOUT: 60

# 2. Increase max_connections in PostgreSQL
kubectl edit configmap postgres-config -n emailclient
# Change: max_connections = 300

# 3. Restart PostgreSQL
kubectl delete pod postgres-0 -n emailclient
```

### Slow Database Queries

**Diagnosis:**
```bash
# Enable slow query log
kubectl exec postgres-0 -n emailclient -- psql -U emailclient -d emailclient_db \
  -c "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# Restart PostgreSQL
kubectl delete pod postgres-0 -n emailclient

# Check logs
kubectl logs postgres-0 -n emailclient | grep "duration:"
```

**Solutions:**
```bash
# 1. Add indexes
kubectl exec postgres-0 -n emailclient -- psql -U emailclient -d emailclient_db \
  -c "CREATE INDEX email_messages_account_id_idx ON email_messages(account_id);"

# 2. Increase work_mem
kubectl edit statefulset postgres -n emailclient
# In POSTGRES_INITDB_ARGS: -c work_mem=256MB

# 3. Enable query caching in Redis
kubectl edit configmap email-service-config -n emailclient
# Change: CACHE_TTL_SECONDS: 3600
```

---

## Cache Issues

### Redis Pod Not Starting

```bash
# Check logs
kubectl logs -f redis-0 -n emailclient

# Check PVC
kubectl describe pvc redis-pvc -n emailclient

# Check data corruption
kubectl exec redis-0 -n emailclient -- redis-cli FLUSHALL
```

**Solution:**
```bash
# Reset Redis data
kubectl exec redis-0 -n emailclient -- redis-cli --rdb /tmp/dump.rdb SHUTDOWN
kubectl delete pvc redis-pvc -n emailclient
kubectl apply -f email-service-deployment.yaml -n emailclient
```

### High Memory Usage

**Diagnosis:**
```bash
# Check Redis memory
kubectl exec redis-0 -n emailclient -- redis-cli INFO memory

# Check top keys
kubectl exec redis-0 -n emailclient -- redis-cli --bigkeys

# Check key expiration
kubectl exec redis-0 -n emailclient -- redis-cli --scan --pattern "*"
```

**Solutions:**
```bash
# 1. Reduce maxmemory
kubectl edit configmap redis-config -n emailclient
# Change: maxmemory 256mb → 128mb

# 2. Update eviction policy
# Change: maxmemory-policy allkeys-lru → volatile-lru

# 3. Flush expired keys
kubectl exec redis-0 -n emailclient -- redis-cli BGSAVE
```

---

## Network Issues

### Service Not Accessible

**Diagnosis:**
```bash
# Check service endpoints
kubectl get endpoints email-service -n emailclient

# Check DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n emailclient -- \
  nslookup email-service

# Test direct connection
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n emailclient -- \
  curl http://email-service:5000/health

# Check service definition
kubectl get svc email-service -n emailclient -o yaml
```

**Solutions:**
```bash
# 1. Verify pod selector matches service
kubectl get pods -n emailclient -l component=email-service

# 2. Check network policies
kubectl get networkpolicy -n emailclient
kubectl describe networkpolicy emailclient-network-policy -n emailclient

# 3. Allow traffic
kubectl delete networkpolicy emailclient-network-policy -n emailclient
```

### DNS Resolution Fails

**Diagnosis:**
```bash
# Check core DNS
kubectl get pods -n kube-system -l k8s-app=kube-dns

# Test DNS from pod
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- nslookup postgres

# Check service name resolution
kubectl run -it --rm debug --image=busybox --restart=Never -n emailclient -- \
  nslookup postgres.emailclient.svc.cluster.local
```

**Solution:**
```bash
# Restart CoreDNS
kubectl rollout restart deployment/coredns -n kube-system

# Or use IP address directly in environment
kubectl set env deployment/email-service \
  DATABASE_HOST=10.x.x.x \
  -n emailclient
```

---

## Storage Issues

### PersistentVolumeClaim Not Binding

**Diagnosis:**
```bash
# Check PVC status
kubectl get pvc -n emailclient
kubectl describe pvc postgres-pvc -n emailclient

# Check storage class
kubectl get storageclass

# Check available PVs
kubectl get pv
```

**Solutions:**
```bash
# 1. Create storage class if missing
kubectl apply -f - <<EOF
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
EOF

# 2. Change storage class in overlay
kubectl edit kustomization -n emailclient

# 3. Use hostPath for testing
storageClassName: manual
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: postgres-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/postgres
```

### Disk Space Running Out

**Diagnosis:**
```bash
# Check PVC usage
kubectl exec postgres-0 -n emailclient -- df -h /var/lib/postgresql/data

# Check node disk
kubectl describe node <node-name>

# Check what's using space
kubectl exec postgres-0 -n emailclient -- du -sh /var/lib/postgresql/data/*
```

**Solutions:**
```bash
# 1. Expand PVC
kubectl patch pvc postgres-pvc -n emailclient \
  -p '{"spec":{"resources":{"requests":{"storage":"20Gi"}}}}'

# 2. Delete old data
kubectl exec postgres-0 -n emailclient -- pg_dump -U emailclient emailclient_db | gzip > backup.sql.gz

# 3. Archive to S3
aws s3 cp backup.sql.gz s3://backups/emailclient/
```

---

## Scaling Issues

### HPA Not Scaling

**Diagnosis:**
```bash
# Check HPA status
kubectl get hpa email-service-hpa -n emailclient

# Check detailed metrics
kubectl describe hpa email-service-hpa -n emailclient

# Check if metrics-server is installed
kubectl get deployment metrics-server -n kube-system
```

**Solutions:**
```bash
# 1. Install metrics-server
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# 2. Check HPA is reading metrics
kubectl logs hpa-controller -n kube-system | grep emailclient

# 3. Verify pod resource requests
kubectl describe deployment email-service -n emailclient | grep -A 5 "Requests"
```

### Manual Scaling Takes Too Long

**Diagnosis:**
```bash
# Check pod creation progress
kubectl get pods -n emailclient -l component=email-service -w

# Check events
kubectl get events -n emailclient --sort-by='.lastTimestamp' | tail -20

# Check node capacity
kubectl top nodes
```

**Solutions:**
```bash
# 1. Pre-pull images on nodes
for node in $(kubectl get nodes -o name); do
  kubectl debug node/$node -it --image=docker
  # Pull image: docker pull emailclient/email-service:latest
done

# 2. Increase replica surge
kubectl patch deployment email-service -n emailclient \
  -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":"100%"}}}}'

# 3. Add more nodes
kubectl scale nodes --replicas=5  # Or cloud provider CLI
```

---

## Performance Issues

### High CPU Usage

**Diagnosis:**
```bash
# Check current usage
kubectl top pods -n emailclient --sort-by=cpu

# Check over time
for i in {1..10}; do
  kubectl top pods -n emailclient --sort-by=cpu
  sleep 30
done

# Profile container
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- \
  python -m cProfile -o stats.prof -m flask run
```

**Solutions:**
```bash
# 1. Scale horizontally
kubectl scale deployment email-service --replicas=5 -n emailclient

# 2. Reduce worker concurrency
kubectl set env deployment/email-service \
  GUNICORN_WORKERS=2 \
  -n emailclient

# 3. Optimize database queries
# Add indexes, enable query caching, reduce logging
```

### High Memory Usage

**Diagnosis:**
```bash
# Check memory usage
kubectl top pods -n emailclient --sort-by=memory

# Check memory leaks
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- \
  ps aux | grep python

# Monitor over time
kubectl top pods -n emailclient --containers --sort-by=memory -w
```

**Solutions:**
```bash
# 1. Reduce memory limits to force GC
kubectl set resources deployment/email-service \
  --limits=memory=512Mi \
  -n emailclient

# 2. Restart pods to clear memory
kubectl rollout restart deployment/email-service -n emailclient

# 3. Reduce cache TTL
kubectl set env deployment/email-service \
  CACHE_TTL_SECONDS=1800 \
  -n emailclient
```

---

## Security Issues

### Secret Not Being Applied

**Diagnosis:**
```bash
# Check secret exists
kubectl get secret email-service-secrets -n emailclient

# Check secret data
kubectl get secret email-service-secrets -n emailclient -o yaml

# Check pod uses secret
kubectl describe pod email-service-5d4f7c6b8-xyz -n emailclient

# Check environment in pod
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- env | grep JWT_SECRET
```

**Solutions:**
```bash
# 1. Update secret
kubectl create secret generic email-service-secrets \
  --from-literal=JWT_SECRET=$(openssl rand -base64 32) \
  --dry-run=client -o yaml | kubectl apply -f -

# 2. Restart pods to pick up new secret
kubectl rollout restart deployment/email-service -n emailclient

# 3. Verify new secret is loaded
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- env | grep JWT_SECRET
```

---

## Monitoring & Debugging

### Enable Detailed Logging

```bash
# Set log level to DEBUG
kubectl set env deployment/email-service \
  LOG_LEVEL=DEBUG \
  -n emailclient

# Stream logs
kubectl logs -f deployment/email-service -n emailclient

# Filter logs
kubectl logs deployment/email-service -n emailclient | grep ERROR
```

### Port Forwarding for Debugging

```bash
# Forward email-service
kubectl port-forward svc/email-service 5000:5000 -n emailclient

# Forward PostgreSQL
kubectl port-forward svc/postgres 5432:5432 -n emailclient

# Forward Redis
kubectl port-forward svc/redis 6379:6379 -n emailclient

# Test from localhost
curl http://localhost:5000/health
psql -h localhost -U emailclient -d emailclient_db
redis-cli -h localhost ping
```

### Execute Commands in Pods

```bash
# Interactive shell
kubectl exec -it email-service-5d4f7c6b8-xyz -n emailclient -- /bin/bash

# Run single command
kubectl exec email-service-5d4f7c6b8-xyz -n emailclient -- ps aux

# Copy files
kubectl cp email-service-5d4f7c6b8-xyz:/app/logs/error.log ./error.log -n emailclient
```

### Debug Node Issues

```bash
# Check node status
kubectl describe node <node-name>

# Debug node
kubectl debug node/<node-name> -it --image=ubuntu

# Check kubelet logs
journalctl -u kubelet -n 100
```

---

## Quick Reference

### Emergency Restart All Components

```bash
# Force restart all deployments
kubectl rollout restart deployment -n emailclient

# Force restart StatefulSets
kubectl rollout restart statefulset -n emailclient

# Watch rollout progress
kubectl rollout status deployment -n emailclient
```

### Capture System State for Debugging

```bash
# Export cluster state
kubectl get all -n emailclient -o yaml > cluster-state.yaml

# Export pod logs
kubectl logs -f deployment/email-service -n emailclient > email-service.log

# Export events
kubectl get events -n emailclient > events.log

# Export resource usage
kubectl top nodes > nodes-usage.log
kubectl top pods -n emailclient > pods-usage.log
```

### Recovery from Disaster

```bash
# Backup and restore database
kubectl exec postgres-0 -n emailclient -- pg_dump -U emailclient emailclient_db | gzip > backup.sql.gz

# Restore from backup
gunzip -c backup.sql.gz | \
  kubectl exec -i postgres-0 -n emailclient -- \
  psql -U emailclient emailclient_db

# Restore PersistentVolume
kubectl delete pvc postgres-pvc -n emailclient
kubectl apply -f email-service-deployment.yaml -n emailclient
```

---

## Getting Help

1. Check pod logs: `kubectl logs -f <pod-name> -n emailclient`
2. Describe pod: `kubectl describe pod <pod-name> -n emailclient`
3. Check events: `kubectl get events -n emailclient --sort-by='.lastTimestamp'`
4. Contact support: [email-client-support@metabuilder.com](mailto:support@metabuilder.com)
