'use client'

import { createContext, useCallback, useContext, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { setAdminLangAction } from '@/app/admin/actions'
import type { AdminLang, Label } from '@/lib/admin/i18n'

interface AdminLangContextValue {
  lang: AdminLang
  setLang: (lang: AdminLang) => void
}

const AdminLangContext = createContext<AdminLangContextValue | null>(null)

export function AdminLangProvider({ lang, children }: { lang: AdminLang; children: ReactNode }) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const setLang = useCallback(
    (next: AdminLang) =>
      startTransition(async () => {
        await setAdminLangAction(next)
        router.refresh()
      }),
    [router],
  )
  return <AdminLangContext.Provider value={{ lang, setLang }}>{children}</AdminLangContext.Provider>
}

export function useAdminLang(): AdminLangContextValue {
  const context = useContext(AdminLangContext)
  if (!context) throw new Error('useAdminLang must be used inside AdminLangProvider')
  return context
}

/** Returns a translator for admin labels in the current interface language. */
export function useT(): (label: Label) => string {
  const { lang } = useAdminLang()
  return useCallback((label: Label) => label[lang], [lang])
}
