# JSON UI Examples

This directory contains example JSON configurations that demonstrate the capabilities of the JSON UI system.

## Available Examples

### 1. Dashboard (`dashboard.json`)
A complete dashboard interface featuring:
- **Stats Cards**: Display key metrics with data binding
- **Activity Feed**: Shows recent activities using list looping
- **Quick Actions**: Grid of action buttons with click handlers
- **Static Data Sources**: Demonstrates hardcoded data in JSON

**Key Features Demonstrated:**
- Component composition with Cards
- Data binding to show dynamic values
- Event handlers for user interactions
- Grid layouts with responsive classes
- Icon components integration

### 2. Form (`form.json`)
A user registration form showcasing:
- **Text Inputs**: Name, email, password fields
- **Textarea**: Multi-line bio input
- **Checkbox**: Newsletter subscription
- **Form Actions**: Submit and cancel buttons
- **Data Binding**: Two-way binding for all form fields

**Key Features Demonstrated:**
- Form field components
- Input validation attributes
- onChange event handling
- Form data management
- Label-input associations

### 3. Data Table (`table.json`)
An interactive projects table with:
- **Table Structure**: Header and body rows
- **List Looping**: Dynamic rows from array data
- **Status Badges**: Visual status indicators
- **Row Actions**: View, edit, and delete buttons per row
- **Action Parameters**: Pass row data to event handlers

**Key Features Demonstrated:**
- Table components (TableHeader, TableBody, TableRow, TableCell)
- Loop rendering with itemVar and indexVar
- Badge components for status
- Icon buttons for actions
- Event handlers with dynamic parameters

### 4. Settings (`settings.json`)
A comprehensive settings panel featuring:
- **Tabbed Interface**: General, Notifications, Security tabs
- **Switch Toggles**: Enable/disable features
- **Select Dropdown**: Language selection
- **Multiple Data Sources**: Separate sources for each tab
- **Settings Persistence**: Save and reset functionality

**Key Features Demonstrated:**
- Tabs component with multiple TabsContent
- Switch components with data binding
- Select components with options
- Separator components for visual organization
- Multiple independent data sources

### 5. List/Table/Timeline Bindings (`list-table-timeline.json`)
A binding-focused layout that highlights:
- **List loops**: ListItem rows rendered from a data source
- **Data table bindings**: Columns and rows bound to JSON data
- **Timeline bindings**: Timeline items pulled from a structured array

**Key Features Demonstrated:**
- Loop contexts with `itemVar` and `indexVar`
- Property bindings for component props
- Shared data sources across multiple components

## How to Use These Examples

1. **View in the UI**: Navigate to the "JSON UI" page in the application to see live previews
2. **Toggle JSON View**: Click the "Show JSON" button to see the configuration
3. **Copy and Modify**: Use these as templates for your own UI configurations
4. **Learn by Example**: Each example builds on concepts from the previous ones

## Creating Your Own

To create a new JSON UI:

1. Create a new `.json` file in this directory
2. Follow the structure from existing examples
3. Import it in `JSONUIShowcase.tsx`:
   ```typescript
   import myExample from '@/config/ui-examples/my-example.json'
   ```
4. Add it to the examples object:
   ```typescript
   myExample: {
     name: 'My Example',
     description: 'Description here',
     icon: IconComponent,
     config: myExample,
   }
   ```

## JSON Structure Reference

Each JSON file should have:
- `id`: Unique identifier
- `title`: Display title
- `description`: Brief description
- `layout`: Root layout configuration
  - `type`: Layout type (flex, grid, etc.)
  - `children`: Array of child components
- `dataSources`: Data sources configuration
- `actions` (optional): Action definitions

## Best Practices

1. **Start Simple**: Begin with basic layouts before adding complexity
2. **Use Semantic IDs**: Give components meaningful, descriptive IDs
3. **Test Data First**: Start with static data sources before moving to API/KV
4. **Incremental Development**: Add features one at a time
5. **Refer to Documentation**: See `/docs/JSON-UI-SYSTEM.md` for complete reference

## Tips

- Use the existing examples as starting points
- Keep component trees shallow for better performance
- Leverage Tailwind classes for styling
- Use data binding instead of hardcoded values
- Group related settings in separate data sources
