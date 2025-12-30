# CSS as an Abstract System (Not a Language)

If you strip CSS of syntax and web-specific baggage, it becomes a deterministic styling function:

```text
CSS = f(Style Rules, Element Tree, Environment) -> Computed Styles
```

That abstraction is exactly what a GUI designer can expose.

Below is the clean, implementation-agnostic decomposition and how each layer maps to a visual designer UI.

---

## 1. CSS as a layered data model

At its core, CSS consists of five orthogonal systems:

| Layer | Abstract Concept | CSS Name |
| --- | --- | --- |
| Identity | "What is this thing?" | Elements, attributes |
| Selection | "Which rules apply?" | Selectors |
| Conflict resolution | "Which rule wins?" | Cascade, specificity |
| Value resolution | "What does this value mean?" | Computed values |
| Application | "How does it affect appearance?" | Layout / paint |

This separation is critical for GUI mapping.

---

## 2. Identity layer -> Object Inspector

**Abstract model**

Every node has:
- Type (component kind)
- ID (unique)
- Classes (tags/categories)
- Attributes (key/value metadata)
- State vector (hover, active, disabled, focus, etc.)

**GUI mapping**

Inspector panel:
- Tree view of objects
- Editable:
  - ID field
  - Class list (chip editor)
  - Attribute table
  - State toggles (simulate `:hover`, `:pressed`)

This directly mirrors how CSS selectors "see" the world.

---

## 3. Selection layer -> Selector Builder

**Abstract model**

A selector is just a predicate over a node and its context.

Formally:

```text
selector(node, ancestry, state) -> true | false
```

**GUI mapping**

Visual selector constructor:
- Base target:
  - Type dropdown
  - ID picker
  - Class checkboxes
- Relationship:
  - Descendant / direct parent (optional)
- State flags:
  - Hover / Pressed / Focus / Disabled

Represent selectors as structured objects, not text:

```text
Selector {
  targetType: Button
  classes: ["primary"]
  states: [hover]
}
```

Text CSS becomes a serialization, not the authoring format.

---

## 4. Cascade layer -> Rule Priority Stack

**Abstract model**

CSS conflict resolution is a total ordering problem. Rules are sorted by:
1. Importance
2. Origin
3. Specificity
4. Source order

**GUI mapping**

Rule stack view (like layers in Photoshop):
- Each rule is a card
- Visual priority indicators:
  - Importance badge
  - Specificity meter
  - Order handle (drag to reorder)
  - Disabled/enabled toggle

User intuition: "This rule overrides that one."

---

## 5. Value system -> Typed property editors

**Abstract model**

CSS values are:
- Typed
- Context-dependent
- Late-bound

Example:

```text
font-size: 1.2em
```

means:

```text
multiply inherited font size by 1.2 at compute time
```

**GUI mapping**

Property editor driven by types:
- Color -> color picker
- Length -> numeric field + unit dropdown
- Enum -> dropdown
- Boolean -> toggle
- Compound -> grouped editor (e.g. margin/padding)

Variables become tokens:
- Global palette
- Component tokens
- Overrides

Users never type `calc()` unless they want to.

---

## 6. Computed values -> Debug and explainability

**Abstract model**

Computed style is a resolved snapshot:

```text
ComputedStyle(node) = resolve(rules, inheritance, environment)
```

**GUI mapping**

Computed style panel:
- Read-only list of final values
- For each value:
  - Source rule
  - Overridden rules (collapsed)
  - Resolved numeric/color result

This is the "why does this look like that?" tool.

---

## 7. Layout as constraint systems

**Abstract model**

Layout is constraint satisfaction, not painting.
- Flexbox -> linear constraints
- Grid -> 2D constraint matrix
- Positioning -> anchor constraints

**GUI mapping**

Layout mode switcher:
- Flow / Flex / Grid / Absolute
- Visual handles for:
  - Alignment
  - Gaps
  - Sizing rules
- Optional overlay visualization

This maps CSS layout primitives to direct manipulation.

---

## 8. Paint and effects -> Layer compositor

**Abstract model**

Painting is a stack of visual effects:
- Background
- Border
- Content
- Shadow
- Filter

**GUI mapping**

Layered appearance editor:
- Background layer
- Border layer
- Shadow layer(s)
- Opacity/blend mode

Each layer editable independently.

---

## 9. Environment and media -> Context simulator

**Abstract model**

CSS rules depend on environment:
- Viewport size
- DPI
- Color scheme
- Platform hints

**GUI mapping**

Environment toolbar:
- Resize viewport
- Toggle dark/light
- DPI slider
- Platform profile selector

Media queries become conditional rule groups.

---

## 10. The unifying mental model for the designer

**What the user is really doing**

They are not "writing CSS". They are:
- Tagging objects
- Defining conditions
- Assigning visual outcomes
- Resolving conflicts visually

Therefore the GUI should expose:

```text
Object -> Conditions -> Effects -> Priority -> Result
```

---

## Key insight

CSS is already a declarative visual programming language. A QML CSS designer should:
- Treat CSS as data, not text
- Expose structure over syntax
- Make cascade and specificity visible and manipulable

---

## TODO

- Map this abstraction to a concrete Qt 6 QML UI layout
- Define a minimal internal schema for "CSS as objects"
- Show how this model round-trips to real CSS or QML styles
