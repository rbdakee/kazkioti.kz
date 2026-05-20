import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import { Reveal } from '@/components/ui/Reveal'

export interface UTPStripeProps {
  locale: Locale
}

export async function UTPStripe({ locale }: UTPStripeProps) {
  const t = await getTranslations({ locale, namespace: 'utp' })
  const items = [
    { num: '01', title: t('item1Title'), body: t('item1Body') },
    { num: '02', title: t('item2Title'), body: t('item2Body') },
    { num: '03', title: t('item3Title'), body: t('item3Body') },
  ]

  return (
    <section className="border-y border-border bg-bg-soft">
      <div className="mx-auto max-w-container px-4 py-16 sm:px-6 lg:px-10">
        <Reveal as="ul" stagger className="grid gap-10 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.num} className="flex flex-col gap-4">
              <span className="font-mono text-mono-label uppercase tracking-widest text-brand-red">
                {item.num}
              </span>
              <h3 className="font-heading text-h3 text-text-primary">{item.title}</h3>
              <p className="text-body-m text-text-muted">{item.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
