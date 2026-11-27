import Link from 'next/link'
import { ArrowRight, MessageCircleQuestion, Newspaper, Plus, Tractor, Wrench } from 'lucide-react'
import type { CollectionName, StoredEntry } from '@/shared/content'
import { adminFetch } from '@/lib/admin/api'
import { COLLECTION_FORMS } from '@/lib/admin/forms'
import { formatAdminDateTime } from '@/lib/admin/formatDate'
import type { Doc } from '@/lib/admin/forms/types'
import { UI } from '@/lib/admin/i18n'
import { getAdminLang } from '@/lib/admin/lang.server'
import { getMe, listCollection } from '@/lib/admin/queries'

const STAT_CARDS = [
  { collection: 'tractors', icon: Tractor },
  { collection: 'attachments', icon: Wrench },
  { collection: 'news', icon: Newspaper },
  { collection: 'faq', icon: MessageCircleQuestion },
] as const

export default async function DashboardPage() {
  const lang = getAdminLang()
  const [user, recent, ...lists] = await Promise.all([
    getMe(),
    adminFetch<Array<StoredEntry<Doc> & { collection: CollectionName }>>('/recent'),
    ...STAT_CARDS.map(({ collection }) => listCollection(collection)),
  ])
  const news = lists[2] ?? []
  const drafts = news.filter((entry) => entry.data.status !== 'published').length

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">{UI.welcome[lang]}</p>
        <h1 className="mt-2 font-heading text-[30px] font-bold text-text-primary">{user.name}</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map(({ collection, icon: Icon }, index) => {
          const form = COLLECTION_FORMS[collection]
          return (
            <Link
              key={collection}
              href={`/admin/${collection}`}
              className="group flex flex-col gap-4 rounded-lg border border-border bg-white p-5 shadow-[0_1px_2px_rgba(15,15,15,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-card"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-bg-muted text-text-primary group-hover:bg-brand-red group-hover:text-white">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex items-end justify-between">
                <span>
                  <span className="block font-heading text-[32px] font-bold leading-none text-text-primary">{lists[index]?.length ?? 0}</span>
                  <span className="mt-2 block text-[14px] text-text-muted">{form.plural[lang]}</span>
                </span>
                {collection === 'news' && drafts > 0 ? (
                  <span className="rounded-pill bg-black/[0.05] px-2 py-0.5 text-[12px] font-semibold text-text-muted">
                    {UI.draft[lang]}: {drafts}
                  </span>
                ) : null}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-border bg-white shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
          <h2 className="border-b border-border px-6 py-4 font-heading text-[15px] font-semibold">{UI.recentChanges[lang]}</h2>
          <ul className="divide-y divide-border">
            {recent.map((entry) => (
              <li key={`${entry.collection}-${entry.slug}`}>
                <Link href={`/admin/${entry.collection}/${entry.slug}`} className="flex items-center gap-4 px-6 py-3 hover:bg-bg-soft">
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[14px] font-semibold text-text-primary">
                      {COLLECTION_FORMS[entry.collection].titleOf(entry.data) || entry.slug}
                    </span>
                    <span className="text-[12px] text-text-muted">
                      {COLLECTION_FORMS[entry.collection].singular[lang]} · {formatAdminDateTime(entry.updatedAt)}
                      {entry.updatedBy ? ` · ${entry.updatedBy}` : ''}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-text-faint" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-white p-6 shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
          <h2 className="font-heading text-[15px] font-semibold">{UI.quickActions[lang]}</h2>
          <div className="mt-4 flex flex-col gap-2">
            {(['news', 'tractors', 'attachments'] as const).map((collection) => (
              <Link
                key={collection}
                href={`/admin/${collection}/new`}
                className="flex items-center gap-3 rounded-md border border-border px-4 py-3 text-[14px] font-semibold text-text-primary transition-colors hover:border-text-primary/30 hover:bg-bg-soft"
              >
                <Plus className="h-4 w-4 text-brand-red" />
                {COLLECTION_FORMS[collection].addLabel[lang]}
              </Link>
            ))}
            <Link href="/admin/contacts" className="flex items-center gap-3 rounded-md border border-border px-4 py-3 text-[14px] font-semibold text-text-primary transition-colors hover:border-text-primary/30 hover:bg-bg-soft">
              <ArrowRight className="h-4 w-4 text-text-muted" />
              {UI.contacts[lang]}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
