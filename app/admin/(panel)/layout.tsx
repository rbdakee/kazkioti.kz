import type { ReactNode } from 'react'
import { getMe, listCollection } from '@/lib/admin/queries'
import { Sidebar } from '@/components/admin/Sidebar'

export const dynamic = 'force-dynamic'

export default async function PanelLayout({ children }: { children: ReactNode }) {
  const [user, tractors, attachments, news, faq] = await Promise.all([
    getMe(),
    listCollection('tractors'),
    listCollection('attachments'),
    listCollection('news'),
    listCollection('faq'),
  ])
  const counts = { tractors: tractors.length, attachments: attachments.length, news: news.length, faq: faq.length }
  return (
    <div className="min-h-screen">
      <Sidebar user={{ name: user.name, login: user.login }} counts={counts} />
      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  )
}
