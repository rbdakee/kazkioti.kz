'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'kk_cookie_ack'

export function CookieBanner() {
  const t = useTranslations('cookie')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const ack = (() => {
      try {
        return localStorage.getItem(STORAGE_KEY)
      } catch {
        return null
      }
    })()
    if (ack) return
    const timer = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // ignore storage errors
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-6 left-6 z-[55] max-w-md rounded-lg border border-white/10 bg-bg-invert p-4 text-white shadow-card">
      <p className="text-body-s">{t('text')}</p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-pill bg-white px-4 py-2 font-mono text-mono-label uppercase tracking-widest text-bg-invert"
        >
          {t('ok')}
        </button>
      </div>
    </div>
  )
}
