import { Envelope } from '@phosphor-icons/react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import type { User } from '@/lib/level-types'

interface ProfileCardProps {
  user: User
  editingProfile: boolean
  profileForm: { bio: string; email: string }
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onFormChange: (form: { bio: string; email: string }) => void
  onRequestPasswordReset: () => void
}

export function ProfileCard({
  user,
  editingProfile,
  profileForm,
  onEdit,
  onCancel,
  onSave,
  onFormChange,
  onRequestPasswordReset,
}: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </div>
          {!editingProfile ? (
            <Button onClick={onEdit}>Edit Profile</Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onSave}>Save Changes</Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-lg">{user.username}</h3>
            <p className="text-sm text-muted-foreground capitalize">{user.role} Account</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Username</Label>
            <Input value={user.username} disabled className="mt-2" />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={editingProfile ? profileForm.email : user.email}
              onChange={e => onFormChange({ ...profileForm, email: e.target.value })}
              disabled={!editingProfile}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea
              value={editingProfile ? profileForm.bio : user.bio || ''}
              onChange={e => onFormChange({ ...profileForm, bio: e.target.value })}
              disabled={!editingProfile}
              className="mt-2"
              rows={4}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <Label>Account Created</Label>
            <Input
              value={new Date(user.createdAt).toLocaleDateString()}
              disabled
              className="mt-2"
            />
          </div>

          <div className="pt-4 border-t border-border">
            <Label className="mb-3 block">Security</Label>
            <Button onClick={onRequestPasswordReset} variant="outline" className="gap-2">
              <Envelope size={16} />
              Request New Password via Email
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              A new randomly generated password will be sent to your email address
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
