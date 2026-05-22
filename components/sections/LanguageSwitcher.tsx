'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { usePathname } from '@/lib/i18n/routing'
import { Link } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils/cn'

export interface LanguageSwitcherProps {
  currentLocale: Locale
  className?: string
  dark?: boolean
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={<FallbackSwitcher {...props} />}>
      <Switcher {...props} />
    </Suspense>
  )
}

function Switcher({ currentLocale, className, dark }: LanguageSwitcherProps) {
  const t = useTranslations('header')
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  const destination = query ? `${pathname}?${query}` : pathname

  const locales: Locale[] = ['ru', 'kk']
  const labels: Record<Locale, string> = {
    ru: t('langRu'),
    kk: t('langKk'),
  }

  return (
    <div
      className={cn(
        'inline-flex rounded-pill border transition-colors duration-250',
        dark ? 'border-white/40' : 'border-border-strong',
        className,
      )}
    >
      {locales.map((locale) => {
        const active = locale === currentLocale
        return (
          <Link
            key={locale}
            href={destination}
            locale={locale}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'inline-flex min-w-[2.75rem] items-center justify-center px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest transition-colors duration-200 first:rounded-l-pill last:rounded-r-pill',
              dark
                ? active
                  ? 'bg-white text-text-primary'
                  : 'text-white hover:text-white/70'
                : active
                  ? 'bg-text-primary text-white'
                  : 'text-text-primary hover:text-brand-red',
            )}
          >
            {labels[locale]}
          </Link>
        )
      })}
    </div>
  )
}

function FallbackSwitcher({ currentLocale, className, dark }: LanguageSwitcherProps) {
  const locales: Locale[] = ['ru', 'kk']
  const labels: Record<Locale, string> = { ru: 'RU', kk: 'KZ' }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'inline-flex rounded-pill border transition-colors duration-250',
        dark ? 'border-white/40' : 'border-border-strong',
        className,
      )}
    >
      {locales.map((locale) => {
        const active = locale === currentLocale
        return (
          <span
            key={locale}
            className={cn(
              'inline-flex min-w-[2.75rem] items-center justify-center px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest first:rounded-l-pill last:rounded-r-pill',
              dark
                ? active
                  ? 'bg-white text-text-primary'
                  : 'text-white'
                : active
                  ? 'bg-text-primary text-white'
                  : 'text-text-primary',
            )}
          >
            {labels[locale]}
          </span>
        )
      })}
    </div>
  )
}
