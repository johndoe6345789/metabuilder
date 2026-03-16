# MetaBuilder Deployment

Build and deploy the full MetaBuilder stack locally using Docker.

## Prerequisites

- Docker Desktop with BuildKit enabled
- Bash 4+ (macOS: `brew install bash`)
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
./push-to-nexus.sh                    # Docker images → Nexus
./publish-npm-patches.sh              # Patched npm packages → Nexus
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
./build-base-images.sh              # Build all (skips existing)
./build-base-images.sh --force      # Rebuild all
./build-base-images.sh node-deps    # Build a specific image
./build-base-images.sh --list       # List available images
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
./build-apps.sh                     # Build all (skips existing)
./build-apps.sh --force             # Rebuild all
./build-apps.sh workflowui          # Build specific app
./build-apps.sh --sequential        # Lower RAM usage
```

### Step 4 — Start the Stack

```bash
./start-stack.sh                    # Core services
./start-stack.sh --monitoring       # + Prometheus, Grafana, Loki
./start-stack.sh --media            # + Media daemon, Icecast, HLS
./start-stack.sh --all              # Everything
```

Portal: http://localhost (nginx welcome page with links to all apps)

### Quick Deploy (rebuild + restart specific apps)

```bash
./deploy.sh codegen                 # Build and deploy codegen
./deploy.sh codegen pastebin        # Multiple apps
./deploy.sh --all                   # All apps
```

## Compose Files

| File | Purpose |
|------|---------|
| `docker-compose.nexus.yml` | Local registries (Nexus + Artifactory) |
| `docker-compose.stack.yml` | Full application stack |
| `docker-compose.test.yml` | Integration test services |
| `docker-compose.smoke.yml` | Smoke test environment |

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `build-base-images.sh` | Build base Docker images |
| `build-apps.sh` | Build app Docker images |
| `build-testcontainers.sh` | Build test container images |
| `start-stack.sh` | Start the full stack |
| `deploy.sh` | Quick build + deploy for specific apps |
| `push-to-nexus.sh` | Push Docker images to Nexus |
| `publish-npm-patches.sh` | Publish patched npm packages to Nexus |
| `populate-nexus.sh` | Populate Nexus with all artifacts |
| `nexus-init.sh` | Nexus repository setup (runs automatically) |
| `nexus-ci-init.sh` | Nexus setup for CI environments |
| `artifactory-init.sh` | Artifactory repository setup (runs automatically) |
| `release.sh` | Release workflow |

## Troubleshooting

**npm install fails with "proxy" error during base-node-deps build**
→ Nexus/Verdaccio isn't running. The `.npmrc` references `localhost:4873` for `@esbuild-kit` scoped packages. Start registries first (Step 1) or comment out the scoped registry in `.npmrc`.

**Build takes 20+ minutes then fails on npm install**
→ Same as above. The Dockerfile now has a pre-flight registry check that fails fast with actionable instructions instead of retrying for 20 minutes.

**Docker image push rejected**
→ Add `localhost:5050` to Docker Desktop insecure registries and restart Docker Desktop.

**Nexus not ready after `docker compose up -d`**
→ Nexus takes ~2 minutes to start. The `nexus-init` container waits for the healthcheck automatically. Check with: `docker compose -f docker-compose.nexus.yml logs -f nexus-init`
