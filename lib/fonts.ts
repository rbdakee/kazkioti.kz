import { Geologica, Manrope, Montserrat } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
})

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
})

const geologica = Geologica({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-geologica',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
})

/** Class names that expose the brand fonts as CSS variables; put on <html>. */
export const FONT_VARIABLES = `${montserrat.variable} ${manrope.variable} ${geologica.variable}`
