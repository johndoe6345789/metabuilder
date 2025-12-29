import SearchIcon from '@mui/icons-material/Search'
import { Box, Card, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'

import { getComponentIcon } from '@/components/get-component-icon'
import type { ComponentDefinition } from '@/lib/builder-types'
import { componentCatalog } from '@/lib/component-catalog'

interface ComponentCatalogProps {
  onDragStart: (component: ComponentDefinition) => void
}

export function ComponentCatalog({ onDragStart }: ComponentCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredComponents = componentCatalog.filter(
    comp =>
      comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = Array.from(new Set(componentCatalog.map(c => c.category)))

  return (
    <Box
      sx={{
        width: theme => theme.custom.sidebar.width,
        bgcolor: 'background.paper',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
        height: '100vh',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          Components
        </Typography>
        <TextField
          placeholder="Search components..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <Stack spacing={3}>
          {categories.map(category => {
            const categoryComponents = filteredComponents.filter(c => c.category === category)
            if (categoryComponents.length === 0) return null

            return (
              <Box key={category}>
                <Typography
                  variant="overline"
                  sx={{
                    display: 'block',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    color: 'text.secondary',
                    mb: 1.5,
                  }}
                >
                  {category}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 1.5,
                  }}
                >
                  {categoryComponents.map(component => (
                    <Card
                      key={component.type}
                      draggable
                      onDragStart={() => onDragStart(component)}
                      sx={{
                        p: 1.5,
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        transition:
                          'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 3,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack spacing={1} alignItems="center" textAlign="center">
                        <Box
                          sx={{
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {getComponentIcon(component.icon, { sx: { fontSize: 20 } })}
                        </Box>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {component.label}
                        </Typography>
                      </Stack>
                    </Card>
                  ))}
                </Box>
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
