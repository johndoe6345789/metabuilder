# WorkflowUI - Getting Started

## Quick Start

### 1. Start the Development Server

```bash
cd /Users/rmac/Documents/metabuilder/workflowui
npm run dev
```

The server will start on **http://localhost:3005** (or the next available port).

### 2. Open in Browser

Navigate to: **http://localhost:3005**

---

## Features Available

### Dashboard
- View all workflows
- Create new workflows
- Quick actions (edit, delete, duplicate)

### Workflow Editor (React Flow)
- Drag-and-drop nodes
- Connect workflow steps
- Configure node properties
- Real-time preview

### Project Canvas (NEW - Uses M3!)
- Infinite canvas with workflow cards
- Drag-and-drop card positioning
- Zoom in/out controls
- Material Design 3 interface
- Responsive grid layout

### Built-in Workflows
The system comes with example workflows:
- User Authentication Flow
- Data Processing Pipeline
- Email Notification System
- Payment Processing

---

## Key Endpoints

| Route | Purpose |
|-------|---------|
| `/` | Dashboard - view all workflows |
| `/editor/:workflowId` | Workflow editor (React Flow) |
| `/project/:projectId` | Project canvas (infinite canvas with cards) |
| `/workspace` | Workspace selector |

---

## Technology Stack

- **Frontend**: Next.js 14.2, React 18, TypeScript
- **UI Components**: M3 (Material Design 3)
- **State Management**: Redux + Custom Hooks
- **Data**: IndexedDB (offline-first) + Backend API
- **Workflow Engine**: Multi-language execution (TS, Python, Go, Rust, etc.)

---

## Project Structure

```
workflowui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Dashboard
│   │   ├── editor/[id]/        # Workflow editor
│   │   ├── project/[id]/       # Project canvas (NEW)
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   ├── hooks/                  # Custom hooks
│   ├── services/               # API clients
│   ├── store/                  # Redux slices + middleware
│   ├── db/                     # IndexedDB schema
│   └── types/                  # TypeScript types
├── backend/                    # Flask API server
│   ├── server_sqlalchemy.py    # Main server
│   ├── models.py               # Database models
│   └── workflows/              # Workflow definitions
├── Dockerfile                  # Docker configuration
└── package.json
```

---

## Creating Your First Workflow

1. **Click "Create Workflow"** on the dashboard
2. **Enter workflow name** (e.g., "My AI Pipeline")
3. **Click "Create"**
4. **You're now in the workflow editor!**

### In the Workflow Editor:
- Drag nodes from the left panel onto the canvas
- Connect nodes by dragging from output → input ports
- Click nodes to configure parameters
- Click "Save" to persist your workflow

---

## Available Node Types

### Control Flow
- Trigger (start workflow)
- If/Then/Else (conditional branching)
- Loop (iterate over items)
- Wait (delay execution)

### Data Operations
- Filter (filter arrays)
- Map (transform items)
- Reduce (aggregate data)
- Merge (combine datasets)

### AI/ML
- ChatGPT (call Claude/GPT APIs)
- Image Generation (DALL-E, Midjourney)
- Embedding (vector embeddings)
- Classification (categorize data)

### External Services
- HTTP Request (call APIs)
- Database (SQL queries)
- File Operations (read/write files)
- Email (send messages)

---

## Running Workflows

1. **Open a workflow** in the editor
2. **Click "Execute"** button in the top toolbar
3. **Provide input values** if the workflow has parameters
4. **Watch the execution** in real-time
5. **View results** in the output panel

---

## Exporting & Importing

### Export Workflow as JSON
```bash
# Click the "Export" button in the workflow editor
# This downloads the workflow as a .json file
```

### Import Workflow from JSON
```bash
# Drag a .json file onto the import zone
# Or click "Import" and select the file
```

---

## Using with Docker

Build the Docker image:
```bash
docker build -t metabuilder-workflowui:latest .
```

Run the container:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:5000 \
  metabuilder-workflowui:latest
```

---

## Automating AI Workflows

### Example: Content Generation Pipeline
1. **Trigger**: Webhook or scheduled time
2. **Input**: Topic, style, length
3. **Process**:
   - Call Claude API to generate content
   - Call image generation API for graphics
   - Format output as Markdown
4. **Output**: Send to email, save to file, or publish

### Example: Data Analysis Pipeline
1. **Trigger**: New data file uploaded
2. **Process**:
   - Load CSV file
   - Filter by criteria
   - Calculate statistics
   - Generate visualizations
3. **Output**: Send report via email

### Example: Workflow Orchestration
1. **Trigger**: Main workflow starts
2. **Process**:
   - Run multiple AI workflows in parallel
   - Combine results
   - Apply business logic
3. **Output**: Save to database or trigger other workflows

---

## Troubleshooting

### Port Already in Use
```bash
# Kill existing process
lsof -i :3005
kill -9 <PID>

# Or try a different port
PORT=3010 npm run dev
```

### Database Errors
```bash
# Clear IndexedDB cache (in browser DevTools)
# Application > Storage > IndexedDB > Clear All
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

---

## Next Steps

1. ✅ Start the dev server: `npm run dev`
2. ✅ Open http://localhost:3005 in browser
3. ✅ Create your first workflow
4. ✅ Add nodes and connect them
5. ✅ Test execution
6. ✅ Save and export

---

## Documentation

- **M3 Components**: See `/m3/COMPONENT_GUIDE.md`
- **Migration Summary**: See `/m3/MIGRATION_SUMMARY.md`
- **Architecture**: See `CLAUDE.md` in root
- **Workflow Engine**: See `/workflow/README.md`

---

## Support

For issues or questions:
1. Check the logs: `npm run dev` (shows errors in real-time)
2. Check browser console: F12 → Console tab
3. Check Network tab: F12 → Network to see API calls
4. Review workflow definitions: `/workflow/examples/`

Happy workflow automation! 🚀
