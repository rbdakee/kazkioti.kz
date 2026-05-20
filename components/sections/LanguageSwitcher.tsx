'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils/cn'

export interface LanguageSwitcherProps {
  currentLocale: Locale
  className?: string
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={<FallbackButton {...props} />}>
      <Switcher {...props} />
    </Suspense>
  )
}

function Switcher({ currentLocale, className }: LanguageSwitcherProps) {
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const target: Locale = currentLocale === 'ru' ? 'kk' : 'ru'
  const label = target === 'kk' ? 'ҚАЗ' : 'RU'

  function handleClick() {
    const query = searchParams.toString()
    const destination = query ? `${pathname}?${query}` : pathname
    router.replace(destination, { locale: target })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('languageSwitch')}
      className={cn(
        'rounded-pill border border-border-strong px-3 py-1 font-mono text-mono-label uppercase tracking-widest text-text-primary hover:border-text-primary',
        className,
      )}
    >
      {label}
    </button>
  )
}

function FallbackButton({ currentLocale, className }: LanguageSwitcherProps) {
  const target: Locale = currentLocale === 'ru' ? 'kk' : 'ru'
  const label = target === 'kk' ? 'ҚАЗ' : 'RU'
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex rounded-pill border border-border-strong px-3 py-1 font-mono text-mono-label uppercase tracking-widest text-text-primary',
        className,
      )}
    >
      {label}
    </span>
  )
}
