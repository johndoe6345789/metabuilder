local M = {}

function M.standard(props)
  return {
    type = "Box",
    props = { className = "min-h-screen bg-background" },
    children = {
      props.header and { type = "AppHeader", props = props.header } or nil,
      {
        type = "Container",
        props = { className = "max-w-7xl mx-auto px-4 py-8 space-y-8" },
        children = props.children or {}
      },
      props.footer and { type = "AppFooter", props = props.footer } or nil
    }
  }
end

function M.with_sidebar(props)
  return {
    type = "Flex",
    props = { className = "min-h-screen" },
    children = {
      { type = "Sidebar", props = props.sidebar },
      {
        type = "Box",
        props = { className = "flex-1" },
        children = {
          props.header and { type = "AppHeader", props = props.header } or nil,
          {
            type = "Box",
            props = { className = "p-8 space-y-8" },
            children = props.children or {}
          }
        }
      }
    }
  }
end

return M
