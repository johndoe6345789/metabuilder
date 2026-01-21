# Seed Data Templates

This directory contains pre-configured project templates that provide complete starting points for different application types.

## Available Templates

### 🚀 Default Project
**File:** `../seed-data.json`

Basic starter template with common components and models for general-purpose applications.

**Features:**
- Basic User and Post models
- Simple file structure
- User registration workflow
- Foundation components (Button, Card)
- Sample tests and stories

**Best for:** Learning, prototyping, or building custom applications from scratch

---

### 🛍️ E-Commerce Store
**File:** `e-commerce.json`

Complete online store setup with product catalog, shopping cart, and order management.

**Features:**
- **Models:**
  - Product (with variants, pricing, inventory)
  - Category (hierarchical)
  - Order & OrderItem
  - Customer (with addresses)
  
- **Components:**
  - ProductCard
  - CartItem
  - CheckoutSummary
  
- **Workflows:**
  - Order processing (payment → inventory → notifications)
  
- **Lambda Functions:**
  - calculateShipping
  - processRefund
  
- **Pages:**
  - Product listing with Hero
  - Shopping cart
  - Checkout flow

**Best for:** Online stores, marketplaces, retail platforms

---

### 📝 Blog Platform
**File:** `blog.json`

Content-focused blogging platform with author management, comments, and newsletter.

**Features:**
- **Models:**
  - Post (with SEO fields, read time, tags)
  - Author (with bio, social links)
  - Category
  - Comment (with threading support)
  - Newsletter subscribers
  
- **Components:**
  - PostCard (with metadata)
  - AuthorCard
  - CommentSection
  
- **Workflows:**
  - Post publishing (draft → SEO → review → publish → notify)
  
- **Lambda Functions:**
  - generateSEO (auto-generate meta tags)
  - sendNewsletter
  
- **Pages:**
  - Blog grid with featured post
  - Individual post view
  - Author profile pages

**Best for:** Blogs, magazines, content sites, news platforms

---

### 📊 Analytics Dashboard
**File:** `dashboard.json`

Data visualization dashboard with real-time metrics, user management, and reporting.

**Features:**
- **Models:**
  - Metric (time-series data with trends)
  - User (roles, status, activity tracking)
  - Activity (audit logging)
  - Report (generated reports with filters)
  - Alert (notification system)
  
- **Components:**
  - StatCard (with trends and sparklines)
  - DataTable (sortable, filterable, exportable)
  - ChartCard (multiple chart types)
  
- **Workflows:**
  - Alert processing (threshold → severity check → notifications)
  
- **Lambda Functions:**
  - aggregateMetrics (scheduled hourly)
  - generateReport (on-demand)
  
- **Pages:**
  - Main dashboard with stats and charts
  - Analytics page with date range picker
  - User management with filters

**Best for:** Admin panels, analytics platforms, SaaS dashboards, monitoring tools

---

## Usage

### Using the Template Selector UI

1. Navigate to the **Templates** tab in the application
2. Browse available templates
3. Choose an action:
   - **Load Template**: Replaces all existing data (⚠️ destructive)
   - **Merge**: Adds template data to existing project

### Programmatic Usage

```typescript
import { useSeedTemplates } from '@/hooks/data/use-seed-templates'

function MyComponent() {
  const { templates, loadTemplate, clearAndLoadTemplate, mergeTemplate } = useSeedTemplates()

  // Load template (preserves existing data)
  await loadTemplate('e-commerce')

  // Replace all data with template
  await clearAndLoadTemplate('blog')

  // Merge template with existing data
  await mergeTemplate('dashboard')
}
```

### Manual Loading

```typescript
import ecommerceTemplate from '@/config/seed-templates/e-commerce.json'

// Load each data type
for (const [key, value] of Object.entries(ecommerceTemplate)) {
  await window.spark.kv.set(key, value)
}
```

---

## Template Structure

Each template is a JSON file with the following keys:

```json
{
  "project-files": [],           // TypeScript/React files
  "project-models": [],          // Data models (Prisma-style)
  "project-components": [],      // UI component definitions
  "project-component-trees": [], // Component hierarchies
  "project-workflows": [],       // Visual workflow definitions
  "project-lambdas": [],         // Serverless functions
  "project-playwright-tests": [],// E2E tests
  "project-storybook-stories": [],// Component stories
  "project-unit-tests": []       // Unit test definitions
}
```

---

## Creating Custom Templates

1. **Export current project data:**
   ```typescript
   const keys = await window.spark.kv.keys()
   const data = {}
   for (const key of keys) {
     data[key] = await window.spark.kv.get(key)
   }
   console.log(JSON.stringify(data, null, 2))
   ```

2. **Create a new JSON file** in this directory

3. **Add to the templates list** in `use-seed-templates.ts`:
   ```typescript
   import myTemplate from '@/config/seed-templates/my-template.json'
   
   const templates: Template[] = [
     // ...existing templates
     {
       id: 'my-template',
       name: 'My Custom Template',
       description: 'Description here',
       icon: '🎨',
       data: myTemplate,
       features: ['Feature 1', 'Feature 2']
     }
   ]
   ```

---

## Best Practices

### When to Load vs Merge

- **Load (Replace):** Starting a new project, switching project types, or resetting to a clean state
- **Merge:** Adding features from another template, combining template elements, or expanding functionality

### ID Conventions

Use prefixed IDs to avoid conflicts:
- `file-ecom-1`, `file-blog-1`, `file-dash-1`
- `model-ecom-1`, `model-blog-1`, `model-dash-1`
- `comp-ecom-1`, `comp-blog-1`, `comp-dash-1`

### Real-World Data

Templates include realistic:
- Model field definitions
- Component configurations
- Workflow logic
- Function implementations

This allows immediate testing and provides clear examples for customization.

---

## Template Maintenance

When updating templates:

1. **Validate JSON** structure matches expected schema
2. **Test loading** in a fresh project
3. **Verify IDs** are unique within the template
4. **Check relationships** between models reference valid relations
5. **Update documentation** when adding new features

---

## Support

For questions or issues with templates:
- Check the main project documentation
- Review existing template structures
- Test in development before production use
