# MetaBuilder Documentation

This folder contains project documentation for MetaBuilder. It is organised by topic to make information easy to find.

Top-level layout

- `architecture/` — design documents and system architecture
- `guides/` — how-to guides and developer workflows
- `migrations/` — migration notes and compatibility docs
- `packages/` — package-related docs and seeds
- `testing/` — tests and e2e information
- `archive/` — archived or deprecated docs

Housekeeping

- Keep actively maintained docs in the topic folders above.
- Move outdated or reference-only files to `archive/` and document the reason in `ARCHIVE.md`.
- Consolidate overlapping docs (e.g., testing notes) into a single canonical file such as `TESTING_COMPLETE.md`.

Next steps

- Review `docs/ARCHIVE.md` for archiving criteria and run the suggested git move commands when ready.
- If you want, I can identify and prepare a list of candidate files to archive.
# MetaBuilder Documentation

## Quick Links

- [Migration Status](MIGRATION.md) - MUI elimination & Lua package migration
- [Styles System](STYLES.md) - CSS V2 schema & styling architecture

## Architecture

- [architecture/](architecture/) - System architecture & design patterns
  - [ARCHITECTURE_DIAGRAM.md](architecture/ARCHITECTURE_DIAGRAM.md)
  - [data/](architecture/data/) - Data-driven components & database
  - [security-docs/](architecture/security-docs/) - 5-level permission system
  - [systems/](architecture/systems/) - CSS, deployment, packages, testing

## Development

- [development/](development/) - Development workflows
  - [AGENTS.md](development/AGENTS.md) - AI agent workflows
  - [KANBAN_READY.md](development/KANBAN_READY.md) - Ready for dev criteria
  - [ISSUE_COMMENT_TEMPLATE.md](development/ISSUE_COMMENT_TEMPLATE.md)

- [guides/](guides/) - Implementation guides
  - [UI_STANDARDS.md](guides/UI_STANDARDS.md) - UI component standards
  - [ATOMIC_GATED_WORKFLOW.md](guides/ATOMIC_GATED_WORKFLOW.md)
  - [ENTERPRISE_GATED_WORKFLOW.md](guides/ENTERPRISE_GATED_WORKFLOW.md)

- [packages/](packages/) - Lua package system documentation

## Testing & Quality

- [testing/](testing/) - Test strategies & frameworks
- [quality-metrics/](quality-metrics/) - Code quality metrics

## Reference

- [api/](api/) - API documentation
- [reference/](reference/) - Technical reference
- [database/](database/) - Database schemas
- [dbal/](dbal/) - Database abstraction layer

## Operations

- [deployments/](deployments/) - Deployment configurations
- [security/](security/) - Security documentation
- [troubleshooting/](troubleshooting/) - Common issues & solutions

## Reports

- [reports/](reports/) - Status reports & summaries
- [audits/](audits/) - Code & security audits
- [archive/](archive/) - Historical documentation
