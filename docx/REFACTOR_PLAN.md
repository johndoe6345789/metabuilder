# Next.js to Lua Conversion TODO

## TODOs

- [ ] Audit all `frontends/nextjs/src/` entry points (pages, components, hooks, lib) so we know exactly what needs to be ported or adapted.
- [ ] Document the Lua boundary—what metadata/static/seed assets we expect to own and what runtime API each function will expose.
- [ ] Map reusable TypeScript helpers to single-function Lua targets (one file, one function) and describe their inputs/outputs for future porting.
- [ ] Extend the core framework only where gaps remain (data loading, metadata resolution, routing) with tiny TypeScript adapters to Lua if needed.
- [ ] Pilot a TypeScript → Lua helper conversion (choose one small helper, wrap it with an adapter, and keep the rest of the build intact).
- [ ] Update documentation/tests to reflect the new Lua metadata focus and ensure existing CI steps continue to pass with the new structure.
- [ ] Iterate with feedback—confirm the team agrees on the folder layout, metadata ownership, and which TypeScript files stay as adapters.

## Quick File References

- `frontends/nextjs/src/app`: every route/provider/API handler will need metadata equivalents or thin Lua adapters (`page.tsx`, `layout.tsx`, auth/dashboards, `codegen/`, `api/*`, providers, etc.).
- `frontends/nextjs/src/components`: move UI-heavy builders (`Builder.tsx`, `Level[1-5].tsx`, `NerdModeIDE.tsx`, `Workflow*`, manager/editor panels) into metadata-driven definitions, with atoms/molecules/organisms turning into per-file Lua adapters.
- `frontends/nextjs/src/hooks`: treat every hook (`useAuth`, `useAutoRefresh`, `useKV`, `useDBAL`, `useFileTree`, etc.) as a Lua micro-function plus any factory files in `hooks/use-dbal/`.
- `frontends/nextjs/src/lib`: catalog authentication/security, db/DBAL, package/seed, Lua engine, workflow/rendering, infra/API, schema, and helper files to decide which remain TypeScript adapters.
- Supporting assets: seed JSONs, README docs in components/hooks/lib, and unit/e2e tests must reflect the Lua theta once conversions begin.

## Next Steps

1. Create the companion metadata folder (e.g., `lua/` or `packages/static_content`) with placeholder single-function files that mirror the above references.
2. Run the audit across the identified folders and mark each file as “port to Lua”, “adapter only”, or “leave in TypeScript” before touching the code.
