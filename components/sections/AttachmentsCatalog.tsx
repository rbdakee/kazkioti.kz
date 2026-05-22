'use client'

import { useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Tabs, type Tab } from '@/components/ui/Tabs'
import { Sheet } from '@/components/ui/Sheet'
import { Button } from '@/components/ui/Button'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
import { MiniContactForm } from '@/components/forms/MiniContactForm'
import { Reveal } from '@/components/ui/Reveal'
import type { Locale } from '@/lib/i18n/routing'
import type { AttachmentFrontmatter } from '@/lib/types/attachment'
import { formatTenge } from '@/lib/utils/formatPrice'

export type AttachmentCategory = AttachmentFrontmatter['category']

export interface AttachmentsCatalogProps {
  locale: Locale
  attachments: readonly AttachmentFrontmatter[]
}

interface PriceLabels {
  priceLabel: string
  priceWithoutVat: string
  subsidyLabel: string
  priceWithSubsidyLabel: string
  priceFromLabel: string
  priceOnRequest: string
}

const CATEGORY_ORDER: readonly AttachmentCategory[] = [
  'seeding',
  'tillage',
  'mowing',
  'extra',
]

const CATEGORY_NUMBER: Record<AttachmentCategory, string> = {
  seeding: '01',
  tillage: '02',
  mowing: '03',
  extra: '04',
}

export function AttachmentsCatalog({ locale, attachments }: AttachmentsCatalogProps) {
  const t = useTranslations('attachments')
  const tTractors = useTranslations('tractors')
  const [activeAttachment, setActiveAttachment] = useState<AttachmentFrontmatter | null>(null)

  const tabLabels: Record<AttachmentCategory, string> = {
    seeding: t('tabSeeding'),
    tillage: t('tabTillage'),
    mowing: t('tabMowing'),
    extra: t('tabExtra'),
  }

  const groupTitles: Record<AttachmentCategory, string> = {
    seeding: t('groupSeedingTitle'),
    tillage: t('groupTillageTitle'),
    mowing: t('groupMowingTitle'),
    extra: t('groupExtraTitle'),
  }

  const priceLabels: PriceLabels = {
    priceLabel: tTractors('priceLabel'),
    priceWithoutVat: tTractors('priceWithoutVat'),
    subsidyLabel: tTractors('subsidyLabel'),
    priceWithSubsidyLabel: tTractors('priceWithSubsidyLabel'),
    priceFromLabel: tTractors('priceFromLabel'),
    priceOnRequest: tTractors('priceOnRequest'),
  }

  const grouped = CATEGORY_ORDER.reduce<Record<AttachmentCategory, AttachmentFrontmatter[]>>(
    (acc, key) => {
      acc[key] = attachments.filter((item) => item.category === key)
      return acc
    },
    { seeding: [], tillage: [], mowing: [], extra: [] },
  )

  const tabs: Tab[] = CATEGORY_ORDER.map((category) => ({
    key: category,
    label: `${tabLabels[category]} · ${grouped[category].length}`,
    content: (
      <AttachmentGrid
        items={grouped[category]}
        emptyLabel={t('emptyState')}
        compatibleLabel={t('compatibleLabel')}
        requestLabel={t('requestPrice')}
        groupNumber={CATEGORY_NUMBER[category]}
        groupTitle={groupTitles[category]}
        categoryLabel={groupTitles[category]}
        onRequest={setActiveAttachment}
        locale={locale}
        priceLabels={priceLabels}
      />
    ),
  }))

  return (
    <>
      <Tabs tabs={tabs} />
      <Sheet
        open={activeAttachment !== null}
        onClose={() => setActiveAttachment(null)}
        title={activeAttachment ? `${t('requestSheetTitle')} · ${activeAttachment.name}` : t('requestSheetTitle')}
      >
        <p className="mb-4 text-body-s text-text-muted">{t('requestSheetIntro')}</p>
        {activeAttachment ? (
          <MiniContactForm
            key={activeAttachment.slug}
            locale={locale}
            source="attachment-request"
            attachment={activeAttachment.name}
          />
        ) : null}
      </Sheet>
    </>
  )
}

interface AttachmentGridProps {
  items: readonly AttachmentFrontmatter[]
  groupNumber: string
  groupTitle: string
  categoryLabel: string
  emptyLabel: string
  compatibleLabel: string
  requestLabel: string
  onRequest: (attachment: AttachmentFrontmatter) => void
  locale: Locale
  priceLabels: PriceLabels
}

function AttachmentGrid({
  items,
  groupNumber,
  groupTitle,
  categoryLabel,
  emptyLabel,
  compatibleLabel,
  requestLabel,
  onRequest,
  locale,
  priceLabels,
}: AttachmentGridProps) {
  if (items.length === 0) {
    return <p className="rounded-md border border-dashed border-border p-8 text-center text-body-m text-text-muted">{emptyLabel}</p>
  }
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
          <span className="text-brand-red">{groupNumber}</span> · {groupTitle}
        </span>
        <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
          {items.length}
        </span>
      </div>
      <Reveal stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((attachment) => (
          <AttachmentCard
            key={attachment.slug}
            attachment={attachment}
            categoryLabel={categoryLabel}
            compatibleLabel={compatibleLabel}
            requestLabel={requestLabel}
            onRequest={() => onRequest(attachment)}
            locale={locale}
            priceLabels={priceLabels}
          />
        ))}
      </Reveal>
    </div>
  )
}

interface AttachmentCardProps {
  attachment: AttachmentFrontmatter
  categoryLabel: string
  compatibleLabel: string
  requestLabel: string
  onRequest: () => void
  locale: Locale
  priceLabels: PriceLabels
}

function AttachmentCard({
  attachment,
  categoryLabel,
  compatibleLabel,
  requestLabel,
  onRequest,
  locale,
  priceLabels,
}: AttachmentCardProps): ReactNode {
  const compat = attachment.specs?.compatibility ?? null
  const hasPhoto = Boolean(attachment.heroImage)
  return (
    <article className="flex flex-col gap-4 rounded-md border border-border bg-bg-default p-5 transition-all duration-fast ease-kk hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card">
      <div className="aspect-[5/4] overflow-hidden rounded-md bg-white">
        {hasPhoto ? (
          <img
            src={attachment.heroImage}
            alt={`${attachment.name} — ${categoryLabel}`}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <h3 className="font-heading text-h3 leading-tight text-text-primary">
          {attachment.name}
        </h3>
        <div className="flex flex-wrap gap-2">
          {compat ? (
            <span className="rounded-pill border border-border-strong px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
              {compatibleLabel}: {compat}
            </span>
          ) : null}
          {attachment.compatibleModels.slice(0, 2).map((model) => (
            <span
              key={model}
              className="rounded-pill border border-border-strong px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-text-muted"
            >
              {model.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-border pt-4">
        {attachment.price ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint">
              {attachment.priceWithSubsidy
                ? `${priceLabels.priceFromLabel} · ${priceLabels.priceWithSubsidyLabel}`
                : `${priceLabels.priceLabel} · ${priceLabels.priceWithoutVat}`}
            </span>
            <span className="font-heading text-body-l font-semibold text-brand-red">
              {formatTenge(attachment.priceWithSubsidy ?? attachment.price, locale)}
            </span>
            {attachment.priceWithSubsidy ? (
              <span className="font-mono text-[10px] uppercase tracking-widest text-text-faint line-through">
                {formatTenge(attachment.price, locale)}
              </span>
            ) : null}
          </div>
        ) : (
          <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
            {priceLabels.priceOnRequest}
          </span>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={onRequest}>
          {requestLabel}
        </Button>
      </div>
    </article>
  )
}
