import type { FieldConfig } from './types'

const l = (ru: string, kk: string) => ({ ru, kk })

export { l }

export const priceFields: readonly FieldConfig[] = [
  { key: 'price', kind: 'number', unit: '₸', width: 'third', label: l('Цена без НДС', 'ҚҚС-сыз баға') },
  { key: 'subsidy', kind: 'number', unit: '₸', width: 'third', label: l('Субсидия', 'Субсидия') },
  {
    key: 'priceWithSubsidy',
    kind: 'number',
    unit: '₸',
    width: 'third',
    label: l('Цена с субсидией', 'Субсидиямен баға'),
  },
]

export const seoFields: readonly FieldConfig[] = [
  {
    key: 'metaTitle',
    kind: 'localized',
    kazakhOptional: true,
    label: l('Заголовок в Google', 'Google-дағы тақырып'),
    hint: l('Если пусто — используется название', 'Бос болса — атауы қолданылады'),
  },
  {
    key: 'metaDescription',
    kind: 'localized',
    multiline: true,
    rows: 2,
    kazakhOptional: true,
    label: l('Описание в Google', 'Google-дағы сипаттама'),
  },
]
