import { ProfileCard } from '../../level2/ProfileCard'
import type { User } from '@/lib/level-types'

interface ProfileTabContentProps {
  user: User
  editingProfile: boolean
  profileForm: { bio: string; email: string }
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onFormChange: (value: { bio: string; email: string }) => void
  onRequestPasswordReset: () => void
}

export function ProfileTabContent({
  user,
  editingProfile,
  profileForm,
  onEdit,
  onCancel,
  onSave,
  onFormChange,
  onRequestPasswordReset,
}: ProfileTabContentProps) {
  return (
    <ProfileCard
      user={user}
      editingProfile={editingProfile}
      profileForm={profileForm}
      onEdit={onEdit}
      onCancel={onCancel}
      onSave={onSave}
      onFormChange={onFormChange}
      onRequestPasswordReset={onRequestPasswordReset}
    />
  )
}
