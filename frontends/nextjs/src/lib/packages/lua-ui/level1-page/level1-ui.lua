local M = {}

function M.render()
  return {
    type = "Box",
    props = {
      className = "min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5"
    },
    children = {
      -- Navigation Bar
      {
        type = "NavigationBar",
        props = {
          level = 1,
          onNavigate = "handleNavigate"
        }
      },

      -- Main Content
      {
        type = "Container",
        props = {
          maxWidth = "lg",
          className = "px-4 sm:px-6 lg:px-8 pt-6 space-y-6"
        },
        children = {
          -- Credentials Section
          {
            type = "Card",
            props = {},
            children = {
              {
                type = "CardHeader",
                props = {},
                children = {
                  {
                    type = "CardTitle",
                    props = { text = "Server Status" }
                  }
                }
              },
              {
                type = "CardContent",
                props = {},
                children = {
                  {
                    type = "Typography",
                    props = {
                      variant = "body1",
                      text = "MetaBuilder Development Server"
                    }
                  },
                  {
                    type = "Typography",
                    props = {
                      variant = "body2",
                      color = "textSecondary",
                      text = "Status: Active"
                    }
                  }
                }
              }
            }
          },

          -- Level Tabs
          {
            type = "Tabs",
            props = { defaultValue = "overview" },
            children = {
              {
                type = "TabsList",
                props = {},
                children = {
                  {
                    type = "TabsTrigger",
                    props = { value = "overview", text = "Overview" }
                  },
                  {
                    type = "TabsTrigger",
                    props = { value = "features", text = "Features" }
                  },
                  {
                    type = "TabsTrigger",
                    props = { value = "docs", text = "Documentation" }
                  }
                }
              },
              {
                type = "TabsContent",
                props = { value = "overview" },
                children = {
                  {
                    type = "Stack",
                    props = { spacing = 2 },
                    children = {
                      {
                        type = "Typography",
                        props = {
                          variant = "h5",
                          text = "Welcome to MetaBuilder"
                        }
                      },
                      {
                        type = "Typography",
                        props = {
                          variant = "body1",
                          text = "MetaBuilder is a powerful data-driven platform with multi-level navigation."
                        }
                      },
                      {
                        type = "Button",
                        props = {
                          variant = "contained",
                          text = "Explore Level 2",
                          onClick = "navigateToLevel2"
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },

      -- Footer
      {
        type = "AppFooter",
        props = {}
      }
    }
  }
end

return M
