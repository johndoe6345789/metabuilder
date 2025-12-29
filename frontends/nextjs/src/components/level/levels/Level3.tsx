'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Users, ChatCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getUsers, deleteUser, updateUser } from '@/lib/db/users'
import { getComments, deleteComment } from '@/lib/db/comments'
import { AppHeader } from '../../shared/AppHeader'
import type { User as UserType, Comment } from '@/lib/level-types'
import type { ModelSchema } from '@/lib/schema-types'
import { IntroSection } from '../sections/IntroSection'
import { Level3Stats } from '../level3/Level3Stats'
import { UserTable } from '../level3/UserTable'
import { CommentsTable } from '../level3/CommentsTable'
import { EditUserDialog } from '../level3/EditUserDialog'

interface Level3Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function Level3({ user, onLogout, onNavigate }: Level3Props) {
  const [users, setUsers] = useState<UserType[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModel, setSelectedModel] = useState<ModelSchema>('users' as ModelSchema)
  const [editingItem, setEditingItem] = useState<UserType | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const loadedUsers = await getUsers({ scope: 'all' })
      setUsers(loadedUsers)
      const loadedComments = await getComments()
      setComments(loadedComments)
    }
    loadData()
  }, [])

  const handleDeleteUser = async (userId: string) => {
    if (userId === user.id) {
      toast.error('You cannot delete your own account')
      return
    }
    await deleteUser(userId)
    setUsers(current => current.filter(u => u.id !== userId))
    toast.success('User deleted')
  }

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId)
    setComments(current => current.filter(c => c.id !== commentId))
    toast.success('Comment deleted')
  }

  const handleEditUser = (editUser: UserType) => {
    setEditingItem(editUser)
    setDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingItem) return

    await updateUser(editingItem.id, editingItem)
    setUsers(current => current.map(u => (u.id === editingItem.id ? editingItem : u)))
    setDialogOpen(false)
    setEditingItem(null)
    toast.success('User updated')
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        title="Admin Panel"
        username={user.username}
        showBadge={true}
        onNavigateHome={() => onNavigate(1)}
        onLogout={onLogout}
        variant="admin"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <IntroSection
          eyebrow="Level 3"
          title="Data Management"
          description="Manage all application data and users from a single dashboard."
        />

        <Level3Stats users={users} comments={comments} />

        <Tabs value={selectedModel} onValueChange={v => setSelectedModel(v as ModelSchema)}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="users">
              <Users className="mr-2" size={16} />
              Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="comments">
              <ChatCircle className="mr-2" size={16} />
              Comments ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserTable
              users={users}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              currentUserId={user.id}
              commentCount={comments.length}
              commentLabel="Comments"
            />
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <CommentsTable
              comments={comments}
              users={users}
              searchTerm={searchTerm}
              onDeleteComment={handleDeleteComment}
            />
          </TabsContent>
        </Tabs>
      </div>

      <EditUserDialog
        open={dialogOpen}
        user={editingItem}
        onClose={setDialogOpen}
        onChange={item => setEditingItem(item)}
        onSave={handleSaveUser}
      />
    </div>
  )
}
