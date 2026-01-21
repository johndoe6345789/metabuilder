import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Envelope,
  Lock,
  ArrowRight,
} from '@phosphor-icons/react'

export function FormsShowcase() {
  return (
    <section className="space-y-6" data-testid="forms-showcase" role="region" aria-label="Forms showcase">
      <div>
        <h2 className="text-3xl font-bold mb-2">Forms</h2>
        <p className="text-muted-foreground">
          Complete form layouts with validation and actions
        </p>
      </div>

      <Card className="p-6">
        <form className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Create Account</h3>
            <p className="text-sm text-muted-foreground">
              Fill in your details to get started
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formEmail">Email</Label>
            <div className="relative">
              <Envelope className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input id="formEmail" type="email" placeholder="john@example.com" className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formPassword">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <Input id="formPassword" type="password" placeholder="••••••••" className="pl-10" />
            </div>
            <p className="text-sm text-muted-foreground">
              Must be at least 8 characters
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-4">
            <Button variant="outline" type="button">
              Cancel
            </Button>
            <Button type="submit">
              Create Account
              <ArrowRight className="ml-2" aria-hidden="true" />
            </Button>
          </div>
        </form>
      </Card>
    </section>
  )
}
