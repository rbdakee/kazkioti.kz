import Link from 'next/link'
import { Eyebrow } from './Eyebrow'
import { cn } from '@/lib/utils/cn'

export interface SectionHeaderProps {
  eyebrow?: string
  h2: string
  lede?: string
  link?: { label: string; href: string }
  className?: string
}

export function SectionHeader({ eyebrow, h2, lede, link, className }: SectionHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}
    >
      <div className="flex max-w-2xl flex-col gap-3">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h2 className="font-heading text-h2 text-text-primary">{h2}</h2>
        {lede ? <p className="text-lede text-text-muted">{lede}</p> : null}
      </div>
      {link ? (
        <Link
          href={link.href}
          className="font-mono text-mono-label uppercase tracking-widest text-text-primary underline-offset-4 hover:text-brand-red hover:underline"
        >
          {link.label}
        </Link>
      ) : null}
    </div>
  )
}
