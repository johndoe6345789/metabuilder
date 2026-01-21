# Quality Profiles Documentation

This directory contains comprehensive documentation for the multi-profile configuration system implemented in the Quality Validator.

## Quick Start

Start here to understand profiles and how to use them:

**[PROFILE_SYSTEM.md](./PROFILE_SYSTEM.md)** (Read First)
- Overview of profiles system
- Built-in profiles explained
- How to select profiles
- Profile management commands
- CI/CD integration
- Best practices

## API Documentation

Detailed technical reference for developers:

**[API_REFERENCE.md](./API_REFERENCE.md)**
- ProfileManager class methods
- Type definitions
- Complete API examples
- Validation rules
- Error handling

## Implementation Details

Full technical breakdown of the implementation:

**[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
- Deliverables overview
- Integration points
- File structure
- Test coverage
- Performance metrics

## File Locations

### Core Implementation
- Main class: `/src/lib/quality-validator/config/ProfileManager.ts`
- Tests: `/src/lib/quality-validator/config/ProfileManager.test.ts`
- Integration: `/src/lib/quality-validator/config/ConfigLoader.ts`
- CLI: `/src/lib/quality-validator/index.ts`

### Profile Definitions
- Built-in profiles: `/.quality/profiles.json`
- Custom profiles: `/.quality/profiles.json` (created on first use)
- Dev profiles: `/.quality/profiles.dev.json` (optional)
- Staging profiles: `/.quality/profiles.staging.json` (optional)
- Production profiles: `/.quality/profiles.prod.json` (optional)

## Key Concepts

### Profiles
A profile defines quality standards with:
- **Weights**: How to distribute quality scoring (e.g., 30% code quality, 35% coverage)
- **Minimum scores**: Thresholds for each dimension (e.g., code quality ≥ 80)
- **Thresholds**: Specific limits (e.g., max complexity of 15)

### Built-in Profiles
- **Strict**: Enterprise-grade standards (90-95 minimum scores)
- **Moderate**: Standard production quality (70-85 minimum scores) - **DEFAULT**
- **Lenient**: Development standards (60-75 minimum scores)

### Custom Profiles
Create your own profiles matching your team's standards.

## Usage Examples

### Select Profile via CLI
```bash
quality-validator --profile strict
```

### Use Moderate Profile (Default)
```bash
quality-validator
```

### List Available Profiles
```bash
quality-validator --list-profiles
```

### Show Profile Details
```bash
quality-validator --show-profile strict
```

### Environment-Specific Profile
```bash
# Development: lenient standards
NODE_ENV=development quality-validator

# Production: strict standards
NODE_ENV=production quality-validator
```

## Test Coverage

The implementation includes:
- **36 profile tests**: All dimensions of profile functionality
- **23 config tests**: ConfigLoader integration
- **351 validator tests**: Full quality validator suite
- **Total**: 400+ tests, all passing

## Common Tasks

### Create a Custom Profile
Edit `.quality/profiles.json`:
```json
{
  "my-profile": {
    "name": "my-profile",
    "description": "Our team standard",
    "weights": {
      "codeQuality": 0.3,
      "testCoverage": 0.35,
      "architecture": 0.2,
      "security": 0.15
    },
    "minimumScores": {
      "codeQuality": 82,
      "testCoverage": 75,
      "architecture": 80,
      "security": 87
    }
  }
}
```

Or via API:
```typescript
import { profileManager } from '@/lib/quality-validator';

await profileManager.initialize();
profileManager.createProfile('my-profile', {
  name: 'my-profile',
  description: 'Our team standard',
  weights: { /* ... */ },
  minimumScores: { /* ... */ }
});
```

### Compare Two Profiles
```bash
quality-validator --show-profile strict
quality-validator --show-profile moderate
# Compare the JSON output
```

Or via API:
```typescript
const comparison = profileManager.compareProfiles('strict', 'moderate');
console.log(comparison.weights.differences);
```

### Use Environment-Specific Profiles
Create `/.quality/profiles.prod.json`:
```json
{
  "production": {
    "name": "production",
    "description": "Production standards",
    "weights": { /* ... */ },
    "minimumScores": { /* higher scores */ }
  }
}
```

Then:
```bash
NODE_ENV=production quality-validator
```

## Troubleshooting

**Q: Profile not found error**
A: Check the profile name and availability:
```bash
quality-validator --list-profiles
```

**Q: How do I modify a profile?**
A: Edit `.quality/profiles.json` directly or use the API.

**Q: Can I delete built-in profiles?**
A: No, built-in profiles (strict, moderate, lenient) cannot be deleted.

**Q: How do I restore default profiles?**
A: Delete `.quality/profiles.json` and reinitialize.

**Q: What's the difference between profiles?**
A: See PROFILE_SYSTEM.md or run:
```bash
quality-validator --list-profiles
```

## Next Steps

1. **Read [PROFILE_SYSTEM.md](./PROFILE_SYSTEM.md)** for complete usage guide
2. **Check [API_REFERENCE.md](./API_REFERENCE.md)** for programming interface
3. **Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** for technical details
4. **Select a profile** for your project
5. **Integrate into CI/CD** using examples in PROFILE_SYSTEM.md

## Support

For questions about:
- **Usage**: See PROFILE_SYSTEM.md
- **API**: See API_REFERENCE.md
- **Implementation**: See IMPLEMENTATION_SUMMARY.md
- **Troubleshooting**: See PROFILE_SYSTEM.md Troubleshooting section

---

Last updated: January 20, 2025
Implementation: Complete ✅
Test coverage: 36 tests (all passing)
Documentation: Comprehensive
