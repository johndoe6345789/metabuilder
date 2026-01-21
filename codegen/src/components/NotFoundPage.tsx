import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { 
  House, 
  ArrowLeft, 
  MagnifyingGlass, 
  Compass,
  Code,
  Cube,
  Lightning,
  ChartBar
} from '@phosphor-icons/react'
import {
  EmptyState,
  ActionButton,
  Stack,
  Heading,
  Text,
  Kbd,
  IconWrapper,
  GlowCard,
  ResponsiveGrid,
  Container
} from '@/components/atoms'

export function NotFoundPage() {
  const navigate = useNavigate()

  const quickLinks = [
    { label: 'Dashboard', icon: ChartBar, path: '/dashboard', description: 'Project overview and stats' },
    { label: 'Code Editor', icon: Code, path: '/code', description: 'Edit your source files' },
    { label: 'Components', icon: Lightning, path: '/components', description: 'UI component library' },
    { label: 'Models', icon: Cube, path: '/models', description: 'Data models and schemas' },
  ]

  return (
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <Container size="lg">
        <Stack direction="vertical" spacing="xl" className="items-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 backdrop-blur-sm mb-4">
              <Compass className="text-primary" size={64} weight="duotone" />
            </div>
            
            <Heading level={1} className="text-6xl">404</Heading>
            <Heading level={2}>Page Not Found</Heading>
            <Text variant="muted" className="max-w-md mx-auto">
              The page you're looking for doesn't exist or may have been moved.
            </Text>
          </div>

          <Stack direction="horizontal" spacing="md" className="flex-wrap justify-center">
            <ActionButton
              icon={<ArrowLeft size={20} />}
              label="Go Back"
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
            />
            
            <ActionButton
              icon={<House size={20} />}
              label="Home"
              onClick={() => navigate('/')}
              variant="default"
              size="lg"
            />
            
            <ActionButton
              icon={<MagnifyingGlass size={20} />}
              label="Search"
              onClick={() => {
                const searchBtn = document.querySelector('[data-search-trigger]') as HTMLElement
                searchBtn?.click()
              }}
              variant="outline"
              size="lg"
            />
          </Stack>

          <Stack direction="vertical" spacing="md" className="w-full">
            <Text variant="muted" className="text-center font-medium">
              Quick Links
            </Text>
            <ResponsiveGrid columns={4} gap="md">
              {quickLinks.map((link) => {
                const Icon = link.icon
                return (
                  <GlowCard
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="cursor-pointer"
                  >
                    <Stack direction="vertical" spacing="md" className="items-center text-center">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="text-primary" size={24} weight="duotone" />
                      </div>
                      <Stack direction="vertical" spacing="xs">
                        <Heading level={4}>{link.label}</Heading>
                        <Text variant="muted" className="text-xs">
                          {link.description}
                        </Text>
                      </Stack>
                    </Stack>
                  </GlowCard>
                )
              })}
            </ResponsiveGrid>
          </Stack>

          <div className="text-center">
            <Text variant="caption">
              Need help? Check the keyboard shortcuts with{' '}
              <Kbd>Ctrl</Kbd>
              {' + '}
              <Kbd>/</Kbd>
            </Text>
          </div>
        </Stack>
      </Container>
    </div>
  )
}
