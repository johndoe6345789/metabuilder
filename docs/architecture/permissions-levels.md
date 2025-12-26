# Permission Levels Reference

MetaBuilder runs on a six-tier permission stack that spans the public surface, authenticated experiences, moderation, governance, system design, and governance.

## Tier breakdown

| Level | Name | Responsibilities |
|-------|------|------------------|
| 1 | Public | Browse marketing content, view stories, and consume public dashboards without any write access. |
| 2 | Regular User | Maintain a profile, tune personal settings, launch saved dashboards, and participate in community workflows. |
| 3 | Moderator | Keep the community healthy by resolving flags, reviewing reports, and guiding shared spaces. |
| 4 | Admin | Manage tenant policies, approve shared content, and coordinate escalation paths. |
| 5 | God | Author blueprints, edit the front page, seed packages, and design workflows for the multiverse. |
| 6 | Super God | Transfer front page ownership, promote gods, run audits, and override safety nets when necessary. |

## Interactive view

Visit `/levels` to step through each tier. The page renders a grid of cards, highlights the selected level, and previews the bundle of privileges that accompany it. A promotion button demonstrates the jump to the next level while providing contextual messaging.

## API

- `GET /api/levels` echoes the permission catalog as JSON.
- Add `?level=<key|id>` to narrow the response to a single tier when wiring helpers or automation into the UI.
- Provide `?cap=<term>` (comma-separated) to return only levels whose capability descriptions mention the given keywords.
- `POST /api/levels` accepts a `{ level, note }` payload for telemetry and responds with the matched landing tier.
- `GET /api/levels/metrics` returns totals and capability counts so dashboards can include quick diagnostics.
- `GET /api/health` reports service readiness plus the current number of defined levels.

## Tooling

- Run `tsx tools/list-permissions.ts` to dump the level definitions and capabilities into the console. This script ensures workflows or automation agents always align with the same data that powers the UI.
- Run `tsx tools/levels-csv-export.ts` to emit the permission catalog as comma-separated values for spreadsheets and data pipelines.
- The CLI at `packages/codegen_studio/static_content/cli/main.cpp --levels` also prints this list so legacy tooling and C++ guardians share the same glossary.

## Testing

- `frontends/nextjs/src/app/levels/LevelsClient.test.tsx` asserts the UI renders each tier and that promotions update the alert banner.

Keeping these references synchronized prevents drift between documentation, UI, tooling, and C++ listeners.
