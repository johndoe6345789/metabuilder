interface DataBindingHeaderProps {
  title: string
  description: string
}

export function DataBindingHeader({ title, description }: DataBindingHeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
