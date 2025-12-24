import { useState, useEffect } from 'react'
import { Database } from '@/lib/database'
import { getScrambledPassword } from '@/lib/auth'
import { NavigationBar } from './level1/NavigationBar'
import { GodCredentialsBanner } from './level1/GodCredentialsBanner'
import { HeroSection } from './level1/HeroSection'
import { FeaturesSection } from './level1/FeaturesSection'
import { ContactSection } from './level1/ContactSection'
import { AppFooter } from './shared/AppFooter'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitHubActionsFetcher } from './GitHubActionsFetcher'

interface Level1Props {
  onNavigate: (level: number) => void
}

export function Level1({ onNavigate }: Level1Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [showGodCredentials, setShowGodCredentials] = useState(false)
  const [showSuperGodCredentials, setShowSuperGodCredentials] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showSuperGodPassword, setShowSuperGodPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedSuper, setCopiedSuper] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState('')

  useEffect(() => {
    const checkCredentials = async () => {
      const shouldShow = await Database.shouldShowGodCredentials()
      setShowGodCredentials(shouldShow)
      
      const superGod = await Database.getSuperGod()
      const firstLoginFlags = await Database.getFirstLoginFlags()
      setShowSuperGodCredentials(superGod !== null && firstLoginFlags['supergod'] === true)
      
      if (shouldShow) {
        const expiry = await Database.getGodCredentialsExpiry()
        const updateTimer = () => {
          const now = Date.now()
          const diff = expiry - now
          
          if (diff <= 0) {
            setShowGodCredentials(false)
            setTimeRemaining('')
          } else {
            const minutes = Math.floor(diff / 60000)
            const seconds = Math.floor((diff % 60000) / 1000)
            setTimeRemaining(`${minutes}m ${seconds}s`)
          }
        }
        
        updateTimer()
        const interval = setInterval(updateTimer, 1000)
        return () => clearInterval(interval)
      }
    }
    
    checkCredentials()
  }, [])

  const handleCopyPassword = async () => {
    await navigator.clipboard.writeText(getScrambledPassword('god'))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopySuperGodPassword = async () => {
    await navigator.clipboard.writeText(getScrambledPassword('supergod'))
    setCopiedSuper(true)
    setTimeout(() => setCopiedSuper(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <NavigationBar menuOpen={menuOpen} setMenuOpen={setMenuOpen} onNavigate={onNavigate} />

      {(showGodCredentials || showSuperGodCredentials) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
          {showSuperGodCredentials && (
            <GodCredentialsBanner
              username="supergod"
              password={getScrambledPassword('supergod')}
              showPassword={showSuperGodPassword}
              onTogglePassword={() => setShowSuperGodPassword(!showSuperGodPassword)}
              copied={copiedSuper}
              onCopy={handleCopySuperGodPassword}
              timeRemaining=""
              variant="supergod"
            />
          )}
          
          {showGodCredentials && (
            <GodCredentialsBanner
              username="god"
              password={getScrambledPassword('god')}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              copied={copied}
              onCopy={handleCopyPassword}
              timeRemaining={timeRemaining}
              variant="god"
            />
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="github-actions">GitHub Actions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="mt-0">
            <HeroSection onNavigate={onNavigate} />
            <FeaturesSection />

            <section id="about" className="bg-muted/30 py-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-3xl font-bold">About MetaBuilder</h2>
                <p className="text-lg text-muted-foreground">
                  MetaBuilder is a revolutionary platform that lets you build entire application stacks 
                  through visual interfaces. From public websites to complex admin panels, everything 
                  is generated from declarative configurations, workflows, and embedded scripts.
                </p>
                <p className="text-lg text-muted-foreground">
                  Whether you're a designer who wants to create without code, or a developer who wants 
                  to work at a higher level of abstraction, MetaBuilder adapts to your needs.
                </p>
              </div>
            </section>

            <ContactSection />
          </TabsContent>
          
          <TabsContent value="github-actions" className="mt-0">
            <GitHubActionsFetcher />
          </TabsContent>
        </Tabs>
      </div>

      <AppFooter />
    </div>
  )
}
