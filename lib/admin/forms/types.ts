import type { CollectionName } from '@/shared/content'
import type { Label } from '../i18n'

export type Doc = Record<string, unknown>

interface FieldBase {
  /** Property name inside the parent object. */
  key: string
  label: Label
  hint?: Label
  required?: boolean
  /** Share a row with neighbours on wide screens. */
  width?: 'full' | 'half' | 'third'
}

export interface SelectOption {
  value: string
  label: Label
}

export type FieldConfig =
  | (FieldBase & { kind: 'text'; placeholder?: string })
  | (FieldBase & { kind: 'textarea'; rows?: number })
  | (FieldBase & { kind: 'number'; unit?: string })
  | (FieldBase & { kind: 'select'; options: readonly SelectOption[] })
  | (FieldBase & { kind: 'toggle' })
  | (FieldBase & { kind: 'date' })
  /** One text in both site languages, side by side. */
  | (FieldBase & { kind: 'localized'; multiline?: boolean; rows?: number; kazakhOptional?: boolean })
  | (FieldBase & { kind: 'image' })
  | (FieldBase & { kind: 'gallery' })
  /** Pick entries of another collection by name. */
  | (FieldBase & { kind: 'relation'; collection: CollectionName })
  /** A list of similar items, e.g. questions or dealers. */
  | (FieldBase & {
      kind: 'repeater'
      fields: readonly FieldConfig[]
      itemTitle: (item: Doc, index: number) => string
      addLabel: Label
      newItem: () => Doc
      /** Collapse items to their title; good for long lists. */
      collapsible?: boolean
    })
  /** Attachment characteristics picked from a fixed list. */
  | (FieldBase & { kind: 'specs' })
  /** News article body. */
  | (FieldBase & { kind: 'blocks' })

export interface SectionConfig {
  title: Label
  description?: Label
  fields: readonly FieldConfig[]
}

export interface FormConfig {
  sections: readonly SectionConfig[]
  /** Fields shown in the right column next to the Save button. */
  sidebar?: readonly FieldConfig[]
}

export interface CollectionFormConfig extends FormConfig {
  collection: CollectionName
  singular: Label
  plural: Label
  addLabel: Label
  emptyDoc: () => Doc
  titleOf: (doc: Doc) => string
  /** Public page of an entry, if it has one. */
  sitePath?: (slug: string) => string
}
