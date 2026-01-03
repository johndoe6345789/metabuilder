# Run GitHub Actions Locally

Run from `frontends/nextjs/`.

Run the full CI pipeline locally using act to validate changes before pushing.

```bash
npm run act
```

If specific jobs fail, debug with:
- `npm run act:lint` - ESLint only
- `npm run act:typecheck` - TypeScript validation
- `npm run act:build` - Production build
- `npm run act:e2e` - End-to-end tests

Use `npm run act:diagnose` to check setup issues without Docker.
