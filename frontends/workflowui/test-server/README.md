# WorkflowUI Test Infrastructure

**Code = Doc**: All documentation is in `test-runner.py`

---

## Quick Start

```bash
# See all commands
./test-runner.py --help

# Start servers + run tests
./test-runner.py run --start-servers

# Run comprehensive tests
./test-runner.py run comprehensive

# Run with UI (interactive)
./test-runner.py run --ui

# View report
./test-runner.py report
```

---

## Features

- Mock DBAL server (port 8080)
- WorkflowUI dev server (port 3000)
- Playwright E2E tests (27 tests)
- Salesforce-style login
- 92.6% pass rate (25/27)

---

**Documentation**: Run `./test-runner.py --help`
