import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Label } from '@/components/ui'
import type { ReactNode, InputHTMLAttributes } from 'react'

interface DemoCardProps {
  title: string
  description: string
  children: ReactNode
}

export function DemoCard({ title, description, children }: DemoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  )
}

interface LabeledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string
  label: string
}

export function LabeledInput({ id, label, ...inputProps }: LabeledInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...inputProps} />
    </div>
  )
}
