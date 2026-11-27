/** Longest side kept for uploaded photos; larger images are scaled down in the browser. */
const MAX_DIMENSION = 2400
/** Stay well under the 4.5 MB request limit of the hosting platform. */
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

export const ACCEPT_ATTRIBUTE = ACCEPTED_TYPES.join(',')

export class ImageUploadError extends Error {}

async function encode(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/** Scales a photo down when it is too large to upload comfortably. */
async function prepare(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  if (scale === 1 && file.size <= MAX_UPLOAD_BYTES) {
    bitmap.close()
    return file
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new ImageUploadError('Canvas is not available')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  // WebP keeps transparency (price-list PNGs); Safari cannot encode it and falls back to PNG.
  const webp = await encode(canvas, 'image/webp', 0.86)
  const blob = webp?.type === 'image/webp' ? webp : await encode(canvas, 'image/jpeg', 0.88)
  if (!blob) throw new ImageUploadError('Could not encode image')
  return blob
}

/** Uploads a photo through the admin and returns its site path (`/uploads/...`). */
export async function uploadImage(file: File): Promise<string> {
  if (!ACCEPTED_TYPES.includes(file.type)) throw new ImageUploadError('Unsupported file type')
  const blob = await prepare(file)
  if (blob.size > MAX_UPLOAD_BYTES) throw new ImageUploadError('Image is too large')
  const form = new FormData()
  form.set('file', blob, file.name)
  const response = await fetch('/admin/upload', { method: 'POST', body: form })
  const body = (await response.json().catch(() => ({}))) as { path?: string; message?: string }
  if (!response.ok || !body.path) throw new ImageUploadError(body.message ?? `Upload failed (${response.status})`)
  return body.path
}
