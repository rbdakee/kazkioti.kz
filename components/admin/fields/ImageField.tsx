'use client'

import { useId, useRef, useState, type DragEvent } from 'react'
import { ImagePlus, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { ACCEPT_ATTRIBUTE, uploadImage } from '@/lib/admin/uploadImage'
import { UI } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useT } from '../AdminLang'
import { useToast } from '../Toaster'
import { AdminButton } from '../ui'

interface ImageDropProps {
  value: string | undefined
  onChange: (path: string | undefined) => void
  invalid?: boolean
  compact?: boolean
}

/** Single photo: drop or pick a file, see a preview, replace or remove it. */
export function ImageDrop({ value, onChange, invalid, compact }: ImageDropProps) {
  const t = useT()
  const toast = useToast()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      onChange(await uploadImage(file))
    } catch (error) {
      console.error(error)
      toast({ tone: 'error', message: t(UI.uploadFailed) })
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    void handleFile(event.dataTransfer.files[0])
  }

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      accept={ACCEPT_ATTRIBUTE}
      className="sr-only"
      onChange={(event) => void handleFile(event.target.files?.[0])}
    />
  )

  if (value) {
    return (
      <div className={cn('group relative overflow-hidden rounded-md border border-border bg-bg-muted', compact ? 'aspect-[4/3]' : 'aspect-[16/9] max-w-xl')}>
        <img src={value} alt="" className="h-full w-full object-contain" />
        {uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          </div>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          {input}
          <AdminButton size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} onClick={() => inputRef.current?.click()}>
            {t(UI.replacePhoto)}
          </AdminButton>
          <AdminButton size="sm" className="bg-white" tone="danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onChange(undefined)}>
            {t(UI.remove)}
          </AdminButton>
        </div>
      </div>
    )
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 text-center transition-colors',
        compact ? 'aspect-[4/3]' : 'aspect-[16/9] max-w-xl',
        dragging ? 'border-brand-blue bg-brand-blue-soft' : invalid ? 'border-brand-red/60 bg-brand-red/[0.03]' : 'border-black/15 bg-bg-soft hover:border-black/30 hover:bg-white',
      )}
    >
      {input}
      {uploading ? (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
          <span className="text-[13px] text-text-muted">{t(UI.uploading)}</span>
        </>
      ) : (
        <>
          <ImagePlus className="h-6 w-6 text-text-faint" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-text-primary">{t(compact ? UI.uploadPhoto : UI.dropPhoto)}</span>
          {compact ? null : <span className="text-[12px] text-text-faint">{t(UI.photoFormats)}</span>}
        </>
      )}
    </label>
  )
}

/** Several photos in a grid; order matters on the site. */
export function GalleryInput({ value, onChange }: { value: string[]; onChange: (paths: string[]) => void }) {
  const t = useT()
  const toast = useToast()
  const inputId = useId()
  const [uploading, setUploading] = useState(0)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    const list = Array.from(files)
    setUploading(list.length)
    const uploaded: string[] = []
    for (const file of list) {
      try {
        uploaded.push(await uploadImage(file))
      } catch (error) {
        console.error(error)
        toast({ tone: 'error', message: `${t(UI.uploadFailed)}: ${file.name}` })
      }
      setUploading((count) => count - 1)
    }
    onChange([...value, ...uploaded])
  }

  function move(index: number, delta: number) {
    const next = [...value]
    const [item] = next.splice(index, 1)
    if (item === undefined) return
    next.splice(index + delta, 0, item)
    onChange(next)
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {value.map((path, index) => (
        <div key={`${path}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-bg-muted">
          <img src={path} alt="" className="h-full w-full object-cover" />
          <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] text-white">{index + 1}</span>
          <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-black/60 to-transparent p-2 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <div className="flex gap-1">
              <button type="button" disabled={index === 0} onClick={() => move(index, -1)} className="rounded bg-white/90 px-2 text-[12px] font-semibold disabled:opacity-40" aria-label={t(UI.moveUp)}>
                ←
              </button>
              <button type="button" disabled={index === value.length - 1} onClick={() => move(index, 1)} className="rounded bg-white/90 px-2 text-[12px] font-semibold disabled:opacity-40" aria-label={t(UI.moveDown)}>
                →
              </button>
            </div>
            <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="rounded bg-white/90 p-1 text-brand-red" aria-label={t(UI.remove)}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
      <label
        htmlFor={inputId}
        className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-black/15 bg-bg-soft text-center transition-colors hover:border-black/30 hover:bg-white"
      >
        <input id={inputId} type="file" multiple accept={ACCEPT_ATTRIBUTE} className="sr-only" onChange={(event) => void handleFiles(event.target.files)} />
        {uploading > 0 ? <Loader2 className="h-5 w-5 animate-spin text-text-muted" /> : <ImagePlus className="h-5 w-5 text-text-faint" />}
        <span className="text-[12px] font-semibold text-text-muted">{uploading > 0 ? t(UI.uploading) : t(UI.add)}</span>
      </label>
    </div>
  )
}
