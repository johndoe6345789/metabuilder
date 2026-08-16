# MetaBuilder

A meta-application platform. Define your application in JSON. MetaBuilder runs it.

Pages, workflows, permissions and business logic are data, not code — roughly 95% JSON
config over a thin TypeScript and C++ runtime. This repo holds the platform's three
frontends; everything they depend on lives in sibling repos (see [Related repos](#related-repos)).

---

## Run it

The local stack is nginx, the Next.js frontend, the DBAL daemon, Postgres and
Redis, pulled from GHCR and Docker Hub. It builds nothing and needs no
toolchain — just Docker.

```bash
docker compose -f deploy/compose.yml up -d
```

Then open **<http://localhost:8080/app>**.

Two services are opt-in, behind profiles, because they cost real memory and are
not needed to read the app:

```bash
# Elasticsearch, backing DBAL's full-text search (~1GB heap)
docker compose -f deploy/compose.yml --profile search up -d

# The Postgres admin dashboard, at http://localhost:3100/postgres
docker compose -f deploy/compose.yml --profile tools up -d
```

> **Use `localhost`, not `0.0.0.0`.** Browsers do not treat `http://0.0.0.0` as a
> [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts),
> so `crypto.subtle` is undefined and the PKCE step of sign-in cannot run. The app
> will tell you so, but the address bar is the fix.

| | |
|---|---|
| Pull the latest published images | `docker compose -f deploy/compose.yml pull` |
| Stop the stack | `docker compose -f deploy/compose.yml down` |
| Stop it and wipe the seeded database | `docker compose -f deploy/compose.yml down -v` |
| Run a specific build | `TAG=<sha>-arm64 docker compose -f deploy/compose.yml up -d` |
| Serve on another port | `HTTP_PORT=9000 docker compose -f deploy/compose.yml up -d` |

Changing `HTTP_PORT` means adding that origin to `deploy/oidc/clients.json` too —
OIDC `redirect_uris` are matched exactly, port included.

### Sign in

The stack seeds one account per permission level. Passwords all follow
`<username>-Demo1!`:

| Username | Password | Role | Level |
|----------|----------|------|-------|
| `supergod` | `supergod-Demo1!` | Super administrator, instance owner | 5 |
| `god` | `god-Demo1!` | God Builder — application architect | 4 |
| `admin` | `admin-Demo1!` | System administrator | 3 |
| `moderator` | `moderator-Demo1!` | Content moderator | 2 |
| `demo` | `demo-Demo1!` | Regular user | 1 |
| `testuser` | `testuser-Demo1!` | Regular user, used by the E2E suite | 1 |

`supergod` is the highest level and the only account with `isInstanceOwner`. `god` sits
one below it and is the one to use for building applications — it reaches the God Panel
without owning the instance.

> [!WARNING]
> **These are demo credentials and must be rotated before any non-dev deployment.**
> They are published deliberately, so they are public knowledge and grant no secrecy
> whatsoever. Both seed files are marked `bootstrap: true`, which means DBAL reconciles
> them to the seed file **on every startup** — changing or deleting these accounts in a
> running instance will not stick. Rotating them means changing
> [`credentials.json`](https://github.com/johndoe6345789/dbal/blob/main/libraries/dbal/shared/seeds/database/credentials.json)
> and `users.json` in the `dbal` repo and rebuilding, not editing the database.

Passwords are Argon2id (`dbal::security::hash_password`); the plaintexts are documented
in the seed file itself because they cannot be recovered from the hashes.

---

## What's in this repo

| Frontend | Stack | Description |
|----------|-------|-------------|
| `frontends/nextjs` | Next.js 16, React 19, App Router | The platform runtime — a thin shell that loads features from packages. Six-level permission system (Public → SuperGod), `/{tenant}/{package}/{entity}` routing, JSON workflow execution, God Panel. |
| `frontends/cli` | C++, Lua runtime | Command-line interface targeting MetaBuilder services over HTTP. Lua scripting for package execution. Conan + CMake. |
| `frontends/qt6` | Qt6, QML | Desktop app — a Qt Quick replica of the MetaBuilder landing page. |

Plus `config/` (lint, test and misc configs), `scripts/` (mirrored in
[metabuilder-scripts](https://github.com/johndoe6345789/metabuilder-scripts)), and
`deploy/` (the local stack above). Docker base images, the Compose stacks and the build
CLI live in the [deployment](https://github.com/johndoe6345789/deployment) repo, which
publishes the base images this repo builds against to GHCR.

> **Known open item.** `frontends/nextjs` renders admin, auth and dashboard packages
> (`admin`, `ui_auth`, `ui_login`, `ui_permissions`, `role_editor`, `user_manager`,
> `audit_log`, `dashboard`, `nav_menu`, `ui_header/footer/home/intro/pages`,
> `notification_center`, `config_summary`) that moved to the
> [packages](https://github.com/johndoe6345789/packages) repo. That dependency has not
> been reconciled yet.

---

## Building from source

MetaBuilder is split across micro-repos, so **only `frontends/cli` builds from a bare
checkout**. The other two need their dependencies mounted first: the root `package.json`
declares npm workspaces under `libraries/*`, and `frontends/qt6/CMakeLists.txt`
references a few hundred paths under `libraries/qml/` — none of which live here any more.

```bash
# Mount the 11 sibling repos the Next.js frontend needs, into libraries/ and packages/
python3 .github/scripts/assemble_workspace.py --frontend nextjs
npm install

# Just the QML sources for the Qt6 frontend
python3 .github/scripts/assemble_workspace.py --frontend qt6
```

Re-running assembly after `npm install` leaves `node_modules/@metabuilder/*` symlinks
dangling — run `npm install` again afterwards.

`.github/workspace.json` is the repo → mount-path map. Siblings are assembled at their
**branch heads**, so a fix landing in one of them reaches this build straight away — and
so a broken push elsewhere can break CI here, which is the accepted trade. The commit
SHAs recorded in that file are a known-good set rather than what a normal build uses;
pass `--pinned` to rebuild from them. `bump-workspace-pins.yml` keeps that record
current through a PR. Run `--help` on either script for the full options.

> Set the `WORKSPACE_TOKEN` secret to a PAT if any sibling repo is private — a
> workflow's default `GITHUB_TOKEN` can only see this repository.

---

## CI/CD

| Workflow | What it does |
|----------|--------------|
| `nextjs.yml` | Lint, typecheck, unit tests, build, Playwright E2E |
| `cli.yml` | Conan + CMake build (Release and Debug), uploads the binary |
| `qt6.yml` | CMake build against a prebuilt Qt (via `aqtinstall`), uploads the binary |
| `docker.yml` | Publishes `metabuilder/{nextjs-app,cli}` to GHCR on every push to main, multi-arch |
| `bump-workspace-pins.yml` | Weekly refresh of the sibling-repo pin record, via PR |

`qt6.yml` deliberately skips Conan: `conanfile.txt` asks for `qt/6.7.3`, which Conan has
no prebuilt binary for, so it would compile Qt from source and tie up (or exhaust) the
runner for hours. The workflow installs that same version as a binary instead, parsing
the version out of `conanfile.txt` so the two cannot drift.

Jenkins pipelines and the Drogon C++ credential vault that rotates secrets across the
stack both live in the [jenkins](https://github.com/johndoe6345789/jenkins) repo.

---

## Related repos

This repo was a large monorepo (`packages/`, `libraries/`, `services/`, most of
`frontends/`) before being split into single-purpose repos. The
[reposplit README](https://github.com/johndoe6345789/reposplit#readme) has the full
source → destination mapping:

- **`libraries/`** → `mojo`, `qml` (merged into `CPlusPlusQT6Skel`), `workflow` (merged
  into `AutoMetabuilder`), plus `cadquerywrapper`, `components`, `dbal`, `hooks`,
  `icons`, `interfaces`, `pcbgenerator`, `redux`, `schemas`, `scss`, `SparkOS`,
  `translations`, `types`
- **`packages/`** → a new `packages` repo, except pieces already homed in
  `codegen_studio`, `code_editor`, `email_client`, `dbal`, `media_center`,
  `geocities-app`, `testing`, `AutoMetabuilder`
- **`services/`** → `media_center`, `email_client`, `object-store`, `plugin-registry`
- **`frontends/*`** (the other 14) → `CaproverForge`, `goodpackagerepo`, `dbal`,
  `media_center`, `docker-swarm-termina` + `dockerterminal-backend`, `email_client`,
  `exploded-diagrams`, `SDL3CPlusPlus`, `postgres`, `RepoForge`, `storybook`,
  `AutoMetabuilder`
- **`e2e/`** → `metabuilder_e2e`

See [ROADMAP.md](ROADMAP.md) for phase status and what's next.
