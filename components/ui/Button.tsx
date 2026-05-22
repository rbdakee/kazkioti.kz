import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onDark'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-red text-white font-semibold hover:bg-brand-red-hover focus-visible:ring-brand-red border border-transparent',
  secondary:
    'bg-transparent text-text-primary border border-border-strong hover:border-text-primary hover:bg-bg-muted focus-visible:ring-text-primary',
  ghost:
    'bg-transparent text-text-primary border border-transparent hover:bg-bg-muted focus-visible:ring-text-primary',
  onDark:
    'bg-transparent text-white border border-white/70 hover:bg-white/10 hover:border-white focus-visible:ring-white',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-body-s',
  md: 'h-11 px-5 text-body-m',
  lg: 'h-14 px-7 text-body-l',
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-medium transition-all duration-250 ease-kk select-none disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 hover:-translate-y-px active:scale-[0.98]'

interface CommonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  className?: string
  children: ReactNode
}

export type ButtonProps =
  | (CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { asLink?: false })
  | (CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { asLink: true; href: string })

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', loading, className, children, ...rest } = props
  const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className)

  if (props.asLink) {
    const { asLink: _asLink, ...anchorProps } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & {
      asLink?: boolean
    }
    return (
      <a className={classes} {...anchorProps}>
        {loading ? <Spinner /> : null}
        {children}
      </a>
    )
  }

  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <button className={classes} disabled={loading || buttonProps.disabled} {...buttonProps}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

function Spinner() {
  return (
    <span
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      aria-hidden="true"
    />
  )
}
