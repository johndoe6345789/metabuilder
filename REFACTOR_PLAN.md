# Next.js to Lua Conversion Plan

## Objective

- Break the frontend refactor request into atomic, achievable chunks that respect the current Next.js/TypeScript architecture while preparing for a future metadata/seed-focused Lua layer.

## Task Breakdown

1. **Audit current Next.js surface**  
   - List all entry points under `frontends/nextjs/src/`, noting pages, components, and data-fetching hooks.
   - Capture existing build/test commands tied to that folder to understand dependencies.

2. **Define Lua boundary**  
   - Specify what metadata/static content/seed data the Lua layer would own (e.g., folder structure under `packages/` or new `lua/` workspace).
   - Sketch a minimal runtime API that Lua micro-functions would need to expose to the rest of the repo.

3. **Map TypeScript → Lua functions**  
   - Identify reusable logic in TypeScript that could be refactored into 1-function-per-file Lua utilities (e.g., serializers, validators).
   - Document the inputs/outputs for each candidate utility to guide future porting.

4. **Extend the core framework**  
   - Determine missing framework hooks (data loading, metadata resolution, routing stubs) that the Lua layer requires.
   - Draft minimal TypeScript interfaces that act as adapters between Next.js and the Lua utilities.

5. **Pilot conversion proof-of-concept**  
   - Choose one small TypeScript helper and rewrite it as a Lua micro-function, keeping the rest in sync via a thin adapter.
   - Validate by wiring it into the Next.js app in a way that doesn’t break the current build.

6. **Review and iterate**  
   - Gather feedback from the team about the proposed Lua bundle structure and adapters.
   - Update documentation and tests to reflect the evolving division between Next.js and Lua content.

## Next Steps

- Share this plan with the team (via GitHub issue/PR note).
- Prioritize the audit task to ensure subsequent steps are grounded in current files.
