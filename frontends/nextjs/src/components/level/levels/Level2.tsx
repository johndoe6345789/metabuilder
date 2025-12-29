'use client'

import { ChatCircle, User } from '@phosphor-icons/react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import type { User as UserType } from '@/lib/level-types'

import { AppHeader } from '../../shared/AppHeader'
import { ChatTabContent } from '../level2/ChatTabContent'
import { CommentsTabContent } from '../level2/CommentsTabContent'
import { ProfileTabContent } from '../level2/ProfileTabContent'
import { IntroSection } from '../sections/IntroSection'
import { useLevel2State } from './hooks/useLevel2State'

export interface Level2Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function Level2({ user, onLogout, onNavigate }: Level2Props) {
  const {
    comments,
    currentUser,
    editingProfile,
    newComment,
    profileForm,
    users,
    setEditingProfile,
    setNewComment,
    setProfileForm,
    handleDeleteComment,
    handlePostComment,
    handleProfileSave,
    handleRequestPasswordReset,
  } = useLevel2State(user as User)

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        username={currentUser.username}
        showAvatar={true}
        onNavigateHome={() => onNavigate(1)}
        onLogout={onLogout}
        variant="user"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <IntroSection
          eyebrow="Level 2"
          title="User Dashboard"
          description="Manage your profile, collaborate with the community, and explore live chat."
        />

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="profile">
              <User className="mr-2" size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="comments">
              <ChatCircle className="mr-2" size={16} />
              Comments
            </TabsTrigger>
            <TabsTrigger value="chat">
              <ChatCircle className="mr-2" size={16} />
              Webchat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <ProfileTabContent
              user={currentUser}
              editingProfile={editingProfile}
              profileForm={profileForm}
              onEdit={() => setEditingProfile(true)}
              onCancel={() => setEditingProfile(false)}
              onSave={handleProfileSave}
              onFormChange={setProfileForm}
              onRequestPasswordReset={handleRequestPasswordReset}
            />
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <CommentsTabContent
              comments={comments}
              users={users}
              currentUserId={user.id}
              newComment={newComment}
              onChangeComment={setNewComment}
              onPostComment={handlePostComment}
              onDeleteComment={handleDeleteComment}
            />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <ChatTabContent user={currentUser} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
