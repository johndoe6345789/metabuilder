import { useState, type ComponentType } from 'react'
import { Box, Card, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import type { SvgIconProps } from '@mui/material'
import CropFreeIcon from '@mui/icons-material/CropFree'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import GridViewIcon from '@mui/icons-material/GridView'
import ViewStreamIcon from '@mui/icons-material/ViewStream'
import CropPortraitIcon from '@mui/icons-material/CropPortrait'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import TextFieldsIcon from '@mui/icons-material/TextFields'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import LocalOfferIcon from '@mui/icons-material/LocalOffer'
import LooksOneIcon from '@mui/icons-material/LooksOne'
import ArticleIcon from '@mui/icons-material/Article'
import VerifiedIcon from '@mui/icons-material/Verified'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import RemoveIcon from '@mui/icons-material/Remove'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AutorenewIcon from '@mui/icons-material/Autorenew'
import TuneIcon from '@mui/icons-material/Tune'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import TableChartIcon from '@mui/icons-material/TableChart'
import ChatIcon from '@mui/icons-material/Chat'
import SearchIcon from '@mui/icons-material/Search'
import { componentCatalog } from '@/lib/component-catalog'
import type { ComponentDefinition } from '@/lib/builder-types'

const iconMap: Record<string, ComponentType<SvgIconProps>> = {
  FrameCorners: CropFreeIcon,
  Columns: ViewColumnIcon,
  GridFour: GridViewIcon,
  Stack: ViewStreamIcon,
  Card: CropPortraitIcon,
  CursorClick: TouchAppIcon,
  TextT: TextFieldsIcon,
  TextAlignLeft: FormatAlignLeftIcon,
  Tag: LocalOfferIcon,
  TextHOne: LooksOneIcon,
  Article: ArticleIcon,
  Seal: VerifiedIcon,
  ToggleRight: ToggleOnIcon,
  CheckSquare: CheckBoxIcon,
  Minus: RemoveIcon,
  Warning: WarningAmberIcon,
  CircleNotch: AutorenewIcon,
  SlidersHorizontal: TuneIcon,
  UserCircle: AccountCircleIcon,
  Table: TableChartIcon,
  Chat: ChatIcon,
}

interface ComponentCatalogProps {
  onDragStart: (component: ComponentDefinition) => void
}

export function ComponentCatalog({ onDragStart }: ComponentCatalogProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredComponents = componentCatalog.filter(comp =>
    comp.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comp.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = Array.from(new Set(componentCatalog.map(c => c.category)))

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName]
    return Icon ? <Icon sx={{ fontSize: 20 }} /> : null
  }

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
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
                  {categoryComponents.map(component => (
                    <Card
                      key={component.type}
                      draggable
                      onDragStart={() => onDragStart(component)}
                      sx={{
                        p: 1.5,
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: 3,
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Stack spacing={1} alignItems="center" textAlign="center">
                        <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getIcon(component.icon)}
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
