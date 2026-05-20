import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'KAZKIOTI — Тракторы, собранные в Казахстане'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#e0001b',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            color: '#ffffff',
            fontSize: 28,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 500,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: '#ffffff',
              color: '#e0001b',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              borderRadius: 6,
            }}
          >
            K
          </div>
          <span>KAZKIOTI</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              color: '#ffffff',
              fontSize: 96,
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            Тракторы, собранные в Казахстане
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 32,
              letterSpacing: '-0.01em',
              maxWidth: '900px',
            }}
          >
            6 моделей · 40–210 л.с. · Завод в Бадаме · с 2016
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'rgba(255,255,255,0.7)',
            fontSize: 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          <span>kazkioti.kz</span>
          <span>+7 747 876 44 44</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
