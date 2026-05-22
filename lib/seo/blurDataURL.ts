/**
 * Shared 1x1 neutral light-grey PNG used as a universal `blurDataURL`
 * for `next/image` placeholders.
 *
 * TEMPORARY: replace with per-image blur data generated at build time via
 * `sharp` (or `plaiceholder`) once those dependencies are introduced.
 * Until then, this provides a non-jarring grey shimmer for LCP images.
 */
export const NEUTRAL_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII='
