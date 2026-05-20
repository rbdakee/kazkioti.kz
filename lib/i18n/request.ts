import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = routing.locales.find((value) => value === requested)

  if (!locale) {
    notFound()
  }

  const messages = (await import(`../../messages/${locale}.json`)).default

  return {
    locale,
    messages,
  }
})
