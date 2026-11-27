'use client'

import { useId, useRef, useState, type DragEvent } from 'react'
import { ExternalLink, FileText, Loader2, RefreshCw, Trash2 } from 'lucide-react'
import { MAX_PDF_MB, PdfTooLargeError, uploadPdf } from '@/lib/admin/uploadImage'
import { UI } from '@/lib/admin/i18n'
import { cn } from '@/lib/utils/cn'
import { useT } from '../AdminLang'
import { useToast } from '../Toaster'
import { AdminButton } from '../ui'

interface PdfInputProps {
  value: string | undefined
  /** File the site uses while nothing is uploaded; previewed so editors see what is live. */
  fallback?: string
  onChange: (path: string | undefined) => void
  invalid?: boolean
}

/** One PDF: preview what the site serves now, upload a replacement or go back to the fallback. */
export function PdfInput({ value, fallback, onChange, invalid }: PdfInputProps) {
  const t = useT()
  const toast = useToast()
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const shown = value ?? fallback

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploading(true)
    try {
      onChange(await uploadPdf(file))
    } catch (error) {
      console.error(error)
      toast({ tone: 'error', message: t(error instanceof PdfTooLargeError ? UI.pdfTooLarge(MAX_PDF_MB) : UI.uploadFailed) })
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
      accept="application/pdf"
      className="sr-only"
      onChange={(event) => void handleFile(event.target.files?.[0])}
    />
  )

  if (shown) {
    return (
      <div className="flex max-w-3xl flex-col gap-3">
        <div className="relative h-[480px] overflow-hidden rounded-md border border-border bg-bg-muted">
          <iframe key={shown} src={`${shown}#view=FitH`} title={fileName(shown)} className="h-full w-full" />
          {uploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-auto flex min-w-0 items-center gap-2 text-[13px] text-text-muted">
            <FileText className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{value ? fileName(value) : t(UI.bundledFile)}</span>
          </span>
          {input}
          <AdminButton size="sm" icon={<ExternalLink className="h-3.5 w-3.5" />} onClick={() => window.open(shown, '_blank', 'noopener')}>
            {t(UI.openFile)}
          </AdminButton>
          <AdminButton size="sm" icon={<RefreshCw className="h-3.5 w-3.5" />} loading={uploading} onClick={() => inputRef.current?.click()}>
            {t(UI.replacePhoto)}
          </AdminButton>
          {value ? (
            <AdminButton size="sm" tone="danger" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => onChange(undefined)}>
              {t(UI.remove)}
            </AdminButton>
          ) : null}
        </div>
        <p className="text-[12px] text-text-faint">{t(UI.pdfLimit(MAX_PDF_MB))}</p>
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
        'flex aspect-[16/9] max-w-xl cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed px-6 text-center transition-colors',
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
          <FileText className="h-6 w-6 text-text-faint" aria-hidden="true" />
          <span className="text-[13px] font-semibold text-text-primary">{t(UI.dropPdf)}</span>
          <span className="text-[12px] text-text-faint">{t(UI.pdfLimit(MAX_PDF_MB))}</span>
        </>
      )}
    </label>
  )
}

function fileName(path: string): string {
  return path.split('/').pop() ?? path
}
