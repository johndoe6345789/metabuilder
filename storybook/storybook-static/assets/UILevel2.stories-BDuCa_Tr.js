import{j as e}from"./iframe-C03bZBvv.js";import"./preload-helper-D1UD9lgW.js";const r=({size:a=32})=>e.jsx("div",{className:"box user-avatar",style:{width:a,height:a,borderRadius:"9999px",background:"linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"}}),c=({username:a,bio:m,email:l})=>e.jsxs("div",{className:"card profile-card",style:{padding:"1.5rem",border:"1px solid var(--color-border)",borderRadius:"0.5rem",backgroundColor:"var(--color-card)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginBottom:"1rem"},children:[e.jsx(r,{size:48}),e.jsxs("div",{children:[e.jsx("h3",{style:{margin:0,fontWeight:600},children:a}),e.jsx("p",{style:{margin:0,fontSize:"0.875rem",color:"var(--color-muted-foreground)"},children:l})]})]}),e.jsx("p",{style:{color:"var(--color-foreground)"},children:m})]}),s=({username:a,content:m,timestamp:l})=>e.jsxs("div",{className:"box comment-item",style:{padding:"0.75rem",marginBottom:"0.75rem",border:"1px solid var(--color-border)",borderRadius:"0.375rem",backgroundColor:"var(--color-background)",transition:"background-color 150ms ease-in-out"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem"},children:[e.jsx(r,{size:24}),e.jsx("span",{style:{fontWeight:600,fontSize:"0.875rem"},children:a}),e.jsx("span",{style:{fontSize:"0.75rem",color:"var(--color-muted-foreground)"},children:l})]}),e.jsx("p",{style:{margin:0,fontSize:"0.875rem"},children:m})]}),p=()=>e.jsxs("div",{className:"box comment-box",style:{padding:"1rem",marginBottom:"1.5rem",border:"1px solid var(--color-border)",borderRadius:"0.375rem",backgroundColor:"var(--color-card)"},children:[e.jsx("h4",{style:{marginTop:0,marginBottom:"0.75rem"},children:"Add a Comment"}),e.jsx("textarea",{placeholder:"Share your thoughts...",style:{width:"100%",minHeight:"80px",padding:"0.5rem",border:"1px solid var(--color-input)",borderRadius:"0.375rem",fontFamily:"inherit",fontSize:"0.875rem"}}),e.jsx("button",{style:{marginTop:"0.5rem",padding:"0.5rem 1rem",backgroundColor:"#22c55e",color:"white",border:"none",borderRadius:"0.375rem",fontWeight:600,cursor:"pointer"},children:"Post Comment"})]}),g=()=>e.jsxs("section",{className:"section user-dashboard",style:{padding:"2rem",maxWidth:"1280px"},children:[e.jsx("h2",{style:{marginBottom:"2rem"},children:"User Dashboard"}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"2rem",marginBottom:"2rem"},children:[e.jsx(c,{username:"GreenUser123",bio:"Full-stack developer passionate about open source and clean code.",email:"user@example.com"}),e.jsx(c,{username:"CommunityMod",bio:"Community moderator helping users and maintaining forum quality.",email:"mod@example.com"})]}),e.jsx("h3",{style:{marginBottom:"1rem"},children:"Recent Comments"}),e.jsx(p,{}),e.jsxs("div",{children:[e.jsx(s,{username:"GreenUser123",content:"This is a great feature! Really enjoying the new Level 2 user area.",timestamp:"2 hours ago"}),e.jsx(s,{username:"CommunityMod",content:"Thanks for the feedback! We're constantly improving the platform.",timestamp:"1 hour ago"}),e.jsx(s,{username:"NewUser2024",content:"Just signed up and loving the community vibe here!",timestamp:"30 minutes ago"})]})]}),u=()=>e.jsx("nav",{className:"nav level2-nav",style:{position:"sticky",top:0,zIndex:50,backgroundColor:"var(--color-card)",borderBottom:"1px solid var(--color-border)",padding:"1rem 2rem"},children:e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"1rem"},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:"0.5rem",background:"linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"}}),e.jsx("span",{style:{fontWeight:700,fontSize:"1.25rem"},children:"Level 2 Community"})]}),e.jsxs("div",{style:{display:"flex",gap:"1rem",alignItems:"center"},children:[e.jsx("a",{href:"#",style:{color:"var(--color-foreground)",textDecoration:"none"},children:"Forum"}),e.jsx("a",{href:"#",style:{color:"var(--color-foreground)",textDecoration:"none"},children:"Profile"}),e.jsx(r,{size:32})]})]})}),v={title:"Packages/UI Level 2",parameters:{package:"ui_level2",layout:"fullscreen"}},o={render:()=>e.jsx(u,{})},n={render:()=>e.jsx("div",{style:{padding:"2rem",maxWidth:"400px"},children:e.jsx(c,{username:"GreenUser123",bio:"Full-stack developer passionate about open source and clean code.",email:"user@example.com"})})},t={render:()=>e.jsxs("div",{style:{padding:"2rem",maxWidth:"600px"},children:[e.jsx(p,{}),e.jsx(s,{username:"GreenUser123",content:"This is a great feature! Really enjoying the new Level 2 user area.",timestamp:"2 hours ago"}),e.jsx(s,{username:"CommunityMod",content:"Thanks for the feedback! We're constantly improving the platform.",timestamp:"1 hour ago"})]})},i={render:()=>e.jsxs("div",{children:[e.jsx(u,{}),e.jsx(g,{})]})},d={render:()=>e.jsxs("div",{style:{padding:"2rem",display:"flex",gap:"1rem",alignItems:"center"},children:[e.jsx(r,{size:24}),e.jsx(r,{size:32}),e.jsx(r,{size:48}),e.jsx(r,{size:64}),e.jsx(r,{size:96})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Level2Nav />
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    maxWidth: '400px'
  }}>
      <ProfileCard username="GreenUser123" bio="Full-stack developer passionate about open source and clean code." email="user@example.com" />
    </div>
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    maxWidth: '600px'
  }}>
      <CommentBox />
      <CommentItem username="GreenUser123" content="This is a great feature! Really enjoying the new Level 2 user area." timestamp="2 hours ago" />
      <CommentItem username="CommunityMod" content="Thanks for the feedback! We're constantly improving the platform." timestamp="1 hour ago" />
    </div>
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <Level2Nav />
      <UserDashboard />
    </div>
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    padding: '2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  }}>
      <UserAvatar size={24} />
      <UserAvatar size={32} />
      <UserAvatar size={48} />
      <UserAvatar size={64} />
      <UserAvatar size={96} />
    </div>
}`,...d.parameters?.docs?.source}}};const y=["Navigation","SingleProfileCard","CommentThread","FullDashboard","AvatarGallery"];export{d as AvatarGallery,t as CommentThread,i as FullDashboard,o as Navigation,n as SingleProfileCard,y as __namedExportsOrder,v as default};
