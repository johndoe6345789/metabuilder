# MetaBuilder Deployment

Build and deploy the full MetaBuilder stack locally using Docker.

All commands go through a single Python CLI: `python3 deployment.py --help`

## Prerequisites

- Docker Desktop with BuildKit enabled
- Python 3.9+
- Add `localhost:5050` to Docker Desktop insecure registries:
  Settings → Docker Engine → `"insecure-registries": ["localhost:5050"]`

## Build & Deploy Order

### Step 1 — Start Local Registries (Nexus + Artifactory)

All base image builds pull dependencies through local registries. **Start these first.**

```bash
cd deployment
docker compose -f docker-compose.nexus.yml up -d
```

Wait ~2 minutes for init containers to finish, then populate:

```bash
python3 deployment.py nexus push          # Docker images → Nexus
python3 deployment.py npm publish-patches # Patched npm packages → Nexus
conan remote add artifactory http://localhost:8092/artifactory/api/conan/conan-local
```

| Service     | URL                              | Credentials       |
|-------------|----------------------------------|--------------------|
| Nexus UI    | http://localhost:8091            | admin / nexus      |
| Artifactory | http://localhost:8092            | admin / password   |
| npm group   | http://localhost:8091/repository/npm-group/ | — |
| Conan2      | http://localhost:8092/artifactory/api/conan/conan-local | — |
| Docker repo | localhost:5050                   | —                  |

### Step 2 — Build Base Images

```bash
python3 deployment.py build base            # Build all (skips existing)
python3 deployment.py build base --force    # Rebuild all
python3 deployment.py build base node-deps  # Build a specific image
python3 deployment.py build base --list     # List available images
```

Build order (dependencies respected automatically):

1. `base-apt` — system packages (no deps)
2. `base-conan-deps` — C++ dependencies (needs base-apt)
3. `base-android-sdk` — Android SDK (needs base-apt)
4. `base-node-deps` — npm workspace dependencies (standalone, needs Nexus running)
5. `base-pip-deps` — Python dependencies (standalone)
6. `devcontainer` — full dev environment (needs all above)

### Step 3 — Build App Images

```bash
python3 deployment.py build apps                # Build all (skips existing)
python3 deployment.py build apps --force        # Rebuild all
python3 deployment.py build apps workflowui     # Build specific app
python3 deployment.py build apps --sequential   # Lower RAM usage
```

### Step 4 — Start the Stack

```bash
python3 deployment.py stack up              # Core services
python3 deployment.py stack up --monitoring # + Prometheus, Grafana, Loki
python3 deployment.py stack up --media      # + Media daemon, Icecast, HLS
python3 deployment.py stack up --all        # Everything
```

Portal: http://localhost (nginx welcome page with links to all apps)

### Quick Deploy (rebuild + restart specific apps)

```bash
python3 deployment.py deploy codegen            # Build and deploy codegen
python3 deployment.py deploy codegen pastebin   # Multiple apps
python3 deployment.py deploy --all              # All apps
```

## CLI Command Reference

```
deployment.py build base [--force] [--list] [images...]
deployment.py build apps [--force] [--sequential] [apps...]
deployment.py build testcontainers [--skip-native] [--skip-sidecar]
deployment.py deploy [apps...] [--all] [--no-cache]
deployment.py stack up|down|build|logs|ps|clean [--monitoring] [--media] [--all]
deployment.py release <app> [patch|minor|major|x.y.z]
deployment.py nexus init [--ci]
deployment.py nexus push [--tag TAG] [--src SRC] [--pull]
deployment.py nexus populate [--skip-heavy]
deployment.py npm publish-patches [--nexus] [--verdaccio]
deployment.py artifactory init
```

## Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.nexus.yml` | Local registries (Nexus + Artifactory) |
| `docker-compose.stack.yml` | Full application stack |
| `docker-compose.test.yml` | Integration test services |
| `docker-compose.smoke.yml` | Smoke test environment |

## Remaining Shell Scripts

| Script | Purpose |
|--------|---------|
| `nexus-init.sh` | Nexus repository setup (mounted into Docker container) |
| `artifactory-init.sh` | Artifactory repository setup (mounted into Docker container) |

These are container entrypoints used by `docker-compose.nexus.yml`, not user-facing scripts.

## Troubleshooting

**npm install fails with "proxy" error during base-node-deps build**
→ Nexus/Verdaccio isn't running. The `.npmrc` references `localhost:4873` for `@esbuild-kit` scoped packages. Start registries first (Step 1) or comment out the scoped registry in `.npmrc`.

**Build takes 20+ minutes then fails on npm install**
→ Same as above. The Dockerfile now has a pre-flight registry check that fails fast with actionable instructions instead of retrying for 20 minutes.

**Docker image push rejected**
→ Add `localhost:5050` to Docker Desktop insecure registries and restart Docker Desktop.

**Nexus not ready after `docker compose up -d`**
→ Nexus takes ~2 minutes to start. The `nexus-init` container waits for the healthcheck automatically. Check with: `docker compose -f docker-compose.nexus.yml logs -f nexus-init`
