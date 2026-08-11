# MetaBuilder

A meta-application platform. Define your application in JSON. MetaBuilder runs it.

**Status**: Being split into many single-purpose repos — see [reposplit](https://github.com/johndoe6345789/reposplit) for the full breakdown of what moved where and why.

---

## What's Left Here

This repo used to be a large monorepo (`packages/`, `libraries/`, `services/`, most of `frontends/`). That content has all been split out into dedicated repos. What remains is just three frontends that stay here because they're actively part of MetaBuilder's own multi-frontend showcase:

| Frontend | Stack | Description |
|----------|-------|-------------|
| `frontends/nextjs` | Next.js 16, React 19, App Router | The platform runtime — thin shell that loads features from packages. 6-level permission system (Public→SuperGod), `/{tenant}/{package}/{entity}` routing, JSON workflow execution, God Panel. |
| `frontends/cli` | C++, Lua runtime | Command-line interface targeting MetaBuilder services via HTTP. Lua scripting for package execution. Conan + CMake. |
| `frontends/qt6` | Qt6, QML | Desktop app — Qt Quick replica of the MetaBuilder landing page. |

Plus supporting root-level content: `config/` (lint, test, misc configs), `deployment/` (Docker Compose stack + build scripts), `docs/`, and `scripts/` (mirrored in [metabuilder-scripts](https://github.com/johndoe6345789/metabuilder-scripts)).

**Known open item**: `frontends/nextjs` renders admin/auth/dashboard packages (`admin`, `ui_auth`, `ui_login`, `ui_permissions`, `role_editor`, `user_manager`, `audit_log`, `dashboard`, `nav_menu`, `ui_header/footer/home/intro/pages`, `notification_center`, `config_summary`) that moved to the [packages](https://github.com/johndoe6345789/packages) repo along with everything else — that dependency hasn't been reconciled yet.

## Where Everything Else Went

See the [reposplit README](https://github.com/johndoe6345789/reposplit#readme) for the full source → destination mapping, including:
- `libraries/` → `mojo`, `qml` (merged into `CPlusPlusQT6Skel`), `workflow` (merged into `AutoMetabuilder`), plus `cadquerywrapper`, `components`, `dbal`, `hooks`, `icons`, `interfaces`, `pcbgenerator`, `redux`, `schemas`, `scss`, `SparkOS`, `translations`, `types`
- `packages/` → bundled into a new `packages` repo, except pieces already homed in `codegen_studio`, `code_editor`, `email_client`, `dbal`, `media_center`, `geocities-app`, `testing`, `AutoMetabuilder`
- `services/` → `media_center`, `email_client`, `object-store`, `plugin-registry`
- `frontends/*` (the other 14) → `CaproverForge`, `goodpackagerepo`, `dbal`, `media_center`, `docker-swarm-termina` + `dockerterminal-backend`, `email_client`, `exploded-diagrams`, `SDL3CPlusPlus`, `postgres`, `RepoForge`, `storybook`, `AutoMetabuilder`
- `e2e/` → `metabuilder_e2e`

## CI/CD Infrastructure

Both the CI stack and credential manager live in a **sibling repo** at
`../jenkins/` (`github.com/johndoe6345789/jenkins`).

### Jenkins (`../jenkins/`)

Docker Compose stack: Jenkins controller + nginx + 8 SSH build agents + `registry:2`.

| Service | URL | Purpose |
|---------|-----|---------|
| Jenkins UI | `:8081` | Pipeline dashboard |
| Docker registry | `:5001` | Internal image registry (no-auth) |
| Nexus UI | `:8083` | Nexus 3 (package repos) |

**Key paths:**
```bash
../jenkins/Jenkinsfile.nextjs          # Next.js pipeline definition
../jenkins/Jenkinsfile.cpp             # C++ pipeline definition
../jenkins/jobs/                       # Jenkins job XML configs
../jenkins/scripts/setup.py           # Management CLI (doctor, secrets, up/down)
../jenkins/secrets/                    # gitignored — credentials.yaml, *.env
../jenkins/secrets.example/           # Templates to bootstrap secrets/
```

### Vault (`../jenkins/scripts/vault/`)

Credential manager — stores, serves, and **rotates** all secrets across the
entire stack. Written in **Drogon C++** (ported from Flask), Postgres-backed.

| Service | Port | Purpose |
|---------|------|---------|
| `vault-backend` | `:5055` | C++ REST API — CRUD + rotation engine |
| `vault-frontend` | `:4100` | React UI |
| `vault-db` | internal | PostgreSQL credential store |

```bash
cd ../jenkins/scripts/vault
docker compose up -d          # starts vault-db, vault-backend, vault-frontend
# UI at http://localhost:4100
```

---

**Last Updated**: 2026-08-11
**Roadmap**: See [ROADMAP.md](ROADMAP.md) for phase status and what's next.
