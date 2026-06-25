import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignOut, MagnifyingGlass, Plus, PencilSimple, Trash, Users, ChatCircle, House } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { Database } from '@/lib/database'
import type { User as UserType, Comment } from '@/lib/level-types'
import type { ModelSchema } from '@/lib/schema-types'

interface Level3Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function Level3({ user, onLogout, onNavigate }: Level3Props) {
  const [users, setUsers] = useState<UserType[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedModel, setSelectedModel] = useState<'users' | 'comments'>('users')
  const [editingItem, setEditingItem] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const loadedUsers = await Database.getUsers()
      setUsers(loadedUsers)
      const loadedComments = await Database.getComments()
      setComments(loadedComments)
    }
    loadData()
  }, [])

  const allUsers = users
  const allComments = comments

  const filteredUsers = allUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredComments = allComments.filter(c =>
    c.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteUser = async (userId: string) => {
    if (userId === user.id) {
      toast.error("You cannot delete your own account")
      return
    }
    await Database.deleteUser(userId)
    setUsers((current) => current.filter(u => u.id !== userId))
    toast.success('User deleted')
  }

  const handleDeleteComment = async (commentId: string) => {
    await Database.deleteComment(commentId)
    setComments((current) => current.filter(c => c.id !== commentId))
    toast.success('Comment deleted')
  }

  const handleEditUser = (editUser: UserType) => {
    setEditingItem(editUser)
    setDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!editingItem) return
    
    await Database.updateUser(editingItem.id, editingItem)
    setUsers((current) =>
      current.map(u => u.id === editingItem.id ? editingItem : u)
    )
    setDialogOpen(false)
    setEditingItem(null)
    toast.success('User updated')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-sidebar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600" />
                <span className="font-bold text-xl text-sidebar-foreground">Admin Panel</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate(1)} className="text-sidebar-foreground">
                <House className="mr-2" size={16} />
                Home
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">{user.username}</Badge>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-sidebar-foreground">
                <SignOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">Manage all application data and users</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allUsers.length}</div>
              <p className="text-xs text-muted-foreground">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <ChatCircle className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allComments.length}</div>
              <p className="text-xs text-muted-foreground">Posted by users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Users className="text-muted-foreground" size={20} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allUsers.filter(u => u.role === 'admin' || u.role === 'god').length}
              </div>
              <p className="text-xs text-muted-foreground">Admin & god users</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Models</CardTitle>
                <CardDescription>Browse and manage data models</CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedModel} onValueChange={(v) => setSelectedModel(v as any)}>
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="users">
                  <Users className="mr-2" size={16} />
                  Users ({allUsers.length})
                </TabsTrigger>
                <TabsTrigger value="comments">
                  <ChatCircle className="mr-2" size={16} />
                  Comments ({allComments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.username}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant={u.role === 'god' ? 'default' : u.role === 'admin' ? 'secondary' : 'outline'}>
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditUser(u)}
                              >
                                <PencilSimple size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.id === user.id}
                              >
                                <Trash size={16} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No comments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredComments.map((c) => {
                        const commentUser = allUsers.find(u => u.id === c.userId)
                        return (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">
                              {commentUser?.username || 'Unknown'}
                            </TableCell>
                            <TableCell className="max-w-md truncate">{c.content}</TableCell>
                            <TableCell>{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(c.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <Input
                  value={editingItem.username}
                  onChange={(e) => setEditingItem({ ...editingItem, username: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={editingItem.email}
                  onChange={(e) => setEditingItem({ ...editingItem, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Bio</label>
                <Input
                  value={editingItem.bio || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, bio: e.target.value })}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveUser}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
