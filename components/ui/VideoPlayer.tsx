'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils/cn'

export type VideoPlayerType = 'loop' | 'youtube'

export interface VideoPlayerProps {
  src: string
  poster: string
  alt: string
  type?: VideoPlayerType
  aspectRatio?: string
  className?: string
}

export function VideoPlayer({
  src,
  poster,
  alt,
  type = 'loop',
  aspectRatio = '16 / 9',
  className,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [activated, setActivated] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const match = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(match.matches)
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches)
    match.addEventListener('change', listener)
    return () => match.removeEventListener('change', listener)
  }, [])

  useEffect(() => {
    if (type !== 'loop' || reduced) return
    const node = containerRef.current
    const video = videoRef.current
    if (!node || !video) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        }
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [type, reduced])

  if (type === 'youtube') {
    const embedSrc = toYouTubeEmbed(src)
    return (
      <div
        ref={containerRef}
        className={cn('relative overflow-hidden rounded-lg bg-bg-muted', className)}
        style={{ aspectRatio }}
      >
        {activated ? (
          <iframe
            src={`${embedSrc}?autoplay=1`}
            title={alt}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={alt}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img src={poster} alt={alt} className="h-full w-full object-cover" />
            <span className="absolute flex h-16 w-16 items-center justify-center rounded-full bg-brand-red text-white shadow-card">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden rounded-lg bg-bg-muted', className)}
      style={{ aspectRatio }}
    >
      {reduced ? (
        <img src={poster} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={alt}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  )
}

function toYouTubeEmbed(url: string): string {
  if (url.includes('embed')) return url
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : url
}
