import { Button, Separator } from '@/components/ui'
import { GoogleLogo, GithubLogo, IconProps } from '@phosphor-icons/react'

export interface Provider {
  name: string
  description?: string
  icon?: React.ComponentType<IconProps>
}

export interface ProviderListProps {
  providers: Provider[]
  onSelect?: (provider: Provider) => void
}

const FALLBACK_PROVIDERS: Provider[] = [
  { name: 'Google', description: 'Use your Google Workspace account', icon: GoogleLogo },
  { name: 'GitHub', description: 'Developer SSO via GitHub', icon: GithubLogo },
]

export function ProviderList({ providers, onSelect }: ProviderListProps) {
  const entries = providers.length > 0 ? providers : FALLBACK_PROVIDERS

  return (
    <div className="space-y-3">
      <Separator />
      <p className="text-xs text-muted-foreground text-center">Or continue with</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entries.map((provider) => {
          const Icon = provider.icon
          return (
            <Button
              key={provider.name}
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => onSelect?.(provider)}
            >
              {Icon ? <Icon size={18} /> : null}
              <span className="text-sm font-medium">{provider.name}</span>
              {provider.description ? (
                <span className="text-xs text-muted-foreground block leading-tight text-left">
                  {provider.description}
                </span>
              ) : null}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
