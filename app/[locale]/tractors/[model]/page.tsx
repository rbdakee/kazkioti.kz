import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { getTractor, getAllTractors } from '@/lib/content/tractors'
import { getAllAttachments } from '@/lib/content/attachments'
import type { AttachmentFrontmatter } from '@/lib/types/attachment'
// Cases section is temporarily disabled until we have published cases.
// import { getAllCases } from '@/lib/content/cases'
import { routing } from '@/lib/i18n/routing'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { SpecTable, type SpecGroup } from '@/components/ui/SpecTable'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder'
// import { CardCase } from '@/components/ui/Card/CardCase'
import { TractorProductHero } from '@/components/sections/TractorProductHero'
import { TractorSubNav } from '@/components/sections/TractorSubNav'
import { TractorLeadBar } from '@/components/sections/TractorLeadBar'
import { FinalCTA } from '@/components/sections/FinalCTA'

export async function generateStaticParams() {
  const params: Array<{ locale: Locale; model: string }> = []
  for (const locale of routing.locales) {
    const tractors = await getAllTractors(locale)
    for (const tractor of tractors) {
      params.push({ locale, model: tractor.frontmatter.slug })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; model: string }>
}) {
  const { locale, model } = await params
  const tractor = await getTractor(model, locale)
  if (!tractor) return {}
  const t = await getTranslations({ locale, namespace: 'meta.tractorDetail' })
  return {
    title: tractor.frontmatter.metaTitle ?? t('title', { model: tractor.frontmatter.name }),
    description:
      tractor.frontmatter.metaDescription ??
      t('description', {
        model: tractor.frontmatter.name,
        power: tractor.frontmatter.power,
      }),
    openGraph: {
      title: tractor.frontmatter.metaTitle ?? t('title', { model: tractor.frontmatter.name }),
      description:
        tractor.frontmatter.metaDescription ??
        t('description', {
          model: tractor.frontmatter.name,
          power: tractor.frontmatter.power,
        }),
      images: [tractor.frontmatter.ogImage ?? tractor.frontmatter.heroImage],
    },
  }
}

interface AttachmentPreview {
  slug: string
  name: string
  categoryKey: AttachmentFrontmatter['category']
  heroImage: string
}

const ATTACHMENT_CATEGORY_ORDER: ReadonlyArray<AttachmentFrontmatter['category']> = [
  'seeding',
  'tillage',
  'mowing',
  'extra',
]

/**
 * Order so the top of the grid showcases a "best-of" mix:
 *   - prefer attachments that ship with a real product photo
 *   - round-robin across categories so the first row is one of each kind
 *   - fall back to the remaining items in category order
 */
function sortAttachmentsForTractorPage(
  items: readonly AttachmentPreview[],
): AttachmentPreview[] {
  const groups: Record<AttachmentFrontmatter['category'], AttachmentPreview[]> = {
    seeding: [],
    tillage: [],
    mowing: [],
    extra: [],
  }
  for (const item of items) groups[item.categoryKey].push(item)
  // Inside each group, items with a photo come first
  for (const key of ATTACHMENT_CATEGORY_ORDER) {
    groups[key].sort((a, b) => {
      const aHas = Boolean(a.heroImage)
      const bHas = Boolean(b.heroImage)
      if (aHas !== bHas) return aHas ? -1 : 1
      return 0
    })
  }
  // Round-robin interleave
  const out: AttachmentPreview[] = []
  const maxLen = Math.max(...ATTACHMENT_CATEGORY_ORDER.map((k) => groups[k].length))
  for (let i = 0; i < maxLen; i += 1) {
    for (const key of ATTACHMENT_CATEGORY_ORDER) {
      const item = groups[key][i]
      if (item) out.push(item)
    }
  }
  return out
}

export default async function TractorDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; model: string }>
}) {
  const { locale, model } = await params
  setRequestLocale(locale)
  const tractor = await getTractor(model, locale)
  if (!tractor) notFound()

  const t = await getTranslations({ locale })
  const tDetail = await getTranslations({ locale, namespace: 'tractorDetail' })
  const frontmatter = tractor.frontmatter

  // Show the full catalogue — no compatibility filter. Better-looking items
  // (those with product photos) bubble to the top and we interleave categories
  // so the first row showcases variety.
  const allAttachmentRecords = await getAllAttachments(locale)
  const attachments = sortAttachmentsForTractorPage(
    allAttachmentRecords.map<AttachmentPreview>((record) => ({
      slug: record.frontmatter.slug,
      name: record.frontmatter.name,
      categoryKey: record.frontmatter.category,
      heroImage: record.frontmatter.heroImage,
    })),
  )

  const CATEGORY_LABEL_KEY: Record<AttachmentPreview['categoryKey'], string> = {
    seeding: t('attachments.groupSeedingTitle'),
    tillage: t('attachments.groupTillageTitle'),
    mowing: t('attachments.groupMowingTitle'),
    extra: t('attachments.groupExtraTitle'),
  }

  // Cases lookup disabled while the section is hidden site-wide.

  const specGroups: SpecGroup[] = [
    {
      title: tDetail('specGroupEngine'),
      rows: [
        { label: tDetail('specEngineModel'), value: frontmatter.engineModel },
        { label: tDetail('specEngineCylinders'), value: String(frontmatter.engineCylinders) },
        { label: tDetail('specEngineDisplacement'), value: `${frontmatter.engineDisplacement} cm³` },
        { label: tDetail('specEngineEco'), value: frontmatter.engineEcoClass },
        { label: tDetail('specEngineFuel'), value: frontmatter.fuelType },
      ],
    },
    {
      title: tDetail('specGroupTransmission'),
      rows: [
        { label: tDetail('specTrType'), value: frontmatter.transmissionType },
        { label: tDetail('specTrGears'), value: frontmatter.transmission },
        { label: tDetail('specTrDrive'), value: frontmatter.driveType },
        { label: tDetail('specTrPto'), value: frontmatter.pto },
        ...(frontmatter.clutch
          ? [{ label: tDetail('specTrClutch'), value: frontmatter.clutch }]
          : []),
      ],
    },
    {
      title: tDetail('specGroupDimensions'),
      rows: [
        { label: tDetail('specDimLength'), value: `${frontmatter.lengthMm} mm` },
        { label: tDetail('specDimWidth'), value: `${frontmatter.widthMm} mm` },
        { label: tDetail('specDimHeight'), value: `${frontmatter.heightMm} mm` },
        { label: tDetail('specDimMass'), value: `${frontmatter.weight} kg` },
        ...(frontmatter.wheelbase
          ? [{ label: tDetail('specDimWheelbase'), value: `${frontmatter.wheelbase} mm` }]
          : []),
      ],
    },
    {
      title: tDetail('specGroupHydraulics'),
      rows: [
        { label: tDetail('specHydTank'), value: `${frontmatter.fuelTank} L` },
        ...(frontmatter.hydraulicPump
          ? [{ label: tDetail('specHydPump'), value: frontmatter.hydraulicPump }]
          : []),
        ...(frontmatter.rearLinkage
          ? [{ label: tDetail('specHydRear'), value: frontmatter.rearLinkage }]
          : []),
        ...(frontmatter.brakes
          ? [{ label: tDetail('specHydBrakes'), value: frontmatter.brakes }]
          : []),
        {
          label: tDetail('specHydWarranty'),
          value: `${frontmatter.warrantyYears} / ${frontmatter.warrantyHours}`,
        },
      ],
    },
  ]

  const cabinItems: Array<{ key: string; title: string; body: string }> = [
    { key: 'ac', title: tDetail('cabinAcTitle'), body: tDetail('cabinAcBody') },
    { key: 'steering', title: tDetail('cabinSteeringTitle'), body: tDetail('cabinSteeringBody') },
    { key: 'noise', title: tDetail('cabinNoiseTitle'), body: tDetail('cabinNoiseBody') },
    { key: 'view', title: tDetail('cabinViewTitle'), body: tDetail('cabinViewBody') },
  ]

  const showReview = Boolean(frontmatter.videoUrl)
  const showAttachments = attachments.length > 0
  const showCases = false
  const kpHref = '#kp'

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-24 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: t('breadcrumbs.home'), href: `/${locale}` },
            { label: t('breadcrumbs.tractors'), href: `/${locale}/tractors` },
            { label: frontmatter.name },
          ]}
        />
      </div>

      <TractorProductHero tractor={frontmatter} locale={locale} />

      <TractorSubNav
        showReview={showReview}
        showAttachments={showAttachments}
        showCases={showCases}
        kpHref={kpHref}
      />

      {showReview ? (
        <section id="review" className="bg-bg-default">
          <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
            <div className="flex max-w-3xl flex-col gap-3">
              <Eyebrow>01 · {tDetail('subNavReview')}</Eyebrow>
              <h2 className="font-heading text-h2 text-text-primary">
                {tDetail('reviewTitle', { model: frontmatter.name })}
              </h2>
            </div>
            <div className="mt-10">
              <VideoPlayer
                type="youtube"
                src={frontmatter.videoUrl ?? ''}
                poster={frontmatter.heroImage}
                alt={`${frontmatter.name} ${tDetail('subNavReview')}`}
                aspectRatio="16 / 9"
              />
              <div className="mt-3 font-mono text-mono-label uppercase tracking-widest text-text-muted">
                <span>{frontmatter.videoCaption ?? tDetail('reviewCaption')}</span>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section id="specs" className="bg-bg-soft">
        <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
            <div className="flex max-w-3xl flex-col gap-3">
              <Eyebrow>02 · {tDetail('subNavSpecs')}</Eyebrow>
              <h2 className="font-heading text-h2 text-text-primary">{tDetail('specsTitle')}</h2>
              <p className="text-lede text-text-muted">{tDetail('specsLede')}</p>
            </div>
          </div>
          <SpecTable groups={specGroups} className="mt-10" />
        </div>
      </section>

      <section id="cabin" className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
          <div className="flex max-w-3xl flex-col gap-3">
            <Eyebrow>03 · {tDetail('subNavCabin')}</Eyebrow>
            <h2 className="font-heading text-h2 text-text-primary">{tDetail('cabinTitle')}</h2>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cabinItems.map((item, index) => (
              <li
                key={item.key}
                className="flex h-full flex-col gap-3 rounded-md border border-border bg-bg-soft p-6"
              >
                <span className="font-mono text-mono-label uppercase tracking-widest text-text-faint">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="font-heading text-body-l font-semibold text-text-primary">{item.title}</p>
                <p className="text-body-s text-text-muted">{item.body}</p>
              </li>
            ))}
          </ul>
          {tractor.body.trim() ? (
            <p className="mt-10 max-w-3xl text-body-l text-text-muted">{tractor.body.trim()}</p>
          ) : null}
        </div>
      </section>

      {showAttachments ? (
        <section id="attachments" className="bg-bg-soft">
          <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div className="flex max-w-3xl flex-col gap-3">
                <Eyebrow>04 · {tDetail('subNavAttachments')}</Eyebrow>
                <h2 className="font-heading text-h2 text-text-primary">
                  {tDetail('attachmentsTitle')}
                </h2>
              </div>
              <Link
                href={`/${locale}/attachments`}
                className="font-mono text-mono-label uppercase tracking-widest text-text-primary underline-offset-4 hover:text-brand-red hover:underline"
              >
                {tDetail('attachmentsViewAll')}
              </Link>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {attachments.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/${locale}/attachments`}
                    className="flex h-full flex-col gap-3 rounded-md border border-border bg-bg-default p-5 transition-all duration-fast hover:-translate-y-0.5 hover:border-border-strong hover:shadow-card"
                  >
                    <div className="aspect-square overflow-hidden rounded-sm bg-white">
                      {item.heroImage ? (
                        <img
                          src={item.heroImage}
                          alt={item.name}
                          loading="lazy"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImagePlaceholder />
                      )}
                    </div>
                    <p className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
                      {CATEGORY_LABEL_KEY[item.categoryKey]}
                    </p>
                    <p className="font-heading text-body-l font-semibold text-text-primary">
                      {item.name}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <section id="warranty" className="bg-bg-default">
        <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
          <div className="grid gap-10 rounded-md border border-border bg-bg-soft p-10 lg:grid-cols-[1fr_1.2fr] lg:p-14">
            <div>
              <Eyebrow>05 · {tDetail('subNavWarranty')}</Eyebrow>
              <div className="mt-6 font-heading text-display leading-none tracking-tight text-text-primary">
                <span className="text-brand-red">{frontmatter.warrantyYears}</span>
                <span className="text-text-faint"> · </span>
                <span>{frontmatter.warrantyHours}</span>
              </div>
              <p className="mt-4 font-mono text-mono-label uppercase tracking-widest text-text-muted">
                {tDetail('warrantyCaption')}
              </p>
            </div>
            <ul className="flex flex-col">
              {[1, 2, 3, 4].map((num) => (
                <li
                  key={num}
                  className="grid grid-cols-[32px_1fr] gap-3 border-t border-border py-4 first:border-t-0"
                >
                  <span className="pt-1 font-mono text-mono-label uppercase tracking-widest text-text-muted">
                    {String(num).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-heading text-body-l font-semibold text-text-primary">
                      {tDetail(`warrantyItem${num}Title` as 'warrantyItem1Title')}
                    </p>
                    <p className="mt-1 text-body-m text-text-muted">
                      {tDetail(`warrantyItem${num}Body` as 'warrantyItem1Body')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/${locale}/dealers`}
              className="font-mono text-mono-label uppercase tracking-widest text-text-primary underline-offset-4 hover:text-brand-red hover:underline"
            >
              {tDetail('warrantyDealers')} →
            </Link>
          </div>
        </div>
      </section>

      {/* Cases section temporarily hidden until we have published cases. */}

      <div id="kp">
        <FinalCTA
          locale={locale}
          defaultModel={frontmatter.slug}
          source={`tractor-${frontmatter.slug}-final`}
        />
      </div>

      <TractorLeadBar modelName={`KAZKIOTI · ${frontmatter.name}`} power={frontmatter.power} kpHref={kpHref} />
    </>
  )
}
