# Source Code (`src/`)

This directory contains the main React application source code for MetaBuilder's frontend.

## Structure

- **components/** - React UI components organized by feature and level
- **lib/** - Utility libraries, database access, authentication, and business logic
- **hooks/** - Custom React hooks for state management and side effects
- **types/** - TypeScript type definitions
- **styles/** - Global stylesheets (SCSS)
- **tests/** - Component and unit tests
- **seed-data/** - Initial database population scripts

## Key Files

- `main.tsx` - Application entry point
- `App.tsx` - Main application component with 5-level architecture logic
- `index.scss` - Global styles (imports all component styles)

## Architecture

The application uses a **5-level permission system**:

1. **Level 1 (Public)** - Unauthenticated access
2. **Level 2 (User)** - Basic authenticated user
3. **Level 3 (Admin)** - Administrative functions
4. **Level 4 (God)** - Advanced system functions
5. **Level 5 (Supergod)** - Complete system control

Permission checking is handled in `lib/auth.ts` and enforced throughout the component hierarchy.

## Technologies

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Prisma ORM** - Database access
- **Shadcn/ui** - UI component library
- **Vite** - Build tool

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test
```

## Database

The application uses Prisma ORM with SQLite/PostgreSQL. Database schema is defined in `prisma/schema.prisma` and migrations are managed through `prisma/migrations/`.

## Adding New Features

1. Define data model in `prisma/schema.prisma`
2. Create Prisma migration: `npm run db:migrate`
3. Build components in `components/`
4. Implement business logic in `lib/`
5. Add permissions check via `canAccessLevel()`
6. Test at appropriate permission levels

See `/docs/` for comprehensive development guides.
