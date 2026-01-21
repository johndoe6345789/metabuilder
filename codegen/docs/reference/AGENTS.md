# 🤖 CodeForge AI Agents Architecture

## Overview

CodeForge uses a sophisticated AI agent architecture powered by OpenAI's GPT models to provide intelligent code generation, explanation, optimization, and error repair across the entire application. This document describes the agent system's design, components, and integration patterns.

## Architecture Principles

### 1. Modular Design
Each AI capability is encapsulated in specialized functions within service modules, allowing for:
- Independent testing and updates
- Clear separation of concerns
- Easy addition of new AI features
- Flexible model selection per use case

### 2. Context Awareness
All AI prompts include relevant project context:
- Existing models and their relationships
- Component hierarchy and structure
- Theme configuration and variants
- File contents and dependencies
- Error context from related files

### 3. Format Specification
Prompts specify exact output formats with schemas:
- JSON mode for structured data
- TypeScript interfaces for type safety
- Python with proper indentation
- Validation and sanitization of responses

### 4. Graceful Degradation
Robust error handling ensures:
- Clear error messages for users
- Fallback to manual editing
- Retry logic for transient failures
- Rate limit awareness and handling

## Core Service Modules

### AIService (`/src/lib/ai-service.ts`)

The central orchestration layer for all AI operations.

#### Key Functions

##### `generateCompleteApp(description: string)`
Generates a complete application structure from natural language.

**Prompt Strategy:**
- Analyzes description for key entities and relationships
- Creates Prisma models with appropriate field types
- Generates React components with Material UI
- Configures theme with harmonious color palette
- Returns structured JSON with all elements

**Output:**
```typescript
{
  files: ProjectFile[]
  models: PrismaModel[]
  theme: ThemeConfig
}
```

##### `generateModels(description: string)`
Creates Prisma models from descriptions.

**Prompt Strategy:**
- Identifies entities and their attributes
- Determines field types (String, Int, DateTime, etc.)
- Creates relations (one-to-many, many-to-many)
- Sets appropriate constraints (unique, required, default)

**Example:**
```
Input: "A blog with users, posts, and comments"
Output: User model with posts relation, Post model with author and comments, Comment model with post and author
```

##### `generateComponent(description: string, existingComponents: ComponentNode[])`
Generates React component structures.

**Prompt Strategy:**
- Includes existing components to avoid naming conflicts
- Uses Material UI component library
- Creates proper component hierarchy
- Configures props and children appropriately

**Output:**
```typescript
{
  id: string
  type: string (e.g., "Box", "Card", "Button")
  props: Record<string, any>
  children: ComponentNode[]
  name: string
}
```

##### `generateTheme(description: string)`
Creates Material UI themes with color palettes.

**Prompt Strategy:**
- Applies color theory for harmonious palettes
- Ensures WCAG AA accessibility (4.5:1 contrast)
- Creates both light and dark variants
- Configures typography hierarchy
- Sets spacing and border radius

**Validation:**
- Color contrast ratios verified
- Color format validation (hex to OKLCH)
- Semantic color naming (primary, secondary, etc.)

##### `explainCode(code: string, language: string)`
Provides detailed code explanations.

**Prompt Strategy:**
- Identifies key patterns and structures
- Explains purpose and functionality
- Notes best practices or anti-patterns
- Suggests improvements if applicable

##### `improveCode(code: string, language: string)`
Optimizes code quality and performance.

**Prompt Strategy:**
- Applies framework-specific best practices
- Improves readability and maintainability
- Optimizes performance where applicable
- Maintains existing functionality
- Adds TypeScript types if missing

##### `generatePlaywrightTests(description: string)`
Creates E2E test scenarios.

**Prompt Strategy:**
- Defines user flows from description
- Creates step-by-step test actions
- Uses appropriate selectors (role, testid, text)
- Adds meaningful assertions
- Handles edge cases and error states

##### `generateStorybookStories(componentName: string, description: string)`
Generates Storybook stories.

**Prompt Strategy:**
- Creates multiple story variations
- Configures args based on prop types
- Organizes by meaningful categories
- Shows different states and edge cases

##### `generateUnitTests(description: string, testType: string)`
Creates comprehensive test suites.

**Prompt Strategy:**
- Component tests use React Testing Library
- Function tests cover edge cases
- Hook tests use renderHook utility
- Integration tests combine multiple units
- Includes setup, assertions, and teardown

### ErrorRepairService (`/src/lib/error-repair-service.ts`)

Specialized service for error detection and automated repair.

#### Key Functions

##### `detectErrors(files: ProjectFile[])`
Scans files for various error types.

**Detection Methods:**
- **Syntax Errors**: Parse errors in code structure
- **Import Errors**: Missing or incorrect imports
- **Type Errors**: TypeScript type mismatches
- **Lint Errors**: ESLint violations and code smells

**Output:**
```typescript
{
  id: string
  fileId: string
  type: 'syntax' | 'import' | 'type' | 'lint'
  severity: 'error' | 'warning'
  message: string
  line: number
  suggestion: string
}
```

##### `repairError(error: Error, fileContent: string, relatedFiles: ProjectFile[])`
AI-powered error repair with context.

**Prompt Strategy:**
- Includes error message and stack trace
- Provides file content with line numbers
- Adds related file imports as context
- Explains the fix applied
- Preserves code structure and style

**Context Examples:**
- Import errors: Include package.json for available packages
- Type errors: Include type definition files
- Component errors: Include parent component context

##### `batchRepairErrors(errors: Error[], files: ProjectFile[])`
Repairs multiple errors efficiently.

**Strategy:**
- Groups errors by file
- Applies fixes in dependency order
- Validates fixes don't introduce new errors
- Returns repaired files and success status

### Generators (`/src/lib/generators/*`)

Code generation utilities for project export.

#### Functions

##### `generateNextJSProject(appName: string, models: PrismaModel[], components: ComponentNode[], theme: ThemeConfig)` (`/src/lib/generators/generateNextJSProject.ts`)
Creates complete Next.js file structure.

##### `generatePrismaSchema(models: PrismaModel[])` (`/src/lib/generators/generatePrismaSchema.ts`)
Converts visual models to Prisma schema syntax.

##### `generateMUITheme(theme: ThemeConfig)` (`/src/lib/generators/generateMUITheme.ts`)
Exports Material UI theme configuration.

##### `generatePlaywrightTests(tests: PlaywrightTest[])` (`/src/lib/generators/generatePlaywrightTests.ts`)
Converts visual test definitions to Playwright code.

##### `generateStorybookStories(stories: StorybookStory[])` (`/src/lib/generators/generateStorybookStories.ts`)
Creates Storybook CSF3 story files.

##### `generateUnitTests(tests: UnitTest[])` (`/src/lib/generators/generateUnitTests.ts`)
Generates Vitest test files with React Testing Library.

##### `generateFlaskApp(config: FlaskConfig)` (`/src/lib/generators/generateFlaskApp.ts`)
Creates Flask application with blueprints and routes.

## Integration Points

### Component Integration

Each designer component integrates AI through consistent patterns:

#### Model Designer
```typescript
const handleGenerateModels = async () => {
  const description = prompt('Describe your data models:')
  const result = await AIService.generateModels(description)
  if (result) {
    setModels(current => [...current, ...result])
  }
}
```

#### Component Tree Builder
```typescript
const handleGenerateComponent = async () => {
  const description = prompt('Describe the component:')
  const result = await AIService.generateComponent(description, components)
  if (result) {
    setComponents(current => [...current, result])
  }
}
```

#### Code Editor
```typescript
const handleExplain = async () => {
  const explanation = await AIService.explainCode(currentCode, language)
  setExplanation(explanation)
}

const handleImprove = async () => {
  const improved = await AIService.improveCode(currentCode, language)
  onFileChange(fileId, improved)
}
```

#### Error Panel
```typescript
const handleRepair = async (error: Error) => {
  const file = files.find(f => f.id === error.fileId)
  const relatedFiles = getRelatedFiles(file, files)
  const repaired = await ErrorRepairService.repairError(
    error,
    file.content,
    relatedFiles
  )
  onFileChange(file.id, repaired.content)
}
```

## Prompt Engineering Best Practices

### 1. Clear Instructions
```typescript
const prompt = `You are a Next.js expert. Generate a Prisma schema based on this description:
${description}

Return ONLY valid JSON in this format:
{
  "models": [
    {
      "name": "ModelName",
      "fields": [...]
    }
  ]
}

Ensure:
- Use appropriate field types (String, Int, DateTime, Boolean)
- Add relations where entities reference each other
- Mark required fields with isRequired: true
- Add unique constraints where appropriate`
```

### 2. Context Inclusion
```typescript
const contextPrompt = `Existing models:
${JSON.stringify(existingModels, null, 2)}

Existing components:
${JSON.stringify(existingComponents, null, 2)}

Theme colors:
${JSON.stringify(theme.variants, null, 2)}

Now generate: ${description}`
```

### 3. Output Validation
```typescript
const result = await spark.llm(prompt, 'gpt-4', true)
const parsed = JSON.parse(result)

// Validate structure
if (!parsed.models || !Array.isArray(parsed.models)) {
  throw new Error('Invalid response format')
}

// Validate fields
parsed.models.forEach(model => {
  if (!model.name || !model.fields) {
    throw new Error('Missing required model properties')
  }
})
```

### 4. Error Recovery
```typescript
try {
  const result = await spark.llm(prompt, 'gpt-4', true)
  return JSON.parse(result)
} catch (error) {
  if (error.message.includes('rate limit')) {
    toast.error('AI service rate limited. Please try again in a moment.')
  } else if (error.message.includes('invalid JSON')) {
    toast.error('AI response was invalid. Please try again.')
  } else {
    toast.error('AI generation failed. Please try manual editing.')
  }
  return null
}
```

## Performance Optimization

### Caching
```typescript
const cacheKey = `ai-explanation-${hash(code)}`
const cached = await spark.kv.get(cacheKey)
if (cached) return cached

const result = await spark.llm(prompt)
await spark.kv.set(cacheKey, result)
return result
```

### Debouncing
```typescript
const debouncedExplain = useMemo(
  () => debounce(async (code: string) => {
    const explanation = await AIService.explainCode(code, 'typescript')
    setExplanation(explanation)
  }, 1000),
  []
)
```

### Streaming Responses
```typescript
// Future enhancement for long-running generations
const handleGenerateWithStreaming = async () => {
  const stream = await AIService.streamGeneration(description)
  
  for await (const chunk of stream) {
    appendToOutput(chunk)
  }
}
```

## Future Enhancements

### Multi-Model Support
- Claude for code review and analysis
- Gemini for multimodal design tasks
- Specialized models for different languages

### Fine-Tuned Models
- Custom models trained on Next.js patterns
- Framework-specific optimizations
- Design system adherence

### Advanced Features
- Conversational interface for iterative development
- Learning from user corrections
- Project-specific context retention
- Collaborative AI sessions
- Code review agents
- Security analysis agents
- Performance optimization agents

## Testing AI Features

### Unit Tests
```typescript
describe('AIService', () => {
  it('generates valid Prisma models', async () => {
    const result = await AIService.generateModels('User with name and email')
    expect(result).toBeDefined()
    expect(result.models).toHaveLength(1)
    expect(result.models[0].name).toBe('User')
    expect(result.models[0].fields).toContainEqual(
      expect.objectContaining({ name: 'name', type: 'String' })
    )
  })
})
```

### Integration Tests
```typescript
describe('Error Repair', () => {
  it('fixes import errors with context', async () => {
    const file = { content: 'import { Button } from "missing-package"' }
    const relatedFiles = [{ content: 'package.json content...' }]
    
    const repaired = await ErrorRepairService.repairError(
      error,
      file.content,
      relatedFiles
    )
    
    expect(repaired.content).toContain('@mui/material')
  })
})
```

## Monitoring and Analytics

### Usage Tracking
```typescript
// Track AI feature usage
const trackAIUsage = async (feature: string, success: boolean) => {
  await spark.kv.set(`ai-usage-${Date.now()}`, {
    feature,
    success,
    timestamp: new Date().toISOString()
  })
}
```

### Quality Metrics
- Generation success rate
- Error repair effectiveness
- User acceptance of AI suggestions
- API response times
- Cost per operation

---

**For more information, see the [main README](./README.md) and [PRD](./PRD.md).**
