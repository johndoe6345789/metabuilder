'use client'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from '@/components/ui'
import type { UserRole } from '@/lib/level-types'

interface RoleEditorProps {
  role: UserRole
  onRoleChange: (role: UserRole) => void
  isInstanceOwner?: boolean
  onInstanceOwnerChange?: (value: boolean) => void
  allowedRoles?: UserRole[]
}

const ROLE_INFO: Record<UserRole, { blurb: string; highlights: string[] }> = {
  public: {
    blurb: 'Read-only access for guest viewers.',
    highlights: ['View public resources', 'No authentication needed'],
  },
  user: {
    blurb: 'Standard workspace member with personal settings.',
    highlights: ['Create content', 'Access shared libraries'],
  },
  moderator: {
    blurb: 'Content moderator with collaboration tools.',
    highlights: ['Manage comments', 'Resolve reports', 'Escalate to admins'],
  },
  admin: {
    blurb: 'Tenant-level administrator controls.',
    highlights: ['Invite users', 'Configure pages', 'Reset credentials'],
  },
  god: {
    blurb: 'Power user with platform configuration access.',
    highlights: ['Manage integrations', 'Run advanced scripts', 'Override safety flags'],
  },
  supergod: {
    blurb: 'Instance owner with full control.',
    highlights: ['Edit system settings', 'Manage tenants', 'Bypass feature gates'],
  },
}

const roleLabel = (role: UserRole) => role.charAt(0).toUpperCase() + role.slice(1)

export function RoleEditor({
  role,
  onRoleChange,
  isInstanceOwner,
  onInstanceOwnerChange,
  allowedRoles,
}: RoleEditorProps) {
  const options = allowedRoles ?? (Object.keys(ROLE_INFO) as UserRole[])

  return (
    <Card>
      <CardHeader>
        <CardTitle>User role</CardTitle>
        <CardDescription>Adjust access level and ownership flags.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={(value) => onRoleChange(value as UserRole)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {options.map((value) => (
                <SelectItem key={value} value={value}>
                  <div className="flex items-center justify-between gap-3">
                    <span>{roleLabel(value)}</span>
                    <Badge variant={value === 'supergod' || value === 'god' ? 'default' : 'secondary'}>
                      {value === 'public' ? 'Read only' : 'Level access'}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{roleLabel(role)}</p>
              <p className="text-sm text-muted-foreground">{ROLE_INFO[role].blurb}</p>
            </div>
            <Badge variant="outline">{ROLE_INFO[role].highlights.length} capabilities</Badge>
          </div>
          <ul className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            {ROLE_INFO[role].highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {onInstanceOwnerChange && (
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium">Instance owner</p>
              <p className="text-sm text-muted-foreground">
                Grants access to backup, billing, and infrastructure settings.
              </p>
            </div>
            <Switch checked={isInstanceOwner} onCheckedChange={onInstanceOwnerChange} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
