'use client'

import { useEffect } from 'react'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#ffffff',
          color: '#0a0a0a',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          lineHeight: 1.5,
        }}
      >
        <main
          style={{
            maxWidth: '560px',
            width: '100%',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
          }}
        >
          <span
            style={{
              fontSize: '12px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#e0001b',
              fontWeight: 600,
            }}
          >
            KAZKIOTI · Error 500
          </span>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 700,
              letterSpacing: '-0.01em',
            }}
          >
            Что-то пошло не так
            <br />
            <span style={{ color: '#6b6b6b' }}>Бір нәрсе дұрыс болмады</span>
          </h1>
          <p style={{ margin: 0, color: '#4a4a4a', fontSize: '16px' }}>
            Сайт временно недоступен. Пожалуйста, попробуйте ещё раз.
            <br />
            The site is temporarily unavailable. Please try again.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                appearance: 'none',
                cursor: 'pointer',
                border: 'none',
                backgroundColor: '#e0001b',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '15px',
                padding: '12px 22px',
                borderRadius: '999px',
                fontFamily: 'inherit',
              }}
            >
              Повторить / Қайта көру
            </button>
            <a
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #d4d4d4',
                color: '#0a0a0a',
                fontWeight: 500,
                fontSize: '15px',
                padding: '11px 22px',
                borderRadius: '999px',
                textDecoration: 'none',
              }}
            >
              На главную / Home
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
