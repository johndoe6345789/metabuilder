import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import { Level1 } from '@/components/Level1'
import { Level2 } from '@/components/Level2'
import { Level3 } from '@/components/Level3'
import { Level4 } from '@/components/Level4'
import { Level5 } from '@/components/Level5'
import { PasswordChangeDialog } from '@/components/PasswordChangeDialog'
import { UnifiedLogin } from '@/components/UnifiedLogin'
import { toast } from 'sonner'
import { canAccessLevel } from '@/lib/auth'
import { Database, hashPassword } from '@/lib/database'
import { seedDatabase } from '@/lib/seed-data'
import { initializePackageSystem } from '@/lib/package-loader'
import type { User, AppLevel } from '@/lib/level-types'

function App() {
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentLevel, setCurrentLevel] = useState<AppLevel>(1)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  useEffect(() => {
    const initDatabase = async () => {
      await initializePackageSystem()
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

    const firstLoginFlags = await Database.getFirstLoginFlags()
    const isFirstLoginFlag = firstLoginFlags[username] === true

    setCurrentUser(user)
    
    if (isFirstLoginFlag) {
      setIsFirstLogin(true)
      setShowPasswordChange(true)
    } else {
      if (user.role === 'supergod') {
        setCurrentLevel(5)
      } else if (user.role === 'god') {
        setCurrentLevel(4)
      } else if (user.role === 'admin') {
        setCurrentLevel(3)
      } else {
        setCurrentLevel(2)
      }
      
      toast.success(`Welcome, ${user.username}!`)
    }
  }

  const handlePasswordChange = async (newPassword: string) => {
    if (!currentUser) return

    const passwordHash = await hashPassword(newPassword)
    await Database.setCredential(currentUser.username, passwordHash)
    await Database.setFirstLoginFlag(currentUser.username, false)
    
    setShowPasswordChange(false)
    setIsFirstLogin(false)
    
    if (currentUser.role === 'supergod') {
      setCurrentLevel(5)
    } else if (currentUser.role === 'god') {
      setCurrentLevel(4)
    } else if (currentUser.role === 'admin') {
      setCurrentLevel(3)
    } else {
      setCurrentLevel(2)
    }
    
    toast.success('Password changed successfully!')
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
      setCurrentLevel(level)
      return
    }

    setIsPreviewMode(false)
    setCurrentLevel(level)
  }

  const handlePreview = (level: AppLevel) => {
    setIsPreviewMode(true)
    setCurrentLevel(level)
    toast.info(`Previewing Level ${level}`)
  }

  const handleExitPreview = () => {
    setIsPreviewMode(false)
    if (currentUser?.role === 'supergod') {
      setCurrentLevel(5)
    } else {
      setCurrentLevel(4)
    }
    toast.info('Returning to Builder')
  }

  if (!currentUser) {
    if (currentLevel === 1) {
      return (
        <>
          <Level1 onNavigate={handleNavigate} />
          <Toaster />
        </>
      )
    } else {
      return (
        <>
          <UnifiedLogin 
            onLogin={handleLogin} 
            onRegister={handleRegister}
            onBack={() => setCurrentLevel(1)}
          />
          <Toaster />
        </>
      )
    }
  }

  if (showPasswordChange && currentUser) {
    return (
      <>
        <PasswordChangeDialog
          open={showPasswordChange}
          username={currentUser.username}
          onPasswordChanged={handlePasswordChange}
          isFirstLogin={isFirstLogin}
        />
        <Toaster />
      </>
    )
  }

  if (currentLevel === 1) {
    return (
      <>
        {isPreviewMode && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                <span className="font-semibold">Preview Mode: Level 1</span>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleExitPreview}
              >
                Exit Preview
              </Button>
            </div>
          </div>
        )}
        <div className={isPreviewMode ? 'pt-14' : ''}>
          <Level1 onNavigate={handleNavigate} />
        </div>
        <Toaster />
      </>
    )
  }

  if (currentLevel === 2) {
    return (
      <>
        {isPreviewMode && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                <span className="font-semibold">Preview Mode: Level 2 (User Area)</span>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleExitPreview}
              >
                Exit Preview
              </Button>
            </div>
          </div>
        )}
        <div className={isPreviewMode ? 'pt-14' : ''}>
          <Level2 user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
        </div>
        <Toaster />
      </>
    )
  }

  if (currentLevel === 3 && canAccessLevel(currentUser.role, 3)) {
    return (
      <>
        {isPreviewMode && (
          <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600 to-purple-800 text-white py-3 px-4 shadow-lg">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-yellow-300 animate-pulse" />
                <span className="font-semibold">Preview Mode: Level 3 (Admin Panel)</span>
              </div>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={handleExitPreview}
              >
                Exit Preview
              </Button>
            </div>
          </div>
        )}
        <div className={isPreviewMode ? 'pt-14' : ''}>
          <Level3 user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} />
        </div>
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

  if (currentLevel === 5 && canAccessLevel(currentUser.role, 5)) {
    return (
      <>
        <Level5 user={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} onPreview={handlePreview} />
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
