import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { FactorySplit } from '@/components/sections/FactorySplit'
import { FinalCTA } from '@/components/sections/FinalCTA'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'meta.about' })
  return { title: t('title'), description: t('description') }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'about' })
  const tBc = await getTranslations({ locale, namespace: 'breadcrumbs' })

  const timelineEntries = [
    { year: '2016', title: t('timeline.2016title'), body: t('timeline.2016body'), accent: false },
    { year: '2018', title: t('timeline.2018title'), body: t('timeline.2018body'), accent: false },
    { year: '2020', title: t('timeline.2020title'), body: t('timeline.2020body'), accent: false },
    { year: '2022', title: t('timeline.2022title'), body: t('timeline.2022body'), accent: false },
    { year: '2024', title: t('timeline.2024title'), body: t('timeline.2024body'), accent: false },
    { year: '2026', title: t('timeline.2026title'), body: t('timeline.2026body'), accent: true },
  ]

  const goals = [
    { num: t('goals.g1num'), title: t('goals.g1title'), body: t('goals.g1body') },
    { num: t('goals.g2num'), title: t('goals.g2title'), body: t('goals.g2body') },
    { num: t('goals.g3num'), title: t('goals.g3title'), body: t('goals.g3body') },
    { num: t('goals.g4num'), title: t('goals.g4title'), body: t('goals.g4body') },
    { num: t('goals.g5num'), title: t('goals.g5title'), body: t('goals.g5body') },
    { num: t('goals.g6num'), title: t('goals.g6title'), body: t('goals.g6body') },
    { num: t('goals.g7num'), title: t('goals.g7title'), body: t('goals.g7body') },
    { num: t('goals.g8num'), title: t('goals.g8title'), body: t('goals.g8body') },
    { num: t('goals.g9num'), title: t('goals.g9title'), body: t('goals.g9body') },
  ]

  return (
    <>
      <div className="mx-auto max-w-container px-4 pt-8 sm:px-6 lg:px-10">
        <Breadcrumbs
          items={[
            { label: tBc('home'), href: `/${locale}` },
            { label: tBc('about') },
          ]}
        />
      </div>

      <section className="mx-auto max-w-container px-4 pb-16 pt-10 sm:px-6 lg:px-10">
        <Eyebrow>{t('heroEyebrow')}</Eyebrow>
        <h1 className="mt-4 max-w-[16ch] font-heading text-h1 text-text-primary">{t('h1')}</h1>
        <p className="mt-5 max-w-[60ch] text-lede text-text-muted">{t('heroLede')}</p>
      </section>

      <section className="border-y border-border bg-bg-soft py-14">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { value: '2016', label: t('metricFounded') },
              { value: '10', label: t('metricYears') },
              { value: '6', label: t('metricModels') },
              { value: '9', label: t('metricRegions') },
              { value: '380', label: t('metricOutput') },
              { value: '28', label: t('metricService') },
            ].map(({ value, label }) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd className="font-heading text-[clamp(36px,4vw,56px)] font-medium leading-none tracking-tight text-text-primary">
                  {value}
                </dd>
                <p className="mt-2 font-mono text-mono-label uppercase tracking-widest text-text-muted">
                  {label}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="bg-bg-muted py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <div className="mb-12">
            <Eyebrow>{t('timelineEyebrow')}</Eyebrow>
            <h2 className="mt-3 font-heading text-h2 text-text-primary">{t('timelineH2')}</h2>
          </div>
          <ol className="mx-auto max-w-[920px]">
            {timelineEntries.map(({ year, title, body, accent }) => (
              <li
                key={year}
                className="grid grid-cols-[120px_1fr] gap-8 border-t border-border py-8 first:border-t-0 sm:grid-cols-[140px_1fr]"
              >
                <div
                  className={
                    accent
                      ? 'font-heading text-[36px] font-medium leading-none tracking-tight text-brand-red'
                      : 'font-heading text-[36px] font-medium leading-none tracking-tight text-text-faint'
                  }
                >
                  {year}
                </div>
                <div>
                  <p className="font-heading text-h3 text-text-primary">{title}</p>
                  <p className="mt-2 max-w-[56ch] text-body-m text-text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <div className="mb-12">
            <Eyebrow>{t('goalsEyebrow')}</Eyebrow>
            <h2 className="mt-3 font-heading text-h2 text-text-primary">{t('goalsH2')}</h2>
            <p className="mt-2 text-lede text-text-muted">{t('goalsLede')}</p>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goals.map(({ num, title, body }) => (
              <li
                key={num}
                className="flex flex-col gap-3 rounded border border-border bg-bg-default p-7"
              >
                <span className="font-heading text-[64px] font-medium leading-none tracking-tighter text-text-primary">
                  {num}
                </span>
                <p className="font-heading text-h3 text-text-primary">{title}</p>
                <p className="text-body-s text-text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FactorySplit locale={locale} />

      <section className="py-20">
        <div className="mx-auto max-w-container px-4 sm:px-6 lg:px-10">
          <div className="mb-12">
            <Eyebrow>{t('logisticsEyebrow')}</Eyebrow>
            <h2 className="mt-3 font-heading text-h2 text-text-primary">{t('logisticsTitle')}</h2>
          </div>
          <div className="overflow-x-auto">
            <svg
              viewBox="0 0 1000 280"
              preserveAspectRatio="xMidYMid meet"
              className="w-full min-w-[640px]"
              aria-label={t('logisticsTitle')}
              role="img"
            >
              <line x1="40" y1="200" x2="960" y2="200" stroke="#e0001b" strokeWidth="2" />
              <line
                x1="40"
                y1="80"
                x2="960"
                y2="80"
                stroke="rgba(0,0,0,.2)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <LogisticsCity cx={120} cy={200} r={8} fill="#e0001b" name="БАДАМ" sub={t('logisticsFactory')} textFill="#0a0a0a" />
              <LogisticsCity cx={280} cy={200} r={6} fill="#0a0a0a" name="Шымкент" sub="110 км" textFill="#0a0a0a" />
              <LogisticsCity cx={440} cy={200} r={6} fill="#0a0a0a" name="Тараз" sub="340 км" textFill="#0a0a0a" />
              <LogisticsCity cx={640} cy={200} r={6} fill="#0a0a0a" name="Алматы" sub="820 км" textFill="#0a0a0a" />
              <LogisticsCity cx={820} cy={200} r={6} fill="#0a0a0a" name="Астана" sub="1 480 км" textFill="#0a0a0a" />
              <LogisticsCity cx={940} cy={200} r={6} fill="#1853d6" name="Курык" sub={t('logisticsPort')} textFill="#1853d6" />
              <text
                x="500"
                y="40"
                textAnchor="middle"
                fontFamily="var(--font-jetbrains-mono), monospace"
                fontSize="11"
                letterSpacing="2"
                fill="#9a9a99"
              >
                {t('logisticsHighway').toUpperCase()}
              </text>
              <text
                x="500"
                y="62"
                textAnchor="middle"
                fontFamily="var(--font-space-grotesk), sans-serif"
                fontSize="20"
                fontWeight="500"
                fill="#0a0a0a"
              >
                {t('logisticsHighwayName')}
              </text>
              <line
                x1="120"
                y1="80"
                x2="120"
                y2="200"
                stroke="rgba(0,0,0,.18)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x="120"
                y="110"
                textAnchor="middle"
                fontFamily="var(--font-jetbrains-mono), monospace"
                fontSize="10"
                fill="#9a9a99"
              >
                ↗ 120 км
              </text>
            </svg>
          </div>
        </div>
      </section>

      <FinalCTA locale={locale} source="about-page" />
    </>
  )
}

function LogisticsCity({
  cx,
  cy,
  r,
  fill,
  name,
  sub,
  textFill,
}: {
  cx: number
  cy: number
  r: number
  fill: string
  name: string
  sub: string
  textFill: string
}) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={fill} />
      <text
        x={cx}
        y={cy + 32}
        textAnchor="middle"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="11"
        fontWeight="700"
        fill={textFill}
      >
        {name}
      </text>
      <text
        x={cx}
        y={cy + 48}
        textAnchor="middle"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontSize="10"
        fill="#9a9a99"
      >
        {sub}
      </text>
    </g>
  )
}
