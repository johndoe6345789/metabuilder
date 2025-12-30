# Large TypeScript file audit

This helper documents the process for converting oversized TypeScript/TSX files into a modular, lambda-per-file layout.

## Goal
- Keep each file focused on a single exported lambda/component.
- Extract helpers, constants, and view fragments into adjacent modules to lower per-file cognitive load.
- Track remaining oversized files to schedule refactors.

## Usage
1. From the repository root, run the analyzer:
   ```bash
   npx tsx tools/analysis/code/list-large-typescript-files.ts --max-lines 150 --out tools/analysis/code/reports/large-ts-files.json
   ```
2. The report records every `.ts`/`.tsx` file above the threshold, their line counts, and a recommendation to break them into smaller modules.
3. Use the sorted list to prioritize the longest files and migrate logic into dedicated helpers (one primary lambda per file).

## Output format
The generated JSON includes:
- `root`: scan starting directory.
- `maxLines`: line threshold used for the run.
- `ignored`: directories skipped (tune with `--ignore`).
- `scanned`: count of `.ts`/`.tsx` files inspected.
- `overLimit`: number of files exceeding the threshold.
- `files`: array of file records with paths, line counts, and an extraction recommendation.

## Suggested refactor steps per file
1. Identify the main exported lambda/component and keep it in place.
2. Move derived data builders, parsing helpers, or rendering sub-sections into nearby modules (e.g., `./helpers/<name>.ts`).
3. Re-export shared types from the original file when needed to avoid import churn.
4. Keep UI-only fragments in `.tsx` leaf components; move business logic into `.ts` utilities when possible.
