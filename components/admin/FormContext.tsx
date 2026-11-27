'use client'

import { createContext, useContext } from 'react'
import type { CollectionName } from '@/shared/content'
import type { Doc } from '@/lib/admin/forms/types'
import type { Path } from '@/lib/admin/forms/paths'

export interface RelationOption {
  slug: string
  title: string
}

export type RelationIndex = Partial<Record<CollectionName, RelationOption[]>>

export interface FormContextValue {
  doc: Doc
  setValue: (path: Path, value: unknown) => void
  /** Field errors keyed by dotted path, e.g. "subtitle.kk" or "items.2.answer.ru". */
  errors: Record<string, string>
  relations: RelationIndex
  /** Slug of the entry being edited, so it is not offered as its own relation. */
  currentSlug: string | null
}

export const FormContext = createContext<FormContextValue | null>(null)

export function useForm(): FormContextValue {
  const context = useContext(FormContext)
  if (!context) throw new Error('useForm must be used inside an editor')
  return context
}

/** True when any error is at `prefix` or nested below it. */
export function hasErrorWithin(errors: Record<string, string>, prefix: string): boolean {
  return Object.keys(errors).some((key) => key === prefix || key.startsWith(`${prefix}.`))
}
