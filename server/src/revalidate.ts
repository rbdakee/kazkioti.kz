import { cacheTag, type CollectionName, type SettingsKey } from '../../shared/content'

export interface RevalidateTarget {
  urls: readonly string[]
  secret: string
}

const TIMEOUT_MS = 8000

/**
 * Tells the site to drop cached pages for the changed content. Returns false
 * when any site did not confirm, so the editor can be told the change may show late.
 */
export async function revalidateSite(
  target: RevalidateTarget,
  names: ReadonlyArray<CollectionName | SettingsKey>,
): Promise<boolean> {
  if (target.urls.length === 0) return true
  const tags = names.map(cacheTag)
  const results = await Promise.allSettled(
    target.urls.map(async (url) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-revalidate-secret': target.secret },
        body: JSON.stringify({ tags }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
      if (!response.ok) throw new Error(`${url} answered ${response.status}`)
    }),
  )
  const failures = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected')
  for (const failure of failures) console.error('[revalidate]', failure.reason)
  return failures.length === 0
}
