import type { ComponentProps, ReactNode } from 'react'
import { createHeadingIdAssigner } from '@/lib/utils/slugifyHeading'
import { CaseGallery } from './CaseGallery'
import { CaseQuote } from './CaseQuote'
import { CaseStats } from './CaseStats'
import { NewsQuote } from './NewsQuote'
import { NewsStats } from './NewsStats'

function nodeToString(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(nodeToString).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    return nodeToString((children as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

function makeBaseComponents() {
  const assignId = createHeadingIdAssigner()

  function ArticleH2({ children, ...rest }: ComponentProps<'h2'>) {
    const text = nodeToString(children)
    const id = assignId(text)
    return (
      <h2
        id={id}
        className="mt-10 scroll-mt-24 font-heading text-h3 font-medium text-text-primary"
        {...rest}
      >
        {children}
      </h2>
    )
  }

  function ArticleH3({ children, ...rest }: ComponentProps<'h3'>) {
    return (
      <h3
        className="mt-8 font-heading text-body-l font-semibold text-text-primary"
        {...rest}
      >
        {children}
      </h3>
    )
  }

  function ArticleP({ children, ...rest }: ComponentProps<'p'>) {
    return (
      <p className="text-body-l leading-relaxed text-text-muted" {...rest}>
        {children}
      </p>
    )
  }

  function ArticleUL({ children, ...rest }: ComponentProps<'ul'>) {
    return (
      <ul className="ml-5 list-disc text-body-l leading-relaxed text-text-muted" {...rest}>
        {children}
      </ul>
    )
  }

  function ArticleOL({ children, ...rest }: ComponentProps<'ol'>) {
    return (
      <ol className="ml-5 list-decimal text-body-l leading-relaxed text-text-muted" {...rest}>
        {children}
      </ol>
    )
  }

  function ArticleA({ children, ...rest }: ComponentProps<'a'>) {
    return (
      <a className="text-text-primary underline underline-offset-4 hover:text-brand-red" {...rest}>
        {children}
      </a>
    )
  }

  function ArticleStrong({ children, ...rest }: ComponentProps<'strong'>) {
    return (
      <strong className="font-semibold text-text-primary" {...rest}>
        {children}
      </strong>
    )
  }

  return { h2: ArticleH2, h3: ArticleH3, p: ArticleP, ul: ArticleUL, ol: ArticleOL, a: ArticleA, strong: ArticleStrong }
}

export function buildNewsArticleComponents() {
  return { ...makeBaseComponents(), NewsStats, NewsQuote }
}

export function buildCaseArticleComponents() {
  return { ...makeBaseComponents(), CaseStats, CaseQuote, CaseGallery }
}
