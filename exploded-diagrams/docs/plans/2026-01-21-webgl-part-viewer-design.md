# WebGL 3D Part Viewer Design

**Date**: 2026-01-21
**Status**: Ready for Implementation

## Overview

Add a tabbed interface to the assembly page with two views:
1. **Exploded View** (existing) - 2D SVG exploded diagram
2. **3D Part View** (new) - WebGL viewer for individual parts with part selector

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  [Exploded View]  [3D Part View]                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐  ┌─────────────────────────┐ │
│  │                      │  │  Part List              │ │
│  │   Three.js Canvas    │  │  ─────────────────────  │ │
│  │                      │  │  ○ Flywheel            │ │
│  │   (OrbitControls)    │  │  ● Clutch Disc ←active │ │
│  │                      │  │  ○ Pressure Plate      │ │
│  │                      │  │  ○ Release Bearing     │ │
│  └──────────────────────┘  │  ...                    │ │
│                            └─────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Three.js** - WebGL rendering, camera, lighting
- **@jscad/modeling** - CSG operations (union, subtract, intersect)
- **@jscad/regl-renderer** or custom Three.js conversion - Render JSCAD geometry

## JSON Schema Extension

### New 3D Geometry Types

```typescript
interface Geometry3D {
  // Identity
  type: string
  id?: string           // Reference for boolean ops

  // Positioning
  offsetX?: number
  offsetY?: number
  offsetZ?: number
  rotateX?: number      // Degrees
  rotateY?: number
  rotateZ?: number

  // Boolean operation
  subtract?: boolean    // Subtract from union of previous shapes
  intersect?: boolean   // Intersect with union of previous shapes

  // Appearance
  fill?: string
  material?: string
  opacity?: number
}

// Cylinder: r, height
interface CylinderGeometry extends Geometry3D {
  type: 'cylinder'
  r: number
  height: number
  segments?: number     // Default 32
}

// Box: width, height, depth
interface BoxGeometry extends Geometry3D {
  type: 'box'
  width: number
  height: number
  depth: number
}

// Sphere: r
interface SphereGeometry extends Geometry3D {
  type: 'sphere'
  r: number
  segments?: number
}

// Torus: r (major), tubeR (minor)
interface TorusGeometry extends Geometry3D {
  type: 'torus'
  r: number
  tubeR: number
}

// Cone/Frustum: r1 (bottom), r2 (top), height
interface ConeGeometry extends Geometry3D {
  type: 'cone'
  r1: number
  r2: number
  height: number
}

// Extruded polygon: points[], height
interface ExtrudeGeometry extends Geometry3D {
  type: 'extrude'
  points: number[]      // [x1,y1, x2,y2, ...]
  height: number
}

// Revolved profile: points[], angle
interface RevolveGeometry extends Geometry3D {
  type: 'revolve'
  points: number[]      // [x1,y1, x2,y2, ...] profile
  angle?: number        // Default 360
}
```

### Backward Compatibility

Existing 2D geometry types (`circle`, `rect`, `ellipse`, `polygon`) continue to work for the SVG renderer. The 3D viewer will:

1. Use `geometry3d` array if present
2. Fall back to auto-extruding `geometry` if no `geometry3d`

```json
{
  "id": "flywheel",
  "name": "Flywheel",
  "geometry": [
    { "type": "circle", "r": 55, "fill": "#555" }
  ],
  "geometry3d": [
    { "type": "cylinder", "r": 55, "height": 25, "fill": "#555" },
    { "type": "cylinder", "r": 12, "height": 25, "subtract": true }
  ]
}
```

## Component Structure

```
src/components/
├── AssemblyTabs.tsx        # Tab switcher component
├── DiagramRenderer.tsx     # Existing 2D SVG (unchanged)
├── PartViewer3D.tsx        # New 3D viewer container
├── ThreeCanvas.tsx         # Three.js canvas + OrbitControls
├── PartSelector.tsx        # Part list for 3D view
└── lib/
    └── jscad-to-three.ts   # Convert JSCAD geometry to Three.js
```

## Implementation Plan

### Phase 1: Infrastructure
1. Install dependencies (`three`, `@react-three/fiber`, `@react-three/drei`, `@jscad/modeling`)
2. Create tab component and wire into assembly page
3. Create basic Three.js canvas with OrbitControls

### Phase 2: JSCAD Integration
4. Build geometry parser (JSON → JSCAD primitives)
5. Build JSCAD-to-Three.js converter
6. Implement boolean operations (subtract, intersect)

### Phase 3: Part Viewer
7. Create part selector sidebar
8. Wire up part selection to render geometry
9. Apply materials/colors from JSON

### Phase 4: Sample Parts
10. Add `geometry3d` to a few parts (gearbox clutch components)
11. Test and refine

## File Changes

| File | Change |
|------|--------|
| `package.json` | Add three, @react-three/fiber, @react-three/drei, @jscad/modeling |
| `src/lib/types.ts` | Add Geometry3D types |
| `src/app/[...]/page.tsx` | Add tab state, render tabs |
| `src/components/AssemblyTabs.tsx` | New - tab UI |
| `src/components/PartViewer3D.tsx` | New - 3D viewer |
| `src/components/ThreeCanvas.tsx` | New - Three.js setup |
| `src/components/PartSelector.tsx` | New - part list |
| `src/lib/jscad-to-three.ts` | New - geometry conversion |
| `public/.../gearbox/parts/*.json` | Add geometry3d to clutch parts |

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| JSCAD bundle size | Tree-shake to only import used ops |
| CSG performance | Cache converted Three.js geometry |
| Mobile WebGL | Graceful fallback to 2D only |
