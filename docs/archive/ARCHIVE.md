# Archiving policy and commands

Purpose

Keep the main `docs/` tree focused on actively maintained and discoverable documents. Move legacy, duplicate, or rarely-used files into `docs/archive/` with a short note explaining why.

Archiving criteria (examples)

- Historical migration notes no longer relevant to current developers
- Deprecated feature plans or proposals
- Duplicate analyses or old audits superseded by newer documents

How to archive a file

1. Create or update `docs/archive/` (if missing):

```bash
mkdir -p docs/archive
git add docs/archive
```

2. Move the file and commit with a descriptive message:

```bash
git mv docs/OLD_FILE.md docs/archive/OLD_FILE.md
git commit -m "docs(archive): move OLD_FILE.md to docs/archive — reason: deprecated"
```

3. In `docs/archive/`, add a short rationale at the top of the file or in `ARCHIVE.md` listing why it was archived.

Candidate files to consider (review before moving)

- MIGRATION.md — confirm whether still relevant
- MISSING_PACKAGES_ANALYSIS.md — archive if superseded
- PACKAGES_ENHANCEMENT_PLAN.md — move if implemented or replaced

Files moved to `docs/archive/` (2026-01-02)

- `MIGRATION.md` — archived: historical migration status and phased plan; retained for reference.
- `MISSING_PACKAGES_ANALYSIS.md` — archived: analysis of missing packages; keep as historical backlog.
- `PACKAGE_ENHANCEMENT_PLAN.md` — archived: planning doc; move to archive after implementation or replacement.
- `PACKAGE_ICONS_COMPLETE.md` — archived: completion report for icons; retained as historical proof-of-completion.
- `SCRIPT_JSON_PATTERN.md` — archived: deep design proposal for script.json abstraction; long-form design document.
- `STYLES_COMPLETE_SUMMARY.md` — archived: full styles-system summary; retained for reference and audits.
- `STYLES.md` — archived: style guidelines and notes consolidated into other docs.
- `TYPESCRIPT_JSON_PATTERN.md` — archived: design note on TypeScript/JSON patterns.

If you'd like, I can open a PR that removes the files from `docs/archive/` later or further annotate each archived file with a per-file rationale header.

If you want, I can prepare a PR that moves selected files into `docs/archive/` and updates `ARCHIVE.md` with per-file reasons.
