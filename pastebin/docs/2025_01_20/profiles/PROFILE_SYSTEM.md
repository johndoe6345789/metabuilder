# Multi-Profile Configuration System

## Overview

The Quality Validator now supports multiple quality profiles to accommodate different contexts and standards. Profiles define:

- **Scoring weights** for different quality metrics
- **Minimum threshold scores** for each dimension
- **Quality thresholds** for complexity, coverage, and duplication
- **Environment-specific settings** for development, staging, and production

## Built-in Profiles

### 1. Strict Profile

Enterprise-grade standards for production-critical code.

```
Weights:
  Code Quality: 35%
  Test Coverage: 40%
  Architecture: 15%
  Security: 10%

Minimum Scores:
  Code Quality: 90
  Test Coverage: 85
  Architecture: 85
  Security: 95

Thresholds:
  Complexity Max: 10
  Complexity Warning: 8
  Coverage Minimum: 85%
  Duplication Max: 2%
```

**Use for:** Payment systems, security-sensitive code, critical infrastructure.

### 2. Moderate Profile (Default)

Standard production quality for typical projects.

```
Weights:
  Code Quality: 30%
  Test Coverage: 35%
  Architecture: 20%
  Security: 15%

Minimum Scores:
  Code Quality: 80
  Test Coverage: 70
  Architecture: 80
  Security: 85

Thresholds:
  Complexity Max: 15
  Complexity Warning: 12
  Coverage Minimum: 70%
  Duplication Max: 5%
```

**Use for:** Standard production applications, business logic.

### 3. Lenient Profile

Relaxed standards for development and experimentation.

```
Weights:
  Code Quality: 25%
  Test Coverage: 30%
  Architecture: 25%
  Security: 20%

Minimum Scores:
  Code Quality: 70
  Test Coverage: 60
  Architecture: 70
  Security: 75

Thresholds:
  Complexity Max: 20
  Complexity Warning: 15
  Coverage Minimum: 60%
  Duplication Max: 8%
```

**Use for:** Early-stage code, prototypes, feature branches.

## Selecting a Profile

### Command Line

```bash
# Use strict profile
quality-validator --profile strict

# Use lenient profile
quality-validator --profile lenient

# Use custom profile
quality-validator --profile my-custom-profile
```

### Environment Variable

```bash
export QUALITY_PROFILE=strict
quality-validator

# Or inline
QUALITY_PROFILE=moderate quality-validator --format json
```

### Configuration File

Add to `.qualityrc.json`:

```json
{
  "profile": "strict",
  "codeQuality": { ... },
  "testCoverage": { ... }
}
```

### Default Behavior

The validator uses the **moderate** profile by default if none is specified.

## Profile Management Commands

### List All Profiles

```bash
quality-validator --list-profiles
```

Output:
```
STRICT (CURRENT)
  Description: Enterprise grade - highest standards
  Weights: Code Quality: 0.35, Test Coverage: 0.4, Architecture: 0.15, Security: 0.1
  Minimum Scores: Code Quality: 90, Test Coverage: 85, Architecture: 85, Security: 95

MODERATE
  Description: Standard production quality
  ...

LENIENT
  Description: Development/experimentation - relaxed standards
  ...
```

### Show Profile Details

```bash
quality-validator --show-profile strict
```

Output:
```json
{
  "name": "strict",
  "description": "Enterprise grade - highest standards",
  "weights": {
    "codeQuality": 0.35,
    "testCoverage": 0.4,
    "architecture": 0.15,
    "security": 0.1
  },
  "minimumScores": {
    "codeQuality": 90,
    "testCoverage": 85,
    "architecture": 85,
    "security": 95
  },
  "thresholds": { ... }
}
```

### Create Custom Profile

```bash
quality-validator --create-profile my-profile
```

Or programmatically:

```typescript
import { profileManager } from './quality-validator';

const customProfile = {
  name: 'my-profile',
  description: 'My custom profile',
  weights: {
    codeQuality: 0.35,
    testCoverage: 0.30,
    architecture: 0.20,
    security: 0.15
  },
  minimumScores: {
    codeQuality: 85,
    testCoverage: 75,
    architecture: 80,
    security: 90
  }
};

profileManager.createProfile('my-profile', customProfile);
```

## Custom Profiles

### Creating Custom Profiles

Custom profiles are saved in `.quality/profiles.json`:

```json
{
  "my-profile": {
    "name": "my-profile",
    "description": "Profile for backend services",
    "weights": {
      "codeQuality": 0.35,
      "testCoverage": 0.30,
      "architecture": 0.20,
      "security": 0.15
    },
    "minimumScores": {
      "codeQuality": 85,
      "testCoverage": 75,
      "architecture": 80,
      "security": 90
    }
  }
}
```

### Profile Validation

Profiles must meet these requirements:

1. **Weights must sum to 1.0** (within 0.001 tolerance)
2. **Minimum scores must be 0-100**
3. **All four dimensions required** (codeQuality, testCoverage, architecture, security)
4. **Thresholds consistency**: warning < max

Invalid profiles will be rejected:

```typescript
// Invalid: weights don't sum to 1.0
{
  weights: {
    codeQuality: 0.3,
    testCoverage: 0.3,
    architecture: 0.2,
    security: 0.1  // Sum = 0.9
  }
}

// Invalid: score out of range
{
  minimumScores: {
    codeQuality: 150  // Must be 0-100
  }
}

// Invalid: thresholds inconsistent
{
  thresholds: {
    complexity: {
      max: 10,
      warning: 15  // Must be <= max
    }
  }
}
```

## Environment-Specific Profiles

Profiles can be customized per environment:

- **Development**: `.quality/profiles.dev.json`
- **Staging**: `.quality/profiles.staging.json`
- **Production**: `.quality/profiles.prod.json`

These are auto-detected based on `NODE_ENV`:

```bash
# Uses profiles.dev.json
NODE_ENV=development quality-validator

# Uses profiles.staging.json
NODE_ENV=staging quality-validator

# Uses profiles.prod.json
NODE_ENV=production quality-validator

# Falls back to default profiles
NODE_ENV=test quality-validator
```

### Example Environment Profile

`.quality/profiles.prod.json`:

```json
{
  "production": {
    "name": "production",
    "description": "Strict standards for production",
    "weights": {
      "codeQuality": 0.35,
      "testCoverage": 0.40,
      "architecture": 0.15,
      "security": 0.10
    },
    "minimumScores": {
      "codeQuality": 92,
      "testCoverage": 88,
      "architecture": 88,
      "security": 98
    }
  }
}
```

## API Usage

### TypeScript/JavaScript API

```typescript
import {
  profileManager,
  ProfileDefinition,
  ProfileName
} from './quality-validator';

// Initialize
await profileManager.initialize();

// Get a profile
const profile = profileManager.getProfile('strict');

// Get current profile
const current = profileManager.getCurrentProfile();
const name = profileManager.getCurrentProfileName();

// Set current profile
profileManager.setCurrentProfile('moderate');

// List all profiles
const allNames = profileManager.getAllProfileNames();
const allProfiles = profileManager.getAllProfiles();

// Create custom profile
const customProfile: ProfileDefinition = {
  name: 'custom',
  description: 'My custom profile',
  weights: {
    codeQuality: 0.3,
    testCoverage: 0.35,
    architecture: 0.2,
    security: 0.15
  },
  minimumScores: {
    codeQuality: 80,
    testCoverage: 70,
    architecture: 80,
    security: 85
  }
};

profileManager.createProfile('my-custom', customProfile);

// Update profile
profileManager.updateProfile('my-custom', {
  minimumScores: {
    codeQuality: 85,
    testCoverage: 75,
    architecture: 85,
    security: 90
  }
});

// Delete profile
profileManager.deleteProfile('my-custom');

// Export profile
const json = profileManager.exportProfile('moderate');

// Import profile
profileManager.importProfile('imported', json);

// Compare profiles
const comparison = profileManager.compareProfiles('strict', 'lenient');

// Check if built-in
const isBuiltIn = profileManager.isBuiltInProfile('strict');

// Environment support
const env = profileManager.getCurrentEnvironment();
profileManager.setEnvironment('production');
const prodProfiles = profileManager.getEnvironmentProfiles('production');
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Quality Validation
        run: |
          npm install
          npx quality-validator --profile strict --format json --output report.json

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: quality-report
          path: report.json

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./report.json');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `Quality Score: ${report.overall.score} (${report.overall.grade})`
            });
```

### Different Profiles by Environment

```yaml
name: Quality Check

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        profile: [lenient, moderate, strict]
    steps:
      - uses: actions/checkout@v3

      - name: Run Quality Validation
        run: npx quality-validator --profile ${{ matrix.profile }}
```

### Enforce Strict Profile for Main Branch

```yaml
name: Production Quality

on:
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Quality Validation (Strict)
        run: npx quality-validator --profile strict --format json --output report.json

      - name: Check Quality Gate
        run: |
          SCORE=$(jq '.overall.score' report.json)
          if (( $(echo "$SCORE < 85" | bc -l) )); then
            echo "Quality score $SCORE below threshold of 85"
            exit 1
          fi
```

## Best Practices

### 1. Select Profile by Maturity

- **Lenient**: Feature branches, rapid development, prototypes
- **Moderate**: Regular development, stable feature branches
- **Strict**: Main branch, releases, critical services

### 2. Environment Consistency

Use same profile across environments or progressively stricter:

```bash
# Development: lenient
NODE_ENV=development quality-validator --profile lenient

# Staging: moderate
NODE_ENV=staging quality-validator --profile moderate

# Production: strict
NODE_ENV=production quality-validator --profile strict
```

### 3. Custom Profiles for Team Standards

Define custom profiles that match your organization:

```json
{
  "team-standard": {
    "name": "team-standard",
    "description": "Our team's production standard",
    "weights": { ... },
    "minimumScores": { ... }
  }
}
```

### 4. Progressive Profile Tightening

Start with lenient, gradually move to stricter:

```bash
# Phase 1: Establish baseline
quality-validator --profile lenient

# Phase 2: Move to moderate
quality-validator --profile moderate

# Phase 3: Enforce strict
quality-validator --profile strict
```

### 5. Profile Documentation

Include profile selection in your project documentation:

```markdown
## Quality Standards

- **Development**: Lenient profile for rapid development
- **Feature branches**: Moderate profile for code review
- **Main branch**: Strict profile for releases
- **Critical services**: Custom profile with enhanced security checks
```

## Troubleshooting

### Profile Not Found

```
Error: Profile not found: my-profile
Available profiles: strict, moderate, lenient
```

**Solution**: Check `.quality/profiles.json` for custom profiles or use a built-in profile.

### Invalid Weights

```
Error: Profile weights must sum to 1.0
Got: 0.95
```

**Solution**: Adjust profile weights so they sum to exactly 1.0:

```typescript
weights: {
  codeQuality: 0.3,    // 30%
  testCoverage: 0.35,  // 35%
  architecture: 0.2,   // 20%
  security: 0.15       // 15%
  // Total: 100%
}
```

### CLI Profile Not Recognized

```bash
# Wrong
quality-validator --profile=strict

# Correct
quality-validator --profile strict
```

## Migration Guide

### From Single Configuration to Profiles

**Before:**

```json
{
  "scoring": {
    "weights": {
      "codeQuality": 0.3,
      "testCoverage": 0.35,
      "architecture": 0.2,
      "security": 0.15
    }
  }
}
```

**After:**

```bash
# Use profile directly
quality-validator --profile moderate

# Or in config
{
  "profile": "moderate"
}
```

### Upgrading to Profiles

1. Identify your current quality standards
2. Map to nearest built-in profile
3. Create custom profile if needed:
   - Extract current weights from `.qualityrc.json`
   - Create profile in `.quality/profiles.json`
4. Test with `--list-profiles` and `--show-profile`
5. Update CI/CD to use profiles

## Performance Impact

Profile selection has negligible performance impact:

- Profile loading: <1ms
- Weight application: <1ms
- No additional analysis needed

Profile switching during runtime has no measurable overhead.
