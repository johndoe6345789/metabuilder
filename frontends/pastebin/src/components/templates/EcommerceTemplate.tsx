import { Card, Button, Input, Chip, Avatar, Divider, MaterialIcon } from '@metabuilder/components/fakemui'
import styles from './EcommerceTemplate.module.scss'

export function EcommerceTemplate() {
  return (
    <Card style={{ overflow: 'hidden' }} data-testid="ecommerce-template" role="main" aria-label="Ecommerce template">
      <div style={{ borderBottom: '1px solid var(--mat-sys-outline-variant)', backgroundColor: 'var(--mat-sys-surface-container)', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', lineHeight: '1.75rem', fontWeight: 700 }}>Store</h3>
            <div className={styles.searchBar}>
              <MaterialIcon name="search" className={styles.searchIcon} />
              <Input placeholder="Search products..." className={styles.searchInputWithIcon} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="ghost">
              <MaterialIcon name="shopping_cart" />
            </Button>
            <Avatar style={{ width: '32px', height: '32px' }} alt="User">U</Avatar>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px' }}>
        <div className={styles.productGrid}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ aspectRatio: '1 / 1', borderRadius: '12px', background: 'linear-gradient(to bottom right, var(--mat-sys-primary), var(--mat-sys-secondary-container))' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  style={{ aspectRatio: '1 / 1', borderRadius: '12px', background: 'linear-gradient(to bottom right, color-mix(in srgb, var(--mat-sys-primary) 50%, transparent), color-mix(in srgb, var(--mat-sys-secondary-container) 50%, transparent))' }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <Chip style={{ marginBottom: '12px' }}>New Arrival</Chip>
              <h1 style={{ fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>Premium Product Name</h1>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <span style={{ fontSize: '1.875rem', lineHeight: '2.25rem', fontWeight: 700 }}>$299.00</span>
                <span style={{ fontSize: '1.125rem', lineHeight: '1.75rem', color: 'var(--mat-sys-on-surface-variant)', textDecoration: 'line-through' }}>
                  $399.00
                </span>
              </div>
            </div>

            <Divider />

            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Description</h3>
              <p style={{ color: 'var(--mat-sys-on-surface-variant)' }}>
                Experience premium quality with this exceptional product. Crafted with
                attention to detail and designed for those who demand excellence.
              </p>
            </div>

            <div>
              <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>Features</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--mat-sys-on-surface-variant)' }}>
                <li>• Premium materials and construction</li>
                <li>• Industry-leading performance</li>
                <li>• 2-year warranty included</li>
                <li>• Free shipping on orders over $50</li>
              </ul>
            </div>

            <Divider />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Button size="lg" style={{ width: '100%' }}>
                <MaterialIcon name="shopping_cart" style={{ marginRight: '8px' }} />
                Add to Cart
              </Button>
              <Button size="lg" variant="outlined" style={{ width: '100%' }}>
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
