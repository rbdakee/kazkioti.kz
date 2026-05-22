import { cn } from '@/lib/utils/cn'

export interface ImagePlaceholderProps {
  className?: string
}

export function ImagePlaceholder({ className }: ImagePlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'flex h-full w-full items-center justify-center bg-bg-muted text-text-faint',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-1/3 w-1/3 max-h-12 max-w-12"
      >
        <rect x="3" y="4.5" width="18" height="15" rx="1.5" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 17l-5-5-9 9" />
      </svg>
    </div>
  )
}
