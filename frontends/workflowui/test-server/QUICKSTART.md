# WorkflowUI Integration Test - Quick Start Guide

## TL;DR

```bash
# One-liner test
cd workflowui/test-server && npm install && npm run start &
sleep 5 && ./quick-test.sh
```

## What This Does

Tests WorkflowUI workflow execution with a mock DBAL backend:
- ✅ Creates 2 workflows (TypeScript math + Python data processing)
- ✅ Executes both workflows
- ✅ Verifies results (16 and 3)
- ✅ No actual DBAL or database needed

## Files Created

```
workflowui/
├── test-server/
│   ├── mock-dbal.ts              # Express mock DBAL API (12KB)
│   ├── integration.spec.ts       # Playwright E2E tests (9.5KB)
│   ├── quick-test.sh            # Quick API validation (5.4KB)
│   ├── run-integration-test.sh  # Full test automation (6.1KB)
│   ├── package.json             # Dependencies
│   └── README.md                # Full documentation (6.7KB)
├── test-workflows/
│   ├── typescript-math.json     # TS workflow: 5+3=8, 8×2=16
│   └── python-data.json         # Python: filter, transform, count
└── test-results/
    ├── workflows-list.json
    ├── typescript-executions.json
    └── python-executions.json
```

## Quick Test (30 seconds)

```bash
# Terminal 1: Start mock server
cd workflowui/test-server
npm install
npm run start

# Terminal 2: Run tests
cd workflowui/test-server
./quick-test.sh
```

**Expected Output:**
```
✓ Health check passed
✓ Workflow created
✓ Execution successful - Result: 16 (expected: 16)
✓ Execution successful - Result: 3 (expected: 3)
All tests passed!
```

## Full Integration Test (with Playwright)

```bash
cd workflowui/test-server
./run-integration-test.sh
```

This will:
1. Start mock DBAL server
2. Start WorkflowUI dev server
3. Run 6 Playwright E2E tests
4. Capture screenshots
5. Generate HTML report
6. Clean up servers

## Test Workflows

### TypeScript Math Workflow
**Flow:** Start(5,3) → Add(8) → Multiply(16) → Result
**Expected:** 16 ✅

### Python Data Workflow
**Flow:** Start(5 items) → Filter(3) → Transform → Count(3) → Result
**Expected:** 3 ✅

## API Endpoints

All available at `http://localhost:8080/api/v1/test-tenant/`:

```bash
# List workflows
curl http://localhost:8080/api/v1/test-tenant/workflows

# Execute workflow
curl -X POST http://localhost:8080/api/v1/test-tenant/workflows/{id}/execute

# Get execution status
curl http://localhost:8080/api/v1/test-tenant/executions/{id}
```

## Troubleshooting

**Port 8080 in use:**
```bash
lsof -ti:8080 | xargs kill -9
```

**Dependencies missing:**
```bash
cd workflowui/test-server
npm install
```

**Server won't start:**
```bash
cd workflowui/test-server
npm run start
# Check output for errors
```

## Results Location

After running tests:
- Screenshots: `workflowui/test-results/`
- Logs: `workflowui/test-results/logs/`
- Full report: `txt/workflowui-integration-test-results-20260205.md`

## Success Criteria

✅ Mock server health check returns `{"status":"ok"}`
✅ TypeScript workflow executes with result: 16
✅ Python workflow executes with result: 3
✅ All node results have status: "success"
✅ No errors in execution logs

## Next Steps

1. **UI Testing**: Add Playwright tests for visual editor
2. **Real DBAL**: Replace mock with actual DBAL backend
3. **CI/CD**: Add to GitHub Actions pipeline
4. **Performance**: Benchmark execution times

See `README.md` for comprehensive documentation.
