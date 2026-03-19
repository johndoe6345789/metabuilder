/**
 * Sidebar Navigation Component
 *
 * Mirrors the Qt6 App.qml sidebar structure:
 * - Static core nav items filtered by auth level
 * - Dynamic package nav items from package metadata
 * - Bottom-pinned settings item
 *
 * Data-driven: items come from sidebar-config.json
 */
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Avatar,
  Chip,
  Badge,
} from '@/fakemui'
import {
  getSidebarItems,
  getBottomSidebarItems,
  getLevelLabel,
  getLevelColor,
} from '@/lib/packages/navigation'
import type { PackageNavItem } from '@/lib/packages/navigation'

const SIDEBAR_WIDTH = 240

/** Map icon IDs to single-character fallbacks for the avatar */
const iconMap: Record<string, string> = {
  dashboard: 'D',
  person: 'P',
  chat: 'C',
  admin: 'A',
  build: 'G',
  crown: 'S',
  settings: 'S',
  package: 'K',
  analytics: 'A',
  forum: 'F',
  gallery: 'G',
  blog: 'B',
  guestbook: 'G',
  music: 'M',
  marketplace: 'M',
}

function getIconChar(icon: string): string {
  return iconMap[icon] ?? icon.charAt(0).toUpperCase()
}

export interface SidebarProps {
  userLevel: number
  username: string
  role: string
  packages?: PackageNavItem[]
  open?: boolean
  onClose?: () => void
}

export function Sidebar({
  userLevel,
  username,
  role,
  packages = [],
  open = true,
  onClose,
}: SidebarProps) {
  const pathname = usePathname()

  const staticItems = getSidebarItems(userLevel)
  const bottomItems = getBottomSidebarItems(userLevel)

  const navigablePackages = packages.filter(
    pkg => pkg.showInNav && pkg.level <= userLevel
  )

  const levelLabel = getLevelLabel(userLevel)
  const levelColor = getLevelColor(userLevel)

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width: open ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          position: 'relative',
          height: '100%',
          borderRight: '1px solid var(--border-color, #e0e0e0)',
          backgroundColor: 'var(--surface-color, #fafafa)',
        },
      }}
    >
      {/* User info header */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color, #e0e0e0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: levelColor, fontSize: '0.875rem' }}>
            {username.charAt(0).toUpperCase()}
          </Avatar>
          <div style={{ overflow: 'hidden' }}>
            <Typography variant="subtitle2" noWrap>{username}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{role}</Typography>
          </div>
        </div>
        <Chip
          label={`Level ${userLevel} - ${levelLabel}`}
          size="small"
          sx={{
            backgroundColor: levelColor,
            color: '#fff',
            fontSize: '0.7rem',
            height: '22px',
          }}
        />
      </div>

      {/* Navigation label */}
      <div style={{ padding: '12px 16px 4px' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
          Navigation
        </Typography>
      </div>

      {/* Static core nav items */}
      <List dense sx={{ flex: 1, overflow: 'auto', py: 0 }}>
        {staticItems.map(item => {
          const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                component={Link}
                href={item.path}
                selected={isActive}
                sx={{
                  py: 0.75,
                  px: 2,
                  borderRadius: '6px',
                  mx: 1,
                  my: 0.25,
                  '&.Mui-selected': {
                    backgroundColor: 'var(--primary-light, #e3f2fd)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      fontSize: '0.75rem',
                      bgcolor: isActive ? levelColor : 'var(--surface-variant, #e0e0e0)',
                      color: isActive ? '#fff' : 'var(--text-secondary, #666)',
                    }}
                  >
                    {getIconChar(item.icon)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    variant: 'body2',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}

        {/* Dynamic package nav items */}
        {navigablePackages.length > 0 && (
          <>
            <Divider sx={{ my: 1, mx: 2 }} />
            <div style={{ padding: '4px 16px' }}>
              <Typography variant="overline" color="text.secondary" sx={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
                Packages
              </Typography>
            </div>
            {navigablePackages.map(pkg => {
              const pkgPath = `/app/packages/${pkg.packageId}`
              const isActive = pathname === pkgPath || pathname.startsWith(pkgPath + '/')
              return (
                <ListItem key={pkg.packageId} disablePadding>
                  <ListItemButton
                    component={Link}
                    href={pkgPath}
                    selected={isActive}
                    sx={{
                      py: 0.75,
                      px: 2,
                      borderRadius: '6px',
                      mx: 1,
                      my: 0.25,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                        {pkg.icon.charAt(0)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={pkg.navLabel}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                    <Badge
                      badgeContent={`L${pkg.level}`}
                      color="default"
                      sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', right: -4 } }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </>
        )}
      </List>

      {/* Bottom items (settings, etc.) */}
      <div>
        <Divider />
        <List dense sx={{ py: 0.5 }}>
          {bottomItems.map(item => {
            const isActive = pathname === item.path
            return (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.path}
                  selected={isActive}
                  sx={{ py: 0.75, px: 2, mx: 1, borderRadius: '6px' }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                      {getIconChar(item.icon)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </div>
    </Drawer>
  )
}
