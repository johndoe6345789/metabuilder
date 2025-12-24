interface AppFooterProps {
  text?: string
  className?: string
}

export function AppFooter({
  text = '© 2024 MetaBuilder. Built with the power of visual workflows and declarative schemas.',
  className = '',
}: AppFooterProps) {
  return (
    <footer className={`border-t border-border bg-muted/30 py-8 mt-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
        <p>{text}</p>
      </div>
    </footer>
  )
}
