import { cn } from '@/lib/utils/cn'

export interface CaseGalleryImage {
  src: string
  alt: string
  caption?: string
}

export interface CaseGalleryProps {
  images: ReadonlyArray<CaseGalleryImage>
  className?: string
}

export function CaseGallery({ images, className }: CaseGalleryProps) {
  if (images.length === 0) return null
  return (
    <div className={cn('my-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {images.map((image, index) => (
        <figure
          key={`${image.src}-${index}`}
          className="m-0 overflow-hidden rounded-sm bg-bg-muted"
        >
          <div className="relative aspect-[4/3]">
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              width={1200}
              height={900}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          {image.caption ? (
            <figcaption className="mt-2 font-mono text-mono-label uppercase tracking-widest text-text-muted">
              {image.caption}
            </figcaption>
          ) : null}
        </figure>
      ))}
    </div>
  )
}
