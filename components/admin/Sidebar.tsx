'use client'

import { useEffect, useState, type ComponentType } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircleQuestion,
  Newspaper,
  Phone,
  Tractor,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { logoutAction } from '@/app/admin/actions'
import { UI, type Label } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useAdminLang, useT } from './AdminLang'
import { LangSwitch } from './LangSwitch'

interface NavItem {
  href: string
  label: Label
  icon: ComponentType<{ className?: string }>
  count?: number
}

export interface SidebarProps {
  user: { name: string; login: string }
  counts: Record<'tractors' | 'attachments' | 'news' | 'faq', number>
}

export function Sidebar({ user, counts }: SidebarProps) {
  const t = useT()
  const { lang } = useAdminLang()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => setOpen(false), [pathname])

  const groups: Array<{ title?: Label; items: NavItem[] }> = [
    { items: [{ href: '/admin', label: UI.dashboard, icon: LayoutDashboard }] },
    {
      title: UI.catalog,
      items: [
        { href: '/admin/tractors', label: UI.tractors, icon: Tractor, count: counts.tractors },
        { href: '/admin/attachments', label: UI.attachments, icon: Wrench, count: counts.attachments },
      ],
    },
    {
      title: UI.content,
      items: [
        { href: '/admin/news', label: UI.news, icon: Newspaper, count: counts.news },
        { href: '/admin/faq', label: UI.faq, icon: MessageCircleQuestion, count: counts.faq },
      ],
    },
    {
      title: UI.company,
      items: [
        { href: '/admin/contacts', label: UI.contacts, icon: Phone },
        { href: '/admin/dealers', label: UI.dealers, icon: MapPin },
        { href: '/admin/users', label: UI.users, icon: Users },
      ],
    },
  ]

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-6 pt-6">
        <Link href="/admin" className="flex items-center gap-3">
          <Image src="/logo.png" alt="KAZKIOTI" width={420} height={96} className="h-6 w-auto" priority />
        </Link>
        <button type="button" className="rounded p-1 text-white/60 hover:text-white lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3">
        {groups.map((group, index) => (
          <div key={index} className="mb-5">
            {group.title ? <p className="mb-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">{t(group.title)}</p> : null}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'relative flex items-center gap-3 rounded-md px-3 py-2 text-[14px] font-medium transition-colors',
                        active ? 'bg-white/[0.09] text-white' : 'text-white/65 hover:bg-white/[0.05] hover:text-white',
                      )}
                    >
                      {active ? <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-red" aria-hidden="true" /> : null}
                      <Icon className={cn('h-[18px] w-[18px]', active ? 'text-white' : 'text-white/45')} />
                      <span className="flex-1">{t(item.label)}</span>
                      {typeof item.count === 'number' ? <span className="font-mono text-[11px] text-white/35">{item.count}</span> : null}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="flex flex-col gap-3 border-t border-white/10 p-4">
        <a href={`/${lang}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-white/65 hover:bg-white/[0.05] hover:text-white">
          <ExternalLink className="h-4 w-4" />
          {t(UI.openSite)}
        </a>
        <div className="flex items-center justify-between gap-2 px-2">
          <span className="text-[11px] text-white/40">{t(UI.interfaceLanguage)}</span>
          <LangSwitch tone="dark" />
        </div>
        <div className="flex items-center gap-3 rounded-md bg-white/[0.04] px-2 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-red font-heading text-[13px] font-bold text-white">
            {user.name.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13px] font-semibold text-white">{user.name}</span>
            <span className="truncate text-[11px] text-white/40">{user.login}</span>
          </span>
          <form action={logoutAction}>
            <button type="submit" className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label={t(UI.logout)} title={t(UI.logout)}>
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-bg-invert px-4 py-3 lg:hidden">
        <button type="button" onClick={() => setOpen(true)} className="rounded p-1 text-white" aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>
        <Image src="/logo.png" alt="KAZKIOTI" width={420} height={96} className="h-5 w-auto" />
        <span className="w-7" />
      </header>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-bg-invert lg:block">{nav}</aside>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="absolute inset-y-0 left-0 w-72 bg-bg-invert shadow-2xl">{nav}</aside>
        </div>
      ) : null}
    </>
  )
}
