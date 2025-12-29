import type { ReactNode } from 'react'

interface IntroSectionProps {
  title: string
  description?: ReactNode
  eyebrow?: string
  actions?: ReactNode
  children?: ReactNode
  id?: string
}

export function IntroSection({
  title,
  description,
  eyebrow,
  actions,
  children,
  id,
}: IntroSectionProps) {
  return (
    <section id={id} className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          {eyebrow && <p className="text-sm font-medium text-muted-foreground">{eyebrow}</p>}
          <h1 className="text-3xl font-bold leading-tight tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-lg max-w-3xl">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
      {children && <div className="space-y-4">{children}</div>}
    </section>
  )
}
