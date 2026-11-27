'use server'

import { cookies, headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { cmsUrl } from '@/lib/cms/client'
import { AdminApiError, adminFetch, sessionToken, type FieldIssue } from '@/lib/admin/api'
import { isAdminLang } from '@/lib/admin/i18n'
import { ADMIN_LANG_COOKIE, ADMIN_LOGIN_PATH, ADMIN_SESSION_COOKIE } from '@/lib/admin/session'
import {
  COLLECTION_NAMES,
  SETTINGS_KEYS,
  type CollectionName,
  type SettingsKey,
  type StoredEntry,
} from '@/shared/content'
import { SLUG_PATTERN } from '@/shared/slugify'

export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: 'validation' | 'conflict' | 'not_found' | 'error'; message?: string; issues?: FieldIssue[] }

export interface SaveResult {
  entry: StoredEntry<unknown>
  revalidated: boolean
}

/** Turns CMS errors into a result the form can show; lets redirects through. */
async function run<T>(action: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await action() }
  } catch (error) {
    if (!(error instanceof AdminApiError)) throw error
    if (error.code === 'validation') return { ok: false, error: 'validation', issues: error.issues }
    if (error.status === 409) return { ok: false, error: 'conflict', message: error.message }
    if (error.status === 404) return { ok: false, error: 'not_found' }
    console.error('[admin]', error.status, error.code, error.message)
    return { ok: false, error: 'error', message: error.message }
  }
}

function collectionName(value: string): CollectionName {
  if (!COLLECTION_NAMES.includes(value as CollectionName)) throw new Error(`Unknown collection ${value}`)
  return value as CollectionName
}

function settingsKey(value: string): SettingsKey {
  if (!SETTINGS_KEYS.includes(value as SettingsKey)) throw new Error(`Unknown settings ${value}`)
  return value as SettingsKey
}

function slugParam(value: string): string {
  if (!SLUG_PATTERN.test(value)) throw new Error(`Invalid slug ${value}`)
  return value
}

const expectedVersionSchema = z.number().int().positive().optional()

// ---- Session -----------------------------------------------------------------

export interface LoginState {
  error?: 'invalid' | 'throttled' | 'unavailable'
}

const LoginSchema = z.object({ login: z.string().trim().min(1).max(64), password: z.string().min(1).max(200) })

export async function loginAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = LoginSchema.safeParse({ login: formData.get('login'), password: formData.get('password') })
  if (!parsed.success) return { error: 'invalid' }
  let response: Response
  try {
    response = await fetch(`${cmsUrl()}/auth/login`, {
      method: 'POST',
      cache: 'no-store',
      headers: {
        'content-type': 'application/json',
        'x-forwarded-for': headers().get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
      },
      body: JSON.stringify(parsed.data),
    })
  } catch (error) {
    console.error('[admin] login failed to reach CMS', error)
    return { error: 'unavailable' }
  }
  if (response.status === 429) return { error: 'throttled' }
  if (response.status === 401) return { error: 'invalid' }
  if (!response.ok) return { error: 'unavailable' }
  const { token, expiresAt } = z.object({ token: z.string(), expiresAt: z.number() }).parse(await response.json())
  cookies().set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
  redirect('/admin')
}

export async function logoutAction(): Promise<void> {
  if (sessionToken()) await adminFetch('/logout', { method: 'POST' }).catch(() => undefined)
  cookies().delete(ADMIN_SESSION_COOKIE)
  redirect(ADMIN_LOGIN_PATH)
}

export async function setAdminLangAction(lang: string): Promise<void> {
  if (!isAdminLang(lang)) return
  cookies().set(ADMIN_LANG_COOKIE, lang, { path: '/admin', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  revalidatePath('/admin', 'layout')
}

// ---- Content -----------------------------------------------------------------

export async function saveEntryAction(
  collection: string,
  slug: string | null,
  data: unknown,
  expectedVersion?: number,
): Promise<ActionResult<SaveResult>> {
  const name = collectionName(collection)
  const version = expectedVersionSchema.parse(expectedVersion)
  const result = await run(() =>
    slug === null
      ? adminFetch<SaveResult>(`/collections/${name}`, { method: 'POST', body: JSON.stringify({ data }) })
      : adminFetch<SaveResult>(`/collections/${name}/${slugParam(slug)}`, {
          method: 'PUT',
          body: JSON.stringify({ data, expectedVersion: version }),
        }),
  )
  if (result.ok) revalidatePath('/admin', 'layout')
  return result
}

export async function deleteEntryAction(collection: string, slug: string): Promise<ActionResult<{ revalidated: boolean }>> {
  const name = collectionName(collection)
  const result = await run(() =>
    adminFetch<{ revalidated: boolean }>(`/collections/${name}/${slugParam(slug)}`, { method: 'DELETE' }),
  )
  if (result.ok) revalidatePath('/admin', 'layout')
  return result
}

export async function saveSettingsAction(
  key: string,
  data: unknown,
  expectedVersion?: number,
): Promise<ActionResult<SaveResult>> {
  const settings = settingsKey(key)
  const version = expectedVersionSchema.parse(expectedVersion)
  const result = await run(() =>
    adminFetch<SaveResult>(`/settings/${settings}`, {
      method: 'PUT',
      body: JSON.stringify({ data, expectedVersion: version }),
    }),
  )
  if (result.ok) revalidatePath('/admin', 'layout')
  return result
}

// ---- Users -------------------------------------------------------------------

export async function createUserAction(input: { login: string; name: string; password: string }): Promise<ActionResult> {
  const result = await run(async () => {
    await adminFetch('/users', { method: 'POST', body: JSON.stringify(input) })
    return undefined
  })
  if (result.ok) revalidatePath('/admin/users')
  return result
}

export async function deleteUserAction(id: number): Promise<ActionResult> {
  const userId = z.number().int().positive().parse(id)
  const result = await run(async () => {
    await adminFetch(`/users/${userId}`, { method: 'DELETE' })
    return undefined
  })
  if (result.ok) revalidatePath('/admin/users')
  return result
}

export async function changePasswordAction(input: { currentPassword: string; newPassword: string }): Promise<ActionResult> {
  const result = await run(async () => {
    await adminFetch('/me/password', { method: 'PUT', body: JSON.stringify(input) })
    return undefined
  })
  // The CMS signs the user out everywhere after a password change.
  if (result.ok) cookies().delete(ADMIN_SESSION_COOKIE)
  return result
}
