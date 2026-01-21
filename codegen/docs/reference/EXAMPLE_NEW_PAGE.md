# Example: Adding a New "API Tester" Page

This example demonstrates the complete process of adding a new page to CodeForge using the declarative system.

## Goal

Add an "API Tester" page that allows users to test REST API endpoints.

## Step 1: Create the Component

Create `src/components/ApiTester.tsx`:

```typescript
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

export function ApiTester() {
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    setLoading(true)
    try {
      const res = await fetch(url, { method })
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
    } catch (error) {
      setResponse(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">API Tester</h1>
            <p className="text-muted-foreground mt-2">
              Test REST API endpoints and inspect responses
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="https://api.example.com/endpoint"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTest} disabled={!url || loading}>
                  {loading ? 'Testing...' : 'Test'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {response && (
            <Card>
              <CardHeader>
                <CardTitle>Response</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={response}
                  readOnly
                  className="font-mono text-sm h-96"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
```

## Step 2: Register in Component Map

Add to `src/App.tsx` in the `componentMap`:

```typescript
const componentMap: Record<string, React.LazyExoticComponent<any>> = {
  // ... existing components
  ApiTester: lazy(() => import('@/components/ApiTester').then(m => ({ default: m.ApiTester }))),
}
```

## Step 3: Add to pages.json

Add to `src/config/pages.json`:

```json
{
  "id": "api-tester",
  "title": "API Tester",
  "icon": "Cloud",
  "component": "ApiTester",
  "enabled": true,
  "toggleKey": "apiTester",
  "shortcut": "ctrl+shift+a",
  "order": 21
}
```

## Step 4: Add Feature Toggle (Optional)

If you want the page to be toggleable, add to `src/types/project.ts`:

```typescript
export interface FeatureToggles {
  // ... existing toggles
  apiTester: boolean
}
```

And add the default in `src/hooks/use-project-state.ts`:

```typescript
const DEFAULT_FEATURE_TOGGLES: FeatureToggles = {
  // ... existing toggles
  apiTester: true,
}
```

## Step 5: Test It!

1. Start the dev server: `npm run dev`
2. Navigate to the new page by:
   - Clicking "API Tester" in the navigation menu
   - Pressing `Ctrl+Shift+A`
   - Searching for "API Tester" in global search (`Ctrl+K`)

## Result

✅ **New page is fully integrated:**
- Appears in navigation menu with Cloud icon
- Accessible via keyboard shortcut (Ctrl+Shift+A)
- Can be toggled on/off in Features page
- Searchable in global search
- Follows the same layout pattern as other pages
- Lazy-loaded for optimal performance

## Benefits of Declarative Approach

**Traditional Approach (Before):**
```typescript
// Would require:
// - 20+ lines of JSX in App.tsx
// - Manual TabsContent component
// - Hardcoded shortcut handling
// - Manual feature toggle check
// - Props wiring
```

**Declarative Approach (After):**
```json
// Just 8 lines of JSON!
{
  "id": "api-tester",
  "title": "API Tester",
  "icon": "Cloud",
  "component": "ApiTester",
  "enabled": true,
  "toggleKey": "apiTester",
  "shortcut": "ctrl+shift+a",
  "order": 21
}
```

## Advanced: With Props

If your component needs props from the app state, add to `getPropsForComponent` in `App.tsx`:

```typescript
const getPropsForComponent = (pageId: string) => {
  const propsMap: Record<string, any> = {
    // ... existing mappings
    'ApiTester': {
      savedRequests: apiRequests,
      onSaveRequest: saveApiRequest,
      onDeleteRequest: deleteApiRequest,
    },
  }
  return propsMap[pageId] || {}
}
```

Then update your component to accept these props:

```typescript
interface ApiTesterProps {
  savedRequests?: ApiRequest[]
  onSaveRequest?: (request: ApiRequest) => void
  onDeleteRequest?: (id: string) => void
}

export function ApiTester({ 
  savedRequests = [], 
  onSaveRequest, 
  onDeleteRequest 
}: ApiTesterProps) {
  // Use the props
}
```

## Using the Helper Scripts

Generate boilerplate code automatically:

```bash
# Generate all boilerplate
npm run pages:generate ApiTester "API Tester" "Cloud" "apiTester" "ctrl+shift+a"

# List all pages
npm run pages:list

# Validate configuration
npm run pages:validate
```

## Summary

With the declarative system, adding a new page requires:

1. ✅ Create component (1 file)
2. ✅ Add to componentMap (1 line)
3. ✅ Add to pages.json (8 lines)
4. ✅ Optional: Add feature toggle (2 lines in 2 files)
5. ✅ Optional: Add props mapping (3 lines)

**Total: ~15 lines of code vs. 50+ lines in the traditional approach!**

The system handles:
- ✅ Navigation menu rendering
- ✅ Keyboard shortcuts
- ✅ Feature toggles
- ✅ Lazy loading
- ✅ Search integration
- ✅ Consistent layouts
- ✅ Props injection
