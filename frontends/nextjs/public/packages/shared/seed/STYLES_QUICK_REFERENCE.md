# Styles System Quick Reference

## Schema V2 Structure

```json
{
  "schema_version": "2.0.0",
  "package": "package_name",

  "tokens": { /* Design tokens */ },
  "selectors": [ /* Predicates */ ],
  "effects": [ /* Property values */ ],
  "appearance": [ /* Visual layers */ ],
  "layouts": [ /* Constraints */ ],
  "transitions": [ /* State changes */ ],
  "rules": [ /* Cascade */ ],
  "environments": [ /* Contexts */ ]
}
```

## 1. Tokens (Design System)

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
      }
    },
    "spacing": {
      "unit": { "type": "length", "value": { "number": 0.25, "unit": "rem" } },
      "scale": [1, 2, 3, 4, 6, 8, 12, 16]
    },
    "typography": {
      "fontFamily": {
        "body": "IBM Plex Sans, system-ui, sans-serif",
        "heading": "Space Grotesk, system-ui, sans-serif"
      }
    }
  }
}
```

## 2. Selectors (What to Style)

```json
{
  "selectors": [
    {
      "id": "button_primary_hover",
      "predicate": {
        "targetType": "Button",
        "classes": ["primary"],
        "states": ["hover"],
        "relationship": null
      }
    },
    {
      "id": "card_title",
      "predicate": {
        "targetType": "Text",
        "classes": ["title"],
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

## 3. Effects (Property Values)

```json
{
  "effects": [
    {
      "id": "large_bold_text",
      "properties": {
        "fontSize": {
          "type": "responsive",
          "breakpoints": {
            "xs": { "value": 2, "unit": "rem" },
            "md": { "value": 4, "unit": "rem" }
          }
        },
        "fontWeight": {
          "type": "number",
          "value": 700
        },
        "transform": {
          "type": "transform",
          "value": {
            "translateY": { "value": -2, "unit": "px" }
          }
        }
      }
    }
  ]
}
```

## 4. Appearance (Visual Layers)

```json
{
  "appearance": [
    {
      "id": "gradient_background",
      "layers": [
        {
          "type": "background",
          "order": 0,
          "properties": {
            "gradient": {
              "type": "linear",
              "angle": 90,
              "stops": [
                { "position": 0, "color": { "token": "primary" } },
                { "position": 1, "color": { "token": "accent" } }
              ]
            }
          }
        },
        {
          "type": "border",
          "order": 1,
          "properties": {
            "width": { "value": 2, "unit": "px" },
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
            "offsetY": { "value": 4, "unit": "px" },
            "blur": { "value": 8, "unit": "px" },
            "color": { "value": "oklch(0 0 0 / 0.1)" }
          }
        }
      ],
      "clip": "border-box"
    }
  ]
}
```

## 5. Layouts (Constraints)

```json
{
  "layouts": [
    {
      "id": "flex_column",
      "type": "flex",
      "constraints": {
        "direction": "column",
        "gap": { "number": 2, "unit": "rem" },
        "alignment": {
          "justify": "center",
          "align": "stretch"
        }
      }
    },
    {
      "id": "responsive_grid",
      "type": "grid",
      "constraints": {
        "columns": {
          "type": "responsive",
          "breakpoints": {
            "xs": 1,
            "sm": 2,
            "lg": 3
          }
        },
        "gap": { "number": 3, "unit": "rem" }
      }
    }
  ]
}
```

## 6. Transitions (State Changes)

```json
{
  "transitions": [
    {
      "id": "hover_lift",
      "trigger": { "state": "hover" },
      "properties": ["transform", "boxShadow"],
      "duration": { "value": 200, "unit": "ms" },
      "easing": "ease-in-out"
    }
  ]
}
```

## 7. Rules (Cascade)

```json
{
  "rules": [
    {
      "id": "rule_button_primary",
      "selector": "button_primary_selector",
      "priority": {
        "importance": "normal",
        "origin": "package",
        "specificity": {
          "ids": 0,
          "classes": 1,
          "types": 1
        },
        "sourceOrder": 10
      },
      "effects": { "ref": "button_effects" },
      "appearance": { "ref": "button_appearance" },
      "transition": { "ref": "hover_lift" },
      "enabled": true
    }
  ]
}
```

## 8. Environments (Context)

```json
{
  "environments": [
    {
      "id": "mobile",
      "conditions": {
        "viewport": {
          "maxWidth": { "value": 768, "unit": "px" }
        },
        "colorScheme": "light"
      }
    },
    {
      "id": "desktop_dark",
      "conditions": {
        "viewport": {
          "minWidth": { "value": 1024, "unit": "px" }
        },
        "colorScheme": "dark"
      }
    }
  ]
}
```

## Property Types

| Type | Example | GUI Editor |
|------|---------|------------|
| `color` | `{ "token": "primary" }` | Color picker |
| `length` | `{ "value": 16, "unit": "px" }` | Number + unit dropdown |
| `number` | `{ "value": 0.9 }` | Slider/input |
| `responsive` | `{ "breakpoints": {...} }` | Responsive editor |
| `transform` | `{ "translateY": {...} }` | Transform builder |
| `gradient` | `{ "type": "linear", "stops": [...] }` | Gradient editor |

## Layer Types

- `background` - Background colors/gradients
- `foreground` - Text/icon colors
- `border` - Border styling
- `shadow` - Box shadows
- `filter` - Filters (blur, brightness, etc.)

## Layout Types

- `flow` - Default document flow
- `flex` - Flexbox constraints
- `grid` - CSS Grid constraints
- `absolute` - Absolute positioning
- `sticky` - Sticky positioning

## Selector Relationships

```json
{
  "relationship": {
    "type": "descendant",  // or "child", "sibling", "adjacent"
    "ancestor": {
      "targetType": "Card",
      "classes": ["feature"]
    }
  }
}
```

## Reference Format

References use `{ "ref": "id" }` to point to other definitions:

```json
{
  "rules": [
    {
      "selector": "my_selector_id",        // String reference
      "effects": { "ref": "my_effect_id" },      // Object reference
      "appearance": { "ref": "my_appearance_id" }
    }
  ]
}
```

## Validation

Run validator:
```bash
lua packages/package_validator/seed/scripts/cli.lua <package_name>
```

Common errors:
- Missing required `id` field
- Duplicate IDs
- Invalid enum values
- Missing `predicate` in selectors
- Missing `properties` in effects
- Missing `layers` in appearance
- Invalid `type` in layouts

## Migration from V1

V1 (array with CSS strings):
```json
[
  { "id": "x", "type": "component", "css": ".class {...}" }
]
```

V2 (structured object):
```json
{
  "schema_version": "2.0.0",
  "selectors": [{ "predicate": {...} }],
  "effects": [{ "properties": {...} }],
  "rules": [{ "selector": "...", "effects": {...} }]
}
```

## Complete Minimal Example

```json
{
  "schema_version": "2.0.0",
  "package": "my_package",

  "tokens": {
    "colors": {
      "primary": { "type": "color", "value": "oklch(0.5 0.2 270)" }
    }
  },

  "selectors": [
    {
      "id": "button_selector",
      "predicate": { "targetType": "Button", "classes": [], "states": [] }
    }
  ],

  "effects": [
    {
      "id": "button_effect",
      "properties": {
        "fontSize": { "type": "length", "value": { "number": 1, "unit": "rem" } }
      }
    }
  ],

  "rules": [
    {
      "id": "button_rule",
      "selector": "button_selector",
      "priority": {
        "importance": "normal",
        "specificity": { "ids": 0, "classes": 0, "types": 1 },
        "sourceOrder": 1
      },
      "effects": { "ref": "button_effect" },
      "enabled": true
    }
  ]
}
```

This is the foundation - expand as needed!
