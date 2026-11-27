import localFont from 'next/font/local'

// Self-hosted variable fonts (latin, latin-ext, cyrillic, cyrillic-ext), so builds
// do not depend on Google Fonts. Licenses: app/fonts/OFL-*.txt
const montserrat = localFont({
  src: '../app/fonts/montserrat.woff2',
  weight: '500 800',
  variable: '--font-montserrat',
  display: 'swap',
  preload: true,
})

const manrope = localFont({
  src: '../app/fonts/manrope.woff2',
  weight: '400 700',
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
})

const geologica = localFont({
  src: '../app/fonts/geologica.woff2',
  weight: '400 600',
  variable: '--font-geologica',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
})

/** Class names that expose the brand fonts as CSS variables; put on <html>. */
export const FONT_VARIABLES = `${montserrat.variable} ${manrope.variable} ${geologica.variable}`
