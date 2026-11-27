import { randomBytes } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'

export type UploadKind = 'image' | 'pdf'

/** Accepted formats, recognised by their first bytes rather than the file name. */
const SIGNATURES: ReadonlyArray<{ kind: UploadKind; extension: string; matches: (bytes: Buffer) => boolean }> = [
  { kind: 'image', extension: 'jpg', matches: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { kind: 'image', extension: 'png', matches: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { kind: 'image', extension: 'webp', matches: (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP' },
  { kind: 'image', extension: 'avif', matches: (b) => b.toString('ascii', 4, 12) === 'ftypavif' },
  { kind: 'pdf', extension: 'pdf', matches: (b) => b.toString('ascii', 0, 5) === '%PDF-' },
]

const ACCEPTED_DESCRIPTION: Record<UploadKind, string> = {
  image: 'JPEG, PNG, WebP or AVIF images',
  pdf: 'PDF files',
}

export class UploadError extends Error {}

function detect(bytes: Buffer, kinds: readonly UploadKind[]): string | undefined {
  return SIGNATURES.find((signature) => kinds.includes(signature.kind) && signature.matches(bytes))?.extension
}

/** Stores a file of one of the given kinds under a random name and returns its public path (`/uploads/…`). */
export async function saveUpload(uploadsDir: string, bytes: Buffer, maxBytes: number, kinds: readonly UploadKind[]): Promise<string> {
  if (bytes.length === 0) throw new UploadError('Empty file')
  if (bytes.length > maxBytes) throw new UploadError(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB`)
  const extension = detect(bytes, kinds)
  if (!extension) throw new UploadError(`Only ${kinds.map((kind) => ACCEPTED_DESCRIPTION[kind]).join(' or ')} are accepted`)
  const now = new Date()
  const folder = path.join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'))
  const filename = `${randomBytes(12).toString('hex')}.${extension}`
  await fs.mkdir(path.join(uploadsDir, folder), { recursive: true })
  await fs.writeFile(path.join(uploadsDir, folder, filename), bytes, { flag: 'wx' })
  return `/uploads/${folder.split(path.sep).join('/')}/${filename}`
}

/** Stores an image under a random name and returns its public path (`/uploads/…`). */
export function saveImage(uploadsDir: string, bytes: Buffer, maxBytes: number): Promise<string> {
  return saveUpload(uploadsDir, bytes, maxBytes, ['image'])
}
