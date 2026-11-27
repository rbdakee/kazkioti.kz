import { ATTACHMENT_CATEGORIES, type AttachmentSpecKey } from '@/shared/content'
import type { Label } from '../i18n'
import { l, priceFields } from './common'
import type { CollectionFormConfig } from './types'

export const ATTACHMENT_CATEGORY_LABELS: Record<(typeof ATTACHMENT_CATEGORIES)[number], Label> = {
  seeding: l('Посевное', 'Егіс'),
  tillage: l('Почвообработка', 'Топырақ өңдеу'),
  mowing: l('Кошение и заготовка', 'Шабу және дайындау'),
  extra: l('Прочее', 'Басқа'),
}

export const ATTACHMENT_SPEC_LABELS: Record<AttachmentSpecKey, Label> = {
  compatibility: l('Совместимость', 'Үйлесімділік'),
  workingWidth: l('Ширина захвата', 'Қамту ені'),
  workingDepth: l('Глубина обработки', 'Өңдеу тереңдігі'),
  driveType: l('Привод', 'Жетек'),
  type: l('Тип', 'Түрі'),
  weight: l('Масса', 'Салмағы'),
  width: l('Ширина', 'Ені'),
  rows: l('Количество рядов', 'Қатар саны'),
  rowSpacing: l('Междурядье', 'Қатар аралығы'),
  discs: l('Количество дисков', 'Дискілер саны'),
  bodies: l('Количество корпусов', 'Корпустар саны'),
  blades: l('Количество ножей', 'Пышақтар саны'),
  rotorSpeed: l('Обороты ротора', 'Ротор айналымы'),
  hopperCapacity: l('Объём бункера', 'Бункер көлемі'),
  tankCapacity: l('Объём бака', 'Бак көлемі'),
  bodyVolume: l('Объём кузова', 'Шанақ көлемі'),
  boomWidth: l('Ширина штанги', 'Штанга ені'),
  bucketWidth: l('Ширина ковша', 'Шөміш ені'),
  capacity: l('Вместимость', 'Сыйымдылығы'),
  liftCapacity: l('Грузоподъёмность', 'Жүк көтергіштігі'),
  liftHeight: l('Высота подъёма', 'Көтеру биіктігі'),
  pickupWidth: l('Ширина подборщика', 'Жинағыш ені'),
  baleSize: l('Размер тюка', 'Тюк өлшемі'),
  baleType: l('Тип тюка', 'Тюк түрі'),
  pump: l('Насос', 'Сорғы'),
  guidance: l('Навигация', 'Навигация'),
  accuracy: l('Точность', 'Дәлдігі'),
  tipping: l('Опрокидывание', 'Аудару'),
}

export const attachmentForm: CollectionFormConfig = {
  collection: 'attachments',
  singular: l('Навесное', 'Агрегат'),
  plural: l('Навесное оборудование', 'Агрегаттар'),
  addLabel: l('Добавить навесное', 'Агрегат қосу'),
  sitePath: () => '/attachments',
  titleOf: (doc) => {
    const name = doc.name as { ru?: string } | undefined
    return name?.ru ?? ''
  },
  emptyDoc: () => ({ category: 'tillage', compatibleModels: [], specs: [] }),
  sidebar: [
    {
      key: 'category',
      kind: 'select',
      required: true,
      label: l('Категория', 'Санаты'),
      options: ATTACHMENT_CATEGORIES.map((value) => ({ value, label: ATTACHMENT_CATEGORY_LABELS[value] })),
    },
  ],
  sections: [
    {
      title: l('Основное', 'Негізгі'),
      fields: [
        { key: 'name', kind: 'localized', required: true, kazakhOptional: true, label: l('Название', 'Атауы'), hint: l('Казахское — только если отличается', 'Қазақшасы — тек өзгеше болса') },
        { key: 'description', kind: 'localized', multiline: true, rows: 4, kazakhOptional: true, label: l('Описание', 'Сипаттама') },
        { key: 'heroImage', kind: 'image', label: l('Фото', 'Фото') },
      ],
    },
    {
      title: l('Цена', 'Баға'),
      description: l('Оставьте пустым, если цену не показываем', 'Бағаны көрсетпесек, бос қалдырыңыз'),
      fields: priceFields,
    },
    {
      title: l('Характеристики', 'Сипаттамалары'),
      description: l('Добавьте только те, что есть у этого орудия', 'Тек осы құралда барларын қосыңыз'),
      fields: [{ key: 'specs', kind: 'specs', label: l('Характеристики', 'Сипаттамалары') }],
    },
    {
      title: l('Совместимые тракторы', 'Үйлесімді тракторлар'),
      fields: [{ key: 'compatibleModels', kind: 'relation', collection: 'tractors', label: l('Тракторы', 'Тракторлар') }],
    },
  ],
}
