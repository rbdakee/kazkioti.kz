'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Bot, Check, Copy, Plus, Trash2 } from 'lucide-react'
import { createTokenAction, deleteTokenAction, type CreatedToken } from '@/app/admin/actions'
import { formatAdminDateTime } from '@/lib/admin/formatDate'
import { mcpAgentInstructions } from '@/lib/admin/mcpSetup'
import { UI } from '@/lib/admin/i18n'
import { useT } from './AdminLang'
import { ConfirmDialog } from './ConfirmDialog'
import { useToast } from './Toaster'
import { AdminButton, Card, FieldShell, IconButton, TextInput } from './ui'

export interface ApiTokenRow {
  id: number
  name: string
  userName: string
  createdAt: string
  lastUsedAt: string | null
}

/** Copies a value without showing it, so secrets stay off the screen. */
function CopyButton({ value, label, tone }: { value: string; label: string; tone?: 'primary' | 'secondary' }) {
  const t = useT()
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AdminButton
      size="sm"
      tone={tone}
      onClick={() => void copy()}
      icon={copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
    >
      {copied ? t(UI.copied) : label}
    </AdminButton>
  )
}

/** First and last characters only: enough to tell tokens apart. */
function maskToken(token: string): string {
  return `${token.slice(0, 8)}…${token.slice(-4)}`
}

export function ApiTokensManager({ tokens, mcpUrl }: { tokens: ApiTokenRow[]; mcpUrl: string }) {
  const t = useT()
  const toast = useToast()
  const router = useRouter()
  const [busy, setBusy] = useState<'create' | 'delete' | null>(null)
  const [created, setCreated] = useState<CreatedToken | null>(null)
  const [pendingDelete, setPendingDelete] = useState<ApiTokenRow | null>(null)

  async function createToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setBusy('create')
    const result = await createTokenAction(String(new FormData(form).get('name') ?? ''))
    setBusy(null)
    if (result.ok) {
      form.reset()
      setCreated(result.data)
      router.refresh()
    } else {
      toast({
        tone: 'error',
        message: result.error === 'validation' ? t(UI.fixErrors) : t(UI.genericError),
      })
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setBusy('delete')
    const result = await deleteTokenAction(pendingDelete.id)
    setBusy(null)
    setPendingDelete(null)
    if (result.ok) router.refresh()
    else toast({ tone: 'error', message: t(UI.genericError) })
  }

  const instructions = mcpAgentInstructions(mcpUrl)

  return (
    <Card
      title={t(UI.mcpAccess)}
      description={t(UI.mcpDescription)}
      actions={created ? null : <CopyButton value={instructions} label={t(UI.mcpCopyInstructions)} />}
    >
      <div className="flex flex-col gap-6">
        {created ? (
          <div className="flex flex-col gap-4 rounded-md border border-amber-200 bg-amber-50/60 p-4">
            <p className="text-[13px] font-semibold text-amber-800">
              {created.name}: {t(UI.mcpTokenShownOnce)}
            </p>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-text-primary">{t(UI.mcpStepInstructions)}</p>
              <div className="self-start">
                <CopyButton value={instructions} label={t(UI.mcpCopyInstructions)} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] text-text-primary">{t(UI.mcpStepToken)}</p>
              <div className="flex flex-wrap items-center gap-3">
                <CopyButton value={created.token} label={t(UI.mcpCopyToken)} tone="primary" />
                <code className="font-mono text-[12px] text-text-muted">{maskToken(created.token)}</code>
              </div>
            </div>
            <details className="rounded-md border border-amber-200/70 bg-white/60 px-3 py-2 text-[13px]">
              <summary className="cursor-pointer font-semibold text-text-primary">{t(UI.mcpBrowserTitle)}</summary>
              <div className="mt-2 flex flex-col gap-2">
                <p className="text-text-muted">{t(UI.mcpBrowserHint)}</p>
                <div className="self-start">
                  <CopyButton value={`${mcpUrl}/${created.token}`} label={t(UI.mcpCopyLink)} />
                </div>
              </div>
            </details>
            <AdminButton size="sm" className="self-start" onClick={() => setCreated(null)}>
              {t(UI.done)}
            </AdminButton>
          </div>
        ) : null}

        {tokens.length === 0 ? (
          <p className="text-[13px] text-text-muted">{t(UI.mcpNoTokens)}</p>
        ) : (
          <ul className="-my-2 divide-y divide-border">
            {tokens.map((token) => (
              <li key={token.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bg-muted">
                  <Bot className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[14px] font-semibold">{token.name}</span>
                  <span className="truncate text-[12px] text-text-muted">
                    {token.userName} · {t(UI.mcpCreated)} {formatAdminDateTime(token.createdAt)} ·{' '}
                    {token.lastUsedAt
                      ? `${t(UI.mcpLastUsed)} ${formatAdminDateTime(token.lastUsedAt)}`
                      : t(UI.mcpNeverUsed)}
                  </span>
                </span>
                <IconButton
                  label={t(UI.mcpRevoke)}
                  onClick={() => setPendingDelete(token)}
                  className="hover:text-brand-red"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}

        <form
          onSubmit={(event) => void createToken(event)}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <FieldShell label={t(UI.mcpTokenName)} htmlFor="token-name" required className="flex-1">
            <TextInput id="token-name" name="name" required maxLength={100} autoComplete="off" />
          </FieldShell>
          <AdminButton
            type="submit"
            tone="primary"
            loading={busy === 'create'}
            icon={<Plus className="h-4 w-4" />}
          >
            {t(UI.mcpCreateToken)}
          </AdminButton>
        </form>
      </div>
      <ConfirmDialog
        open={pendingDelete !== null}
        title={`${t(UI.mcpRevoke)}: ${pendingDelete?.name ?? ''}?`}
        description={t(UI.mcpRevokeDescription)}
        confirmLabel={t(UI.mcpRevoke)}
        cancelLabel={t(UI.cancel)}
        busy={busy === 'delete'}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </Card>
  )
}
