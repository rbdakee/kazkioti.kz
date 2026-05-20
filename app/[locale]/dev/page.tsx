import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Button } from '@/components/ui/Button'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Pill } from '@/components/ui/Pill'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Pagination } from '@/components/ui/Pagination'
import { Accordion } from '@/components/ui/Accordion'
import { Tabs } from '@/components/ui/Tabs'
import { SpecTable } from '@/components/ui/SpecTable'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { CardTractor } from '@/components/ui/Card/CardTractor'
import { CardNews } from '@/components/ui/Card/CardNews'
import { CardCase } from '@/components/ui/Card/CardCase'
import { DealersMap } from '@/components/ui/Map/DealersMap'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { Reveal } from '@/components/ui/Reveal'
import { MiniContactForm } from '@/components/forms/MiniContactForm'
import { LeadForm } from '@/components/forms/LeadForm'
import { getAllTractors } from '@/lib/content/tractors'
import { getAllCases } from '@/lib/content/cases'
import { getAllNews } from '@/lib/content/news'

export const metadata = {
  title: '_dev · component index',
  robots: { index: false, follow: false },
}

export default async function DevPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const [tractors, cases, news] = await Promise.all([
    getAllTractors(locale),
    getAllCases(locale),
    getAllNews(locale),
  ])
  const tractor = tractors[0]?.frontmatter
  const caseItem = cases[0]?.frontmatter
  const newsItem = news[0]?.frontmatter

  return (
    <div className="mx-auto flex max-w-container flex-col gap-16 px-4 py-20 sm:px-6 lg:px-10">
      <div className="flex flex-col gap-3">
        <Eyebrow>component index</Eyebrow>
        <h1 className="font-heading text-h1 text-text-primary">_dev</h1>
        <p className="text-lede text-text-muted">
          Visual catalogue of every primitive and section used in Phase 3. Excluded from sitemap and
          robots.
        </p>
      </div>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="primary" size="lg">
            Large
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="primary" loading>
            Loading
          </Button>
        </div>
      </Section>

      <Section title="Form primitives">
        <div className="grid max-w-2xl gap-4">
          <FormField id="dev-name" label="Имя">
            <Input id="dev-name" placeholder="Иван" />
          </FormField>
          <FormField id="dev-phone" label="Телефон">
            <PhoneInput id="dev-phone" />
          </FormField>
          <FormField id="dev-region" label="Регион">
            <Select
              id="dev-region"
              placeholder="Выберите регион"
              options={[
                { value: 'a', label: 'Алматинская' },
                { value: 't', label: 'Туркестанская' },
              ]}
            />
          </FormField>
          <FormField id="dev-comment" label="Комментарий" error="Поле обязательно">
            <Textarea id="dev-comment" hasError />
          </FormField>
        </div>
      </Section>

      <Section title="Eyebrow + Section Header">
        <Eyebrow>Eyebrow text</Eyebrow>
        <SectionHeader
          eyebrow="Линейка"
          h2="Тракторы KAZKIOTI"
          lede="Шесть моделей от 40 до 210 л.с."
          link={{ label: 'Все →', href: '#' }}
        />
      </Section>

      <Section title="Pills, Breadcrumbs, Pagination">
        <div className="flex flex-wrap gap-2">
          <Pill active>Все</Pill>
          <Pill>До 50</Pill>
          <Pill>50–100</Pill>
          <Pill>100+</Pill>
        </div>
        <Breadcrumbs
          items={[
            { label: 'KAZKIOTI', href: `/${locale}` },
            { label: 'Тракторы', href: `/${locale}/tractors` },
            { label: 'DF 904' },
          ]}
        />
        <Pagination total={42} perPage={6} currentPage={2} basePath={`/${locale}/news`} />
      </Section>

      <Section title="Accordion + Tabs">
        <Accordion
          items={[
            { question: 'Какие условия гарантии?', answer: '1 год или 1000 моточасов.' },
            { question: 'Где обслуживать?', answer: 'В сервисных центрах по Казахстану.' },
          ]}
          defaultOpenIndex={0}
        />
        <Tabs
          tabs={[
            { key: 'a', label: 'Посевная', content: <p>Сеялки и посевные комплексы.</p> },
            { key: 'b', label: 'Почвообработка', content: <p>Плуги и бороны.</p> },
          ]}
        />
      </Section>

      <Section title="SpecTable">
        <SpecTable
          groups={[
            {
              title: 'Двигатель',
              rows: [
                { label: 'Модель', value: 'YTO LR4M5' },
                { label: 'Цилиндры', value: '4' },
                { label: 'Объём', value: '5130 см³' },
              ],
            },
            {
              title: 'Трансмиссия',
              rows: [
                { label: 'Тип', value: 'Механика' },
                { label: 'Передачи', value: '12F + 4R' },
                { label: 'ВОМ', value: '540 / 1000 об/мин' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="VideoPlayer (loop)">
        <VideoPlayer
          type="loop"
          src="/videos/hero-loop.mp4"
          poster="/posters/hero-loop.jpg"
          alt="Demo loop"
          aspectRatio="21 / 9"
        />
      </Section>

      <Section title="Cards">
        {tractor ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <CardTractor tractor={tractor} locale={locale} />
            {newsItem ? (
              <CardNews article={newsItem} locale={locale} tagLabel="Поставка" />
            ) : null}
            {caseItem ? (
              <CardCase
                caseItem={caseItem}
                locale={locale}
                labels={{ hectares: 'га', motorHours: 'моточасов', years: 'лет' }}
              />
            ) : null}
          </div>
        ) : (
          <p className="text-body-m text-text-muted">No content mocks found.</p>
        )}
      </Section>

      <Section title="Dealers map (preview, non-interactive)">
        <DealersMap
          interactive={false}
          dealers={[
            { id: 'factory', city: 'Бадам', type: 'factory', cx: 420, cy: 320 },
            { id: 'almaty', city: 'Алматы', type: 'dealer', cx: 600, cy: 340 },
            { id: 'astana', city: 'Астана', type: 'service', cx: 460, cy: 170 },
          ]}
        />
      </Section>

      <Section title="Reveal demo">
        <Reveal stagger className="grid gap-4 md:grid-cols-3">
          <Card>One</Card>
          <Card>Two</Card>
          <Card>Three</Card>
        </Reveal>
      </Section>

      <Section title="Forms">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-4 font-heading text-h3">MiniContactForm</h3>
            <MiniContactForm locale={locale} source="dev-mini" />
          </div>
          <div>
            <h3 className="mb-4 font-heading text-h3">LeadForm</h3>
            <LeadForm locale={locale} source="dev-lead" />
          </div>
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t border-border pt-12">
      <h2 className="font-heading text-h3 text-text-primary">{title}</h2>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-bg-default p-6 font-mono text-mono-label uppercase tracking-widest text-text-muted">
      {children}
    </div>
  )
}
