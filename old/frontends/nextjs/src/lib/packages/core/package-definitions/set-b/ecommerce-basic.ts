import type { PackageContent, PackageManifest } from '../../package-types'

export const ecommerceBasicPackage = (): {
  manifest: PackageManifest
  content: PackageContent
} => ({
  manifest: {
    id: 'ecommerce-basic',
    name: 'E-Commerce Store',
    version: '1.0.0',
    description:
      'Complete online store with products, shopping cart, checkout, orders, and inventory management. Start selling online!',
    author: 'MetaBuilder Team',
    category: 'ecommerce',
    icon: '🛒',
    screenshots: [],
    tags: ['ecommerce', 'shop', 'store', 'products'],
    dependencies: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    downloadCount: 2341,
    rating: 4.7,
    installed: false,
  },
  content: {
    schemas: [
      {
        name: 'Product',
        displayName: 'Product',
        fields: [
          { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
          { name: 'name', type: 'string', label: 'Name', required: true },
          { name: 'description', type: 'text', label: 'Description', required: false },
          { name: 'price', type: 'number', label: 'Price', required: true },
          { name: 'salePrice', type: 'number', label: 'Sale Price', required: false },
          { name: 'imageUrl', type: 'string', label: 'Image URL', required: false },
          { name: 'category', type: 'string', label: 'Category', required: false },
          {
            name: 'stock',
            type: 'number',
            label: 'Stock Quantity',
            required: true,
            defaultValue: 0,
          },
          { name: 'sku', type: 'string', label: 'SKU', required: false },
          {
            name: 'featured',
            type: 'boolean',
            label: 'Featured',
            required: true,
            defaultValue: false,
          },
          { name: 'createdAt', type: 'number', label: 'Created At', required: true },
        ],
      },
      {
        name: 'Cart',
        displayName: 'Shopping Cart',
        fields: [
          { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
          { name: 'userId', type: 'string', label: 'User ID', required: true },
          { name: 'items', type: 'json', label: 'Items', required: true },
          {
            name: 'totalAmount',
            type: 'number',
            label: 'Total Amount',
            required: true,
            defaultValue: 0,
          },
          { name: 'updatedAt', type: 'number', label: 'Updated At', required: true },
        ],
      },
      {
        name: 'Order',
        displayName: 'Order',
        fields: [
          { name: 'id', type: 'string', label: 'ID', required: true, primaryKey: true },
          { name: 'userId', type: 'string', label: 'User ID', required: true },
          { name: 'items', type: 'json', label: 'Items', required: true },
          { name: 'totalAmount', type: 'number', label: 'Total Amount', required: true },
          { name: 'status', type: 'string', label: 'Status', required: true },
          { name: 'shippingAddress', type: 'json', label: 'Shipping Address', required: true },
          { name: 'paymentMethod', type: 'string', label: 'Payment Method', required: false },
          { name: 'createdAt', type: 'number', label: 'Created At', required: true },
        ],
      },
    ],
    pages: [
      {
        id: 'page_shop_home',
        path: '/shop',
        title: 'Shop',
        level: 2,
        componentTree: [],
        requiresAuth: false,
      },
      {
        id: 'page_product_detail',
        path: '/product/:id',
        title: 'Product Details',
        level: 2,
        componentTree: [],
        requiresAuth: false,
      },
      {
        id: 'page_cart',
        path: '/cart',
        title: 'Shopping Cart',
        level: 2,
        componentTree: [],
        requiresAuth: true,
        requiredRole: 'user',
      },
      {
        id: 'page_checkout',
        path: '/checkout',
        title: 'Checkout',
        level: 2,
        componentTree: [],
        requiresAuth: true,
        requiredRole: 'user',
      },
    ],
    workflows: [],
    componentHierarchy: {},
    componentConfigs: {},
  },
})
