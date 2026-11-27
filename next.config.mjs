import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [375, 640, 768, 1024, 1280, 1440, 1920],
    imageSizes: [64, 128, 256, 384],
  },
  experimental: {
    mdxRs: false,
  },
  // Photos uploaded in the admin live on the CMS server; serve them from the
  // site's own domain so content can store plain `/uploads/...` paths.
  async rewrites() {
    const cmsUrl = process.env.CMS_URL?.replace(/\/$/, '')
    return cmsUrl ? [{ source: '/uploads/:path*', destination: `${cmsUrl}/uploads/:path*` }] : []
  },
}

export default withNextIntl(nextConfig)
