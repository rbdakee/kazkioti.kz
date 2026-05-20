import { getTranslations } from 'next-intl/server'
import type { Locale } from '@/lib/i18n/routing'
import type { NewsFrontmatter } from '@/lib/types/news'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { CardNews } from '@/components/ui/Card/CardNews'

export interface NewsGridProps {
  articles: readonly NewsFrontmatter[]
  locale: Locale
  showViewAll?: boolean
}

export async function NewsGrid({ articles, locale, showViewAll = true }: NewsGridProps) {
  const t = await getTranslations({ locale })
  return (
    <section className="bg-bg-default">
      <div className="mx-auto max-w-container px-4 py-20 sm:px-6 lg:px-10">
        <SectionHeader
          eyebrow={t('news.title')}
          h2={t('news.title')}
          lede={t('news.lede')}
          link={showViewAll ? { label: t('news.viewAll'), href: `/${locale}/news` } : undefined}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <CardNews
              key={article.slug}
              article={article}
              locale={locale}
              tagLabel={t(`news.tag${capitalize(article.tag)}` as 'news.tagProduction')}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
