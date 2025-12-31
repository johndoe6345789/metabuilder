# CSS Schema V2: Abstract Styling System

## Core Principle

CSS = f(Style Rules, Element Tree, Environment) → Computed Styles

This is **NOT** a CSS file format. This is a deterministic styling function exposed through structured data.

## Schema Structure

### 1. Identity Layer (Object Inspector)

```json
{
  "objects": [
    {
      "id": "hero_title",
      "type": "Text",
      "classes": ["heading", "gradient-text", "hero"],
      "attributes": {
        "variant": "h1",
        "component": "main"
      },
      "states": {
        "hover": false,
        "active": false,
        "focus": false,
        "disabled": false
      }
    }
  ]
}
```

**GUI Mapping**: Object tree with inspector panel showing ID, classes, attributes, state toggles.

### 2. Selection Layer (Selector Builder)

Selectors are **predicates**, not strings.

```json
{
  "selectors": [
    {
      "id": "primary_button_hover",
      "predicate": {
        "targetType": "Button",
        "classes": ["primary"],
        "states": ["hover"],
        "relationship": null
      }
    },
    {
      "id": "card_nested_text",
      "predicate": {
        "targetType": "Text",
        "classes": [],
        "states": [],
        "relationship": {
          "type": "descendant",
          "ancestor": {
            "targetType": "Card",
            "classes": ["feature"]
          }
        }
      }
    }
  ]
}
```

**GUI Mapping**: Visual selector constructor with dropdowns, checkboxes, relationship builder.

### 3. Cascade Layer (Rule Priority Stack)

Rules are ordered by importance → origin → specificity → source order.

```json
{
  "rules": [
    {
      "id": "rule_001",
      "selector": "primary_button_hover",
      "priority": {
        "importance": "normal",
        "origin": "user",
        "specificity": {
          "ids": 0,
          "classes": 2,
          "types": 1
        },
        "sourceOrder": 100
      },
      "enabled": true,
      "effects": { "ref": "effect_button_hover" }
    }
  ]
}
```

**GUI Mapping**: Stack of rule cards with priority indicators, drag-to-reorder, enable/disable toggles.

### 4. Value System (Typed Property Editors)

Values are **typed**, **context-dependent**, and **late-bound**.

```json
{
  "effects": [
    {
      "id": "effect_button_hover",
      "properties": {
        "background": {
          "type": "color",
          "value": {
            "token": "primary",
            "modifier": "darken",
            "amount": 0.1
          }
        },
        "transform": {
          "type": "transform",
          "value": {
            "translateY": { "value": -2, "unit": "px" }
          }
        },
        "opacity": {
          "type": "number",
          "value": 0.9,
          "range": [0, 1]
        },
        "fontSize": {
          "type": "length",
          "value": { "number": 1.2, "unit": "em" },
          "computed": "relative"
        }
      }
    }
  ]
}
```

**Property Types**:
- `color`: Color picker (supports tokens)
- `length`: Number + unit dropdown
- `number`: Numeric input with optional range
- `enum`: Dropdown
- `boolean`: Toggle
- `transform`: Transform builder
- `shadow`: Shadow layer editor
- `gradient`: Gradient builder

**GUI Mapping**: Type-specific editors. Variables become tokens from global palette.

### 5. Computed Values (Debug & Explainability)

Read-only resolved snapshots.

```json
{
  "computed": {
    "nodeId": "hero_title",
    "resolvedStyles": {
      "fontSize": {
        "value": "48px",
        "sourceRule": "rule_003",
        "overriddenBy": ["rule_005"],
        "inheritedFrom": null
      },
      "color": {
        "value": "oklch(0.45 0.15 265)",
        "sourceRule": "rule_002",
        "overriddenBy": [],
        "inheritedFrom": null
      }
    }
  }
}
```

**GUI Mapping**: Computed style panel showing final values with source attribution and override trail.

### 6. Layout System (Constraint Systems)

Layout is **constraint satisfaction**, not painting.

```json
{
  "layouts": [
    {
      "id": "layout_hero_grid",
      "type": "grid",
      "constraints": {
        "columns": {
          "type": "template",
          "value": ["1fr", "1fr", "1fr"]
        },
        "rows": {
          "type": "auto"
        },
        "gap": {
          "type": "length",
          "value": { "number": 2, "unit": "rem" }
        },
        "alignment": {
          "justify": "center",
          "align": "start"
        }
      }
    },
    {
      "id": "layout_flex_stack",
      "type": "flex",
      "constraints": {
        "direction": "column",
        "gap": { "number": 1, "unit": "rem" },
        "alignment": {
          "justify": "flex-start",
          "align": "stretch"
        }
      }
    }
  ]
}
```

**Layout Types**:
- `flow`: Default document flow
- `flex`: Linear constraint solver
- `grid`: 2D constraint matrix
- `absolute`: Anchor constraints
- `sticky`: Scroll-anchored

**GUI Mapping**: Layout mode switcher with visual constraint editors and alignment handles.

### 7. Paint & Effects (Layer Compositor)

Painting is a **stack of visual effects**.

```json
{
  "appearance": [
    {
      "id": "appearance_card",
      "layers": [
        {
          "type": "background",
          "order": 0,
          "properties": {
            "color": { "type": "color", "value": { "token": "card" } },
            "gradient": null
          }
        },
        {
          "type": "border",
          "order": 1,
          "properties": {
            "width": { "value": 1, "unit": "px" },
            "style": "solid",
            "color": { "token": "border" },
            "radius": { "value": 0.5, "unit": "rem" }
          }
        },
        {
          "type": "shadow",
          "order": 2,
          "properties": {
            "offsetX": { "value": 0, "unit": "px" },
            "offsetY": { "value": 2, "unit": "px" },
            "blur": { "value": 8, "unit": "px" },
            "spread": { "value": 0, "unit": "px" },
            "color": { "value": "oklch(0 0 0 / 0.1)" }
          }
        }
      ],
      "opacity": 1,
      "blendMode": "normal"
    }
  ]
}
```

**GUI Mapping**: Layered appearance editor (like Photoshop) with independent layer controls.

### 8. Environment & Context (Context Simulator)

CSS rules depend on environment context.

```json
{
  "environments": [
    {
      "id": "env_desktop",
      "conditions": {
        "viewport": {
          "minWidth": { "value": 1024, "unit": "px" }
        },
        "colorScheme": "light",
        "dpi": "standard",
        "platform": "desktop"
      },
      "activeRules": ["rule_001", "rule_003"]
    },
    {
      "id": "env_mobile_dark",
      "conditions": {
        "viewport": {
          "maxWidth": { "value": 768, "unit": "px" }
        },
        "colorScheme": "dark",
        "dpi": "high",
        "platform": "mobile"
      },
      "activeRules": ["rule_002", "rule_004"]
    }
  ]
}
```

**GUI Mapping**: Environment toolbar with viewport resizer, dark/light toggle, DPI slider, platform selector.

### 9. Tokens & Variables (Global Palette)

Design tokens are **first-class values**, not CSS variables.

```json
{
  "tokens": {
    "colors": {
      "primary": {
        "type": "color",
        "value": "oklch(0.45 0.15 265)",
        "metadata": {
          "name": "Primary Blue",
          "category": "brand"
        }
      },
      "accent": {
        "type": "color",
        "value": "oklch(0.75 0.15 195)",
        "metadata": {
          "name": "Accent Cyan",
          "category": "brand"
        }
      }
    },
    "spacing": {
      "unit": {
        "type": "length",
        "value": { "number": 0.25, "unit": "rem" },
        "metadata": {
          "name": "Base Unit",
          "category": "spacing"
        }
      },
      "scale": {
        "type": "multiplier",
        "values": [1, 2, 3, 4, 6, 8, 12, 16],
        "metadata": {
          "name": "Spacing Scale",
          "category": "spacing"
        }
      }
    },
    "typography": {
      "fontFamily": {
        "body": {
          "type": "font",
          "value": "IBM Plex Sans, system-ui, sans-serif"
        },
        "heading": {
          "type": "font",
          "value": "Space Grotesk, system-ui, sans-serif"
        },
        "mono": {
          "type": "font",
          "value": "JetBrains Mono, monospace"
        }
      }
    }
  }
}
```

**GUI Mapping**: Token editor with color palettes, spacing scales, typography sets.

### 10. Animation & Transitions

Animations are **state machines**.

```json
{
  "animations": [
    {
      "id": "anim_fade_in",
      "type": "keyframe",
      "keyframes": [
        {
          "time": 0,
          "properties": {
            "opacity": 0,
            "transform": { "translateY": { "value": 20, "unit": "px" } }
          }
        },
        {
          "time": 1,
          "properties": {
            "opacity": 1,
            "transform": { "translateY": { "value": 0, "unit": "px" } }
          }
        }
      ],
      "duration": { "value": 300, "unit": "ms" },
      "easing": "ease-out"
    }
  ],
  "transitions": [
    {
      "id": "trans_button_hover",
      "trigger": { "state": "hover" },
      "properties": ["background", "transform", "opacity"],
      "duration": { "value": 200, "unit": "ms" },
      "easing": "ease-in-out"
    }
  ]
}
```

**GUI Mapping**: Timeline editor for keyframes, transition property picker.

## Complete Example

```json
{
  "schema_version": "2.0.0",
  "package": "ui_home",

  "tokens": {
    "colors": {
      "primary": { "type": "color", "value": "oklch(0.45 0.15 265)" },
      "accent": { "type": "color", "value": "oklch(0.75 0.15 195)" }
    }
  },

  "selectors": [
    {
      "id": "hero_title_selector",
      "predicate": {
        "targetType": "Text",
        "classes": ["hero-title"],
        "states": []
      }
    }
  ],

  "effects": [
    {
      "id": "hero_title_effect",
      "properties": {
        "fontSize": {
          "type": "length",
          "value": { "number": 4, "unit": "rem" }
        },
        "fontWeight": {
          "type": "number",
          "value": 700
        }
      }
    }
  ],

  "appearance": [
    {
      "id": "hero_title_appearance",
      "layers": [
        {
          "type": "background",
          "properties": {
            "gradient": {
              "type": "linear",
              "angle": 90,
              "stops": [
                { "position": 0, "color": { "token": "primary" } },
                { "position": 0.5, "color": { "token": "accent" } },
                { "position": 1, "color": { "token": "primary" } }
              ]
            }
          }
        }
      ]
    }
  ],

  "rules": [
    {
      "id": "rule_hero_title",
      "selector": "hero_title_selector",
      "priority": {
        "importance": "normal",
        "specificity": { "ids": 0, "classes": 1, "types": 1 },
        "sourceOrder": 100
      },
      "effects": { "ref": "hero_title_effect" },
      "appearance": { "ref": "hero_title_appearance" },
      "enabled": true
    }
  ]
}
```

## Serialization to CSS

The GUI **never** shows CSS syntax. CSS is a **compilation target**:

```javascript
function compileToCSS(schema) {
  // Resolve all rules
  // Apply cascade resolution
  // Generate CSS text
  return cssString;
}
```

## GUI Mental Model

**What the user does**:
1. Tag objects (identity)
2. Define conditions (selection)
3. Assign visual outcomes (effects + appearance)
4. Resolve conflicts (priority stack)
5. Preview result (computed values)

**NOT**: "Write CSS"

This is the foundation for a true visual styling system.
