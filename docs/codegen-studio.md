# Codegen Studio Export

The Codegen Studio package now ships a fully reproducible starter bundle that can be downloaded as a `.zip`. The generator is exposed via a server-side service that blends the declarative packages system, C++ companion assets, and Next.js scaffolding.

## API

- **Endpoint**: `POST /api/codegen/studio`
- **Payload**: JSON object `{ projectName, packageId, runtime, tone?, brief? }`
- **Response**: Streaming ZIP file with `Content-Type: application/zip` and `X-Codegen-Manifest` carrying the manifest metadata.

Example cURL:

```bash
curl -X POST http://localhost:3000/api/codegen/studio \
  -H 'Content-Type: application/json' \
  -d '{"projectName":"nebula-launch","packageId":"codegen_studio","runtime":"web","tone":"newsroom"}' \
  -o nebula-launch.zip
```

## Generated bundle contents

Every archive includes:

1. `README.md` summarizing the runtime, tone, and selected package.
2. `package.json` with baseline Next.js scripts and dependencies.
3. `src/app/page.tsx` with a simple hero section referencing the brief.
4. `cli/main.cpp` and `cli/README.md` as the C++ companion (the CLI echoes the same spec).
5. `spec.json` documenting the manifest shipped with the zip.

The runtime-specific paragraph is drawn from the `runtime` value, and the CLI stub prints project, runtime, package, tone, and brief so Super God users can inspect it before shipping.

## Interactive builder

- **Path**: `/codegen`
- **Experience**: A Material UI-powered scaffold designer that bundles the same payload used by the API and streams the ZIP for download.
- **Feedback**: Inline alerts surface success or failure so teams can iteratively tune briefs before sharing the starter kit with collaborators.

## Development tooling

- `frontends/nextjs/src/lib/codegen/*` houses the generator helpers: one function per file (`createProjectTemplate`, `generateCodegenZip`).
- Vitest suites in `frontends/nextjs/src/lib/codegen` verify the template structure and zipped contents.
- `tools/validate-codegen-export.ts` runs the generator end-to-end, materializes a temporary zip, and ensures required files exist so workflows can call it as a sanity check.

The CLI companion under `packages/codegen_studio/static_content/cli/main.cpp` now prints structured manifest details as the generator produces them.
