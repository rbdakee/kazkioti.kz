'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight, ExternalLink, Save, Trash2 } from 'lucide-react'
import { COLLECTIONS, SETTINGS, type CollectionName, type SettingsKey } from '@/shared/content'
import { deleteEntryAction, saveEntryAction, saveSettingsAction, type ActionResult, type SaveResult } from '@/app/admin/actions'
import { COLLECTION_FORMS } from '@/lib/admin/forms'
import { issuesToErrors } from '@/lib/admin/forms/issues'
import { formatAdminDateTime } from '@/lib/admin/formatDate'
import { setIn, type Path } from '@/lib/admin/forms/paths'
import { SETTINGS_FORMS } from '@/lib/admin/forms/settingsForms'
import type { Doc, FormConfig } from '@/lib/admin/forms/types'
import { UI } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useAdminLang, useT } from './AdminLang'
import { ConfirmDialog } from './ConfirmDialog'
import { FormContext, type RelationIndex } from './FormContext'
import { FieldGrid } from './fields/FieldRenderer'
import { useToast } from './Toaster'
import { AdminButton, Card } from './ui'

export type EditorTarget =
  | { kind: 'collection'; collection: CollectionName; slug: string | null }
  | { kind: 'settings'; key: SettingsKey }

export interface EntryEditorProps {
  target: EditorTarget
  initial: Doc
  version?: number
  updatedAt?: string
  updatedBy?: string | null
  relations?: RelationIndex
}

export function EntryEditor({ target, initial, version: initialVersion, updatedAt, updatedBy, relations = {} }: EntryEditorProps) {
  const t = useT()
  const { lang } = useAdminLang()
  const router = useRouter()
  const toast = useToast()

  const collectionForm = target.kind === 'collection' ? COLLECTION_FORMS[target.collection] : undefined
  const settingsForm = target.kind === 'settings' ? SETTINGS_FORMS[target.key] : undefined
  const form: FormConfig = (collectionForm ?? settingsForm) as FormConfig
  const schema = target.kind === 'collection' ? COLLECTIONS[target.collection].schema : SETTINGS[target.key]
  const slug = target.kind === 'collection' ? target.slug : null
  const isNew = target.kind === 'collection' && slug === null

  const [doc, setDoc] = useState<Doc>(initial)
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial))
  const [version, setVersion] = useState(initialVersion)
  const [meta, setMeta] = useState({ updatedAt, updatedBy })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const dirty = useMemo(() => JSON.stringify(doc) !== baseline, [doc, baseline])

  const setValue = useCallback((path: Path, value: unknown) => {
    setDoc((current) => setIn(current, path, value))
    setErrors((current) => {
      const key = path.join('.')
      if (!Object.keys(current).some((errorKey) => errorKey === key || errorKey.startsWith(`${key}.`))) return current
      return Object.fromEntries(Object.entries(current).filter(([errorKey]) => errorKey !== key && !errorKey.startsWith(`${key}.`)))
    })
  }, [])

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!dirty) return
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  function showErrors(next: Record<string, string>) {
    setErrors(next)
    toast({ tone: 'error', message: t(UI.fixErrors) })
    requestAnimationFrame(() => {
      document.querySelector('[data-field-error="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }

  async function save() {
    if (saving) return
    const check = schema.safeParse(doc)
    if (!check.success) {
      showErrors(issuesToErrors(check.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })), lang))
      return
    }
    setSaving(true)
    let result: ActionResult<SaveResult>
    try {
      result =
        target.kind === 'collection'
          ? await saveEntryAction(target.collection, slug, doc, version)
          : await saveSettingsAction(target.key, doc, version)
    } catch (error) {
      console.error(error)
      toast({ tone: 'error', message: t(UI.genericError) })
      setSaving(false)
      return
    }
    setSaving(false)
    if (!result.ok) {
      if (result.error === 'validation') showErrors(issuesToErrors(result.issues ?? [], lang))
      else if (result.error === 'conflict') toast({ tone: 'error', message: t(UI.conflict), action: { label: t(UI.reload), onClick: () => window.location.reload() } })
      else toast({ tone: 'error', message: t(UI.genericError) })
      return
    }
    const { entry, revalidated } = result.data
    const saved = entry.data as Doc
    setDoc(saved)
    setBaseline(JSON.stringify(saved))
    setVersion(entry.version)
    setMeta({ updatedAt: entry.updatedAt, updatedBy: entry.updatedBy })
    setErrors({})
    toast(revalidated ? { tone: 'success', message: t(UI.saved) } : { tone: 'warning', message: t(UI.savedLate) })
    if (isNew && target.kind === 'collection') router.replace(`/admin/${target.collection}/${entry.slug}`)
    else router.refresh()
  }

  // Cmd/Ctrl+S saves.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        void save()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  async function remove() {
    if (target.kind !== 'collection' || !slug) return
    setDeleting(true)
    const result = await deleteEntryAction(target.collection, slug).catch(() => null)
    setDeleting(false)
    setConfirmDelete(false)
    if (!result?.ok) {
      toast({ tone: 'error', message: t(UI.genericError) })
      return
    }
    setBaseline(JSON.stringify(doc))
    toast({ tone: 'success', message: t(UI.deleted) })
    router.push(`/admin/${target.collection}`)
    router.refresh()
  }

  const listHref = target.kind === 'collection' ? `/admin/${target.collection}` : '/admin'
  const listLabel = collectionForm ? t(collectionForm.plural) : t(UI.company)
  const title = collectionForm
    ? collectionForm.titleOf(doc) || `${t(collectionForm.singular)} — ${t(UI.create).toLowerCase()}`
    : settingsForm
      ? t(settingsForm.title)
      : ''
  const sitePath = collectionForm?.sitePath && slug ? collectionForm.sitePath(slug) : settingsForm?.sitePath
  const siteHref = sitePath ? `/${lang === 'kk' ? 'kk' : 'ru'}${sitePath}` : undefined

  const saveButton = (
    <AdminButton tone="primary" loading={saving} icon={<Save className="h-4 w-4" />} onClick={() => void save()} disabled={!dirty && !isNew} className="w-full">
      {saving ? t(UI.saving) : isNew ? t(UI.create) : t(UI.save)}
    </AdminButton>
  )

  return (
    <FormContext.Provider value={{ doc, setValue, errors, relations, currentSlug: slug }}>
      <div className="flex flex-col gap-6 pb-24 lg:pb-0">
        <header className="flex flex-col gap-3">
          <nav className="flex items-center gap-1 text-[13px] text-text-muted">
            <Link href={listHref} className="hover:text-text-primary">
              {listLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-text-faint" />
            <span className="truncate text-text-primary">{title}</span>
          </nav>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-heading text-[26px] font-bold leading-tight text-text-primary">{title}</h1>
            {siteHref && !isNew ? (
              <a href={siteHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-text-muted hover:text-text-primary">
                {t(UI.viewOnSite)}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
          {settingsForm ? <p className="text-[14px] text-text-muted">{t(settingsForm.description)}</p> : null}
        </header>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="flex min-w-0 flex-col gap-6">
            {form.sections.map((section) => (
              <Card key={section.title.ru} title={t(section.title)} description={section.description ? t(section.description) : undefined}>
                <FieldGrid fields={section.fields} />
              </Card>
            ))}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="rounded-lg border border-border bg-white p-5 shadow-[0_1px_2px_rgba(15,15,15,0.04)]">
              <div className="mb-4 flex items-center gap-2 text-[13px]">
                <span className={cn('h-2 w-2 rounded-full', dirty ? 'bg-amber-500' : 'bg-emerald-500')} aria-hidden="true" />
                <span className="text-text-muted">{dirty ? t(UI.unsaved) : t(UI.allSaved)}</span>
              </div>
              {form.sidebar ? (
                <div className="mb-5 flex flex-col gap-4">
                  <FieldGrid fields={form.sidebar} />
                </div>
              ) : null}
              <div className="hidden lg:block">{saveButton}</div>
              <p className="mt-2 hidden text-center text-[11px] text-text-faint lg:block">⌘S / Ctrl+S</p>
              {slug ? (
                <dl className="mt-5 flex flex-col gap-3 border-t border-border pt-4 text-[13px]">
                  <div>
                    <dt className="text-text-faint">{t(UI.pageAddress)}</dt>
                    <dd className="mt-0.5 break-all font-mono text-[12px] text-text-primary">{sitePath ?? slug}</dd>
                    <dd className="mt-1 text-[11px] leading-snug text-text-faint">{t(UI.pageAddressHint)}</dd>
                  </div>
                </dl>
              ) : null}
              {meta.updatedAt ? (
                <p className="mt-4 border-t border-border pt-4 text-[12px] text-text-faint">
                  {t(UI.updated)}: {formatAdminDateTime(meta.updatedAt)}
                  {meta.updatedBy ? ` · ${meta.updatedBy}` : ''}
                </p>
              ) : null}
            </div>
            {slug ? (
              <AdminButton tone="danger" icon={<Trash2 className="h-4 w-4" />} onClick={() => setConfirmDelete(true)} className="self-start">
                {t(UI.delete)}
              </AdminButton>
            ) : null}
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <span className={cn('h-2 w-2 shrink-0 rounded-full', dirty ? 'bg-amber-500' : 'bg-emerald-500')} aria-hidden="true" />
        <span className="flex-1 truncate text-[13px] text-text-muted">{dirty ? t(UI.unsaved) : t(UI.allSaved)}</span>
        <div className="w-40">{saveButton}</div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t(UI.confirmDelete)}
        description={t(UI.confirmDeleteHint)}
        confirmLabel={t(UI.delete)}
        cancelLabel={t(UI.cancel)}
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setConfirmDelete(false)}
      />
    </FormContext.Provider>
  )
}

