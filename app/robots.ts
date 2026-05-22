import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/ru/dev', '/kk/dev'],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/ru/dev', '/kk/dev'],
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
