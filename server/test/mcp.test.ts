import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { beforeEach, describe, it } from 'node:test'
import { createApp } from '../src/app'
import { createUser, hashPassword } from '../src/auth'
import { openDatabase } from '../src/db'
import { isPrivateAddress } from '../src/remoteImage'

const PASSWORD = 'correct-horse-battery'
const PNG_1PX =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

interface ToolResult {
  isError?: boolean
  content: Array<{ type: string; text: string }>
}

async function setup() {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'kazkioti-mcp-'))
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
  const { token: session } = (await login.json()) as { token: string }
  const admin = (method: string, url: string, body?: unknown) =>
    app.request(`/admin${url}`, {
      method,
      headers: { authorization: `Bearer ${session}`, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  const created = await admin('POST', '/tokens', { name: 'Claude' })
  const { token, id: tokenId } = (await created.json()) as { token: string; id: number }

  let nextId = 1
  const rpc = (method: string, params: unknown, url = '/mcp', headers: Record<string, string> = { authorization: `Bearer ${token}` }) =>
    app.request(url, {
      method: 'POST',
      headers: { ...headers, 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: nextId++, method, params }),
    })
  const callTool = async (name: string, args: unknown): Promise<ToolResult> => {
    const response = await rpc('tools/call', { name, arguments: args })
    assert.equal(response.status, 200)
    const body = (await response.json()) as { result: ToolResult }
    return body.result
  }
  const parse = (result: ToolResult) => JSON.parse(result.content[0]?.text ?? 'null') as Record<string, unknown>
  return { admin, rpc, callTool, parse, token, tokenId }
}

const newsData = {
  title: { ru: 'Новая поставка', kk: 'Жаңа жеткізілім' },
  date: '2026-11-27',
  tag: 'delivery',
  excerpt: { ru: 'Кратко', kk: 'Қысқаша' },
  body: [{ type: 'text', text: { ru: 'Текст', kk: 'Мәтін' } }],
}

describe('MCP', () => {
  let ctx: Awaited<ReturnType<typeof setup>>
  beforeEach(async () => {
    ctx = await setup()
  })

  it('refuses requests without a valid API token', async () => {
    assert.equal((await ctx.rpc('tools/list', {}, '/mcp', {})).status, 401)
    assert.equal((await ctx.rpc('tools/list', {}, '/mcp', { authorization: 'Bearer kzk_wrong' })).status, 401)
    assert.equal((await ctx.rpc('tools/list', {}, '/mcp/not-a-token', {})).status, 401)
  })

  it('accepts the token in the path and lists the tools', async () => {
    const response = await ctx.rpc('tools/list', {}, `/mcp/${ctx.token}`, {})
    assert.equal(response.status, 200)
    const { result } = (await response.json()) as { result: { tools: Array<{ name: string }> } }
    const names = result.tools.map((tool) => tool.name)
    for (const name of ['list_entries', 'create_news', 'update_tractor', 'delete_entry', 'upload_image', 'update_dealers']) {
      assert.ok(names.includes(name), `missing ${name}`)
    }
  })

  it('creates a news draft and edits only the changed fields', async () => {
    const created = ctx.parse(await ctx.callTool('create_news', { data: newsData }))
    const entry = created.entry as { slug: string; version: number; data: { status: string } }
    assert.equal(entry.slug, 'novaya-postavka')
    assert.equal(entry.data.status, 'draft')

    const updated = ctx.parse(await ctx.callTool('update_news', { slug: entry.slug, changes: { status: 'published' } }))
    const after = updated.entry as { version: number; data: { status: string; title: { ru: string } } }
    assert.equal(after.data.status, 'published')
    assert.equal(after.data.title.ru, 'Новая поставка')
    assert.equal(after.version, entry.version + 1)

    const list = JSON.parse((await ctx.callTool('list_entries', { collection: 'news' })).content[0]?.text ?? '[]') as Array<{ slug: string; status: string }>
    assert.deepEqual(list.map(({ slug, status }) => ({ slug, status })), [{ slug: 'novaya-postavka', status: 'published' }])
  })

  it('reports validation errors and stale versions as tool errors', async () => {
    const invalid = await ctx.callTool('create_news', { data: { ...newsData, date: 'tomorrow' } })
    assert.equal(invalid.isError, true)

    const { entry } = ctx.parse(await ctx.callTool('create_news', { data: newsData })) as { entry: { slug: string } }
    const stale = await ctx.callTool('update_news', { slug: entry.slug, changes: { tag: 'lineup' }, expectedVersion: 99 })
    assert.equal(stale.isError, true)
    assert.match(stale.content[0]?.text ?? '', /changed by/)
  })

  it('uploads a base64 image and refuses private links', async () => {
    const uploaded = ctx.parse(await ctx.callTool('upload_image', { base64: `data:image/png;base64,${PNG_1PX}` }))
    assert.match(String(uploaded.path), /^\/uploads\/\d{4}\/\d{2}\/[0-9a-f]{24}\.png$/)

    const local = await ctx.callTool('upload_image', { url: 'http://127.0.0.1:4000/health' })
    assert.equal(local.isError, true)
    assert.match(local.content[0]?.text ?? '', /not reachable/)
  })

  it('stops working once the token is revoked', async () => {
    assert.equal((await ctx.admin('DELETE', `/tokens/${ctx.tokenId}`)).status, 200)
    assert.equal((await ctx.rpc('tools/list', {})).status, 401)
  })
})

describe('isPrivateAddress', () => {
  it('blocks loopback and private networks', () => {
    for (const address of ['127.0.0.1', '10.1.2.3', '172.16.0.1', '192.168.1.1', '169.254.169.254', '::1', 'fd00::1', '::ffff:127.0.0.1', 'not-an-ip']) {
      assert.equal(isPrivateAddress(address), true, address)
    }
  })

  it('allows public addresses', () => {
    for (const address of ['8.8.8.8', '216.198.79.1', '80.247.207.58', '2606:4700::1111', '::ffff:8.8.8.8']) {
      assert.equal(isPrivateAddress(address), false, address)
    }
  })
})
