import{r as a,d as m,j as e}from"./iframe-C03bZBvv.js";import"./preload-helper-D1UD9lgW.js";const h={title:"Packages/Auto-Discovered",parameters:{layout:"padded"}},o={render:()=>{const[d,i]=a.useState([]),[n,t]=a.useState(!0);return a.useEffect(()=>{m().then(s=>{i(s),t(!1)}).catch(s=>{console.error("Failed to discover packages:",s),t(!1)})},[]),n?e.jsx("div",{className:"card",children:"Loading packages..."}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsxs("h2",{children:["Discovered Packages (",d.length,")"]}),d.map(s=>e.jsxs("div",{className:"card",style:{padding:"1rem"},children:[e.jsx("h3",{children:s.metadata.name}),e.jsx("p",{children:s.metadata.description}),e.jsxs("div",{style:{display:"flex",gap:"0.5rem",marginTop:"0.5rem"},children:[e.jsxs("span",{style:{fontSize:"0.875rem",color:"#666"},children:["v",s.metadata.version]}),s.metadata.category&&e.jsx("span",{style:{fontSize:"0.875rem",padding:"0.125rem 0.5rem",background:"#e0e0e0",borderRadius:"0.25rem"},children:s.metadata.category}),s.hasComponents&&e.jsxs("span",{style:{fontSize:"0.875rem",padding:"0.125rem 0.5rem",background:"#90caf9",borderRadius:"0.25rem"},children:[s.components?.length||0," components"]}),s.hasPermissions&&e.jsxs("span",{style:{fontSize:"0.875rem",padding:"0.125rem 0.5rem",background:"#ffcc80",borderRadius:"0.25rem"},children:[s.permissions?.length||0," permissions"]}),s.hasStyles&&e.jsx("span",{style:{fontSize:"0.875rem",padding:"0.125rem 0.5rem",background:"#ce93d8",borderRadius:"0.25rem"},children:"styles"})]})]},s.id))]})}},l={render:()=>{const[d,i]=a.useState([]),[n,t]=a.useState(!0);return a.useEffect(()=>{m().then(s=>{i(s.filter(r=>r.hasComponents)),t(!1)}).catch(s=>{console.error("Failed to discover packages:",s),t(!1)})},[]),n?e.jsx("div",{className:"card",children:"Loading components..."}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx("h2",{children:"All Components"}),d.map(s=>e.jsxs("div",{className:"card",style:{padding:"1rem"},children:[e.jsx("h3",{children:s.metadata.name}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:"0.5rem",marginTop:"0.5rem"},children:s.components?.map(r=>e.jsxs("div",{style:{padding:"0.5rem",border:"1px solid #e0e0e0",borderRadius:"0.25rem"},children:[e.jsx("div",{style:{fontWeight:"bold"},children:r.name}),r.description&&e.jsx("div",{style:{fontSize:"0.875rem",color:"#666",marginTop:"0.25rem"},children:r.description})]},r.id))})]},s.id))]})}},c={render:()=>{const[d,i]=a.useState([]),[n,t]=a.useState(!0);return a.useEffect(()=>{m().then(s=>{i(s.filter(r=>r.hasPermissions)),t(!1)}).catch(s=>{console.error("Failed to discover packages:",s),t(!1)})},[]),n?e.jsx("div",{className:"card",children:"Loading permissions..."}):e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"1rem"},children:[e.jsx("h2",{children:"All Permissions"}),d.map(s=>e.jsxs("div",{className:"card",style:{padding:"1rem"},children:[e.jsx("h3",{children:s.metadata.name}),e.jsxs("table",{style:{width:"100%",borderCollapse:"collapse",marginTop:"0.5rem"},children:[e.jsx("thead",{children:e.jsxs("tr",{style:{borderBottom:"2px solid #e0e0e0"},children:[e.jsx("th",{style:{textAlign:"left",padding:"0.5rem"},children:"ID"}),e.jsx("th",{style:{textAlign:"left",padding:"0.5rem"},children:"Name"}),e.jsx("th",{style:{textAlign:"left",padding:"0.5rem"},children:"Action"}),e.jsx("th",{style:{textAlign:"left",padding:"0.5rem"},children:"Resource"}),e.jsx("th",{style:{textAlign:"left",padding:"0.5rem"},children:"Min Level"})]})}),e.jsx("tbody",{children:s.permissions?.map(r=>e.jsxs("tr",{style:{borderBottom:"1px solid #e0e0e0"},children:[e.jsx("td",{style:{padding:"0.5rem",fontFamily:"monospace",fontSize:"0.875rem"},children:r.id}),e.jsx("td",{style:{padding:"0.5rem"},children:r.name}),e.jsx("td",{style:{padding:"0.5rem"},children:e.jsx("span",{style:{padding:"0.125rem 0.5rem",background:"#90caf9",borderRadius:"0.25rem",fontSize:"0.875rem"},children:r.action})}),e.jsx("td",{style:{padding:"0.5rem",fontFamily:"monospace",fontSize:"0.875rem"},children:r.resource}),e.jsx("td",{style:{padding:"0.5rem",textAlign:"center"},children:r.minLevel||0})]},r.id))})]})]},s.id))]})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      discoverAllPackages().then(pkgs => {
        setPackages(pkgs);
        setLoading(false);
      }).catch(error => {
        console.error('Failed to discover packages:', error);
        setLoading(false);
      });
    }, []);
    if (loading) {
      return <div className="card">Loading packages...</div>;
    }
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
        <h2>Discovered Packages ({packages.length})</h2>
        {packages.map(pkg => <div key={pkg.id} className="card" style={{
        padding: '1rem'
      }}>
            <h3>{pkg.metadata.name}</h3>
            <p>{pkg.metadata.description}</p>
            <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '0.5rem'
        }}>
              <span style={{
            fontSize: '0.875rem',
            color: '#666'
          }}>
                v{pkg.metadata.version}
              </span>
              {pkg.metadata.category && <span style={{
            fontSize: '0.875rem',
            padding: '0.125rem 0.5rem',
            background: '#e0e0e0',
            borderRadius: '0.25rem'
          }}>
                  {pkg.metadata.category}
                </span>}
              {pkg.hasComponents && <span style={{
            fontSize: '0.875rem',
            padding: '0.125rem 0.5rem',
            background: '#90caf9',
            borderRadius: '0.25rem'
          }}>
                  {pkg.components?.length || 0} components
                </span>}
              {pkg.hasPermissions && <span style={{
            fontSize: '0.875rem',
            padding: '0.125rem 0.5rem',
            background: '#ffcc80',
            borderRadius: '0.25rem'
          }}>
                  {pkg.permissions?.length || 0} permissions
                </span>}
              {pkg.hasStyles && <span style={{
            fontSize: '0.875rem',
            padding: '0.125rem 0.5rem',
            background: '#ce93d8',
            borderRadius: '0.25rem'
          }}>
                  styles
                </span>}
            </div>
          </div>)}
      </div>;
  }
}`,...o.parameters?.docs?.source},description:{story:"Package Browser - shows all discovered packages",...o.parameters?.docs?.description}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      discoverAllPackages().then(pkgs => {
        setPackages(pkgs.filter(p => p.hasComponents));
        setLoading(false);
      }).catch(error => {
        console.error('Failed to discover packages:', error);
        setLoading(false);
      });
    }, []);
    if (loading) {
      return <div className="card">Loading components...</div>;
    }
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
        <h2>All Components</h2>
        {packages.map(pkg => <div key={pkg.id} className="card" style={{
        padding: '1rem'
      }}>
            <h3>{pkg.metadata.name}</h3>
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.5rem',
          marginTop: '0.5rem'
        }}>
              {pkg.components?.map(component => <div key={component.id} style={{
            padding: '0.5rem',
            border: '1px solid #e0e0e0',
            borderRadius: '0.25rem'
          }}>
                  <div style={{
              fontWeight: 'bold'
            }}>{component.name}</div>
                  {component.description && <div style={{
              fontSize: '0.875rem',
              color: '#666',
              marginTop: '0.25rem'
            }}>
                      {component.description}
                    </div>}
                </div>)}
            </div>
          </div>)}
      </div>;
  }
}`,...l.parameters?.docs?.source},description:{story:"Components Browser - shows all components from all packages",...l.parameters?.docs?.description}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [packages, setPackages] = useState<DiscoveredPackage[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      discoverAllPackages().then(pkgs => {
        setPackages(pkgs.filter(p => p.hasPermissions));
        setLoading(false);
      }).catch(error => {
        console.error('Failed to discover packages:', error);
        setLoading(false);
      });
    }, []);
    if (loading) {
      return <div className="card">Loading permissions...</div>;
    }
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem'
    }}>
        <h2>All Permissions</h2>
        {packages.map(pkg => <div key={pkg.id} className="card" style={{
        padding: '1rem'
      }}>
            <h3>{pkg.metadata.name}</h3>
            <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '0.5rem'
        }}>
              <thead>
                <tr style={{
              borderBottom: '2px solid #e0e0e0'
            }}>
                  <th style={{
                textAlign: 'left',
                padding: '0.5rem'
              }}>ID</th>
                  <th style={{
                textAlign: 'left',
                padding: '0.5rem'
              }}>Name</th>
                  <th style={{
                textAlign: 'left',
                padding: '0.5rem'
              }}>Action</th>
                  <th style={{
                textAlign: 'left',
                padding: '0.5rem'
              }}>Resource</th>
                  <th style={{
                textAlign: 'left',
                padding: '0.5rem'
              }}>Min Level</th>
                </tr>
              </thead>
              <tbody>
                {pkg.permissions?.map(permission => <tr key={permission.id} style={{
              borderBottom: '1px solid #e0e0e0'
            }}>
                    <td style={{
                padding: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                      {permission.id}
                    </td>
                    <td style={{
                padding: '0.5rem'
              }}>{permission.name}</td>
                    <td style={{
                padding: '0.5rem'
              }}>
                      <span style={{
                  padding: '0.125rem 0.5rem',
                  background: '#90caf9',
                  borderRadius: '0.25rem',
                  fontSize: '0.875rem'
                }}>
                        {permission.action}
                      </span>
                    </td>
                    <td style={{
                padding: '0.5rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }}>
                      {permission.resource}
                    </td>
                    <td style={{
                padding: '0.5rem',
                textAlign: 'center'
              }}>
                      {permission.minLevel || 0}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>)}
      </div>;
  }
}`,...c.parameters?.docs?.source},description:{story:"Permissions Browser - shows all permissions from all packages",...c.parameters?.docs?.description}}};const f=["PackageBrowser","ComponentsBrowser","PermissionsBrowser"];export{l as ComponentsBrowser,o as PackageBrowser,c as PermissionsBrowser,f as __namedExportsOrder,h as default};
