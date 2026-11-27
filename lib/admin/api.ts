import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { cmsUrl } from '@/lib/cms/client'
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from './session'

export interface FieldIssue {
  path: string
  message: string
}

/** A non-2xx answer from the CMS other than "signed out". */
export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly issues: FieldIssue[] = [],
    message?: string,
  ) {
    super(message ?? code)
  }
}

export function sessionToken(): string | undefined {
  return cookies().get(ADMIN_SESSION_COOKIE)?.value
}

/**
 * Calls the CMS as the signed-in editor. An expired session sends the editor
 * to the login page; other failures throw AdminApiError.
 */
export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionToken()
  if (!token) redirect(ADMIN_LOGIN_PATH)
  const response = await fetch(`${cmsUrl()}/admin${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      ...(init.body && !(init.body instanceof FormData) ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
      authorization: `Bearer ${token}`,
    },
  })
  if (response.status === 401) redirect(ADMIN_LOGIN_PATH)
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>
  if (!response.ok) {
    throw new AdminApiError(
      response.status,
      typeof body.error === 'string' ? body.error : 'error',
      Array.isArray(body.issues) ? (body.issues as FieldIssue[]) : [],
      typeof body.message === 'string' ? body.message : undefined,
    )
  }
  return body as T
}
