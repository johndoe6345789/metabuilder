import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Level1 } from '@/components/Level1'
import { Level2 } from '@/components/Level2'
import { Level3 } from '@/components/Level3'
import { Level4 } from '@/components/Level4'
import { toast } from 'sonner'
import { canAccessLevel } from '@/lib/auth'
import { Database, hashPassword } from '@/lib/database'
import { seedDatabase } from '@/lib/seed-data'
import type { User, AppLevel } from '@/lib/level-types'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentLevel, setCurrentLevel] = useState<AppLevel>(1)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const initDatabase = async () => {
      await Database.initializeDatabase()
      await seedDatabase()
      const loadedUsers = await Database.getUsers()
      setUsers(loadedUsers)
      setIsInitialized(true)
    }
    initDatabase()
  }, [])

  if (!isInitialized) return null

  const handleLogin = async (credentials: { username: string; password: string }) => {
    const { username, password } = credentials

    const isValid = await Database.verifyCredentials(username, password)
    if (!isValid) {
      toast.error('Invalid credentials')
      return
    }

    const user = users.find(u => u.username === username)
    if (!user) {
      toast.error('User not found')
      return
    }

    setCurrentUser(user)
    
    if (user.role === 'god') {
      setCurrentLevel(4)
    } else if (user.role === 'admin') {
      setCurrentLevel(3)
    } else {
      setCurrentLevel(2)
    }
    
    toast.success(`Welcome, ${user.username}!`)
  }

  const handleRegister = async (username: string, email: string, password: string) => {
    if (users.some(u => u.username === username)) {
      toast.error('Username already exists')
      return
    }

    if (users.some(u => u.email === email)) {
      toast.error('Email already registered')
      return
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      email,
      role: 'user',
      createdAt: Date.now(),
    }

    const passwordHash = await hashPassword(password)
    await Database.setCredential(username, passwordHash)
    await Database.addUser(newUser)
    
    setUsers((current) => [...current, newUser])
    setCurrentUser(newUser)
    setCurrentLevel(2)
    toast.success('Account created successfully!')
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentLevel(1)
    toast.info('Logged out successfully')
  }

  const handleNavigate = (level: AppLevel) => {
    if (currentUser && !canAccessLevel(currentUser.role, level)) {
      toast.error('Access denied. Insufficient permissions.')
      return
    }

    if (level > 1 && !currentUser) {
      toast.info('Please sign in to access this area')
      return
    }

    setCurrentLevel(level)
  }

  const handlePreview = (level: AppLevel) => {
    setCurrentLevel(level)
    toast.info(`Previewing Level ${level}`)
  }

  if (!currentUser) {
    return (
      <>
        <Level1 onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentLevel === 1) {
    return (
      <>
        <Level1 onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentLevel === 2) {
    return (
      <>
        <Level2 user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentLevel === 3 && canAccessLevel(currentUser.role, 3)) {
    return (
      <>
        <Level3 user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
        <Toaster />
      </>
    )
  }

  if (currentLevel === 4 && canAccessLevel(currentUser.role, 4)) {
    return (
      <>
        <Level4 user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} onPreview={handlePreview} />
        <Toaster />
      </>
    )
  }

  return (
    <>
      <Level1 onNavigate={handleNavigate} />
      <Toaster />
    </>
  )
}

export default App
