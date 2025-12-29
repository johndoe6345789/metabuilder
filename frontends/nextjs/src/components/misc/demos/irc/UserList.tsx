interface UserListProps {
  users: string[]
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users online</p>
  }

  return (
    <div className="space-y-1.5 text-sm">
      {users.map(username => (
        <div key={username} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>{username}</span>
        </div>
      ))}
    </div>
  )
}
