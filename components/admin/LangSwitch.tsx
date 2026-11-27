'use client'

import { ADMIN_LANGS } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useAdminLang } from './AdminLang'

const SHORT = { ru: 'RU', kk: 'KZ' } as const

export function LangSwitch({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { lang, setLang } = useAdminLang()
  return (
    <div className={cn('inline-flex rounded-md p-0.5', tone === 'dark' ? 'bg-white/10' : 'bg-black/[0.05]')} role="group" aria-label="Language">
      {ADMIN_LANGS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={cn(
            'rounded px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider transition-colors',
            lang === option
              ? tone === 'dark'
                ? 'bg-white text-text-primary'
                : 'bg-white text-text-primary shadow-sm'
              : tone === 'dark'
                ? 'text-white/60 hover:text-white'
                : 'text-text-muted hover:text-text-primary',
          )}
        >
          {SHORT[option]}
        </button>
      ))}
    </div>
  )
}
