# Phase 8: Integration Test Suite - Quick Start Guide

## Installation (2 minutes)

```bash
# Navigate to email client directory
cd /Users/rmac/Documents/metabuilder/emailclient

# Install test dependencies
pip install -r tests/requirements.txt

# Verify installation
pytest --version  # pytest 7.4.3
```

## Run Tests (5 seconds to 2 minutes)

### Quick Sanity Check
```bash
# Run a single fast test (0.5s)
pytest tests/integration/test_email_client_e2e.py::TestAccountCreation::test_create_email_account_minimal -v
```

### Run All Tests
```bash
# Full suite (30-60 seconds, no Docker)
pytest tests/integration/ -v

# With coverage report
pytest tests/integration/ --cov=services/email_service --cov-report=html
```

### Run Specific Phase
```bash
pytest tests/integration/test_email_client_e2e.py::TestEmailSync -v
pytest tests/integration/test_email_client_e2e.py::TestAPIEndpoints -v
```

### Run by Category
```bash
# Skip slow Docker tests
pytest tests/integration/ -m "not docker"

# Run only performance tests
pytest tests/integration/ -m performance

# Run only async tests
pytest tests/integration/ -m asyncio
```

### Docker Services (requires Docker installed)
```bash
# Terminal 1: Start services
cd /Users/rmac/Documents/metabuilder/emailclient
docker-compose up

# Terminal 2: Run Docker-dependent tests
cd /Users/rmac/Documents/metabuilder/emailclient
RUN_DOCKER_TESTS=1 pytest tests/integration/ -m docker -v

# Cleanup
docker-compose down
```

## Test Structure

```
tests/integration/
├── conftest.py                    # Fixtures and test setup
├── test_email_client_e2e.py      # 67 test cases
├── README.md                      # Comprehensive docs
└── __init__.py
```

## Test Classes (Pick One to Debug)

| Phase | Class | Tests | Command |
|-------|-------|-------|---------|
| 8.1 | TestAccountCreation | 4 | `pytest -k TestAccountCreation` |
| 8.2 | TestEmailSync | 5 | `pytest -k TestEmailSync` |
| 8.3 | TestEmailSend | 3 | `pytest -k TestEmailSend` |
| 8.4 | TestEmailReceive | 3 | `pytest -k TestEmailReceive` |
| 8.5 | TestFolderManagement | 4 | `pytest -k TestFolderManagement` |
| 8.6 | TestAttachmentHandling | 4 | `pytest -k TestAttachmentHandling` |
| 8.7 | TestSearchAndFiltering | 5 | `pytest -k TestSearchAndFiltering` |
| 8.8 | TestErrorHandling | 6 | `pytest -k TestErrorHandling` |
| 8.9 | TestPerformance | 3 | `pytest -k TestPerformance` |
| 8.10 | TestDockerComposeIntegration | 4 | `RUN_DOCKER_TESTS=1 pytest -k Docker` |
| 8.11 | TestAPIEndpoints | 8 | `pytest -k TestAPIEndpoints` |
| 8.12 | TestWorkflowPlugins | 4 | `pytest -k TestWorkflowPlugins` |

## Common Commands

```bash
# Run with verbose output
pytest tests/integration/ -v -s

# Run with short traceback
pytest tests/integration/ --tb=short

# Run in parallel (4 workers)
pytest tests/integration/ -n 4

# Run with timeout (5 seconds per test)
pytest tests/integration/ --timeout=5

# Generate HTML coverage report
pytest tests/integration/ --cov --cov-report=html
# Open htmlcov/index.html in browser

# Show which tests took longest
pytest tests/integration/ -v --durations=10

# Stop on first failure
pytest tests/integration/ -x

# Run only failures from last run
pytest tests/integration/ --lf
```

## Debugging a Failing Test

```bash
# Get full output
pytest tests/integration/test_email_client_e2e.py::TestEmailSync::test_imap_sync_basic -vv -s

# Use Python debugger (add in test)
def test_something():
    import pdb; pdb.set_trace()
    # ... test code ...

pytest tests/integration/test_email_client_e2e.py::TestEmailSync::test_imap_sync_basic -s

# Show local variables on failure
pytest tests/integration/ -l
```

## Key Fixtures Used

```python
# Database
test_db                    # In-memory SQLite
sample_email_client        # Complete account config
sample_messages            # 100 test messages
sample_folders             # 4 folders (inbox, sent, etc)

# Mocks
mock_imap_client          # Async IMAP mock
mock_smtp_client          # Async SMTP mock
mock_redis                # Async Redis mock
api_client                # HTTP client mock

# Auth
auth_headers              # JWT headers with tenant/user
sample_tenant_id          # "tenant-001"
sample_user_id            # "user-001"

# Utilities
benchmark_timer           # Performance timer
email_test_payload        # RFC 5322 email
docker_compose_up         # Docker services lifecycle
```

## Test Results Interpretation

```
===== test session starts =====
platform linux -- Python 3.11.0, pytest-7.4.3
collected 67 items

tests/integration/test_email_client_e2e.py::TestAccountCreation::test_create_email_account_minimal PASSED [  1%]
tests/integration/test_email_client_e2e.py::TestAccountCreation::test_create_email_account_with_sync_settings PASSED [  3%]
...
===== 67 passed in 45.23s =====
```

### Status Codes
- ✅ PASSED - Test succeeded
- ❌ FAILED - Test failed (check traceback)
- ⊘ SKIPPED - Test was skipped (usually Docker tests)
- ⚠ XFAIL - Expected failure (test marked as expected to fail)

## Performance Expected Results

All tests should complete in <2 minutes on standard hardware:

- **Account Creation**: ~50 tests/sec
- **Folder Ops**: ~100 tests/sec
- **Search on 1000 msgs**: <1 second
- **Attachment handling**: <100 ms
- **Docker services**: 30-60 seconds startup

## Troubleshooting

### "ModuleNotFoundError: No module named 'pytest'"
```bash
pip install -r tests/requirements.txt
```

### "Docker connection refused"
```bash
docker-compose up -d
# Wait 10 seconds for services to start
docker ps  # Verify containers running
```

### "Database locked" error
This means test_db cleanup failed. Solution:
```python
# conftest.py has auto-cleanup, but if it fails:
pytest tests/integration/ --tb=short  # Run again
```

### Tests too slow
```bash
# Run in parallel
pytest tests/integration/ -n 4

# Skip Docker tests
pytest tests/integration/ -m "not docker"

# Run only fast tests
pytest tests/integration/ -m "not performance"
```

### Print debug output
```bash
# Add to your test
print("Debug info here")

# Run with -s flag
pytest tests/integration/ -s
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -r tests/requirements.txt
      - run: pytest tests/integration/ --cov --cov-report=xml
      - uses: codecov/codecov-action@v3
```

### Pre-Commit Hook
```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
pytest tests/integration/ -m "not docker" --tb=short
```

## File Locations

| File | Purpose |
|------|---------|
| `tests/integration/test_email_client_e2e.py` | All 67 tests |
| `tests/integration/conftest.py` | Fixtures & mocks |
| `tests/integration/README.md` | Full documentation |
| `tests/requirements.txt` | Dependencies |
| `pytest.ini` | Pytest config |
| `tests/PHASE_8_SUMMARY.md` | Implementation summary |

## Next Phase

After passing Phase 8 tests, ready for:
- **Phase 9**: Backend Email Service (Flask + Celery)
- **Phase 10**: Redux State Slices (Redux Toolkit)
- **Phase 11**: Custom React Hooks (Email operations)
- **Phase 12**: Email Client Bootloader (Next.js)

## More Information

```bash
# See comprehensive docs
cat tests/integration/README.md

# See implementation details
cat tests/PHASE_8_SUMMARY.md

# View test file structure
head -100 tests/integration/test_email_client_e2e.py
```

## Quick Reference

```bash
# Fast test
pytest tests/integration/test_email_client_e2e.py::TestAccountCreation::test_create_email_account_minimal -v

# All tests
pytest tests/integration/ -v

# With coverage
pytest tests/integration/ --cov --cov-report=html

# Docker tests only
RUN_DOCKER_TESTS=1 pytest -m docker

# Performance tests
pytest -k TestPerformance -v

# Specific feature
pytest -k "test_imap" -v

# Stop at first failure
pytest -x

# Run last failed
pytest --lf
```

That's it! You're ready to test the email client.
