import{j as n,R,r as l,d as S}from"./iframe-C03bZBvv.js";import"./preload-helper-D1UD9lgW.js";function b(e,o={}){if(!e.render)return n.jsxs("div",{className:"error",children:[n.jsx("strong",{children:"Error:"})," Component ",e.name," has no render definition"]});const a={props:o,state:{}};try{return v(e.render.template,a)}catch(s){return n.jsxs("div",{className:"error",children:[n.jsxs("strong",{children:["Error rendering ",e.name,":"]})," ",s instanceof Error?s.message:String(s)]})}}function v(e,o){if(!e||typeof e!="object")return n.jsx(n.Fragment,{children:String(e)});if(e.type==="conditional"){const i=g(e.condition,o);return i&&e.then?v(e.then,o):!i&&e.else?v(e.else,o):n.jsx(n.Fragment,{})}if(e.type==="component")return n.jsxs("div",{className:"component-placeholder","data-component":e.name,children:["[",e.name,"]"]});const a=E(e.type);let s=null;e.children&&(typeof e.children=="string"?s=g(e.children,o):Array.isArray(e.children)?s=e.children.map((i,u)=>typeof i=="string"?g(i,o):n.jsx(R.Fragment,{children:v(i,o)},u)):s=v(e.children,o));const t={className:e.className};return e.style&&(t.style=e.style),e.href&&(t.href=g(e.href,o)),e.src&&(t.src=g(e.src,o)),e.alt&&(t.alt=g(e.alt,o)),n.jsx(a,{...t,children:s})}function E(e){return{Box:"div",Stack:"div",Text:"span",Button:"button",Link:"a",List:"ul",ListItem:"li",ListItemButton:"div",ListItemIcon:"div",ListItemText:"div",Icon:"span",Avatar:"div",Badge:"div",Divider:"hr",Collapse:"div",Breadcrumbs:"nav"}[e]||e}function g(e,o){if(typeof e!="string")return e;const a=e.match(/^\{\{(.+)\}\}$/);if(a){const s=a[1].trim();try{return k(s,o)}catch(t){return console.warn(`Failed to evaluate expression: ${s}`,t),e}}return e}function k(e,o){const a=e.split(".");let s=o;for(const t of a){if(t.includes("?")){const[i,u]=t.split("?"),[m,C]=u.split(":"),y=k(i.trim(),o);return k(y?m.trim():C.trim(),o)}if(t.startsWith("!")){const i=t.substring(1);return s=s?.[i],!s}if(s&&typeof s=="object")s=s[t];else return}return s}b.__docgenInfo={description:"Render a JSON component definition to React elements",methods:[],displayName:"renderJsonComponent",props:{id:{required:!0,tsType:{name:"string"},description:""},name:{required:!0,tsType:{name:"string"},description:""},description:{required:!1,tsType:{name:"string"},description:""},props:{required:!1,tsType:{name:"Array",elements:[{name:"any"}],raw:"any[]"},description:""},render:{required:!1,tsType:{name:"any"},description:""}}};const B={title:"Packages/JSON Components",parameters:{layout:"padded"}},f={render:()=>{const[e,o]=l.useState([]),[a,s]=l.useState(""),[t,i]=l.useState(null),[u,m]=l.useState({}),[C,y]=l.useState(!0);l.useEffect(()=>{S().then(r=>{const d=r.filter(c=>c.hasComponents);if(o(d),d.length>0&&(s(d[0].id),d[0].components&&d[0].components.length>0)){i(d[0].components[0]);const c={};d[0].components[0].props?.forEach(p=>{p.default!==void 0&&(c[p.name]=p.default)}),m(c)}y(!1)}).catch(r=>{console.error("Failed to discover packages:",r),y(!1)})},[]);const j=r=>{s(r);const d=e.find(c=>c.id===r);if(d?.components&&d.components.length>0){i(d.components[0]);const c={};d.components[0].props?.forEach(p=>{p.default!==void 0&&(c[p.name]=p.default)}),m(c)}else i(null),m({})},w=r=>{const c=e.find(p=>p.id===a)?.components?.find(p=>p.id===r);if(c){i(c);const p={};c.props?.forEach(P=>{P.default!==void 0&&(p[P.name]=P.default)}),m(p)}},N=(r,d)=>{m(c=>({...c,[r]:d}))};if(C)return n.jsx("div",{className:"card",children:"Loading components..."});if(e.length===0)return n.jsx("div",{className:"card",children:"No packages with components found"});const x=e.find(r=>r.id===a);return n.jsxs("div",{style:{display:"grid",gridTemplateColumns:"300px 1fr",gap:"1rem"},children:[n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[n.jsxs("div",{className:"card",style:{padding:"1rem"},children:[n.jsx("h3",{children:"Package"}),n.jsx("select",{value:a,onChange:r=>j(r.target.value),style:{width:"100%",padding:"0.5rem",borderRadius:"0.25rem",border:"1px solid #e0e0e0"},children:e.map(r=>n.jsx("option",{value:r.id,children:r.metadata.name},r.id))})]}),x&&x.components&&n.jsxs("div",{className:"card",style:{padding:"1rem"},children:[n.jsx("h3",{children:"Component"}),n.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.5rem"},children:x.components.map(r=>n.jsx("button",{onClick:()=>w(r.id),style:{padding:"0.5rem",textAlign:"left",border:"1px solid #e0e0e0",borderRadius:"0.25rem",background:t?.id===r.id?"#90caf9":"white",cursor:"pointer"},children:r.name},r.id))})]}),t&&t.props&&t.props.length>0&&n.jsxs("div",{className:"card",style:{padding:"1rem"},children:[n.jsx("h3",{children:"Props"}),n.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"0.75rem"},children:t.props.map(r=>n.jsxs("div",{children:[n.jsxs("label",{style:{display:"block",fontSize:"0.875rem",marginBottom:"0.25rem",fontWeight:"bold"},children:[r.name,r.required&&n.jsx("span",{style:{color:"red",marginLeft:"0.25rem"},children:"*"})]}),r.description&&n.jsx("p",{style:{fontSize:"0.75rem",color:"#666",margin:"0.25rem 0"},children:r.description}),T(r,u[r.name],d=>N(r.name,d))]},r.name))})]})]}),n.jsx("div",{className:"card",style:{padding:"1rem"},children:t?n.jsxs(n.Fragment,{children:[n.jsx("h2",{children:t.name}),t.description&&n.jsx("p",{style:{color:"#666",marginBottom:"1rem"},children:t.description}),n.jsxs("div",{style:{marginTop:"1rem",padding:"1rem",border:"1px solid #e0e0e0",borderRadius:"0.25rem",background:"#f5f5f5"},children:[n.jsx("h4",{children:"Preview:"}),n.jsx("div",{style:{marginTop:"0.5rem",padding:"1rem",background:"white",borderRadius:"0.25rem"},children:b(t,u)})]}),n.jsxs("div",{style:{marginTop:"1rem"},children:[n.jsx("h4",{children:"Component Definition:"}),n.jsx("pre",{style:{padding:"1rem",background:"#f5f5f5",borderRadius:"0.25rem",overflow:"auto",fontSize:"0.875rem"},children:JSON.stringify(t,null,2)})]})]}):n.jsx("p",{children:"Select a component to view"})})]})}};function T(e,o,a){const s={width:"100%",padding:"0.5rem",borderRadius:"0.25rem",border:"1px solid #e0e0e0"};switch(e.type){case"boolean":return n.jsx("input",{type:"checkbox",checked:!!o,onChange:t=>a(t.target.checked),style:{width:"auto"}});case"number":return n.jsx("input",{type:"number",value:o||0,onChange:t=>a(Number(t.target.value)),style:s});case"array":case"object":return n.jsx("textarea",{value:typeof o=="string"?o:JSON.stringify(o,null,2),onChange:t=>{try{a(JSON.parse(t.target.value))}catch{a(t.target.value)}},rows:5,style:{...s,fontFamily:"monospace",fontSize:"0.875rem"}});default:return n.jsx("input",{type:"text",value:o||"",onChange:t=>a(t.target.value),style:s})}}const h={render:()=>{const[e,o]=l.useState(null);return l.useEffect(()=>{S().then(a=>{const t=a.find(i=>i.id==="nav_menu")?.components?.find(i=>i.id==="sidebar");t&&o(t)}).catch(a=>{console.error("Failed to load nav_menu package:",a)})},[]),e?b(e,{title:"MetaBuilder",subtitle:"Package System",items:[],user:{name:"John Doe",role:"Admin",avatar:""},collapsed:!1,width:280}):n.jsx("div",{className:"card",children:"Loading sidebar component..."})}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([]);
    const [selectedPackage, setSelectedPackage] = useState<string>('');
    const [selectedComponent, setSelectedComponent] = useState<ComponentDefinition | null>(null);
    const [componentProps, setComponentProps] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      discoverAllPackages().then(pkgs => {
        const withComponents = pkgs.filter(p => p.hasComponents);
        setPackages(withComponents);
        if (withComponents.length > 0) {
          setSelectedPackage(withComponents[0].id);
          if (withComponents[0].components && withComponents[0].components.length > 0) {
            setSelectedComponent(withComponents[0].components[0]);
            // Set default props
            const defaultProps: Record<string, any> = {};
            withComponents[0].components[0].props?.forEach((prop: any) => {
              if (prop.default !== undefined) {
                defaultProps[prop.name] = prop.default;
              }
            });
            setComponentProps(defaultProps);
          }
        }
        setLoading(false);
      }).catch(error => {
        console.error('Failed to discover packages:', error);
        setLoading(false);
      });
    }, []);
    const handlePackageChange = (packageId: string) => {
      setSelectedPackage(packageId);
      const pkg = packages.find(p => p.id === packageId);
      if (pkg?.components && pkg.components.length > 0) {
        setSelectedComponent(pkg.components[0]);
        // Reset props
        const defaultProps: Record<string, any> = {};
        pkg.components[0].props?.forEach((prop: any) => {
          if (prop.default !== undefined) {
            defaultProps[prop.name] = prop.default;
          }
        });
        setComponentProps(defaultProps);
      } else {
        setSelectedComponent(null);
        setComponentProps({});
      }
    };
    const handleComponentChange = (componentId: string) => {
      const pkg = packages.find(p => p.id === selectedPackage);
      const component = pkg?.components?.find(c => c.id === componentId);
      if (component) {
        setSelectedComponent(component);
        // Reset props
        const defaultProps: Record<string, any> = {};
        component.props?.forEach((prop: any) => {
          if (prop.default !== undefined) {
            defaultProps[prop.name] = prop.default;
          }
        });
        setComponentProps(defaultProps);
      }
    };
    const handlePropChange = (propName: string, value: any) => {
      setComponentProps(prev => ({
        ...prev,
        [propName]: value
      }));
    };
    if (loading) {
      return <div className="card">Loading components...</div>;
    }
    if (packages.length === 0) {
      return <div className="card">No packages with components found</div>;
    }
    const currentPackage = packages.find(p => p.id === selectedPackage);
    return <div style={{
      display: 'grid',
      gridTemplateColumns: '300px 1fr',
      gap: '1rem'
    }}>
        {/* Sidebar */}
        <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
          <div className="card" style={{
          padding: '1rem'
        }}>
            <h3>Package</h3>
            <select value={selectedPackage} onChange={e => handlePackageChange(e.target.value)} style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.25rem',
            border: '1px solid #e0e0e0'
          }}>
              {packages.map(pkg => <option key={pkg.id} value={pkg.id}>
                  {pkg.metadata.name}
                </option>)}
            </select>
          </div>

          {currentPackage && currentPackage.components && <div className="card" style={{
          padding: '1rem'
        }}>
              <h3>Component</h3>
              <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
                {currentPackage.components.map(component => <button key={component.id} onClick={() => handleComponentChange(component.id)} style={{
              padding: '0.5rem',
              textAlign: 'left',
              border: '1px solid #e0e0e0',
              borderRadius: '0.25rem',
              background: selectedComponent?.id === component.id ? '#90caf9' : 'white',
              cursor: 'pointer'
            }}>
                    {component.name}
                  </button>)}
              </div>
            </div>}

          {selectedComponent && selectedComponent.props && selectedComponent.props.length > 0 && <div className="card" style={{
          padding: '1rem'
        }}>
              <h3>Props</h3>
              <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
                {selectedComponent.props.map((prop: any) => <div key={prop.name}>
                    <label style={{
                display: 'block',
                fontSize: '0.875rem',
                marginBottom: '0.25rem',
                fontWeight: 'bold'
              }}>
                      {prop.name}
                      {prop.required && <span style={{
                  color: 'red',
                  marginLeft: '0.25rem'
                }}>*</span>}
                    </label>
                    {prop.description && <p style={{
                fontSize: '0.75rem',
                color: '#666',
                margin: '0.25rem 0'
              }}>
                        {prop.description}
                      </p>}
                    {renderPropControl(prop, componentProps[prop.name], value => handlePropChange(prop.name, value))}
                  </div>)}
              </div>
            </div>}
        </div>

        {/* Main content */}
        <div className="card" style={{
        padding: '1rem'
      }}>
          {selectedComponent ? <>
              <h2>{selectedComponent.name}</h2>
              {selectedComponent.description && <p style={{
            color: '#666',
            marginBottom: '1rem'
          }}>
                  {selectedComponent.description}
                </p>}
              <div style={{
            marginTop: '1rem',
            padding: '1rem',
            border: '1px solid #e0e0e0',
            borderRadius: '0.25rem',
            background: '#f5f5f5'
          }}>
                <h4>Preview:</h4>
                <div style={{
              marginTop: '0.5rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.25rem'
            }}>
                  {renderJsonComponent(selectedComponent, componentProps)}
                </div>
              </div>
              <div style={{
            marginTop: '1rem'
          }}>
                <h4>Component Definition:</h4>
                <pre style={{
              padding: '1rem',
              background: '#f5f5f5',
              borderRadius: '0.25rem',
              overflow: 'auto',
              fontSize: '0.875rem'
            }}>
                  {JSON.stringify(selectedComponent, null, 2)}
                </pre>
              </div>
            </> : <p>Select a component to view</p>}
        </div>
      </div>;
  }
}`,...f.parameters?.docs?.source},description:{story:"Component Viewer - interactive viewer for JSON components",...f.parameters?.docs?.description}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [component, setComponent] = useState<ComponentDefinition | null>(null);
    useEffect(() => {
      discoverAllPackages().then(pkgs => {
        const navMenuPkg = pkgs.find(p => p.id === 'nav_menu');
        const sidebarComponent = navMenuPkg?.components?.find(c => c.id === 'sidebar');
        if (sidebarComponent) {
          setComponent(sidebarComponent);
        }
      }).catch(error => {
        console.error('Failed to load nav_menu package:', error);
      });
    }, []);
    if (!component) {
      return <div className="card">Loading sidebar component...</div>;
    }
    return renderJsonComponent(component, {
      title: 'MetaBuilder',
      subtitle: 'Package System',
      items: [],
      user: {
        name: 'John Doe',
        role: 'Admin',
        avatar: ''
      },
      collapsed: false,
      width: 280
    });
  }
}`,...h.parameters?.docs?.source},description:{story:"Example: Nav Menu Sidebar Component",...h.parameters?.docs?.description}}};const J=["ComponentViewer","NavMenuSidebar"];export{f as ComponentViewer,h as NavMenuSidebar,J as __namedExportsOrder,B as default};
