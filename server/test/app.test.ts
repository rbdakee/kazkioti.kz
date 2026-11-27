import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, it } from 'node:test'
import { createApp } from '../src/app'
import { createUser, hashPassword } from '../src/auth'
import { openDatabase } from '../src/db'

const PASSWORD = 'correct-horse-battery'

const tractor = (name: string) => ({
  name,
  powerClass: '90',
  heroImage: '/uploads/2026/01/a.jpg',
  subtitle: { ru: 'Трактор', kk: 'Трактор' },
  power: 90,
  driveType: '4×4',
  transmission: '12F+12R',
  transmissionType: { ru: 'Механика', kk: 'Механикалық' },
  fuelTank: 140,
  weight: 4000,
  engineModel: 'X',
  engineCylinders: 4,
  engineDisplacement: 4000,
  engineEcoClass: 'Euro 3',
  fuelType: 'Дизель',
  pto: { ru: '540', kk: '540' },
  lengthMm: 4000,
  widthMm: 2000,
  heightMm: 2700,
})

const attachment = (name: string, compatibleModels: string[] = []) => ({
  name: { ru: name },
  category: 'tillage',
  compatibleModels,
})

const news = (title: string, status: 'draft' | 'published') => ({
  title: { ru: title, kk: title },
  status,
  date: '2026-05-01',
  tag: 'production',
  excerpt: { ru: 'Кратко', kk: 'Қысқаша' },
  body: [{ type: 'text', text: { ru: 'Текст', kk: 'Мәтін' } }],
})

async function setup() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kazkioti-cms-'))
  const db = openDatabase(':memory:')
  createUser(db, 'editor', 'Редактор', await hashPassword(PASSWORD))
  const app = createApp({
    db,
    uploadsDir: path.join(dataDir, 'uploads'),
    staticRoot: dataDir,
    sessionTtlMs: 60_000,
    maxUploadBytes: 1024 * 1024,
    revalidate: { urls: [], secret: '' },
  })
  const login = await app.request('/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ login: 'editor', password: PASSWORD }),
  })
  const { token } = (await login.json()) as { token: string }
  const call = (method: string, url: string, body?: unknown) =>
    app.request(url, {
      method,
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  const callForm = (url: string, form: FormData) =>
    app.request(url, { method: 'POST', headers: { authorization: `Bearer ${token}` }, body: form })
  return { app, call, callForm }
}

describe('CMS API', () => {
  let ctx: Awaited<ReturnType<typeof setup>>
  beforeEach(async () => {
    ctx = await setup()
  })

  it('rejects admin calls without a session', async () => {
    const response = await ctx.app.request('/admin/collections/tractors')
    assert.equal(response.status, 401)
  })

  it('locks a login after repeated wrong passwords', async () => {
    const attempt = () =>
      ctx.app.request('/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ login: 'editor', password: 'wrong' }),
      })
    for (let i = 0; i < 5; i += 1) assert.equal((await attempt()).status, 401)
    assert.equal((await attempt()).status, 429)
  })

  it('generates a Latin slug from a Cyrillic name and keeps it unique', async () => {
    const first = await ctx.call('POST', '/admin/collections/attachments', { data: attachment('Плуг ПН-400') })
    const second = await ctx.call('POST', '/admin/collections/attachments', { data: attachment('Плуг ПН-400') })
    assert.equal(((await first.json()) as { entry: { slug: string } }).entry.slug, 'plug-pn-400')
    assert.equal(((await second.json()) as { entry: { slug: string } }).entry.slug, 'plug-pn-400-2')
  })

  it('returns field-level errors for invalid data', async () => {
    const response = await ctx.call('POST', '/admin/collections/tractors', { data: { name: '' } })
    assert.equal(response.status, 422)
    const body = (await response.json()) as { issues: Array<{ path: string }> }
    assert.ok(body.issues.some((issue) => issue.path === 'name'))
  })

  it('hides draft news from the public API', async () => {
    await ctx.call('POST', '/admin/collections/news', { data: news('Черновик', 'draft') })
    await ctx.call('POST', '/admin/collections/news', { data: news('Опубликовано', 'published') })
    const response = await ctx.app.request('/public/collections/news')
    const entries = (await response.json()) as Array<{ slug: string }>
    assert.deepEqual(entries.map((entry) => entry.slug), ['opublikovano'])
  })

  it('refuses to overwrite a newer version', async () => {
    const created = await ctx.call('POST', '/admin/collections/tractors', { data: tractor('DF 904') })
    const { entry } = (await created.json()) as { entry: { slug: string; version: number } }
    const save = (expectedVersion: number) =>
      ctx.call('PUT', `/admin/collections/tractors/${entry.slug}`, { data: tractor('DF 904'), expectedVersion })
    assert.equal((await save(entry.version)).status, 200)
    assert.equal((await save(entry.version)).status, 409)
  })

  it('removes links to a deleted tractor from attachments', async () => {
    await ctx.call('POST', '/admin/collections/tractors', { data: tractor('DF 904') })
    await ctx.call('POST', '/admin/collections/attachments', { data: attachment('Плуг', ['df-904']) })
    const removed = await ctx.call('DELETE', '/admin/collections/tractors/df-904')
    assert.equal(removed.status, 200)
    const plow = await ctx.call('GET', '/admin/collections/attachments/plug')
    const { data } = (await plow.json()) as { data: { compatibleModels: string[] } }
    assert.deepEqual(data.compatibleModels, [])
  })

  it('accepts real images and rejects disguised files', async () => {
    const upload = (bytes: number[], name: string) => {
      const form = new FormData()
      form.set('file', new File([new Uint8Array(bytes)], name))
      return ctx.callForm('/admin/uploads', form)
    }
    const jpeg = await upload([0xff, 0xd8, 0xff, 0xe0, 0, 0x10], 'photo.jpg')
    assert.equal(jpeg.status, 201)
    const { path: stored } = (await jpeg.json()) as { path: string }
    assert.match(stored, /^\/uploads\/\d{4}\/\d{2}\/[a-f0-9]{24}\.jpg$/)
    const served = await ctx.app.request(stored)
    assert.equal(served.status, 200)
    assert.equal((await upload([0x3c, 0x73, 0x76, 0x67], 'evil.jpg')).status, 400)
  })
})
