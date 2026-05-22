import type { Locale } from '@/lib/i18n/routing'
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/seo/ogImage'

export const runtime = 'edge'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE
export const alt = 'KAZKIOTI — Навесное оборудование'

const TITLE: Record<Locale, string> = {
  ru: 'Навесное оборудование',
  kk: 'Тіркеме жабдықтар',
}

export default function Image({ params }: { params: { locale: Locale } }) {
  return renderOgImage({ locale: params.locale, title: TITLE[params.locale] })
}
