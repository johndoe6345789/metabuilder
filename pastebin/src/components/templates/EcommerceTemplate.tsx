import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  MagnifyingGlass,
  ShoppingCart,
} from '@phosphor-icons/react'

export function EcommerceTemplate() {
  return (
    <Card className="overflow-hidden" data-testid="ecommerce-template" role="main" aria-label="Ecommerce template">
      <div className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h3 className="text-xl font-bold">Store</h3>
            <div className="relative hidden md:block">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-10 w-80" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ShoppingCart />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-lg bg-gradient-to-br from-primary to-accent" />
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gradient-to-br from-primary/50 to-accent/50"
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <Badge className="mb-3">New Arrival</Badge>
              <h1 className="text-4xl font-bold mb-2">Premium Product Name</h1>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">$299.00</span>
                <span className="text-lg text-muted-foreground line-through">
                  $399.00
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground">
                Experience premium quality with this exceptional product. Crafted with
                attention to detail and designed for those who demand excellence.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Features</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Premium materials and construction</li>
                <li>• Industry-leading performance</li>
                <li>• 2-year warranty included</li>
                <li>• Free shipping on orders over $50</li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-4">
              <Button size="lg" className="w-full">
                <ShoppingCart className="mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
