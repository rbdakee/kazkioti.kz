import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          default: '#ffffff',
          muted: '#f6f5f2',
          soft: '#fafaf9',
          invert: '#0c0c0d',
        },
        text: {
          primary: '#0a0a0a',
          muted: '#6b6b6b',
          faint: '#9a9a99',
        },
        brand: {
          red: '#e0001b',
          'red-hover': '#c20018',
          blue: '#1853d6',
          'blue-soft': '#e8eefb',
        },
        border: {
          DEFAULT: 'rgba(15,15,15,0.08)',
          strong: 'rgba(15,15,15,0.18)',
        },
      },
      fontFamily: {
        heading: ['var(--font-montserrat)', 'system-ui', 'sans-serif'],
        body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geologica)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['clamp(48px,8vw,112px)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        h1: ['clamp(40px,5vw,64px)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        h2: ['clamp(32px,4vw,48px)', { lineHeight: '1.04', letterSpacing: '-0.02em' }],
        h3: ['clamp(22px,2vw,28px)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        lede: ['clamp(17px,1.4vw,21px)', { lineHeight: '1.5' }],
        eyebrow: ['11px', { lineHeight: '1', letterSpacing: '0.18em' }],
        'body-l': ['18px', { lineHeight: '1.6' }],
        'body-m': ['16px', { lineHeight: '1.5' }],
        'body-s': ['14px', { lineHeight: '1.5' }],
        'mono-label': ['11px', { lineHeight: '1', letterSpacing: '0.14em' }],
      },
      spacing: {
        '4.5': '18px',
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 18px 40px -24px rgba(0,0,0,0.18)',
        'card-hover': '0 18px 40px -24px rgba(0,0,0,0.18)',
        form: '0 30px 80px -40px rgba(0,0,0,0.18), 0 8px 24px -16px rgba(0,0,0,0.06)',
        'hero-media': '0 30px 80px -40px rgba(0,0,0,0.22), 0 8px 24px -16px rgba(0,0,0,0.08)',
        fab: '0 8px 24px -8px rgba(224,0,27,0.55), 0 2px 6px rgba(0,0,0,0.18)',
      },
      transitionTimingFunction: {
        kk: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '250ms',
        '250': '250ms',
        slow: '400ms',
        '400': '400ms',
        page: '600ms',
      },
      maxWidth: {
        container: '1440px',
        content: '1280px',
      },
      screens: {
        xs: '480px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1440px',
      },
    },
  },
  plugins: [typography],
}

export default config
