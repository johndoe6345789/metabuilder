import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#030712',
        muted: '#0f172a',
        foreground: '#e2e8f0',
        'muted-foreground': '#94a3b8',
        border: '#1f2937',
        card: '#111827',
        primary: '#a855f7',
      },
    },
  },
  plugins: [],
}

export default config
