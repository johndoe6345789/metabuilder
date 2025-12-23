import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { List, X, User, ShieldCheck, Eye, EyeSlash, Warning, Copy, Check } from '@phosphor-icons/react'
import { Database } from '@/lib/database'
import { getScrambledPassword } from '@/lib/auth'

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
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent" />
              <span className="font-bold text-xl">MetaBuilder</span>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </a>
              <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
              <Button variant="outline" size="sm" onClick={() => onNavigate(2)}>
                <User className="mr-2" size={16} />
                Sign In
              </Button>
              <Button size="sm" onClick={() => onNavigate(4)}>
                <ShieldCheck className="mr-2" size={16} />
                Admin
              </Button>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-3 space-y-3">
              <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
                Features
              </a>
              <a href="#about" className="block text-sm text-muted-foreground hover:text-foreground">
                About
              </a>
              <a href="#contact" className="block text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate(2)}>
                <User className="mr-2" size={16} />
                Sign In
              </Button>
              <Button size="sm" className="w-full" onClick={() => onNavigate(4)}>
                <ShieldCheck className="mr-2" size={16} />
                Admin
              </Button>
            </div>
          </div>
        )}
      </nav>

      {(showGodCredentials || showSuperGodCredentials) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
          {showSuperGodCredentials && (
            <Alert className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/50">
              <Warning className="h-5 w-5 text-amber-500" />
              <AlertDescription className="ml-2">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-base text-foreground">
                        Super God Credentials (Level 5)
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Username:</span>
                          <code className="px-2 py-0.5 bg-background/50 rounded font-mono font-semibold">supergod</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Password:</span>
                          <code className="px-2 py-0.5 bg-background/50 rounded font-mono font-semibold text-xs break-all">
                            {showSuperGodPassword ? getScrambledPassword('supergod') : '••••••••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => setShowSuperGodPassword(!showSuperGodPassword)}
                          >
                            {showSuperGodPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs shrink-0"
                            onClick={handleCopySuperGodPassword}
                          >
                            {copiedSuper ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                            {copiedSuper ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-2">
                        ⚠️ Supreme Administrator - Multi-tenant control. Login and change password IMMEDIATELY!
                      </p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {showGodCredentials && (
            <Alert className="bg-gradient-to-br from-purple-500/10 to-orange-500/10 border-2 border-purple-500/50">
              <Warning className="h-5 w-5 text-orange-500" />
              <AlertDescription className="ml-2">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-base text-foreground">
                        God-Tier Admin Credentials (Level 4)
                      </p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Username:</span>
                          <code className="px-2 py-0.5 bg-background/50 rounded font-mono font-semibold">god</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Password:</span>
                          <code className="px-2 py-0.5 bg-background/50 rounded font-mono font-semibold text-xs break-all">
                            {showPassword ? getScrambledPassword('god') : '••••••••••••••••'}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 shrink-0"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-xs shrink-0"
                            onClick={handleCopyPassword}
                          >
                            {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                            {copied ? 'Copied!' : 'Copy'}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-2">
                        ⚠️ Login and change your password IMMEDIATELY! These credentials will disappear in {timeRemaining}.
                      </p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Build Anything, Visually
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A 5-level meta-architecture for creating entire applications through visual workflows, 
            schema editors, and embedded scripting. No code required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" onClick={() => onNavigate(2)}>
              Get Started
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Five Levels of Power</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                1
              </div>
              <CardTitle>Public Website</CardTitle>
              <CardDescription>
                Beautiful landing pages with responsive design and hamburger menus
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Perfect for marketing sites, portfolios, and public-facing content
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                2
              </div>
              <CardTitle>User Area</CardTitle>
              <CardDescription>
                Authenticated dashboards with profiles and comment systems
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              User registration, profile management, and interactive features
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                3
              </div>
              <CardTitle>Admin Panel</CardTitle>
              <CardDescription>
                Django-style data management with CRUD operations and filters
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Complete control over data models with list views and inline editing
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                4
              </div>
              <CardTitle>God-Tier Builder</CardTitle>
              <CardDescription>
                Meta-builder with workflows, schemas, and Lua scripting
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Design and generate entire applications procedurally
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-amber-500 transition-colors bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/20 dark:to-yellow-950/20">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-white font-bold text-xl mb-4">
                5
              </div>
              <CardTitle className="flex items-center gap-2">
                Super God Panel
                <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-full font-normal">NEW</span>
              </CardTitle>
              <CardDescription>
                Multi-tenant control with power transfer and homepage management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Supreme administrator access for multi-tenant architecture
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="about" className="bg-muted/30 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
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

      <section id="contact" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
            <CardDescription>Have questions? We'd love to hear from you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={4}
                placeholder="Your message..."
              />
            </div>
            <Button className="w-full">Send Message</Button>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border bg-muted/30 py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>© 2024 MetaBuilder. Built with the power of visual workflows and declarative schemas.</p>
        </div>
      </footer>
    </div>
  )
}
