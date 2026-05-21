'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export interface ArticleShareRowProps {
  url: string
  title: string
  labels: {
    share: string
    linkedin: string
    whatsapp: string
    telegram: string
    copy: string
    copied: string
  }
  className?: string
}

export function ArticleShareRow({ url, title, labels, className }: ArticleShareRowProps) {
  const [absoluteUrl, setAbsoluteUrl] = useState(url)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      setAbsoluteUrl(new URL(url, window.location.origin).toString())
    } catch {
      setAbsoluteUrl(url)
    }
  }, [url])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2400)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl)
        setCopied(true)
        return
      }
      const textarea = document.createElement('textarea')
      textarea.value = absoluteUrl
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(ok)
    } catch {
      setCopied(false)
    }
  }, [absoluteUrl])

  const encodedUrl = encodeURIComponent(absoluteUrl)
  const encodedTitle = encodeURIComponent(title)
  const linkClass =
    'rounded-pill border border-border-strong px-3 py-1 font-mono text-mono-label uppercase tracking-widest text-text-primary transition-colors hover:border-text-primary hover:bg-bg-muted'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 border-t border-border pt-6',
        className,
      )}
    >
      <span className="font-mono text-mono-label uppercase tracking-widest text-text-muted">
        {labels.share}
      </span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label={labels.linkedin}
      >
        {labels.linkedin}
      </a>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label={labels.whatsapp}
      >
        {labels.whatsapp}
      </a>
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        aria-label={labels.telegram}
      >
        {labels.telegram}
      </a>
      <button
        type="button"
        onClick={handleCopy}
        className={linkClass}
        aria-live="polite"
      >
        {copied ? labels.copied : labels.copy}
      </button>
    </div>
  )
}
