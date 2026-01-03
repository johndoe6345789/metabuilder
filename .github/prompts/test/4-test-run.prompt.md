# Run All Tests

Run app tests from `frontends/nextjs/`. Run DBAL conformance from `dbal/`.

Execute the full test suite:

## Unit Tests
```bash
npm run test:unit          # Single run
npm run test               # Watch mode
npm run test:coverage      # With coverage
npm run test:coverage:report  # Generate markdown report
```

## End-to-End Tests
```bash
npm run test:e2e           # Headless
npm run test:e2e:headed    # With browser
npm run test:e2e:ui        # Interactive UI
```

## Full CI Pipeline (Local)
```bash
npm run act                # Full pipeline
npm run act:diagnose       # Check setup
```

## Specific Checks
```bash
npm run lint               # ESLint
npm run typecheck          # TypeScript
npm run test:check-functions  # Function coverage
```

## DBAL Conformance (from `dbal/`)
```bash
python tools/conformance/run_all.py
```
