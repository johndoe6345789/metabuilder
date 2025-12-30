# Atomic Design Visual Guide

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ATOMIC DESIGN HIERARCHY                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   ATOMS     │  Smallest building blocks
│  (shadcn)   │  Cannot be divided further
└──────┬──────┘
       │      Button, Input, Label, Badge, Avatar, etc.
       │
       │
       ▼
┌─────────────┐
│  MOLECULES  │  Simple combinations (2-5 atoms)
│  (6 total)  │  Single focused purpose
└──────┬──────┘
       │      • AppHeader (logo + nav buttons)
       │      • AppFooter (links + copyright)
       │      • GodCredentialsBanner (alert + text + button)
       │      • ProfileCard (avatar + labels + values)
       │      • SecurityWarningDialog (dialog + title + list + buttons)
       │      • PasswordChangeDialog (dialog + form + inputs + buttons)
       │
       ▼
┌─────────────┐
│  ORGANISMS  │  Complex features (many atoms/molecules)
│  (40+ total)│  Business logic included
└──────┬──────┘
       │
       ├─ BUILDERS
       │  • Builder (drag-drop interface)
       │  • Canvas (component renderer)
       │  • ComponentCatalog (searchable list)
       │  • PropertyInspector (dynamic forms)
       │
       ├─ EDITORS
       │  • SchemaEditor (Monaco + validation)
       │  • CodeEditor (Monaco + syntax highlighting)
       │  • LuaEditor (Monaco + security scan)
       │  • JsonEditor (Monaco + validation)
       │  • NerdModeIDE (full IDE panel)
       │
       ├─ MANAGERS
       │  • DatabaseManager (query interface)
       │  • UserManagement (CRUD operations)
       │  • PackageManager (install/uninstall)
       │  • CssClassManager (class library)
       │  • ThemeEditor (color customization)
       │
       └─ FEATURES
          • IRCWebchat (real-time chat)
          • WorkflowEditor (workflow config)
          • AuditLogViewer (log display)
          • ScreenshotAnalyzer (AI analysis)
       
       ▼
┌─────────────┐
│   PAGES     │  Complete views (Level 1-5)
│  (5 total)  │  Compose organisms together
└─────────────┘
       • Level1 (Landing page)
       • Level2 (User dashboard)
       • Level3 (Admin panel)
       • Level4 (God builder)
       • Level5 (Super God panel)


┌─────────────────────────────────────────────────────────────────────┐
│                      IMPORT PATH EXAMPLES                            │
└─────────────────────────────────────────────────────────────────────┘

// Atoms (basic UI elements)
import { Button, Input, Label, Badge } from '@/components/atoms'

// Molecules (simple composites)
import { 
  AppHeader, 
  ProfileCard,
  SecurityWarningDialog 
} from '@/components/molecules'

// Organisms (complex features)
import { 
  ComponentCatalog, 
  PropertyInspector,
  SchemaEditor,
  UserManagement 
} from '@/components/organisms'

// Pages
import Level4 from '@/components/Level4'


┌─────────────────────────────────────────────────────────────────────┐
│                     DEPENDENCY FLOW RULES                            │
└─────────────────────────────────────────────────────────────────────┘

✅ ALLOWED:
   Atoms → [nothing custom, only React/external]
   Molecules → Atoms
   Organisms → Atoms, Molecules, other Organisms
   Pages → Atoms, Molecules, Organisms

❌ FORBIDDEN:
   Atoms → Molecules or Organisms
   Molecules → Organisms
   
   
┌─────────────────────────────────────────────────────────────────────┐
│                   COMPONENT COMPOSITION EXAMPLE                      │
└─────────────────────────────────────────────────────────────────────┘

PAGE (Level4.tsx)
└─ Contains:
   ├─ AppHeader (molecule)
   │  └─ Button (atom)
   │  └─ Badge (atom)
   │
   ├─ ComponentCatalog (organism)
   │  ├─ Input (atom)
   │  ├─ Button (atom)
   │  └─ ScrollArea (atom)
   │
   ├─ PropertyInspector (organism)
   │  ├─ Label (atom)
   │  ├─ Input (atom)
   │  ├─ Select (atom)
   │  └─ Button (atom)
   │
   └─ SchemaEditor (organism)
      ├─ Dialog (atom)
      ├─ Button (atom)
      └─ MonacoEditor (external)


┌─────────────────────────────────────────────────────────────────────┐
│                    COMPLEXITY DECISION TREE                          │
└─────────────────────────────────────────────────────────────────────┘

Is it a single UI element?
│
├─ YES → ATOM (use shadcn/ui)
│         Examples: Button, Input, Badge
│
└─ NO → Is it 2-5 simple elements working together?
        │
        ├─ YES → MOLECULE
        │         Examples: FormField (Label + Input + Error)
        │                   CardHeader (Avatar + Title + Subtitle)
        │
        └─ NO → Is it a complex feature with logic?
                │
                └─ YES → ORGANISM
                          Examples: SchemaEditor, UserManagement


┌─────────────────────────────────────────────────────────────────────┐
│                         FILE STRUCTURE                               │
└─────────────────────────────────────────────────────────────────────┘

src/components/
│
├── atoms/
│   ├── index.ts                      # Re-exports shadcn components
│   └── README.md                     # Documentation
│
├── molecules/
│   ├── index.ts                      # Exports all molecules
│   ├── README.md                     # Documentation
│   └── [molecule components]         # Optional: move here or use exports
│
├── organisms/
│   ├── index.ts                      # Exports all organisms
│   ├── README.md                     # Documentation
│   └── [organism components]         # Optional: move here or use exports
│
├── ui/                               # shadcn components (unchanged)
│   └── [all shadcn components]
│
├── shared/                           # Shared utilities
│   ├── AppHeader.tsx                 # Molecule
│   └── AppFooter.tsx                 # Molecule
│
├── level1/                           # Level 1 sections
│   ├── HeroSection.tsx               # Organism
│   ├── FeaturesSection.tsx           # Organism
│   └── NavigationBar.tsx             # Organism
│
└── [Level1.tsx - Level5.tsx]         # Top-level pages


┌─────────────────────────────────────────────────────────────────────┐
│                         KEY BENEFITS                                 │
└─────────────────────────────────────────────────────────────────────┘

📦 MODULARITY
   Components are self-contained and reusable

🔍 DISCOVERABILITY  
   Easy to find components by complexity level

🧪 TESTABILITY
   Atoms and molecules test in isolation easily

📚 DOCUMENTATION
   Structure serves as living documentation

🎯 CONSISTENCY
   Shared atoms ensure visual consistency

⚡ DEVELOPMENT SPEED
   Compose features faster from existing parts

🔄 MAINTAINABILITY
   Changes to atoms propagate automatically

🎓 ONBOARDING
   New developers understand hierarchy quickly


┌─────────────────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE COUNTS                            │
└─────────────────────────────────────────────────────────────────────┘

Atoms:        12+ (all from shadcn/ui)
Molecules:    6 (simple composites)
Organisms:    40+ (complex features)
Pages:        5 (Level 1-5)

Total Components: 60+


┌─────────────────────────────────────────────────────────────────────┐
│                      IMPLEMENTATION STATUS                           │
└─────────────────────────────────────────────────────────────────────┘

[✅] Documentation created (ATOMIC_DESIGN.md)
[✅] Component classification map (COMPONENT_MAP.md)
[✅] Visual guide (ATOMIC_STRUCTURE.md)
[✅] Index files with exports created
[✅] README files for each level
[⏳] Physical file migration (optional)
[⏳] Import path updates (can be gradual)
[⏳] Add to PRD
```
