import { NextResponse, type NextRequest } from 'next/server'
import { cmsUrl } from '@/lib/cms/client'
import { ADMIN_SESSION_COOKIE } from '@/lib/admin/session'

/** Forwards a photo from the admin to the CMS, adding the editor's session. */
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (!origin || new URL(origin).host !== request.headers.get('host')) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const form = await request.formData()
  const response = await fetch(`${cmsUrl()}/admin/uploads`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}` },
    body: form,
  })
  return NextResponse.json(await response.json().catch(() => ({ error: 'upload' })), { status: response.status })
}
