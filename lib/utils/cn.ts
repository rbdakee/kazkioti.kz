import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

const customMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'h1', 'h2', 'h3', 'lede', 'eyebrow', 'body-l', 'body-m', 'body-s', 'mono-label'] },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return customMerge(clsx(inputs))
}
