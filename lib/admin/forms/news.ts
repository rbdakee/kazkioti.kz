import { NEWS_TAGS } from '@/shared/content'
import type { Label } from '../i18n'
import { l, seoFields } from './common'
import type { CollectionFormConfig } from './types'

export const NEWS_TAG_LABELS: Record<(typeof NEWS_TAGS)[number], Label> = {
  production: l('Производство', 'Өндіріс'),
  delivery: l('Поставки', 'Жеткізу'),
  partnership: l('Партнёрство', 'Серіктестік'),
  lineup: l('Модельный ряд', 'Модельдер қатары'),
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export const newsForm: CollectionFormConfig = {
  collection: 'news',
  singular: l('Новость', 'Жаңалық'),
  plural: l('Новости', 'Жаңалықтар'),
  addLabel: l('Написать новость', 'Жаңалық жазу'),
  sitePath: (slug) => `/news/${slug}`,
  titleOf: (doc) => {
    const title = doc.title as { ru?: string } | undefined
    return title?.ru ?? ''
  },
  emptyDoc: () => ({
    status: 'draft',
    date: todayIso(),
    tag: 'production',
    body: [{ type: 'text', text: { ru: '', kk: '' } }],
    relatedNews: [],
  }),
  sidebar: [
    {
      key: 'status',
      kind: 'select',
      label: l('Публикация', 'Жариялау'),
      options: [
        { value: 'draft', label: l('Черновик — не видно на сайте', 'Жоба — сайтта көрінбейді') },
        { value: 'published', label: l('Опубликовано', 'Жарияланды') },
      ],
    },
    { key: 'date', kind: 'date', required: true, label: l('Дата', 'Күні') },
    {
      key: 'tag',
      kind: 'select',
      required: true,
      label: l('Рубрика', 'Айдар'),
      options: NEWS_TAGS.map((value) => ({ value, label: NEWS_TAG_LABELS[value] })),
    },
  ],
  sections: [
    {
      title: l('Заголовок и анонс', 'Тақырып және анонс'),
      fields: [
        { key: 'title', kind: 'localized', required: true, label: l('Заголовок', 'Тақырып') },
        { key: 'excerpt', kind: 'localized', required: true, multiline: true, rows: 3, label: l('Анонс', 'Анонс'), hint: l('2–3 предложения для списка новостей', 'Жаңалықтар тізіміне 2–3 сөйлем') },
        { key: 'coverImage', kind: 'image', label: l('Обложка', 'Мұқаба') },
      ],
    },
    {
      title: l('Текст статьи', 'Мақала мәтіні'),
      description: l(
        'Собирайте статью из блоков. В тексте: пустая строка — новый абзац, **жирный**, [ссылка](https://…), «- » в начале строки — список.',
        'Мақаланы блоктардан құрастырыңыз. Мәтінде: бос жол — жаңа абзац, **қалың**, [сілтеме](https://…), жол басында «- » — тізім.',
      ),
      fields: [{ key: 'body', kind: 'blocks', label: l('Блоки', 'Блоктар') }],
    },
    {
      title: l('Читайте также', 'Сондай-ақ оқыңыз'),
      fields: [{ key: 'relatedNews', kind: 'relation', collection: 'news', label: l('Связанные новости', 'Байланысты жаңалықтар') }],
    },
    {
      title: l('Поисковики и соцсети', 'Іздеу жүйелері және әлеуметтік желілер'),
      fields: [...seoFields, { key: 'ogImage', kind: 'image', label: l('Картинка для соцсетей', 'Әлеуметтік желілерге сурет'), hint: l('Если пусто — обложка', 'Бос болса — мұқаба') }],
    },
  ],
}
