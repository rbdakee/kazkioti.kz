import { FAQ_CATEGORIES } from '@/shared/content'
import type { Label } from '../i18n'
import { l } from './common'
import type { CollectionFormConfig } from './types'

export const FAQ_CATEGORY_LABELS: Record<(typeof FAQ_CATEGORIES)[number], Label> = {
  warranty: l('Гарантия', 'Кепілдік'),
  leasing: l('Лизинг', 'Лизинг'),
  delivery: l('Доставка', 'Жеткізу'),
  docs: l('Документы', 'Құжаттар'),
  service: l('Сервис', 'Сервис'),
}

export const faqForm: CollectionFormConfig = {
  collection: 'faq',
  singular: l('Раздел вопросов', 'Сұрақтар бөлімі'),
  plural: l('Вопросы и ответы', 'Сұрақтар мен жауаптар'),
  addLabel: l('Добавить раздел', 'Бөлім қосу'),
  sitePath: () => '/faq',
  titleOf: (doc) => {
    const title = doc.title as { ru?: string } | undefined
    return title?.ru ?? ''
  },
  emptyDoc: () => ({ category: 'service', order: 10, items: [] }),
  sidebar: [
    {
      key: 'category',
      kind: 'select',
      required: true,
      label: l('Тема', 'Тақырып'),
      options: FAQ_CATEGORIES.map((value) => ({ value, label: FAQ_CATEGORY_LABELS[value] })),
    },
    { key: 'order', kind: 'number', required: true, label: l('Порядок на странице', 'Беттегі реті'), hint: l('Меньше — выше', 'Азырақ — жоғарырақ') },
  ],
  sections: [
    {
      title: l('Раздел', 'Бөлім'),
      fields: [{ key: 'title', kind: 'localized', required: true, label: l('Заголовок раздела', 'Бөлім тақырыбы') }],
    },
    {
      title: l('Вопросы', 'Сұрақтар'),
      fields: [
        {
          key: 'items',
          kind: 'repeater',
          label: l('Вопросы', 'Сұрақтар'),
          addLabel: l('Добавить вопрос', 'Сұрақ қосу'),
          collapsible: true,
          newItem: () => ({ question: { ru: '', kk: '' }, answer: { ru: '', kk: '' } }),
          itemTitle: (item, index) => {
            const question = item.question as { ru?: string } | undefined
            return question?.ru || `#${index + 1}`
          },
          fields: [
            { key: 'question', kind: 'localized', required: true, label: l('Вопрос', 'Сұрақ') },
            { key: 'answer', kind: 'localized', required: true, multiline: true, rows: 4, label: l('Ответ', 'Жауап') },
          ],
        },
      ],
    },
  ],
}
