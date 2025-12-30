import { useState } from 'react'

import { getComponentIcon } from '@/components/get-component-icon'
import { Box, Card, Stack, TextField, Typography } from '@/fakemui'
import { Search } from '@/fakemui/icons'
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
    <Box className="component-catalog">
      <Box className="component-catalog__header">
        <Typography variant="h6" className="component-catalog__title">
          Components
        </Typography>
        <div className="component-catalog__search">
          <Search className="component-catalog__search-icon" />
          <TextField
            placeholder="Search components..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </Box>

      <Box className="component-catalog__content">
        <Stack spacing={3}>
          {categories.map(category => {
            const categoryComponents = filteredComponents.filter(c => c.category === category)
            if (categoryComponents.length === 0) return null

            return (
              <Box key={category}>
                <Typography variant="overline" className="component-catalog__category-label">
                  {category}
                </Typography>
                <Box className="component-catalog__grid">
                  {categoryComponents.map(component => (
                    <Card
                      key={component.type}
                      draggable
                      onDragStart={() => onDragStart(component)}
                      className="component-catalog__card"
                    >
                      <Stack spacing={1} alignItems="center" className="text-center">
                        <Box className="component-catalog__icon">
                          {getComponentIcon(component.icon, { className: 'icon-sm' })}
                        </Box>
                        <Typography variant="caption" className="font-semibold">
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
