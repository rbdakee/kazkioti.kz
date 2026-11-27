import { MDXRemote } from 'next-mdx-remote/rsc'
import type { NewsArticleBlock } from '@/lib/types/news'
import { buildMarkdownComponents } from './article'
import { NewsQuote } from './NewsQuote'
import { NewsStats } from './NewsStats'

/**
 * Renders an article assembled from admin blocks. Text blocks are parsed as
 * plain Markdown (no JSX or scripts), so editor input cannot break the page.
 */
export function NewsArticleBody({ blocks }: { blocks: readonly NewsArticleBlock[] }) {
  const components = buildMarkdownComponents()
  const Heading = components.h2
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`
        switch (block.type) {
          case 'text':
            return (
              <MDXRemote
                key={key}
                source={block.text}
                options={{ blockJS: true, mdxOptions: { format: 'md' } }}
                components={components}
              />
            )
          case 'heading':
            return (
              <Heading key={key} id={block.id}>
                {block.text}
              </Heading>
            )
          case 'stats':
            return <NewsStats key={key} items={block.items} />
          case 'quote':
            return (
              <NewsQuote key={key} cite={block.cite}>
                {block.text}
              </NewsQuote>
            )
          case 'image':
            return (
              <figure key={key} className="my-4 flex flex-col gap-3">
                <img
                  src={block.src}
                  alt={block.caption ?? ''}
                  className="w-full rounded-md bg-bg-muted object-cover"
                  loading="lazy"
                />
                {block.caption ? (
                  <figcaption className="text-body-s text-text-muted">{block.caption}</figcaption>
                ) : null}
              </figure>
            )
        }
      })}
    </>
  )
}
