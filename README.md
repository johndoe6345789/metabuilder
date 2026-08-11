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

Plus supporting root-level content: `config/` (lint, test, misc configs), `docs/`, and `scripts/` (mirrored in [metabuilder-scripts](https://github.com/johndoe6345789/metabuilder-scripts)). The Docker base images, Compose stack and build CLI live in the [deployment](https://github.com/johndoe6345789/deployment) repo; the base images this repo builds against are published from there to GHCR.

**Known open item**: `frontends/nextjs` renders admin/auth/dashboard packages (`admin`, `ui_auth`, `ui_login`, `ui_permissions`, `role_editor`, `user_manager`, `audit_log`, `dashboard`, `nav_menu`, `ui_header/footer/home/intro/pages`, `notification_center`, `config_summary`) that moved to the [packages](https://github.com/johndoe6345789/packages) repo along with everything else — that dependency hasn't been reconciled yet.

## Where Everything Else Went

See the [reposplit README](https://github.com/johndoe6345789/reposplit#readme) for the full source → destination mapping, including:
- `libraries/` → `mojo`, `qml` (merged into `CPlusPlusQT6Skel`), `workflow` (merged into `AutoMetabuilder`), plus `cadquerywrapper`, `components`, `dbal`, `hooks`, `icons`, `interfaces`, `pcbgenerator`, `redux`, `schemas`, `scss`, `SparkOS`, `translations`, `types`
- `packages/` → bundled into a new `packages` repo, except pieces already homed in `codegen_studio`, `code_editor`, `email_client`, `dbal`, `media_center`, `geocities-app`, `testing`, `AutoMetabuilder`
- `services/` → `media_center`, `email_client`, `object-store`, `plugin-registry`
- `frontends/*` (the other 14) → `CaproverForge`, `goodpackagerepo`, `dbal`, `media_center`, `docker-swarm-termina` + `dockerterminal-backend`, `email_client`, `exploded-diagrams`, `SDL3CPlusPlus`, `postgres`, `RepoForge`, `storybook`, `AutoMetabuilder`
- `e2e/` → `metabuilder_e2e`

## CI/CD Infrastructure

### GitHub Actions (`.github/`)

| Workflow | What it does |
|----------|--------------|
| `nextjs.yml` | Lint, typecheck, unit tests, build, Playwright E2E |
| `cli.yml` | Conan + CMake build (Release and Debug), uploads the binary |
| `qt6.yml` | CMake build against a prebuilt Qt (via `aqtinstall`), uploads the binary |
| `bump-workspace-pins.yml` | Weekly refresh of sibling-repo pins, via PR |

`qt6.yml` deliberately skips Conan: `conanfile.txt` asks for `qt/6.7.3`, which
Conan has no prebuilt binary for, so it would compile Qt from source and tie up
(or exhaust) the runner for hours. The workflow installs that same version as a
binary instead, parsing the version out of `conanfile.txt` so the two can't drift.

**Building locally.** Because MetaBuilder is split across micro-repos, only
`frontends/cli` builds from a bare checkout. The other two need their
dependencies mounted first — the root `package.json` still declares npm
workspaces under `libraries/*`, and `frontends/qt6/CMakeLists.txt` references
275 paths under `libraries/qml/`, none of which live here any more:

```bash
# Clone the 10 sibling repos the Next.js frontend needs into libraries/ and packages/
python3 .github/scripts/assemble_workspace.py --frontend nextjs
npm install

# Just the QML sources for the Qt6 frontend
python3 .github/scripts/assemble_workspace.py --frontend qt6
```

`.github/workspace.json` is the repo → mount-path map (the mapping
[reposplit](https://github.com/johndoe6345789/reposplit) leaves as an open
TODO). Each sibling is pinned to a commit SHA, so a push elsewhere can't break
CI here; `bump-workspace-pins.yml` moves the pins through a PR so the new set
is proven before it lands. Run `--help` on either script for the full options.

> Set the `WORKSPACE_TOKEN` secret to a PAT if any sibling repo is private —
> a workflow's default `GITHUB_TOKEN` can only see this repository.

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
