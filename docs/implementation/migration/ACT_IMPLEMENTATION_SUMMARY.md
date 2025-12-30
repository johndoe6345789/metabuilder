# GitHub Actions Testing with Act - Complete Implementation

This document provides a comprehensive overview of the act testing implementation for diagnosing and fixing GitHub Actions workflow failures.

## What Was Implemented

### 1. Documentation

#### `docs/ACT_TESTING.md` - Complete Guide
Comprehensive documentation covering:
- What act is and why to use it
- Installation instructions for all platforms
- Quick start guide
- Testing all project workflows
- Common issues and solutions
- Advanced usage patterns
- Debugging workflows step-by-step
- Best practices and CI workflow

#### `docs/ACT_QUICK_REFERENCE.md` - Quick Reference Card
Condensed cheat sheet with:
- Essential commands
- Common fixes table
- Pre-push checklist
- Troubleshooting flowchart
- Useful aliases
- Emergency fixes

#### `docs/github-actions-local-testing.md` - Technical Deep Dive
Detailed technical documentation including:
- Act fundamentals
- Workflow-specific testing
- Custom event payloads
- Secrets management
- Platform specifications
- Current known issues in project

### 2. Testing Scripts

#### `scripts/diagnose-workflows.sh` - Diagnostic Tool
Bash script that checks for workflow issues **without running act**:
- ✅ Validates package.json structure and scripts
- ✅ Checks for required dependencies
- ✅ Verifies Prisma setup
- ✅ Validates Playwright configuration
- ✅ Checks node_modules installation
- ✅ Inspects workflow files
- ✅ Validates environment configuration
- ✅ Checks git ignore settings
- 📊 Provides detailed report with issue counts
- 💡 Suggests fixes for each problem

**Usage:**
```bash
chmod +x scripts/diagnose-workflows.sh
./scripts/diagnose-workflows.sh
```

**Output:**
- Green ✓ for passing checks
- Yellow ⚠ for warnings
- Red ✗ for critical issues
- Actionable fix suggestions for each issue
- Exit code reflects issue count

#### `scripts/test-workflows.sh` - Interactive Testing Tool
Interactive menu-driven script for running workflows with act:
- 📋 Lists all workflows and jobs
- 🔍 Dry run preview
- 🧪 Test individual jobs
- 🔄 Run full CI pipeline
- 📝 Verbose output mode
- 🩺 Built-in diagnostics
- 📁 Saves logs to `/tmp/` for analysis
- ✨ Color-coded output
- 📊 Summary report

**Menu Options:**
1. List all workflows
2. Dry run (preview)
3. Test Prisma setup
4. Test linting
5. Test build
6. Test E2E tests
7. Run full CI pipeline
8. Run with verbose output
9. Diagnose issues

### 3. Updated Documentation

#### `.github/workflows/README.md`
Enhanced with:
- Act testing section
- Links to comprehensive guides
- Troubleshooting with act examples
- Command examples for each workflow

#### `README.md`
Updated with:
- Act installation instructions
- Quick testing commands
- Links to detailed documentation
- Integration with existing workflow

## How to Use

### For First-Time Setup

1. **Install Prerequisites:**
   ```bash
   # Install Docker (if not already installed)
   # macOS: Docker Desktop
   # Linux: docker.io package
   # Windows: Docker Desktop
   
   # Install act
   # macOS
   brew install act
   
   # Linux
   curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
   
   # Windows
   choco install act-cli
   ```

2. **Run Diagnostics:**
   ```bash
   ./scripts/diagnose-workflows.sh
   ```

3. **Fix Reported Issues:**
   Follow the fix suggestions in the diagnostic output.

4. **Test Workflows:**
   ```bash
   ./scripts/test-workflows.sh
   ```

### For Daily Development

**Before Every Commit:**
```bash
npm run lint
npm run build
```

**Before Every Push:**
```bash
./scripts/diagnose-workflows.sh
act -j lint -j build
```

**Before Creating PR:**
```bash
./scripts/test-workflows.sh
# Select option 7 (full CI pipeline)
```

**When Workflow Fails on GitHub:**
```bash
# Run the same job locally
act -j <job-name> -v

# Or use interactive menu
./scripts/test-workflows.sh
```

## Workflow Coverage

### Workflows That Can Be Tested

#### ✅ `ci.yml` - Full Support
All jobs can be tested locally:
- `prisma-check` - Validates Prisma setup
- `lint` - Runs ESLint
- `build` - Tests production build
- `test-e2e` - Runs Playwright tests

**Test with:**
```bash
act push
# or individually
act -j prisma-check
act -j lint
act -j build
act -j test-e2e
```

#### ⚠️ `code-review.yml` - Limited Support
Can be tested but requires PR context:
```bash
act pull_request -W .github/workflows/code-review.yml
```

Use custom event payload for better simulation.

#### ⚠️ `auto-merge.yml` - Limited Support
Requires GitHub API access, may not work fully locally.

#### ⚠️ `pr-management.yml` - Limited Support
Can be tested with custom event payload:
```bash
act pull_request -W .github/workflows/pr-management.yml -e event.json
```

### Known Limitations

1. **GitHub API Calls:**
   Workflows that use `github.rest.*` APIs may not work fully with act.

2. **Secrets:**
   Some workflows may require secrets. Create `.secrets` file (don't commit!).

3. **Docker Resources:**
   E2E tests may require more Docker memory (8GB+).

4. **Browser Tests:**
   Playwright tests may behave differently in Docker environment.

## Troubleshooting Guide

### Issue: Act Not Found

**Symptoms:**
```
bash: act: command not found
```

**Solution:**
Install act:
- macOS: `brew install act`
- Linux: `curl -s https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash`
- Windows: `choco install act-cli`

### Issue: Docker Not Running

**Symptoms:**
```
Cannot connect to the Docker daemon
```

**Solution:**
Start Docker Desktop or Docker daemon.

### Issue: Missing Dependencies

**Symptoms:**
```
npm ERR! missing: @prisma/client
```

**Solution:**
```bash
npm install
```

### Issue: Prisma Schema Not Found

**Symptoms:**
```
Error: Could not find Prisma schema
```

**Solution:**
```bash
npx prisma init
# Edit prisma/schema.prisma
npx prisma generate
```

### Issue: Docker Out of Memory

**Symptoms:**
```
Error: Process completed with exit code 137
```

**Solution:**
Open Docker Desktop → Settings → Resources → Increase Memory to 8GB+

### Issue: Workflow Passes Locally but Fails on GitHub

**Possible Causes:**
1. `package-lock.json` not committed
2. Environment differences
3. Secrets not available on GitHub
4. Different Node version

**Solution:**
```bash
# Ensure lockfile is committed
git add package-lock.json
git commit -m "Update package-lock.json"

# Test with exact CI environment
act -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
```

## File Structure

```
/workspaces/spark-template/
├── .github/
│   └── workflows/
│       ├── README.md              # Updated with act instructions
│       ├── ci.yml                 # Main CI workflow
│       ├── code-review.yml        # Automated PR review
│       ├── auto-merge.yml         # Auto-merge workflow
│       └── pr-management.yml      # PR labeling
├── docs/
│   ├── ACT_TESTING.md             # NEW: Complete testing guide
│   ├── ACT_QUICK_REFERENCE.md     # NEW: Quick reference card
│   └── github-actions-local-testing.md  # NEW: Technical deep dive
├── scripts/
│   ├── diagnose-workflows.sh      # NEW: Diagnostic tool
│   └── test-workflows.sh          # NEW: Interactive testing
└── README.md                      # Updated with act section
```

## Benefits

### 1. Faster Development
- Test workflows locally before pushing
- No need to push "fix CI" commits
- Immediate feedback on workflow issues

### 2. Better Debugging
- Verbose output shows exactly what fails
- Logs saved for analysis
- Can run specific jobs in isolation

### 3. Cost Savings
- Reduce GitHub Actions minutes usage
- No pollution of commit history
- Faster iteration cycles

### 4. Improved Confidence
- Know workflows will pass before pushing
- Catch issues early in development
- Better understanding of CI/CD pipeline

### 5. Learning Tool
- See how workflows execute
- Understand Docker environment
- Learn GitHub Actions behavior

## Next Steps

### For Users

1. **Install act** following platform-specific instructions
2. **Run diagnostics** to ensure project is ready
3. **Test one job** to verify act is working
4. **Integrate into workflow** - run before pushing
5. **Share knowledge** with team members

### For Maintainers

1. **Create ~/.actrc** with common settings
2. **Set up aliases** for frequently used commands
3. **Document project-specific quirks** in README
4. **Update workflows** to be act-friendly
5. **Add act to CI/CD documentation**

## Advanced Features

### Custom Event Payloads

Create `event.json`:
```json
{
  "pull_request": {
    "number": 1,
    "title": "Test PR",
    "body": "Testing with act"
  }
}
```

Use with:
```bash
act pull_request -e event.json
```

### Secrets Management

Create `.secrets` (add to .gitignore!):
```env
GITHUB_TOKEN=ghp_your_token
DATABASE_URL=postgresql://localhost/db
```

Use with:
```bash
act --secret-file .secrets
```

### Platform Specification

Create `~/.actrc`:
```
-P ubuntu-latest=catthehacker/ubuntu:act-latest
--secret-file .secrets
--env ACT=true
```

### Conditional Steps

Skip steps in act environment:
```yaml
- name: Deploy to production
  if: ${{ !env.ACT }}
  run: ./deploy.sh
```

## Resources

### Documentation
- [ACT_TESTING.md](ACT_TESTING.md) - Complete guide
- [ACT_QUICK_REFERENCE.md](ACT_QUICK_REFERENCE.md) - Quick reference
- [github-actions-local-testing.md](github-actions-local-testing.md) - Technical details

### Scripts
- `./scripts/diagnose-workflows.sh` - Diagnostics
- `./scripts/test-workflows.sh` - Interactive testing

### External Resources
- [Act GitHub Repository](https://github.com/nektos/act)
- [Act Documentation](https://github.com/nektos/act#readme)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

## Support

### Getting Help

1. **Run diagnostics:** `./scripts/diagnose-workflows.sh`
2. **Check documentation:** `docs/ACT_TESTING.md`
3. **Check logs:** `/tmp/act_output_*.log`
4. **Verbose mode:** `act -j <job> -v`
5. **Check act docs:** https://github.com/nektos/act
6. **Open issue:** Include diagnostic output

### Common Questions

**Q: Do I need to install act?**  
A: No, but it's highly recommended. You can use the diagnostic script without act.

**Q: Can I test all workflows?**  
A: Most workflows work. Those requiring GitHub API may have limitations.

**Q: Is Docker required?**  
A: Yes, act uses Docker to simulate the GitHub Actions environment.

**Q: How much disk space do I need?**  
A: ~5GB for Docker images, more if running E2E tests.

**Q: Can I use act in CI/CD?**  
A: Not recommended. Act is for local development/testing.

## Conclusion

This implementation provides a complete solution for testing GitHub Actions locally using act, with:

- ✅ Comprehensive documentation at multiple levels
- ✅ Interactive and automated testing tools
- ✅ Diagnostic capabilities without Docker
- ✅ Clear troubleshooting guides
- ✅ Integration with existing workflows
- ✅ Best practices and patterns

Users can now:
1. Quickly diagnose workflow issues
2. Test workflows before pushing
3. Debug failures locally
4. Reduce CI/CD iteration time
5. Build confidence in their changes

---

**Last Updated:** 2024
**Maintainer:** Project Team
**Version:** 1.0.0
