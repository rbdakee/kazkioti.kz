'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LocaleError({ error, reset }: ErrorBoundaryProps) {
  const t = useTranslations('error')
  const locale = useLocale()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-container flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-10">
      <Eyebrow>{t('eyebrow')}</Eyebrow>
      <h1 className="max-w-[22ch] font-heading text-h1 text-text-primary">{t('title')}</h1>
      <p className="max-w-[56ch] text-lede text-text-muted">{t('description')}</p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="md" onClick={reset}>
          {t('retry')}
        </Button>
        <Link
          href={`/${locale}`}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-pill border border-border-strong px-5 font-medium text-text-primary transition-all duration-250 ease-kk hover:border-text-primary hover:bg-bg-muted"
        >
          {t('home')}
        </Link>
      </div>
    </div>
  )
}
