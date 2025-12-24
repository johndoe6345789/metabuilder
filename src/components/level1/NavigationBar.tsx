import { Button } from '@/components/ui/button'
import { List, X, User, ShieldCheck } from '@phosphor-icons/react'

interface NavigationBarProps {
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  onNavigate: (level: number) => void
}

export function NavigationBar({ menuOpen, setMenuOpen, onNavigate }: NavigationBarProps) {
  return (
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
  )
}
