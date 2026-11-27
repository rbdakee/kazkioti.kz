'use client'

import type { ComponentType } from 'react'
import { AlignLeft, ArrowDown, ArrowUp, BarChart3, Heading2, Image as ImageIcon, Plus, Quote, Trash2 } from 'lucide-react'
import type { NewsBlockType } from '@/shared/content'
import { UI, type Label } from '@/lib/admin/i18n'
import { useT } from '../AdminLang'
import { AdminButton, FieldShell, IconButton } from '../ui'
import { ImageDrop } from './ImageField'
import { LocalizedInput, type LocalizedValue } from './LocalizedInput'

type Block = { type: NewsBlockType } & Record<string, unknown>

const l = (ru: string, kk: string): Label => ({ ru, kk })

const BLOCK_TYPES: ReadonlyArray<{
  type: NewsBlockType
  label: Label
  icon: ComponentType<{ className?: string }>
  create: () => Block
}> = [
  { type: 'text', label: l('Текст', 'Мәтін'), icon: AlignLeft, create: () => ({ type: 'text', text: {} }) },
  { type: 'heading', label: l('Подзаголовок', 'Тақырыпша'), icon: Heading2, create: () => ({ type: 'heading', text: {} }) },
  { type: 'image', label: l('Фото', 'Фото'), icon: ImageIcon, create: () => ({ type: 'image', caption: {} }) },
  { type: 'quote', label: l('Цитата', 'Дәйексөз'), icon: Quote, create: () => ({ type: 'quote', text: {}, cite: {} }) },
  {
    type: 'stats',
    label: l('Цифры', 'Сандар'),
    icon: BarChart3,
    create: () => ({ type: 'stats', items: [{ value: {}, label: {} }] }),
  },
]

const MAX_STATS = 4

/** News article body as a list of blocks: text, headings, photos, quotes and key figures. */
export function BlocksInput({
  id,
  value,
  onChange,
  errorAt,
}: {
  id: string
  value: Block[]
  onChange: (blocks: Block[]) => void
  errorAt: (path: string) => string | undefined
}) {
  const t = useT()

  function update(index: number, patch: Record<string, unknown>) {
    onChange(value.map((block, i) => (i === index ? { ...block, ...patch } : block)))
  }

  function move(index: number, delta: number) {
    const next = [...value]
    const [block] = next.splice(index, 1)
    if (!block) return
    next.splice(index + delta, 0, block)
    onChange(next)
  }

  const localizedErrors = (prefix: string) => ({ ru: errorAt(`${prefix}.ru`) ?? errorAt(prefix), kk: errorAt(`${prefix}.kk`) ?? errorAt(prefix) })

  return (
    <div className="flex flex-col gap-3">
      {value.map((block, index) => {
        const meta = BLOCK_TYPES.find((item) => item.type === block.type)
        if (!meta) return null
        const Icon = meta.icon
        const blockId = `${id}-${index}`
        return (
          <div key={index} className="rounded-lg border border-border bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-soft/70 px-4 py-2">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
                <Icon className="h-4 w-4 text-text-muted" />
                {t(meta.label)}
              </span>
              <div className="flex items-center">
                <IconButton label={t(UI.moveUp)} disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="h-4 w-4" />
                </IconButton>
                <IconButton label={t(UI.moveDown)} disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDown className="h-4 w-4" />
                </IconButton>
                <IconButton label={t(UI.remove)} onClick={() => onChange(value.filter((_, i) => i !== index))} className="hover:text-brand-red">
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-4">
              {block.type === 'text' || block.type === 'heading' ? (
                <LocalizedInput
                  id={blockId}
                  value={block.text as LocalizedValue}
                  multiline={block.type === 'text'}
                  rows={6}
                  required
                  onChange={(text) => update(index, { text })}
                  errors={localizedErrors(`${index}.text`)}
                />
              ) : null}
              {block.type === 'quote' ? (
                <>
                  <LocalizedInput id={blockId} value={block.text as LocalizedValue} multiline rows={3} required onChange={(text) => update(index, { text })} errors={localizedErrors(`${index}.text`)} />
                  <FieldShell label={t(l('Автор цитаты', 'Дәйексөз авторы'))}>
                    <LocalizedInput id={`${blockId}-cite`} value={block.cite as LocalizedValue} kazakhOptional onChange={(cite) => update(index, { cite })} />
                  </FieldShell>
                </>
              ) : null}
              {block.type === 'image' ? (
                <>
                  <FieldShell error={errorAt(`${index}.src`) ? t(UI.required) : undefined}>
                    <ImageDrop value={block.src as string | undefined} invalid={Boolean(errorAt(`${index}.src`))} onChange={(src) => update(index, { src })} />
                  </FieldShell>
                  <FieldShell label={t(l('Подпись', 'Жазу'))}>
                    <LocalizedInput id={`${blockId}-caption`} value={block.caption as LocalizedValue} kazakhOptional onChange={(caption) => update(index, { caption })} />
                  </FieldShell>
                </>
              ) : null}
              {block.type === 'stats' ? (
                <StatsEditor
                  id={blockId}
                  items={(block.items as Array<{ value: LocalizedValue; label: LocalizedValue }>) ?? []}
                  onChange={(items) => update(index, { items })}
                  errorAt={(path) => errorAt(`${index}.items.${path}`)}
                />
              ) : null}
            </div>
          </div>
        )
      })}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-black/15 bg-bg-soft/60 p-3">
        <span className="mr-1 flex items-center gap-1.5 text-[13px] font-semibold text-text-muted">
          <Plus className="h-4 w-4" />
          {t(UI.add)}:
        </span>
        {BLOCK_TYPES.map(({ type, label, icon: Icon, create }) => (
          <AdminButton key={type} size="sm" icon={<Icon className="h-3.5 w-3.5" />} onClick={() => onChange([...value, create()])}>
            {t(label)}
          </AdminButton>
        ))}
      </div>
    </div>
  )
}

function StatsEditor({
  id,
  items,
  onChange,
  errorAt,
}: {
  id: string
  items: Array<{ value: LocalizedValue; label: LocalizedValue }>
  onChange: (items: Array<{ value: LocalizedValue; label: LocalizedValue }>) => void
  errorAt: (path: string) => string | undefined
}) {
  const t = useT()
  return (
    <div className="flex flex-col gap-4">
      {items.map((item, index) => (
        <div key={index} className="grid gap-3 rounded-md bg-bg-soft p-3 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-3">
            <FieldShell label={t(l('Значение', 'Мәні')) + ' — 18 000 м²'}>
              <LocalizedInput
                id={`${id}-value-${index}`}
                value={item.value}
                required
                onChange={(value) => onChange(items.map((current, i) => (i === index ? { ...current, value } : current)))}
                errors={{ ru: errorAt(`${index}.value.ru`), kk: errorAt(`${index}.value.kk`) }}
              />
            </FieldShell>
            <FieldShell label={t(l('Подпись', 'Жазу'))}>
              <LocalizedInput
                id={`${id}-label-${index}`}
                value={item.label}
                required
                onChange={(label) => onChange(items.map((current, i) => (i === index ? { ...current, label } : current)))}
                errors={{ ru: errorAt(`${index}.label.ru`), kk: errorAt(`${index}.label.kk`) }}
              />
            </FieldShell>
          </div>
          <IconButton label={t(UI.remove)} disabled={items.length === 1} onClick={() => onChange(items.filter((_, i) => i !== index))} className="hover:text-brand-red">
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      ))}
      {items.length < MAX_STATS ? (
        <AdminButton size="sm" className="self-start" icon={<Plus className="h-3.5 w-3.5" />} onClick={() => onChange([...items, { value: {}, label: {} }])}>
          {t(l('Ещё цифра', 'Тағы сан'))}
        </AdminButton>
      ) : null}
    </div>
  )
}
