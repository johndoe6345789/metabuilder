import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, ChatCircle, SignOut, House, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { User as UserType, Comment } from '@/lib/level-types'

interface Level2Props {
  user: UserType
  onLogout: () => void
  onNavigate: (level: number) => void
}

export function Level2({ user, onLogout, onNavigate }: Level2Props) {
  const [users, setUsers] = useKV<UserType[]>('app_users', [])
  const [comments, setComments] = useKV<Comment[]>('app_comments', [])
  const [newComment, setNewComment] = useState('')
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    bio: user.bio || '',
    email: user.email,
  })

  const currentUser = users?.find(u => u.id === user.id) || user

  const handleProfileSave = () => {
    setUsers((current) => 
      current?.map(u => 
        u.id === user.id 
          ? { ...u, bio: profileForm.bio, email: profileForm.email }
          : u
      ) || []
    )
    setEditingProfile(false)
    toast.success('Profile updated successfully')
  }

  const handlePostComment = () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty')
      return
    }

    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      content: newComment,
      createdAt: Date.now(),
    }

    setComments((current) => [...(current || []), comment])
    setNewComment('')
    toast.success('Comment posted')
  }

  const handleDeleteComment = (commentId: string) => {
    setComments((current) => current?.filter(c => c.id !== commentId) || [])
    toast.success('Comment deleted')
  }

  const userComments = comments?.filter(c => c.userId === user.id) || []
  const allComments = comments || []

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
                <span className="font-bold text-xl">MetaBuilder</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onNavigate(1)}>
                <House className="mr-2" size={16} />
                Home
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {currentUser.username}
              </span>
              <Avatar className="w-8 h-8">
                <AvatarFallback>{currentUser.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <SignOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">User Dashboard</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="profile">
              <User className="mr-2" size={16} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="comments">
              <ChatCircle className="mr-2" size={16} />
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Manage your account details</CardDescription>
                  </div>
                  {!editingProfile ? (
                    <Button onClick={() => setEditingProfile(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleProfileSave}>
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl">
                      {currentUser.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{currentUser.username}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{currentUser.role} Account</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Username</Label>
                    <Input value={currentUser.username} disabled className="mt-2" />
                  </div>

                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingProfile ? profileForm.email : currentUser.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      disabled={!editingProfile}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={editingProfile ? profileForm.bio : (currentUser.bio || '')}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      disabled={!editingProfile}
                      className="mt-2"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <Label>Account Created</Label>
                    <Input
                      value={new Date(currentUser.createdAt).toLocaleDateString()}
                      disabled
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Post a Comment</CardTitle>
                <CardDescription>Share your thoughts with the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write your comment here..."
                  rows={4}
                />
                <Button onClick={handlePostComment}>Post Comment</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Comments ({userComments.length})</CardTitle>
                <CardDescription>Comments you've posted</CardDescription>
              </CardHeader>
              <CardContent>
                {userComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    You haven't posted any comments yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {userComments.map((comment) => (
                      <div key={comment.id} className="border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-sm flex-1">{comment.content}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Comments ({allComments.length})</CardTitle>
                <CardDescription>Community discussion</CardDescription>
              </CardHeader>
              <CardContent>
                {allComments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No comments yet. Be the first to post!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {allComments.map((comment) => {
                      const commentUser = users?.find(u => u.id === comment.userId)
                      return (
                        <div key={comment.id} className="border border-border rounded-lg p-4 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs">
                                {commentUser?.username[0].toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {commentUser?.username || 'Unknown User'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
