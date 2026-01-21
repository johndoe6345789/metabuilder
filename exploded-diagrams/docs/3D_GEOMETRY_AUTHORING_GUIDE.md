# 3D Geometry Authoring Guide

## Overview

This guide documents the process for creating realistic 3D part geometry using the `geometry3d` JSON schema. The schema uses JSCAD-style CSG (Constructive Solid Geometry) operations to build complex shapes from primitives.

## The Feedback Loop Process

### 1. Start with Basic Shape
Begin with the dominant shape of the part:
```json
"geometry3d": [
  { "type": "box", "width": 100, "height": 85, "depth": 130, "fill": "#606070" }
]
```

### 2. View in Browser
- Navigate to the 3D Part View tab
- Select the part from the list
- Take a screenshot or visually inspect

### 3. Identify What's Wrong
Common issues:
- **"Breeze block" syndrome**: Part looks like a plain box with no character
- **Internal features invisible**: Boolean subtractions for cavities don't show from outside
- **Scale issues**: Part too small/large for camera position
- **Missing external details**: No flanges, bosses, ribs, or surface features

### 4. Add External Features
The key insight: **Internal subtractions are invisible from outside**. Add visible external features:
- Flanges and mounting surfaces
- Bolt bosses (raised cylinders around bolt holes)
- Structural ribs
- Bearing housings
- Access ports

### 5. Iterate
View → Analyze → Improve → Repeat until the part looks realistic.

---

## Geometry3D Schema Reference

### Primitive Types

| Type | Required Properties | Optional Properties |
|------|---------------------|---------------------|
| `box` | `width`, `height`, `depth` | all common |
| `cylinder` | `r`, `height` | all common |
| `sphere` | `r` | all common |
| `torus` | `r`, `tubeR` | all common |
| `cone` | `r1`, `r2`, `height` | all common |

### Common Properties

| Property | Type | Description |
|----------|------|-------------|
| `fill` | string | Hex color (e.g., `"#606070"`) |
| `material` | string | Reference to materials object |
| `offsetX/Y/Z` | number | Position offset in mm |
| `rotateX/Y/Z` | number | Rotation in degrees |
| `subtract` | boolean | Subtract from previous geometry |
| `intersect` | boolean | Intersect with previous geometry |

### Boolean Operations

Shapes are processed in order. By default, shapes are **unioned** (added together).

```json
"geometry3d": [
  { "type": "box", "width": 100, "height": 80, "depth": 120 },
  { "type": "cylinder", "r": 30, "height": 90, "subtract": true }
]
```

This creates a box with a cylindrical hole through it.

---

## Design Patterns by Part Type

### Housing/Case Parts

**Problem**: Internal cavities are invisible from outside.

**Solution**: Add external features that define the shape.

```json
"geometry3d": [
  // Main body
  { "type": "box", "width": 100, "height": 85, "depth": 130, "fill": "#606070" },
  // Hollow interior (invisible but functional)
  { "type": "box", "width": 80, "height": 65, "depth": 110, "offsetY": 5, "subtract": true },

  // VISIBLE EXTERNAL FEATURES:
  // Mating flange
  { "type": "box", "width": 120, "height": 95, "depth": 12, "offsetZ": -65, "fill": "#707080" },

  // Bolt bosses (raised cylinders)
  { "type": "cylinder", "r": 10, "height": 20, "offsetX": -50, "offsetY": -38, "offsetZ": -65 },
  { "type": "cylinder", "r": 10, "height": 20, "offsetX": 50, "offsetY": -38, "offsetZ": -65 },

  // Bolt holes through bosses
  { "type": "cylinder", "r": 4, "height": 25, "offsetX": -50, "offsetY": -38, "offsetZ": -65, "subtract": true },
  { "type": "cylinder", "r": 4, "height": 25, "offsetX": 50, "offsetY": -38, "offsetZ": -65, "subtract": true },

  // Structural ribs
  { "type": "box", "width": 8, "height": 70, "depth": 110, "offsetX": -42, "fill": "#555560" },
  { "type": "box", "width": 8, "height": 70, "depth": 110, "offsetX": 42, "fill": "#555560" },

  // Bearing housing (cylindrical boss)
  { "type": "cylinder", "r": 35, "height": 20, "rotateX": 90, "offsetZ": 55, "fill": "#707080" },
  { "type": "cylinder", "r": 25, "height": 25, "rotateX": 90, "offsetZ": 55, "subtract": true }
]
```

### Rotating Parts (Gears, Flywheels)

**Pattern**: Disc + features + center bore

```json
"geometry3d": [
  // Main disc
  { "type": "cylinder", "r": 55, "height": 25, "fill": "#404550" },
  // Ring gear (torus around edge)
  { "type": "torus", "r": 52, "tubeR": 4, "fill": "#505560" },
  // Center bore
  { "type": "cylinder", "r": 15, "height": 30, "subtract": true },
  // Lightening holes (optional)
  { "type": "cylinder", "r": 8, "height": 30, "offsetX": 30, "subtract": true },
  { "type": "cylinder", "r": 8, "height": 30, "offsetX": -30, "subtract": true }
]
```

### Shaft Parts

**Pattern**: Cylinder + features along length

```json
"geometry3d": [
  // Main shaft
  { "type": "cylinder", "r": 12, "height": 150, "rotateX": 90, "fill": "#707580" },
  // Splined section (larger diameter)
  { "type": "cylinder", "r": 15, "height": 30, "rotateX": 90, "offsetZ": -50, "fill": "#606570" },
  // Bearing journal (polished surface)
  { "type": "cylinder", "r": 14, "height": 20, "rotateX": 90, "offsetZ": 40, "fill": "#808590" },
  // Keyway (subtract a small box)
  { "type": "box", "width": 5, "height": 3, "depth": 25, "offsetY": 10, "offsetZ": 0, "subtract": true }
]
```

### Bearing Parts

**Pattern**: Outer race + inner race + visible gap

```json
"geometry3d": [
  // Outer race
  { "type": "cylinder", "r": 30, "height": 15, "fill": "#707580" },
  // Inner bore (creates the race)
  { "type": "cylinder", "r": 20, "height": 16, "subtract": true },
  // Inner race (smaller cylinder inside)
  { "type": "cylinder", "r": 18, "height": 12, "fill": "#808590" },
  // Shaft bore
  { "type": "cylinder", "r": 10, "height": 15, "subtract": true }
]
```

### Plate/Disc Parts (Clutch, Pressure Plate)

**Pattern**: Flat disc + surface features

```json
"geometry3d": [
  // Main disc
  { "type": "cylinder", "r": 50, "height": 8, "fill": "#505050" },
  // Friction surface (slightly different color)
  { "type": "cylinder", "r": 48, "height": 2, "offsetY": 3, "fill": "#606060" },
  // Center spline hub
  { "type": "cylinder", "r": 20, "height": 15, "fill": "#707070" },
  // Spline bore
  { "type": "cylinder", "r": 12, "height": 20, "subtract": true },
  // Rivets or spring windows
  { "type": "cylinder", "r": 3, "height": 10, "offsetX": 35, "subtract": true },
  { "type": "cylinder", "r": 3, "height": 10, "offsetX": -35, "subtract": true }
]
```

---

## Color Guidelines

Use subtle color variations to distinguish features:

| Feature Type | Suggested Colors |
|--------------|------------------|
| Main body | `#606070`, `#505060` |
| Flanges | `#707080` (slightly lighter) |
| Bolt bosses | `#808090` (lighter still) |
| Ribs | `#555560` (slightly darker) |
| Polished surfaces | `#909095` |
| Steel parts | `#707580` |
| Aluminum | `#808890` |
| Cast iron | `#505560` |

---

## Scale Considerations

All dimensions are in **millimeters**. The camera is positioned at `[150, 150, 150]` with a grid of 200 units.

| Part Size | Typical Dimensions |
|-----------|-------------------|
| Small (bearings, seals) | 20-50mm |
| Medium (gears, shafts) | 50-150mm |
| Large (housings) | 100-200mm |

---

## Debugging Tips

### Part Not Visible
- Check camera position vs part scale
- Ensure geometry3d array is not empty
- Check browser console for errors

### Part Looks Like a Box
- Add external features (flanges, bosses, ribs)
- Internal subtractions don't show - add surface detail

### Colors Look Wrong
- Check `fill` property format (must be hex string)
- Verify material references exist

### Boolean Operations Not Working
- Order matters: shapes are processed sequentially
- `subtract: true` subtracts from the union of all previous shapes
- Check that subtraction geometry is positioned correctly

---

## Workflow Summary

1. **Identify the part type** (housing, gear, shaft, bearing, plate)
2. **Start with main body** - dominant shape
3. **Add external features** - flanges, bosses, ribs (visible from outside)
4. **Add functional geometry** - bores, holes, keyways (boolean subtractions)
5. **Apply color variations** - distinguish different features
6. **View and iterate** - use the visual feedback loop

The key insight: **What you see is what matters**. Internal features are functionally correct but visually invisible. Always add external surface details to make parts look realistic.
