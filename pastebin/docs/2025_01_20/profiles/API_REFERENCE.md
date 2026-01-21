# ProfileManager API Reference

Complete API documentation for the ProfileManager class.

## Classes

### ProfileManager

Main class for managing quality validation profiles.

#### Static Methods

##### `getInstance(): ProfileManager`

Returns the singleton instance of ProfileManager.

```typescript
const manager = ProfileManager.getInstance();
```

#### Instance Methods

##### `async initialize(): Promise<void>`

Initialize the profile manager by loading custom and environment-specific profiles.

```typescript
await profileManager.initialize();
```

Must be called before other operations.

##### `getProfile(name: string): ProfileDefinition`

Retrieve a profile by name. Returns a deep copy.

```typescript
const profile = profileManager.getProfile('strict');
```

**Throws**: `ConfigurationError` if profile not found

##### `getAllProfileNames(): string[]`

Get all available profile names including built-in and custom profiles.

```typescript
const names = profileManager.getAllProfileNames();
// ['strict', 'moderate', 'lenient', 'my-custom']
```

##### `getAllProfiles(): ProfileDefinition[]`

Get all available profiles.

```typescript
const profiles = profileManager.getAllProfiles();
```

##### `setCurrentProfile(name: string): void`

Set the active profile.

```typescript
profileManager.setCurrentProfile('strict');
```

**Throws**: `ConfigurationError` if profile doesn't exist

##### `getCurrentProfile(): ProfileDefinition`

Get the currently active profile.

```typescript
const current = profileManager.getCurrentProfile();
```

##### `getCurrentProfileName(): string`

Get the name of the currently active profile.

```typescript
const name = profileManager.getCurrentProfileName();
// 'moderate'
```

##### `createProfile(name: string, definition: ProfileDefinition, saveToFile?: boolean): ProfileDefinition`

Create a new custom profile.

```typescript
const newProfile: ProfileDefinition = {
  name: 'my-profile',
  description: 'Custom profile',
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

profileManager.createProfile('my-profile', newProfile, true);
```

**Parameters**:
- `name`: Profile identifier
- `definition`: ProfileDefinition object
- `saveToFile`: Save to `.quality/profiles.json` (default: true)

**Returns**: The created profile

**Throws**:
- `ConfigurationError` if profile already exists
- `ConfigurationError` if definition is invalid

##### `updateProfile(name: string, updates: Partial<ProfileDefinition>, saveToFile?: boolean): ProfileDefinition`

Update an existing profile.

```typescript
const updated = profileManager.updateProfile('my-profile', {
  minimumScores: {
    codeQuality: 85,
    testCoverage: 75,
    architecture: 85,
    security: 90
  }
}, true);
```

**Parameters**:
- `name`: Profile name to update
- `updates`: Partial profile updates
- `saveToFile`: Save changes (default: true)

**Returns**: Updated profile

**Throws**: `ConfigurationError` if validation fails

##### `deleteProfile(name: string, deleteFromFile?: boolean): void`

Delete a custom profile.

```typescript
profileManager.deleteProfile('my-profile', true);
```

**Parameters**:
- `name`: Profile name
- `deleteFromFile`: Remove from file (default: true)

**Throws**: `ConfigurationError` if built-in profile or profile doesn't exist

##### `isBuiltInProfile(name: string): boolean`

Check if a profile is built-in.

```typescript
profileManager.isBuiltInProfile('strict'); // true
profileManager.isBuiltInProfile('my-profile'); // false
```

##### `exportProfile(name: string): string`

Export profile as JSON string.

```typescript
const json = profileManager.exportProfile('moderate');
```

**Returns**: JSON string representation

##### `importProfile(name: string, jsonString: string, saveToFile?: boolean): ProfileDefinition`

Import a profile from JSON string.

```typescript
const json = '{"name":"imported","description":"...","weights":{...}}';
profileManager.importProfile('imported', json, true);
```

**Parameters**:
- `name`: New profile name
- `jsonString`: JSON string
- `saveToFile`: Save to file (default: true)

**Returns**: Imported profile

**Throws**: `ConfigurationError` if JSON invalid or validation fails

##### `compareProfiles(name1: string, name2: string): Record<string, any>`

Compare two profiles showing differences.

```typescript
const comparison = profileManager.compareProfiles('strict', 'lenient');
// {
//   profile1Name: 'strict',
//   profile2Name: 'lenient',
//   weights: { ... },
//   minimumScores: { ... }
// }
```

**Returns**: Comparison object with differences

##### `getCurrentEnvironment(): EnvironmentType`

Get the current environment (dev, staging, or production).

```typescript
const env = profileManager.getCurrentEnvironment();
// 'production'
```

##### `setEnvironment(environment: EnvironmentType): void`

Set the environment.

```typescript
profileManager.setEnvironment('staging');
```

##### `getEnvironmentProfiles(environment: EnvironmentType): ProfileDefinition[]`

Get profiles for a specific environment.

```typescript
const prodProfiles = profileManager.getEnvironmentProfiles('production');
```

## Types

### ProfileDefinition

```typescript
interface ProfileDefinition {
  name: string;
  description: string;
  weights: {
    codeQuality: number;
    testCoverage: number;
    architecture: number;
    security: number;
  };
  minimumScores: {
    codeQuality: number;
    testCoverage: number;
    architecture: number;
    security: number;
  };
  thresholds?: {
    complexity?: {
      max?: number;
      warning?: number;
    };
    coverage?: {
      minimum?: number;
      warning?: number;
    };
    duplication?: {
      maxPercent?: number;
      warningPercent?: number;
    };
  };
}
```

### ProfileName

```typescript
type ProfileName = 'strict' | 'moderate' | 'lenient' | 'custom';
```

### EnvironmentType

```typescript
type EnvironmentType = 'dev' | 'staging' | 'production';
```

## Built-in Profiles

### Strict

High-quality standards for production-critical code.

```typescript
{
  name: 'strict',
  weights: {
    codeQuality: 0.35,
    testCoverage: 0.4,
    architecture: 0.15,
    security: 0.1
  },
  minimumScores: {
    codeQuality: 90,
    testCoverage: 85,
    architecture: 85,
    security: 95
  }
}
```

### Moderate (Default)

Balanced standards for typical projects.

```typescript
{
  name: 'moderate',
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
}
```

### Lenient

Relaxed standards for development.

```typescript
{
  name: 'lenient',
  weights: {
    codeQuality: 0.25,
    testCoverage: 0.3,
    architecture: 0.25,
    security: 0.2
  },
  minimumScores: {
    codeQuality: 70,
    testCoverage: 60,
    architecture: 70,
    security: 75
  }
}
```

## Examples

### Basic Usage

```typescript
import { profileManager } from '@/lib/quality-validator';

// Initialize
await profileManager.initialize();

// Get a profile
const profile = profileManager.getProfile('moderate');
console.log(profile.weights);

// List all profiles
const names = profileManager.getAllProfileNames();
console.log(names);
```

### Create Custom Profile

```typescript
const customProfile: ProfileDefinition = {
  name: 'my-team-standard',
  description: 'Our team production standard',
  weights: {
    codeQuality: 0.32,
    testCoverage: 0.33,
    architecture: 0.22,
    security: 0.13
  },
  minimumScores: {
    codeQuality: 82,
    testCoverage: 72,
    architecture: 82,
    security: 87
  }
};

profileManager.createProfile('team-standard', customProfile);
```

### Compare Profiles

```typescript
const comparison = profileManager.compareProfiles('strict', 'moderate');
console.log(comparison.weights.differences);
// {
//   codeQuality: 0.05,
//   testCoverage: 0.05,
//   architecture: 0.05,
//   security: 0.05
// }
```

### Environment Detection

```typescript
// Automatically detects from NODE_ENV
const env = profileManager.getCurrentEnvironment();

// Get environment-specific profiles
if (env === 'production') {
  const prodProfiles = profileManager.getEnvironmentProfiles('production');
  // Use stricter validation
}
```

### Export/Import

```typescript
// Export profile
const json = profileManager.exportProfile('moderate');
fs.writeFileSync('my-profile.json', json);

// Import profile
const imported = fs.readFileSync('my-profile.json', 'utf-8');
profileManager.importProfile('imported-profile', imported);
```

## Validation Rules

All profiles are automatically validated:

1. **Weights must sum to 1.0** (within 0.001 tolerance)
2. **Minimum scores must be 0-100**
3. **All four dimensions required** (codeQuality, testCoverage, architecture, security)
4. **Thresholds must be consistent**: warning ≤ max

## Error Handling

```typescript
try {
  profileManager.setCurrentProfile('invalid');
} catch (error) {
  if (error instanceof ConfigurationError) {
    console.error('Configuration error:', error.message);
    console.error('Available profiles:', profileManager.getAllProfileNames());
  }
}
```

## Performance

- Profile loading: <1ms per profile
- Profile switching: <1ms
- Weight application: <1ms
- No impact on analysis time
