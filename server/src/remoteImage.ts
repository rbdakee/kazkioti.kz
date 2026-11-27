import { lookup } from 'node:dns/promises'
import { BlockList, isIP } from 'node:net'
import { UploadError } from './uploads'

const MAX_REDIRECTS = 3
const TIMEOUT_MS = 20_000

/** Loopback, private, link-local and other non-public ranges the server must never fetch from. */
const PRIVATE_RANGES = new BlockList()
for (const [network, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.168.0.0', 16],
  ['224.0.0.0', 3],
] as const) {
  PRIVATE_RANGES.addSubnet(network, prefix, 'ipv4')
}
for (const [network, prefix] of [
  ['::', 128],
  ['::1', 128],
  ['fc00::', 7],
  ['fe80::', 10],
  ['ff00::', 8],
] as const) {
  PRIVATE_RANGES.addSubnet(network, prefix, 'ipv6')
}

/** True for addresses inside the server's own or a private network. IPv4-mapped IPv6 is matched by the IPv4 rules. */
export function isPrivateAddress(address: string): boolean {
  const family = isIP(address)
  if (family === 0) return true
  return PRIVATE_RANGES.check(address, family === 6 ? 'ipv6' : 'ipv4')
}

async function assertPublicHost(url: URL): Promise<void> {
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new UploadError('Only http(s) links are accepted')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host)
    ? [host]
    : (await lookup(host, { all: true }).catch(() => [])).map((entry) => entry.address)
  if (addresses.length === 0) throw new UploadError(`Cannot resolve ${host}`)
  if (addresses.some(isPrivateAddress)) throw new UploadError('This address is not reachable from the CMS')
}

async function readCapped(response: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(response.headers.get('content-length'))
  if (declared > maxBytes) throw new UploadError(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB`)
  if (!response.body) throw new UploadError('Empty file')
  const chunks: Buffer[] = []
  let total = 0
  for await (const chunk of response.body) {
    total += chunk.byteLength
    if (total > maxBytes) throw new UploadError(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB`)
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

/** Downloads an image from a public link, following a few redirects, each checked again. */
export async function downloadImage(link: string, maxBytes: number): Promise<Buffer> {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    throw new UploadError('Invalid link')
  }
  const signal = AbortSignal.timeout(TIMEOUT_MS)
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    await assertPublicHost(url)
    const response = await fetch(url, { redirect: 'manual', signal }).catch((error: unknown) => {
      throw new UploadError(`Download failed: ${error instanceof Error ? error.message : String(error)}`)
    })
    const location = response.headers.get('location')
    if (response.status >= 300 && response.status < 400 && location) {
      url = new URL(location, url)
      continue
    }
    if (!response.ok) throw new UploadError(`Download failed with HTTP ${response.status}`)
    return readCapped(response, maxBytes)
  }
  throw new UploadError('Too many redirects')
}
