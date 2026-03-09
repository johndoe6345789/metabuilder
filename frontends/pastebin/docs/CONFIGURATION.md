# Configuration Files

This application uses JSON configuration files to manage strings and settings, making it easy to update text, languages, and other app configurations without modifying the TypeScript/TSX code.

## Configuration Files

### `/src/config/strings.json`
Contains all user-facing text strings used throughout the application.

**Structure:**
- `app` - Main application strings (title, header, search)
- `emptyState` - Empty state component text
- `noResults` - No search results text
- `snippetCard` - Snippet card component text and aria labels
- `snippetDialog` - Dialog form labels, placeholders, and error messages
- `snippetViewer` - Viewer component button labels
- `toast` - Toast notification messages

**Example usage in components:**
```typescript
import { strings } from '@/lib/config'

// Access strings
<h1>{strings.app.header.title}</h1>
<p>{strings.emptyState.description}</p>
```

### `/src/config/app-config.json`
Contains application configuration settings and data.

**Structure:**
- `languages` - Array of supported programming languages
- `languageColors` - Color schemes for each language badge
- `previewEnabledLanguages` - Languages that support live preview
- `defaultLanguage` - Default language selection
- `codePreviewMaxLength` - Maximum characters to show in card preview
- `copiedTimeout` - Milliseconds to show "copied" state

**Example usage in components:**
```typescript
import { appConfig } from '@/lib/config'

// Access configuration
const maxLength = appConfig.codePreviewMaxLength
const timeout = appConfig.copiedTimeout
```

## Helper Functions

### `/src/lib/config.ts`
Provides utility functions and exports for accessing configuration data.

**Exports:**
- `strings` - All string data from strings.json
- `appConfig` - All configuration from app-config.json
- `getLanguageColor(language)` - Get combined color classes for a language
- `LANGUAGES` - Array of language options
- `LANGUAGE_COLORS` - Map of language to color classes

**Example:**
```typescript
import { getLanguageColor, LANGUAGES } from '@/lib/config'

const colorClass = getLanguageColor('JavaScript')
// Returns: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
```

## Updating Text and Configuration

### To change text:
1. Edit `/src/config/strings.json`
2. No TypeScript changes needed
3. Changes are reflected immediately

### To add a new language:
1. Add to `languages` array in `/src/config/app-config.json`
2. Add color scheme to `languageColors` object
3. No component changes needed

### To change colors:
1. Edit color values in `languageColors` in `/src/config/app-config.json`
2. Use Tailwind color classes (bg-, text-, border-)

### To change timeouts or limits:
1. Edit values in `/src/config/app-config.json`
2. `codePreviewMaxLength` - Characters shown in preview
3. `copiedTimeout` - How long "Copied!" message shows

## Benefits

✅ **Easy Localization** - All strings in one place for translation
✅ **No Code Changes** - Update text without touching TSX files
✅ **Type Safety** - TypeScript still validates usage
✅ **Maintainability** - Centralized configuration
✅ **Consistency** - Single source of truth for strings and settings
