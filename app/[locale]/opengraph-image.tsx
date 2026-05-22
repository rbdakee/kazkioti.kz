import type { Locale } from '@/lib/i18n/routing'
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/seo/ogImage'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'KAZKIOTI — Тракторы, собранные в Казахстане'

const TITLE: Record<Locale, string> = {
  ru: 'Тракторы, собранные в Казахстане',
  kk: 'Қазақстанда құрастырылған тракторлар',
}

const EYEBROW: Record<Locale, string> = {
  ru: '6 моделей · 40–210 л.с. · с 2016',
  kk: '6 модель · 40–210 а.к. · 2016 жылдан',
}

export default function Image({ params }: { params: { locale: Locale } }) {
  const locale = params.locale
  return renderOgImage({
    locale,
    title: TITLE[locale],
    eyebrow: EYEBROW[locale],
  })
}
