import{j as e}from"./iframe-C03bZBvv.js";import"./preload-helper-D1UD9lgW.js";const o=({count:r})=>e.jsx("span",{className:"badge tab-badge",style:{marginLeft:"0.5rem",padding:"0.125rem 0.5rem",backgroundColor:"var(--color-secondary)",color:"var(--color-secondary-foreground)",borderRadius:"0.375rem",fontSize:"0.75rem",fontWeight:600},children:r}),b=({schemas:r,fields:m,workflows:p,nodes:s,scripts:u})=>e.jsxs("div",{className:"box config-summary",style:{marginTop:"2rem",padding:"1.5rem",background:"linear-gradient(90deg, rgba(74, 58, 199, 0.1) 0%, rgba(56, 189, 248, 0.1) 100%)",border:"2px dashed rgba(74, 58, 199, 0.3)",borderRadius:"0.5rem"},children:[e.jsx("h3",{style:{fontWeight:600,marginTop:0,marginBottom:"1rem"},children:"Configuration Summary"}),e.jsxs("div",{style:{display:"grid",gap:"0.5rem",fontSize:"0.875rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[e.jsx("span",{style:{color:"var(--color-muted-foreground)"},children:"Data Models:"}),e.jsx("span",{style:{fontWeight:500},children:r})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[e.jsx("span",{style:{color:"var(--color-muted-foreground)"},children:"Total Fields:"}),e.jsx("span",{style:{fontWeight:500},children:m})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[e.jsx("span",{style:{color:"var(--color-muted-foreground)"},children:"Workflows:"}),e.jsx("span",{style:{fontWeight:500},children:p})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[e.jsx("span",{style:{color:"var(--color-muted-foreground)"},children:"Workflow Nodes:"}),e.jsx("span",{style:{fontWeight:500},children:s})]}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between"},children:[e.jsx("span",{style:{color:"var(--color-muted-foreground)"},children:"Scripts:"}),e.jsx("span",{style:{fontWeight:500},children:u})]})]})]}),n=({level:r})=>e.jsxs("button",{className:"button preview-button",style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"1px solid var(--color-border)",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,transition:"all 200ms ease-in-out",display:"inline-flex",alignItems:"center",gap:"0.5rem"},children:["👁️ Preview L",r]}),g=({name:r,label:m,fieldCount:p,isSelected:s,onSelect:u,onDelete:x})=>e.jsxs("div",{onClick:u,style:{padding:"0.75rem",border:"1px solid var(--color-border)",borderRadius:"0.5rem",cursor:"pointer",backgroundColor:s?"var(--color-accent)":"transparent",color:s?"var(--color-accent-foreground)":"var(--color-foreground)",transition:"all 200ms ease-in-out",display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:500,fontSize:"0.875rem"},children:m||r}),e.jsxs("div",{style:{fontSize:"0.75rem",opacity:.7},children:[p," fields"]})]}),x&&e.jsx("button",{onClick:h=>{h.stopPropagation(),x()},style:{padding:"0.25rem 0.5rem",backgroundColor:"transparent",border:"none",cursor:"pointer",fontSize:"0.875rem"},children:"🗑️"})]}),y=()=>e.jsx("nav",{className:"nav builder-nav",style:{position:"sticky",top:0,zIndex:50,backgroundColor:"var(--color-sidebar)",borderBottom:"1px solid var(--color-sidebar-border)",padding:"1rem 2rem"},children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1.5rem"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem"},children:[e.jsx("div",{className:"box builder-logo",style:{width:32,height:32,borderRadius:"0.5rem",background:"linear-gradient(135deg, #a855f7 0%, #9333ea 100%)"}}),e.jsx("span",{style:{fontWeight:700,fontSize:"1.25rem",color:"var(--color-sidebar-foreground)"},children:"God-Tier Builder"})]}),e.jsx("a",{href:"#",style:{color:"var(--color-sidebar-foreground)",textDecoration:"none",fontSize:"0.875rem"},children:"🏠 Home"})]}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem",alignItems:"center"},children:[e.jsxs("div",{style:{display:"none",gap:"0.5rem"},children:[e.jsx(n,{level:1}),e.jsx(n,{level:2}),e.jsx(n,{level:3})]}),e.jsx("button",{style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"1px solid var(--color-border)",borderRadius:"0.375rem",color:"var(--color-sidebar-foreground)",cursor:"pointer",fontSize:"0.875rem"},children:"⬇️"}),e.jsx("button",{style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"1px solid var(--color-border)",borderRadius:"0.375rem",color:"var(--color-sidebar-foreground)",cursor:"pointer",fontSize:"0.875rem"},children:"⬆️"}),e.jsx("span",{style:{padding:"0.25rem 0.75rem",backgroundColor:"var(--color-secondary)",color:"var(--color-secondary-foreground)",borderRadius:"0.375rem",fontSize:"0.75rem",fontWeight:600},children:"god_user"})]})]})}),f=()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 2fr",gap:"1.5rem",height:"600px"},children:[e.jsxs("div",{style:{padding:"1.5rem",backgroundColor:"var(--color-card)",border:"1px solid var(--color-border)",borderRadius:"0.5rem"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"},children:[e.jsx("h3",{style:{margin:0,fontSize:"1.125rem"},children:"Models"}),e.jsx("button",{style:{padding:"0.5rem 0.75rem",backgroundColor:"var(--color-primary)",color:"var(--color-primary-foreground)",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"1rem",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",minWidth:"36px",minHeight:"36px",transition:"all 200ms ease-in-out",boxShadow:"0 1px 2px rgba(0, 0, 0, 0.1)"},onMouseEnter:r=>{r.currentTarget.style.transform="scale(1.05)",r.currentTarget.style.boxShadow="0 4px 6px rgba(0, 0, 0, 0.15)"},onMouseLeave:r=>{r.currentTarget.style.transform="scale(1)",r.currentTarget.style.boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"},children:"➕"})]}),e.jsx("p",{style:{fontSize:"0.875rem",color:"var(--color-muted-foreground)",marginBottom:"1rem"},children:"Data model definitions"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:[e.jsx(g,{name:"User",label:"User",fieldCount:5,isSelected:!0}),e.jsx(g,{name:"Post",label:"Post",fieldCount:8}),e.jsx(g,{name:"Comment",label:"Comment",fieldCount:4})]})]}),e.jsxs("div",{style:{padding:"1.5rem",backgroundColor:"var(--color-card)",border:"1px solid var(--color-border)",borderRadius:"0.5rem"},children:[e.jsx("h3",{style:{margin:0,marginBottom:"1rem",fontSize:"1.125rem"},children:"Edit Model: User"}),e.jsxs("div",{style:{display:"grid",gap:"1rem"},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"0.875rem",fontWeight:500,marginBottom:"0.25rem"},children:"Model Name"}),e.jsx("input",{type:"text",value:"User",readOnly:!0,style:{width:"100%",padding:"0.5rem",border:"1px solid var(--color-input)",borderRadius:"0.375rem",fontFamily:"inherit"}})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:"0.875rem",fontWeight:500,marginBottom:"0.25rem"},children:"Label"}),e.jsx("input",{type:"text",value:"User",readOnly:!0,style:{width:"100%",padding:"0.5rem",border:"1px solid var(--color-input)",borderRadius:"0.375rem",fontFamily:"inherit"}})]}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.5rem"},children:[e.jsx("label",{style:{fontSize:"0.875rem",fontWeight:500},children:"Fields"}),e.jsx("button",{style:{padding:"0.375rem 0.75rem",backgroundColor:"var(--color-primary)",color:"var(--color-primary-foreground)",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.75rem",fontWeight:600,transition:"all 200ms ease-in-out",boxShadow:"0 1px 2px rgba(0, 0, 0, 0.1)"},onMouseEnter:r=>{r.currentTarget.style.transform="translateY(-1px)",r.currentTarget.style.boxShadow="0 2px 4px rgba(0, 0, 0, 0.15)"},onMouseLeave:r=>{r.currentTarget.style.transform="translateY(0)",r.currentTarget.style.boxShadow="0 1px 2px rgba(0, 0, 0, 0.1)"},children:"Add Field"})]}),e.jsxs("div",{style:{padding:"1rem",backgroundColor:"var(--color-muted)",borderRadius:"0.375rem",fontSize:"0.875rem",color:"var(--color-muted-foreground)"},children:[e.jsx("div",{style:{marginBottom:"0.5rem"},children:"• username (string, required)"}),e.jsx("div",{style:{marginBottom:"0.5rem"},children:"• email (string, required)"}),e.jsx("div",{style:{marginBottom:"0.5rem"},children:"• bio (text, optional)"}),e.jsx("div",{style:{marginBottom:"0.5rem"},children:"• role (string, required)"}),e.jsx("div",{children:"• createdAt (datetime, required)"})]})]})]})]})]}),v=()=>e.jsxs("section",{className:"section builder-workspace",style:{padding:"2rem",maxWidth:"1536px",backgroundColor:"var(--color-canvas)"},children:[e.jsx("h2",{className:"text builder-title",style:{marginBottom:"0.5rem",fontWeight:700,fontSize:"1.875rem"},children:"Application Builder"}),e.jsx("p",{className:"text builder-subtitle",style:{color:"var(--color-muted-foreground)",marginBottom:"2rem"},children:"Design your application declaratively. Define schemas, create workflows, and write scripts."}),e.jsx("div",{style:{marginBottom:"1.5rem"},children:e.jsxs("div",{style:{display:"inline-flex",gap:"0.25rem",padding:"0.25rem",backgroundColor:"var(--color-muted)",borderRadius:"0.5rem"},children:[e.jsxs("button",{style:{padding:"0.5rem 1rem",backgroundColor:"var(--color-background)",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:"0.5rem"},children:["🗄️ Data Schemas",e.jsx(o,{count:3})]}),e.jsxs("button",{style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:"0.5rem"},children:["⚡ Workflows",e.jsx(o,{count:5})]}),e.jsxs("button",{style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:"0.5rem"},children:["💻 Scripts",e.jsx(o,{count:12})]})]})}),e.jsx(f,{}),e.jsx(b,{schemas:3,fields:17,workflows:5,nodes:23,scripts:12})]}),k={title:"Packages/UI Level 4",parameters:{package:"ui_level4",layout:"fullscreen"}},t={render:()=>e.jsx(y,{})},a={render:()=>e.jsxs("div",{style:{padding:"2rem",display:"flex",gap:"0.5rem"},children:[e.jsx(n,{level:1}),e.jsx(n,{level:2}),e.jsx(n,{level:3})]})},i={render:()=>e.jsx("div",{style:{padding:"2rem",maxWidth:"600px"},children:e.jsx(b,{schemas:3,fields:17,workflows:5,nodes:23,scripts:12})})},d={render:()=>e.jsx("div",{style:{padding:"2rem"},children:e.jsx(f,{})})},l={render:()=>e.jsxs("div",{style:{minHeight:"100vh",backgroundColor:"var(--color-canvas)"},children:[e.jsx(y,{}),e.jsx(v,{})]})},c={render:()=>e.jsx("div",{style:{padding:"2rem"},children:e.jsxs("div",{style:{display:"inline-flex",gap:"0.25rem",padding:"0.25rem",backgroundColor:"var(--color-muted)",borderRadius:"0.5rem"},children:[e.jsxs("button",{style:{padding:"0.5rem 1rem",backgroundColor:"var(--color-background)",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:"0.5rem"},children:["🗄️ Data Schemas",e.jsx(o,{count:3})]}),e.jsxs("button",{style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:"0.5rem"},children:["⚡ Workflows",e.jsx(o,{count:5})]}),e.jsxs("button",{style:{padding:"0.5rem 1rem",backgroundColor:"transparent",border:"none",borderRadius:"0.375rem",cursor:"pointer",fontSize:"0.875rem",fontWeight:500,display:"flex",alignItems:"center",gap:"0.5rem"},children:["💻 Scripts",e.jsx(o,{count:12})]})]})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <BuilderNav />
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    display: 'flex',
    gap: '0.5rem'
  }}>
      <PreviewButton level={1} />
      <PreviewButton level={2} />
      <PreviewButton level={3} />
    </div>
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    maxWidth: '600px'
  }}>
      <ConfigSummary schemas={3} fields={17} workflows={5} nodes={23} scripts={12} />
    </div>
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem'
  }}>
      <SchemaEditor />
    </div>
}`,...d.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    minHeight: '100vh',
    backgroundColor: 'var(--color-canvas)'
  }}>
      <BuilderNav />
      <BuilderWorkspace />
    </div>
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem'
  }}>
      <div style={{
      display: 'inline-flex',
      gap: '0.25rem',
      padding: '0.25rem',
      backgroundColor: 'var(--color-muted)',
      borderRadius: '0.5rem'
    }}>
        <button style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'var(--color-background)',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          🗄️ Data Schemas
          <TabBadge count={3} />
        </button>
        <button style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          ⚡ Workflows
          <TabBadge count={5} />
        </button>
        <button style={{
        padding: '0.5rem 1rem',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '0.375rem',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
          💻 Scripts
          <TabBadge count={12} />
        </button>
      </div>
    </div>
}`,...c.parameters?.docs?.source}}};const C=["Navigation","PreviewButtons","ConfigurationSummary","SchemaEditorPanel","FullBuilderWorkspace","TabsDemo"];export{i as ConfigurationSummary,l as FullBuilderWorkspace,t as Navigation,a as PreviewButtons,d as SchemaEditorPanel,c as TabsDemo,C as __namedExportsOrder,k as default};
