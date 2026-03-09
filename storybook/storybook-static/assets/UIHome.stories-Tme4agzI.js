import{j as e}from"./iframe-C03bZBvv.js";import"./preload-helper-D1UD9lgW.js";const m=({children:t})=>e.jsx("h1",{className:"text hero-title",children:t}),p=({children:t})=>e.jsx("p",{className:"text hero-subtitle",children:t}),r=({level:t,title:v,description:x})=>e.jsxs("div",{className:`card feature-card feature-card--level${t}`,children:[e.jsx("div",{className:"box feature-icon",children:t}),e.jsx("h3",{className:"text",children:v}),e.jsx("p",{className:"text",children:x})]}),g=()=>e.jsxs("div",{className:"hero-section",children:[e.jsx(m,{children:"Welcome to MetaBuilder"}),e.jsx(p,{children:"Build dynamic applications with abstract styling systems, automation scripting, and component composition"})]}),u=()=>e.jsxs("div",{className:"features-section",children:[e.jsx("h2",{className:"text",children:"Features by Level"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"2rem",marginTop:"2rem"},children:[e.jsx(r,{level:1,title:"Home & Basics",description:"Landing page, navigation, and core UI components"}),e.jsx(r,{level:2,title:"User Content",description:"Forums, social features, and user-generated content"}),e.jsx(r,{level:3,title:"Media & Rich Content",description:"Media center, streaming, and rich content management"}),e.jsx(r,{level:4,title:"Administration",description:"Admin tools, user management, and system configuration"}),e.jsx(r,{level:5,title:"Development Tools",description:"Code editor, schema designer, and developer utilities"}),e.jsx(r,{level:6,title:"Advanced Systems",description:"Workflow editor, AI integration, and advanced automation"})]})]}),H={title:"Packages/UI Home",parameters:{package:"ui_home",layout:"fullscreen"}},a={render:()=>e.jsx(m,{children:"Gradient Text Heading"})},i={render:()=>e.jsx(p,{children:"This is a subtitle with muted foreground color"})},s={render:()=>e.jsx("div",{style:{padding:"2rem",maxWidth:"300px"},children:e.jsx(r,{level:1,title:"Home & Basics",description:"Landing page, navigation, and core UI components"})})},n={render:()=>e.jsxs("div",{style:{padding:"2rem",display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"2rem"},children:[e.jsx(r,{level:1,title:"Level 1",description:"Blue gradient"}),e.jsx(r,{level:2,title:"Level 2",description:"Green gradient"}),e.jsx(r,{level:3,title:"Level 3",description:"Orange gradient"}),e.jsx(r,{level:4,title:"Level 4",description:"Red gradient"}),e.jsx(r,{level:5,title:"Level 5",description:"Purple gradient"}),e.jsx(r,{level:6,title:"Level 6",description:"Gold gradient"})]})},d={render:()=>e.jsx("div",{style:{padding:"2rem",background:"linear-gradient(135deg, rgba(74, 58, 199, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)"},children:e.jsx(g,{})})},o={render:()=>e.jsx("div",{style:{padding:"2rem"},children:e.jsx(u,{})})},l={render:()=>e.jsxs("div",{style:{minHeight:"100vh",background:"linear-gradient(135deg, rgba(74, 58, 199, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)"},children:[e.jsx(g,{}),e.jsx(u,{})]})},c={render:()=>e.jsxs("div",{style:{padding:"2rem"},children:[e.jsx("p",{style:{marginBottom:"1rem",color:"#666"},children:"Hover over the card to see the lift effect (transform: translateY(-2px))"}),e.jsx("div",{style:{maxWidth:"300px"},children:e.jsx(r,{level:3,title:"Hover Me!",description:"The border color and transform change on hover thanks to V2 transitions"})})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <HeroTitle>Gradient Text Heading</HeroTitle>
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <HeroSubtitle>This is a subtitle with muted foreground color</HeroSubtitle>
}`,...i.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    maxWidth: '300px'
  }}>
      <FeatureCard level={1} title="Home & Basics" description="Landing page, navigation, and core UI components" />
    </div>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem'
  }}>
      <FeatureCard level={1} title="Level 1" description="Blue gradient" />
      <FeatureCard level={2} title="Level 2" description="Green gradient" />
      <FeatureCard level={3} title="Level 3" description="Orange gradient" />
      <FeatureCard level={4} title="Level 4" description="Red gradient" />
      <FeatureCard level={5} title="Level 5" description="Purple gradient" />
      <FeatureCard level={6} title="Level 6" description="Gold gradient" />
    </div>
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(74, 58, 199, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)'
  }}>
      <HeroSection />
    </div>
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem'
  }}>
      <FeaturesGrid />
    </div>
}`,...o.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    minHeight: '100vh',
    background: 'linear-gradient(135deg, rgba(74, 58, 199, 0.05) 0%, transparent 50%, rgba(56, 189, 248, 0.05) 100%)'
  }}>
      <HeroSection />
      <FeaturesGrid />
    </div>
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem'
  }}>
      <p style={{
      marginBottom: '1rem',
      color: '#666'
    }}>
        Hover over the card to see the lift effect (transform: translateY(-2px))
      </p>
      <div style={{
      maxWidth: '300px'
    }}>
        <FeatureCard level={3} title="Hover Me!" description="The border color and transform change on hover thanks to V2 transitions" />
      </div>
    </div>
}`,...c.parameters?.docs?.source}}};const f=["HeroTitleExample","HeroSubtitleExample","SingleFeatureCard","AllFeatureCards","HeroSectionExample","FeaturesGridExample","FullLandingPage","HoverTest"];export{n as AllFeatureCards,o as FeaturesGridExample,l as FullLandingPage,d as HeroSectionExample,i as HeroSubtitleExample,a as HeroTitleExample,c as HoverTest,s as SingleFeatureCard,f as __namedExportsOrder,H as default};
