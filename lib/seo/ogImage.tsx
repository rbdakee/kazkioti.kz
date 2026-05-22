import { ImageResponse } from 'next/og'
import type { Locale } from '@/lib/i18n/routing'
import { SITE_NAME, COMPANY_PHONE_HUMAN } from '@/lib/constants'

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = 'image/png'

const BRAND_RED = '#e0001b'
const BRAND_BLUE = '#0b1f3a'
const TEXT_PRIMARY = '#0b1220'
const TEXT_MUTED = '#5a6577'

interface RenderOgImageOptions {
  locale: Locale
  title: string
  eyebrow?: string
}

const DEFAULT_EYEBROW: Record<Locale, string> = {
  ru: 'Тракторы из Казахстана',
  kk: 'Қазақстанда жасалған тракторлар',
}

/**
 * Render a 1200×630 OG image with the KAZKIOTI brand mark.
 *
 * Typographic, edge-renderable. Falls back to system fonts for Cyrillic support
 * without requiring runtime font fetches.
 */
export function renderOgImage({ locale, title, eyebrow }: RenderOgImageOptions): ImageResponse {
  const eyebrowText = eyebrow ?? DEFAULT_EYEBROW[locale]

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          position: 'relative',
        }}
      >
        {/* Subtle red gradient corner */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 520,
            height: 520,
            background:
              'radial-gradient(circle at top right, rgba(224, 0, 27, 0.18), rgba(224, 0, 27, 0) 70%)',
          }}
        />
        {/* Bottom-left soft tint */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: 360,
            height: 360,
            background:
              'radial-gradient(circle at bottom left, rgba(11, 31, 58, 0.08), rgba(11, 31, 58, 0) 70%)',
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: BRAND_RED,
              color: '#ffffff',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              borderRadius: 8,
            }}
          >
            K
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}
          >
            <span style={{ color: BRAND_BLUE }}>KAZ</span>
            <span style={{ color: BRAND_RED }}>KIOTI</span>
          </div>
        </div>

        {/* Title block */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            zIndex: 1,
            maxWidth: 1000,
          }}
        >
          <div
            style={{
              color: TEXT_MUTED,
              fontSize: 26,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
              fontWeight: 500,
            }}
          >
            {eyebrowText}
          </div>
          <div
            style={{
              color: TEXT_PRIMARY,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: TEXT_MUTED,
            fontSize: 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, "SFMono-Regular", Menlo, monospace',
            zIndex: 1,
          }}
        >
          <span>kazkioti.kz</span>
          <span>{COMPANY_PHONE_HUMAN}</span>
        </div>

        {/* Hidden but available for screen-reader context via alt prop */}
        <span style={{ display: 'none' }}>{SITE_NAME}</span>
      </div>
    ),
    { ...OG_SIZE },
  )
}
