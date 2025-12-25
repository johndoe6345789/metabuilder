import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ContactSection() {
  return (
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
  )
}
