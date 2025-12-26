# Permission Levels Reference

MetaBuilder runs on a five-tier permission stack that spans the public surface, authenticated experiences, moderation, system design, and governance.

## Tier breakdown

| Level | Name | Responsibilities |
|-------|------|------------------|
| 1 | Guest | Browse marketing content, view stories, consume public dashboards without any write access.
| 2 | Regular User | Maintain a profile, tune personal settings, launch saved dashboards, and participate in public workflows.
| 3 | Moderator | Keep the community healthy by resolving flags, reviewing reports, and adjusting shared spaces.
| 4 | God | Author blueprints, edit the front page, seed packages, and design workflows for the multiverse.
| 5 | Super God | Transfer front page ownership, promote gods, run audits, and override safety nets when necessary.

## Interactive view

Visit `/levels` to step through each tier. The page renders a grid of cards, highlights the selected level, and previews the bundle of privileges that accompany it. A promotion button demonstrates the jump to the next level while providing contextual messaging.

## Tooling

- Run `tsx tools/list-permissions.ts` to dump the level definitions and capabilities into the console. This script ensures workflows or automation agents always align with the same data that powers the UI.
- The CLI at `packages/codegen_studio/static_content/cli/main.cpp --levels` also prints this list so legacy tooling and C++ guardians share the same glossary.

## Testing

- `frontends/nextjs/src/app/levels/LevelsClient.test.tsx` asserts the UI renders each tier and that promotions update the alert banner.

Keeping these references synchronized prevents drift between documentation, UI, tooling, and C++ listeners.
