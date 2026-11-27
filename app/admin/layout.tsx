import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { FONT_VARIABLES } from '@/lib/fonts'
import { getAdminLang } from '@/lib/admin/lang.server'
import { AdminLangProvider } from '@/components/admin/AdminLang'
import { Toaster } from '@/components/admin/Toaster'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'KAZKIOTI — админка', template: '%s — KAZKIOTI' },
  robots: { index: false, follow: false },
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  const lang = getAdminLang()
  return (
    <html lang={lang} className={FONT_VARIABLES}>
      <body className="bg-[#f4f3f0] font-body text-text-primary antialiased">
        <AdminLangProvider lang={lang}>
          <Toaster>{children}</Toaster>
        </AdminLangProvider>
      </body>
    </html>
  )
}
