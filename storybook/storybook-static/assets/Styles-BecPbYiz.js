import{j as e}from"./iframe-C03bZBvv.js";import{useMDXComponents as r}from"./index-BIeM4Pvv.js";import{M as l}from"./blocks-DwHosmsX.js";import"./preload-helper-D1UD9lgW.js";import"./index-SocMimkG.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(l,{title:"Developer/Styles System"}),`
`,e.jsx(n.h1,{id:"styles-system-v2",children:"Styles System V2"}),`
`,e.jsx(n.h2,{id:"overview",children:"Overview"}),`
`,e.jsxs(n.p,{children:["MetaBuilder uses an ",e.jsx(n.strong,{children:"abstract styling system"})," (V2 schema) where CSS is treated as a deterministic function:"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`CSS = f(Style Rules, Element Tree, Environment) → Computed Styles
`})}),`
`,e.jsxs(n.p,{children:["This is ",e.jsx(n.strong,{children:"NOT"})," a CSS file format. This is structured data that gets ",e.jsx(n.strong,{children:"compiled"})," to CSS."]}),`
`,e.jsx(n.h2,{id:"the-problem-with-traditional-css",children:"The Problem with Traditional CSS"}),`
`,e.jsx(n.p,{children:"Traditional approach (❌):"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "id": "hero_title",
  "css": ".hero-title { font-size: 4rem; background: linear-gradient(...); }"
}
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Problems:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"CSS syntax mixed with JSON"}),`
`,e.jsx(n.li,{children:"Not GUI-editable"}),`
`,e.jsx(n.li,{children:"No semantic structure"}),`
`,e.jsx(n.li,{children:"Can't query/manipulate programmatically"}),`
`]}),`
`,e.jsx(n.h2,{id:"the-v2-approach",children:"The V2 Approach"}),`
`,e.jsx(n.p,{children:"V2 schema (✅):"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "selectors": [{
    "predicate": {
      "targetType": "Text",
      "classes": ["hero-title"]
    }
  }],
  "effects": [{
    "properties": {
      "fontSize": { "type": "responsive", ... }
    }
  }],
  "appearance": [{
    "layers": [
      { "type": "background", "properties": { "gradient": {...} } }
    ]
  }]
}
`})}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Benefits:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Fully structured and queryable"}),`
`,e.jsx(n.li,{children:"GUI-editable (CSS Designer)"}),`
`,e.jsx(n.li,{children:"Type-safe values"}),`
`,e.jsx(n.li,{children:"Explicit cascade resolution"}),`
`,e.jsx(n.li,{children:"Responsive by design"}),`
`]}),`
`,e.jsx(n.h2,{id:"the-10-layers",children:"The 10 Layers"}),`
`,e.jsx(n.h3,{id:"1-identity-layer",children:"1. Identity Layer"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What is this thing?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Objects have: type, ID, classes, attributes, states"}),`
`,e.jsx(n.li,{children:"GUI: Object inspector with property panel"}),`
`]}),`
`,e.jsx(n.h3,{id:"2-selection-layer",children:"2. Selection Layer"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Which rules apply?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Selectors as predicates (not strings)"}),`
`,e.jsx(n.li,{children:"GUI: Visual selector builder"}),`
`]}),`
`,e.jsx(n.h3,{id:"3-cascade-layer",children:"3. Cascade Layer"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Which rule wins?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Explicit priority: importance → specificity → source order"}),`
`,e.jsx(n.li,{children:"GUI: Rule stack with drag-to-reorder"}),`
`]}),`
`,e.jsx(n.h3,{id:"4-value-system",children:"4. Value System"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What does this value mean?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Typed properties: color, length, transform, responsive"}),`
`,e.jsx(n.li,{children:"GUI: Type-specific editors (color picker, slider, etc.)"}),`
`]}),`
`,e.jsx(n.h3,{id:"5-computed-values",children:"5. Computed Values"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Why does this look like that?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Read-only resolved styles with source attribution"}),`
`,e.jsx(n.li,{children:"GUI: Debug panel showing cascade trail"}),`
`]}),`
`,e.jsx(n.h3,{id:"6-layout-system",children:"6. Layout System"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How is it arranged?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Constraints: flex, grid, absolute"}),`
`,e.jsx(n.li,{children:"GUI: Layout mode switcher with visual handles"}),`
`]}),`
`,e.jsx(n.h3,{id:"7-paint--effects",children:"7. Paint & Effects"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How does it look?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Layered: background → border → shadow"}),`
`,e.jsx(n.li,{children:"GUI: Layer compositor (Photoshop-style)"}),`
`]}),`
`,e.jsx(n.h3,{id:"8-environment--context",children:"8. Environment & Context"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What are the conditions?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Viewport, color scheme, DPI, platform"}),`
`,e.jsx(n.li,{children:"GUI: Environment simulator toolbar"}),`
`]}),`
`,e.jsx(n.h3,{id:"9-tokens--variables",children:"9. Tokens & Variables"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"Design system values"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"First-class design tokens"}),`
`,e.jsx(n.li,{children:"GUI: Token editor with palettes"}),`
`]}),`
`,e.jsx(n.h3,{id:"10-animations--transitions",children:"10. Animations & Transitions"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"How does it change?"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"State machines with keyframes"}),`
`,e.jsx(n.li,{children:"GUI: Timeline editor"}),`
`]}),`
`,e.jsx(n.h2,{id:"how-it-works-in-storybook",children:"How It Works in Storybook"}),`
`,e.jsx(n.h3,{id:"1-schema-is-loaded",children:"1. Schema is Loaded"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`const response = await fetch('/packages/ui_home/seed/styles.json')
const schema = await response.json()
`})}),`
`,e.jsx(n.h3,{id:"2-schema-is-compiled-to-css",children:"2. Schema is Compiled to CSS"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`import { compileToCSS } from '@/styles/compiler'
const css = compileToCSS(schema)
`})}),`
`,e.jsx(n.h3,{id:"3-css-is-injected",children:"3. CSS is Injected"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`const styleEl = document.createElement('style')
styleEl.textContent = css
document.head.appendChild(styleEl)
`})}),`
`,e.jsx(n.h3,{id:"4-components-use-classes",children:"4. Components Use Classes"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<h1 className="text hero-title">Welcome</h1>
`})}),`
`,e.jsx(n.p,{children:"The compiler matches:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:["Selector predicate: ",e.jsx(n.code,{children:'targetType: "Text", classes: ["hero-title"]'})]}),`
`,e.jsxs(n.li,{children:["Generates CSS: ",e.jsx(n.code,{children:".text.hero-title { ... }"})]}),`
`,e.jsx(n.li,{children:"Applies effects + appearance from rules"}),`
`]}),`
`,e.jsx(n.h2,{id:"example-hero-title",children:"Example: Hero Title"}),`
`,e.jsx(n.h3,{id:"v2-schema",children:"V2 Schema"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "selectors": [{
    "id": "hero_title_selector",
    "predicate": {
      "targetType": "Text",
      "classes": ["hero-title"],
      "states": []
    }
  }],
  "effects": [{
    "id": "hero_title_typography",
    "properties": {
      "fontWeight": { "type": "number", "value": 700 },
      "fontSize": {
        "type": "responsive",
        "breakpoints": {
          "xs": { "value": 2.5, "unit": "rem" },
          "md": { "value": 4, "unit": "rem" }
        }
      }
    }
  }],
  "appearance": [{
    "id": "hero_title_gradient",
    "layers": [{
      "type": "background",
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
    }],
    "clip": "text"
  }],
  "rules": [{
    "selector": "hero_title_selector",
    "effects": { "ref": "hero_title_typography" },
    "appearance": { "ref": "hero_title_gradient" },
    "priority": { "sourceOrder": 10 }
  }]
}
`})}),`
`,e.jsx(n.h3,{id:"compiled-css",children:"Compiled CSS"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-css",children:`.text.hero-title {
  font-weight: 700;
  font-size: 4rem;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

@media (max-width: 768px) {
  .text.hero-title {
    font-size: 2.5rem;
  }
}
`})}),`
`,e.jsx(n.h3,{id:"component-usage",children:"Component Usage"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-tsx",children:`<h1 className="text hero-title">Welcome to MetaBuilder</h1>
`})}),`
`,e.jsx(n.h2,{id:"viewing-styles-in-storybook",children:"Viewing Styles in Storybook"}),`
`,e.jsx(n.h3,{id:"styles-viewer",children:"Styles Viewer"}),`
`,e.jsxs(n.p,{children:["Navigate to ",e.jsx(n.strong,{children:"Developer → Styles Viewer"})," to see:"]}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"Compiled CSS output"}),`
`,e.jsx(n.li,{children:"Raw V2 schema"}),`
`,e.jsx(n.li,{children:"Summary statistics"}),`
`]}),`
`,e.jsx(n.h3,{id:"package-specific-styles",children:"Package-Specific Styles"}),`
`,e.jsx(n.p,{children:"Each story can load its package styles:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-typescript",children:`export default {
  title: 'My Component',
  parameters: {
    package: 'ui_home', // Auto-loads ui_home styles
  },
}
`})}),`
`,e.jsx(n.h3,{id:"console-output",children:"Console Output"}),`
`,e.jsx(n.p,{children:"Check the browser console for:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`✓ Loaded styles for shared (2.4KB)
✓ Loaded styles for ui_home (5.1KB)
📦 All package styles loaded
`})}),`
`,e.jsx(n.h2,{id:"gui-designer-vision",children:"GUI Designer Vision"}),`
`,e.jsx(n.p,{children:"The V2 schema enables a visual CSS designer where users:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Tag objects"})," (identity) - Select component type and classes"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Define conditions"})," (selection) - Build predicates visually"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Assign visual outcomes"})," (effects) - Use type-specific editors"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Resolve conflicts"})," (cascade) - Drag rules to reorder"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Preview result"})," (computed) - See final applied styles"]}),`
`]}),`
`,e.jsxs(n.p,{children:[e.jsx(n.strong,{children:"Users never see CSS syntax."})," The designer exposes abstract concepts through visual interfaces."]}),`
`,e.jsx(n.h2,{id:"validation",children:"Validation"}),`
`,e.jsx(n.p,{children:"The package validator checks V2 schema structure:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-bash",children:`lua packages/package_validator/seed/scripts/cli.lua ui_home
`})}),`
`,e.jsx(n.p,{children:"Validates:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"All 10 layers"}),`
`,e.jsx(n.li,{children:"Required fields"}),`
`,e.jsx(n.li,{children:"Duplicate IDs"}),`
`,e.jsx(n.li,{children:"Type enums"}),`
`,e.jsx(n.li,{children:"Reference integrity"}),`
`]}),`
`,e.jsx(n.h2,{id:"migration-from-v1",children:"Migration from V1"}),`
`,e.jsx(n.p,{children:"V1 schemas (array with CSS strings) are still supported but deprecated."}),`
`,e.jsx(n.p,{children:"To migrate:"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsx(n.li,{children:"Convert CSS strings to predicates + effects"}),`
`,e.jsx(n.li,{children:"Extract colors/spacing to tokens"}),`
`,e.jsx(n.li,{children:"Define cascade priority explicitly"}),`
`,e.jsx(n.li,{children:"Add responsive breakpoints"}),`
`]}),`
`,e.jsxs(n.p,{children:["See ",e.jsx(n.code,{children:"packages/shared/seed/CSS_SCHEMA_V2.md"})," for full specification."]}),`
`,e.jsx(n.h2,{id:"summary",children:"Summary"}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What V2 Gives Us:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"✅ Database-driven styling"}),`
`,e.jsx(n.li,{children:"✅ GUI-editable design system"}),`
`,e.jsx(n.li,{children:"✅ Type-safe property values"}),`
`,e.jsx(n.li,{children:"✅ Explicit cascade resolution"}),`
`,e.jsx(n.li,{children:"✅ Responsive by default"}),`
`,e.jsx(n.li,{children:"✅ Programmatically queryable"}),`
`]}),`
`,e.jsx(n.p,{children:e.jsx(n.strong,{children:"What We Avoid:"})}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsx(n.li,{children:"❌ CSS syntax in JSON"}),`
`,e.jsx(n.li,{children:"❌ String-based selectors"}),`
`,e.jsx(n.li,{children:"❌ Implicit cascade"}),`
`,e.jsx(n.li,{children:"❌ Magic numbers"}),`
`,e.jsx(n.li,{children:"❌ Unmaintainable stylesheets"}),`
`]}),`
`,e.jsxs(n.p,{children:["CSS becomes a ",e.jsx(n.strong,{children:"compilation target"}),", not an authoring format."]})]})}function h(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{h as default};
