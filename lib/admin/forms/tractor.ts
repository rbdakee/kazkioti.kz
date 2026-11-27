import { l, priceFields, seoFields } from './common'
import { textOf } from './paths'
import type { CollectionFormConfig } from './types'

export const tractorForm: CollectionFormConfig = {
  collection: 'tractors',
  singular: l('Трактор', 'Трактор'),
  plural: l('Тракторы', 'Тракторлар'),
  addLabel: l('Добавить трактор', 'Трактор қосу'),
  sitePath: (slug) => `/tractors/${slug}`,
  titleOf: (doc) => textOf(doc.name),
  emptyDoc: () => ({
    status: 'available',
    galleryImages: [],
    compatibleAttachments: [],
    relatedCases: [],
    warrantyYears: 1,
    warrantyHours: 1000,
  }),
  sidebar: [
    {
      key: 'status',
      kind: 'select',
      label: l('Статус на сайте', 'Сайттағы мәртебесі'),
      options: [
        { value: 'available', label: l('В продаже', 'Сатылымда') },
        { value: 'coming-soon', label: l('Скоро в продаже', 'Жақында сатылымда') },
      ],
    },
  ],
  sections: [
    {
      title: l('Основное', 'Негізгі'),
      fields: [
        { key: 'name', kind: 'text', required: true, width: 'half', label: l('Название модели', 'Модель атауы'), placeholder: 'DF 904' },
        { key: 'power', kind: 'number', required: true, unit: 'л.с.', width: 'half', label: l('Мощность', 'Қуаты') },
        { key: 'subtitle', kind: 'localized', required: true, label: l('Подзаголовок', 'Тақырыпша'), hint: l('Одна строка под названием', 'Атау астындағы бір жол') },
        { key: 'description', kind: 'localized', multiline: true, rows: 5, kazakhOptional: true, label: l('Описание', 'Сипаттама') },
      ],
    },
    {
      title: l('Цена', 'Баға'),
      description: l('Оставьте пустым, если цену не показываем', 'Бағаны көрсетпесек, бос қалдырыңыз'),
      fields: priceFields,
    },
    {
      title: l('Фото', 'Фото'),
      fields: [
        { key: 'heroImage', kind: 'image', required: true, label: l('Главное фото', 'Негізгі фото'), hint: l('Показывается в каталоге и на странице модели', 'Каталогта және модель бетінде көрсетіледі') },
        { key: 'galleryImages', kind: 'gallery', label: l('Галерея', 'Галерея') },
      ],
    },
    {
      title: l('Двигатель и трансмиссия', 'Қозғалтқыш және трансмиссия'),
      fields: [
        { key: 'engineModel', kind: 'text', required: true, width: 'third', label: l('Модель двигателя', 'Қозғалтқыш моделі') },
        { key: 'engineEcoClass', kind: 'text', required: true, width: 'third', label: l('Экокласс', 'Экокласы'), placeholder: 'Euro 3' },
        { key: 'engineCylinders', kind: 'number', required: true, width: 'third', label: l('Цилиндров', 'Цилиндрлер') },
        { key: 'engineDisplacement', kind: 'number', required: true, unit: 'см³', width: 'third', label: l('Объём', 'Көлемі') },
        { key: 'fuelType', kind: 'text', required: true, width: 'third', label: l('Топливо', 'Отын'), placeholder: 'Дизель' },
        { key: 'driveType', kind: 'text', required: true, width: 'third', label: l('Привод', 'Жетек'), placeholder: '4×4' },
        { key: 'transmission', kind: 'text', required: true, width: 'third', label: l('Схема КПП', 'Беріліс сызбасы'), placeholder: '12F+12R' },
        { key: 'fuelTank', kind: 'number', required: true, unit: 'л', width: 'third', label: l('Топливный бак', 'Отын багы') },
        { key: 'transmissionType', kind: 'localized', required: true, label: l('Тип трансмиссии', 'Трансмиссия түрі') },
        { key: 'clutch', kind: 'localized', kazakhOptional: true, label: l('Сцепление', 'Ілініс') },
        { key: 'pto', kind: 'localized', required: true, label: l('ВОМ', 'ҚБВ') },
      ],
    },
    {
      title: l('Размеры и гидравлика', 'Өлшемдер және гидравлика'),
      fields: [
        { key: 'lengthMm', kind: 'number', required: true, unit: 'мм', width: 'third', label: l('Длина', 'Ұзындығы') },
        { key: 'widthMm', kind: 'number', required: true, unit: 'мм', width: 'third', label: l('Ширина', 'Ені') },
        { key: 'heightMm', kind: 'number', required: true, unit: 'мм', width: 'third', label: l('Высота', 'Биіктігі') },
        { key: 'weight', kind: 'number', required: true, unit: 'кг', width: 'third', label: l('Масса', 'Салмағы') },
        { key: 'wheelbase', kind: 'number', unit: 'мм', width: 'third', label: l('Колёсная база', 'Доңғалақ базасы') },
        { key: 'hydraulicPump', kind: 'text', width: 'third', label: l('Гидронасос', 'Гидросорғы') },
        { key: 'rearLinkage', kind: 'localized', kazakhOptional: true, label: l('Задняя навеска', 'Артқы аспа') },
        { key: 'brakes', kind: 'localized', kazakhOptional: true, label: l('Тормоза', 'Тежегіштер') },
      ],
    },
    {
      title: l('Гарантия', 'Кепілдік'),
      fields: [
        { key: 'warrantyYears', kind: 'number', required: true, unit: 'лет', width: 'half', label: l('Срок', 'Мерзімі') },
        { key: 'warrantyHours', kind: 'number', required: true, unit: 'м/ч', width: 'half', label: l('Моточасов', 'Мотосағат') },
      ],
    },
    {
      title: l('Видео', 'Бейне'),
      fields: [
        { key: 'videoUrl', kind: 'text', label: l('Ссылка на YouTube', 'YouTube сілтемесі'), placeholder: 'https://youtu.be/…' },
        { key: 'videoCaption', kind: 'localized', kazakhOptional: true, label: l('Подпись под видео', 'Бейне астындағы жазу') },
      ],
    },
    {
      title: l('Совместимое навесное', 'Үйлесімді тіркелмелі агрегаттар'),
      description: l('Будет показано на странице трактора', 'Трактор бетінде көрсетіледі'),
      fields: [{ key: 'compatibleAttachments', kind: 'relation', collection: 'attachments', label: l('Навесное', 'Агрегаттар') }],
    },
    {
      title: l('Поисковики и соцсети', 'Іздеу жүйелері және әлеуметтік желілер'),
      fields: [...seoFields, { key: 'ogImage', kind: 'image', label: l('Картинка для соцсетей', 'Әлеуметтік желілерге сурет'), hint: l('Если пусто — главное фото', 'Бос болса — негізгі фото') }],
    },
  ],
}
