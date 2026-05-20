'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/lib/i18n/routing'
import type { Locale } from '@/lib/i18n/routing'
import { cn } from '@/lib/utils/cn'

export interface LanguageSwitcherProps {
  currentLocale: Locale
  className?: string
}

export function LanguageSwitcher({ currentLocale, className }: LanguageSwitcherProps) {
  const t = useTranslations('common')
  const router = useRouter()
  const pathname = usePathname()
  const target: Locale = currentLocale === 'ru' ? 'kk' : 'ru'
  const label = target === 'kk' ? 'ҚАЗ' : 'RU'

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: target })}
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
