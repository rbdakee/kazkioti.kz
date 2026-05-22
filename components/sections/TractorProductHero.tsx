'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Locale } from '@/lib/i18n/routing'
import type { TractorFrontmatter } from '@/lib/types/tractor'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Sheet } from '@/components/ui/Sheet'
import { MiniContactForm } from '@/components/forms/MiniContactForm'
import { LeadForm } from '@/components/forms/LeadForm'
import { cn } from '@/lib/utils/cn'
import { formatTenge } from '@/lib/utils/formatPrice'

export interface TractorProductHeroProps {
  tractor: TractorFrontmatter
  locale: Locale
}

interface MetricCell {
  key: string
  label: string
  value: string
  unit?: string
}

export function TractorProductHero({ tractor, locale }: TractorProductHeroProps) {
  const t = useTranslations()
  const tDetail = useTranslations('tractorDetail')
  const tUnits = useTranslations('units')

  const angles = [tractor.heroImage, ...(tractor.galleryImages ?? [])]
  const [activeImage, setActiveImage] = useState(0)
  const [kpSheetOpen, setKpSheetOpen] = useState(false)
  const [tdModalOpen, setTdModalOpen] = useState(false)

  const cells: MetricCell[] = [
    { key: 'power', label: tDetail('cellPower'), value: String(tractor.power), unit: tUnits('hp') },
    { key: 'engine', label: tDetail('cellEngine'), value: `${tractor.engineDisplacement / 1000}`, unit: `${tractor.engineCylinders} ${tUnits('cylinders')}` },
    { key: 'transmission', label: tDetail('cellTransmission'), value: tractor.transmission },
    { key: 'drive', label: tDetail('cellDrive'), value: tractor.driveType },
    { key: 'tank', label: tDetail('cellTank'), value: String(tractor.fuelTank), unit: tUnits('liters') },
    { key: 'mass', label: tDetail('cellMass'), value: String(tractor.weight), unit: tUnits('kg') },
  ]

  return (
    <section className="border-b border-border pb-20 pt-6">
      <div className="mx-auto grid max-w-container gap-14 px-4 sm:px-6 lg:grid-cols-[1.05fr_1.4fr] lg:px-10">
        <div className="flex flex-col">
          <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
            KAZKIOTI · {tractor.name} · {new Date().getFullYear()}
          </p>
          <h1 className="mt-4 font-heading text-h1 text-text-primary">{tractor.subtitle}</h1>
          {tractor.status === 'coming-soon' ? (
            <span className="mt-4 inline-flex w-fit rounded-pill bg-text-primary px-3 py-1 font-mono text-mono-label uppercase tracking-widest text-white">
              {t('tractors.comingSoon')}
            </span>
          ) : null}

          <dl className="mt-9 grid grid-cols-2 overflow-hidden rounded-md border border-border">
            {cells.map((cell, index) => (
              <div
                key={cell.key}
                className={cn(
                  'flex flex-col gap-1 p-5',
                  index % 2 === 0 && 'border-r border-border',
                  index < cells.length - 2 && 'border-b border-border',
                )}
              >
                <dt className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {cell.label}
                </dt>
                <dd className="font-heading text-[28px] font-medium leading-none tracking-tight text-text-primary">
                  {cell.value}
                  {cell.unit ? (
                    <span className="ml-1 align-baseline font-mono text-[11px] font-medium text-text-muted">
                      {cell.unit}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          {tractor.price ? (
            <div className="mt-8 flex flex-col gap-1 rounded-md border border-border bg-bg-soft p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                  {t('tractors.priceLabel')} · {t('tractors.priceWithoutVat')}
                </span>
                <span className="font-heading text-h2 font-semibold text-text-primary">
                  {formatTenge(tractor.price, locale)}
                </span>
              </div>
              {tractor.subsidy ? (
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2 border-t border-dashed border-border pt-2">
                  <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                    {t('tractors.subsidyLabel')}
                  </span>
                  <span className="font-mono text-body-m text-text-muted">
                    − {formatTenge(tractor.subsidy, locale)}
                  </span>
                </div>
              ) : null}
              {tractor.priceWithSubsidy ? (
                <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-mono text-mono-label uppercase tracking-widest text-brand-red">
                    {t('tractors.priceWithSubsidyLabel')}
                  </span>
                  <span className="font-heading text-h2 font-semibold text-brand-red">
                    {formatTenge(tractor.priceWithSubsidy, locale)}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" onClick={() => setKpSheetOpen(true)}>
              {tDetail('ctaKp')}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setTdModalOpen(true)}>
              {tDetail('ctaTestDrive')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="overflow-hidden rounded-md bg-white" style={{ aspectRatio: '5 / 4' }}>
            <img
              src={angles[activeImage] ?? tractor.heroImage}
              alt={
                activeImage === 0
                  ? tDetail('heroImageAlt', { name: tractor.name })
                  : tDetail('angleAriaLabel', { tractor: tractor.name, n: activeImage + 1 })
              }
              className="h-full w-full object-contain transition-opacity duration-250 ease-kk"
              loading="eager"
            />
          </div>
          {angles.length > 1 ? (
            <div className="flex gap-2">
              {angles.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={tDetail('angleAriaLabel', { tractor: tractor.name, n: index + 1 })}
                  aria-pressed={activeImage === index}
                  className={cn(
                    'flex-1 overflow-hidden rounded-sm border bg-white transition-colors duration-fast',
                    activeImage === index ? 'border-text-primary border-2' : 'border-border hover:border-border-strong',
                  )}
                  style={{ aspectRatio: '4 / 3' }}
                >
                  <img src={src} alt="" className="h-full w-full object-contain" loading="lazy" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <Sheet open={kpSheetOpen} onClose={() => setKpSheetOpen(false)} title={tDetail('ctaKp')}>
        <MiniContactForm locale={locale} source={`tractor-${tractor.slug}-kp-sheet`} />
      </Sheet>
      <Modal open={tdModalOpen} onClose={() => setTdModalOpen(false)} title={tDetail('ctaTestDrive')}>
        <LeadForm locale={locale} defaultModel={tractor.slug} source={`tractor-${tractor.slug}-test-drive`} />
      </Modal>
    </section>
  )
}
