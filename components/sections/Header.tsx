'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import type { Locale } from '@/lib/i18n/routing'
import {
  COMPANY_PHONE_HUMAN,
  COMPANY_PHONE_TEL,
  NAV_ITEMS,
  PDF_CATALOG_URL,
} from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { LanguageSwitcher } from './LanguageSwitcher'
import { cn } from '@/lib/utils/cn'

export interface HeaderProps {
  locale: Locale
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations()
  const pathname = usePathname()
  const isHome = /^\/(ru|kk)\/?$/.test(pathname)
  const [isStuck, setIsStuck] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const darkMode = isHome && !isStuck

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--header-offset', '72px')
    let lastY = 0
    function onScroll() {
      const y = window.scrollY
      const stuck = y > 24
      const hidden = y > 120 && y > lastY
      setIsStuck(stuck)
      setIsHidden(hidden)
      root.style.setProperty('--header-offset', hidden ? '0px' : stuck ? '58px' : '72px')
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      root.style.removeProperty('--header-offset')
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-250 ease-kk',
          darkMode
            ? 'bg-black/85 backdrop-blur-md'
            : cn('bg-bg-default/95 backdrop-blur', isStuck && 'border-b border-border'),
          isHidden && !menuOpen && '-translate-y-full',
        )}
      >
        <div
          className={cn(
            'mx-auto flex max-w-container items-center justify-between gap-6 px-4 transition-all duration-250 ease-kk sm:px-6 lg:px-10',
            isStuck ? 'h-[58px]' : 'h-[72px]',
          )}
        >
          <Link href={`/${locale}`} className="flex items-center gap-3 font-heading text-h3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-brand-red font-bold text-white">
              K
            </span>
            <span className={cn('hidden sm:inline', darkMode ? 'text-white/85' : 'text-text-primary')}>
              KAZKIOTI
            </span>
          </Link>
          <nav className="hidden items-center gap-5 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                className={cn(
                  'whitespace-nowrap font-mono text-[12px] font-medium uppercase tracking-[0.08em] transition-colors duration-250',
                  darkMode
                    ? 'text-white/85 hover:text-white'
                    : 'text-text-primary hover:text-brand-red',
                )}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher currentLocale={locale} className="hidden sm:inline-flex" dark={darkMode} />
            <a
              href={`tel:${COMPANY_PHONE_TEL}`}
              className={cn(
                'hidden whitespace-nowrap font-mono text-[12px] font-medium tracking-[0.04em] transition-colors duration-250 xl:inline-block',
                darkMode ? 'text-white/85 hover:text-white' : 'text-text-primary hover:text-brand-red',
              )}
            >
              {COMPANY_PHONE_HUMAN}
            </a>
            <Button
              asLink
              href={PDF_CATALOG_URL}
              variant={darkMode ? 'onDark' : 'ghost'}
              size="sm"
              className={cn('hidden xl:inline-flex', darkMode && 'font-semibold text-white')}
            >
              {t('header.downloadCatalog')}
            </Button>
            <Button
              asLink
              href={`/${locale}/contacts`}
              variant="primary"
              size="sm"
              className="hidden font-semibold text-white lg:inline-flex"
            >
              {t('header.cta')}
            </Button>
            <button
              type="button"
              className={cn(
                'inline-flex h-10 w-10 items-center justify-center rounded-md border transition-colors duration-250 lg:hidden',
                darkMode ? 'border-white/40 text-white/85' : 'border-border-strong text-text-primary',
              )}
              onClick={() => setMenuOpen(true)}
              aria-label={t('header.menuOpen')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {menuOpen ? (
        <div className="fixed inset-0 z-[60] flex flex-col bg-bg-default lg:hidden">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <Link href={`/${locale}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 font-heading text-h3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-brand-red font-bold text-white">
                K
              </span>
              KAZKIOTI
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={t('header.menuClose')}
              className="inline-flex h-10 w-10 items-center justify-center text-2xl"
            >
              ×
            </button>
          </div>
          <nav className="flex flex-col gap-4 px-6 py-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={`/${locale}${item.href}`}
                onClick={() => setMenuOpen(false)}
                className="font-heading text-h2 text-text-primary hover:text-brand-red"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <Link
              href={`/${locale}/faq`}
              onClick={() => setMenuOpen(false)}
              className="font-heading text-h2 text-text-primary hover:text-brand-red"
            >
              {t('nav.faq')}
            </Link>
            <Link
              href={`/${locale}/contacts`}
              onClick={() => setMenuOpen(false)}
              className="font-heading text-h2 text-text-primary hover:text-brand-red"
            >
              {t('nav.contacts')}
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3 border-t border-border px-6 py-6">
            <a
              href={`tel:${COMPANY_PHONE_TEL}`}
              className="font-mono text-mono-label uppercase tracking-widest text-text-primary"
            >
              {COMPANY_PHONE_HUMAN}
            </a>
            <Button asLink href={`/${locale}/contacts`} variant="primary" size="lg" onClick={() => setMenuOpen(false)}>
              {t('header.cta')}
            </Button>
            <LanguageSwitcher currentLocale={locale} />
          </div>
        </div>
      ) : null}
    </>
  )
}
