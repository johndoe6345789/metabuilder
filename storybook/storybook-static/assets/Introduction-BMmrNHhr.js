import{j as e}from"./iframe-C03bZBvv.js";import{useMDXComponents as r}from"./index-BIeM4Pvv.js";import{M as c}from"./blocks-DwHosmsX.js";import"./preload-helper-D1UD9lgW.js";import"./index-SocMimkG.js";function i(s){const n={code:"code",h1:"h1",h2:"h2",h3:"h3",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...r(),...s.components};return e.jsxs(e.Fragment,{children:[e.jsx(c,{title:"Introduction"}),`
`,e.jsx(n.h1,{id:"metabuilder-package-storybook",children:"MetaBuilder Package Storybook"}),`
`,e.jsxs(n.p,{children:["This Storybook renders ",e.jsx(n.strong,{children:"MetaBuilder packages backed by JSON scripts"})," from the MetaBuilder platform without running the actual application."]}),`
`,e.jsx(n.h2,{id:"quick-start",children:"Quick Start"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Explorer"})," - Use the Auto-Discovered Packages → Explorer to browse all packages interactively"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Component Registry"})," - See all available components in Components → Registry"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Manual Stories"})," - Pre-configured stories in JSON package renders"]}),`
`]}),`
`,e.jsx(n.h2,{id:"auto-discovery",children:"Auto-Discovery"}),`
`,e.jsxs(n.p,{children:["The storybook automatically discovers packages using ",e.jsx(n.code,{children:"storybook.config.json"}),":"]}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`  {
    "discovery": {
      "enabled": true,
      "includedCategories": ["ui", "admin", "gaming", "social", "editors"],
      "excludedPackages": ["shared", "testing"],
      "minLevel": 1,
      "maxLevel": 6
    }
  }
`})}),`
`,e.jsx(n.h3,{id:"context-variants",children:"Context Variants"}),`
`,e.jsx(n.p,{children:"Test packages with different user contexts:"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Guest"})," - Level 1 user"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Admin"})," - Level 4 user"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Admin (Nerd Mode)"})," - Level 4 with nerdMode enabled"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Supergod"})," - Level 6 user"]}),`
`]}),`
`,e.jsx(n.h2,{id:"how-it-works",children:"How It Works"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"JSON script packages"})," in ",e.jsx(n.code,{children:"/packages/*/seed/scripts/"})," define UI component trees"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Mock data"})," mirrors the output structure produced by the JSON scripts"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"PackageRenderer"})," (still the runtime entry) converts the component tree to React components"]}),`
`,e.jsxs(n.li,{children:[e.jsx(n.strong,{children:"Component Registry"})," maps package-defined type names to React implementations"]}),`
`]}),`
`,e.jsx(n.h2,{id:"package-structure",children:"Package Structure"}),`
`,e.jsx(n.p,{children:"Each JSON script package follows this structure:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{children:`packages/
└── {package_name}/
    └── seed/
        ├── metadata.json      # Package info
        ├── components.json    # Component definitions
        └── scripts/
            └── [script-name].json  # JSON script definitions following script_schema.json
                                     # Must include full function implementations with bodies,
                                     # not just metadata declarations (e.g., automation.json)
`})}),`
`,e.jsx(n.h2,{id:"json-script-output",children:"JSON Script Output"}),`
`,e.jsx(n.p,{children:"JSON script functions return component trees like:"}),`
`,e.jsx(n.pre,{children:e.jsx(n.code,{className:"language-json",children:`{
  "type": "Card",
  "props": { "className": "p-4" },
  "children": [
    {
      "type": "Typography",
      "props": { "variant": "h5", "text": "Title" }
    },
    {
      "type": "Button",
      "props": { "children": "Click Me" }
    }
  ]
}
`})}),`
`,e.jsx(n.h2,{id:"adding-new-package-mocks",children:"Adding New Package Mocks"}),`
`,e.jsxs(n.ol,{children:[`
`,e.jsxs(n.li,{children:["Create a file in ",e.jsx(n.code,{children:"src/mocks/packages/{package-name}.ts"})]}),`
`,e.jsxs(n.li,{children:["Define the ",e.jsx(n.code,{children:"MockPackageDefinition"})," with metadata and renders"]}),`
`,e.jsxs(n.li,{children:["Call ",e.jsx(n.code,{children:"registerMockPackage()"})," to register it"]}),`
`,e.jsxs(n.li,{children:["Import it in ",e.jsx(n.code,{children:"src/mocks/packages/index.ts"})]}),`
`,e.jsxs(n.li,{children:["Create stories in ",e.jsx(n.code,{children:"src/stories/"})]}),`
`]}),`
`,e.jsx(n.h2,{id:"available-component-types",children:"Available Component Types"}),`
`,e.jsx(n.p,{children:"The component registry maps these package types to React:"}),`
`,e.jsx(n.h3,{id:"layout",children:"Layout"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Box"}),", ",e.jsx(n.code,{children:"Stack"}),", ",e.jsx(n.code,{children:"Flex"}),", ",e.jsx(n.code,{children:"Grid"}),", ",e.jsx(n.code,{children:"Container"})]}),`
`]}),`
`,e.jsx(n.h3,{id:"surfaces",children:"Surfaces"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Card"}),", ",e.jsx(n.code,{children:"CardHeader"}),", ",e.jsx(n.code,{children:"CardContent"}),", ",e.jsx(n.code,{children:"CardActions"}),", ",e.jsx(n.code,{children:"Paper"})]}),`
`]}),`
`,e.jsx(n.h3,{id:"typography",children:"Typography"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Typography"})," (with variants: h1-h6, body1, body2, caption, overline)"]}),`
`]}),`
`,e.jsx(n.h3,{id:"inputs",children:"Inputs"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Button"})," (variants: contained, outlined, text)"]}),`
`]}),`
`,e.jsx(n.h3,{id:"display",children:"Display"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Icon"}),", ",e.jsx(n.code,{children:"Avatar"}),", ",e.jsx(n.code,{children:"Badge"}),", ",e.jsx(n.code,{children:"Chip"}),", ",e.jsx(n.code,{children:"Divider"}),", ",e.jsx(n.code,{children:"Alert"})]}),`
`]}),`
`,e.jsx(n.h3,{id:"navigation",children:"Navigation"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Tabs"}),", ",e.jsx(n.code,{children:"Tab"})]}),`
`]}),`
`,e.jsx(n.h3,{id:"app-specific",children:"App-Specific"}),`
`,e.jsxs(n.ul,{children:[`
`,e.jsxs(n.li,{children:[e.jsx(n.code,{children:"Level4Header"}),", ",e.jsx(n.code,{children:"IntroSection"}),", ",e.jsx(n.code,{children:"AppHeader"}),", ",e.jsx(n.code,{children:"AppFooter"}),", ",e.jsx(n.code,{children:"Sidebar"})]}),`
`]})]})}function h(s={}){const{wrapper:n}={...r(),...s.components};return n?e.jsx(n,{...s,children:e.jsx(i,{...s})}):i(s)}export{h as default};
