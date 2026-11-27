import type { SettingsKey } from '@/shared/content'
import type { Label } from '../i18n'
import { l } from './common'
import { textOf } from './paths'
import type { FormConfig } from './types'

export interface SettingsFormConfig extends FormConfig {
  key: SettingsKey
  title: Label
  description: Label
  sitePath: string
}

export const companyForm: SettingsFormConfig = {
  key: 'company',
  title: l('Контакты компании', 'Компания байланыстары'),
  description: l('Показываются в шапке, подвале и на странице контактов', 'Тақырыпшада, төменгі жақта және байланыс бетінде көрсетіледі'),
  sitePath: '/contacts',
  sections: [
    {
      title: l('Связь', 'Байланыс'),
      fields: [
        { key: 'phone', kind: 'text', required: true, width: 'half', label: l('Телефон', 'Телефон'), placeholder: '+7 747 876 44 44' },
        { key: 'email', kind: 'text', required: true, width: 'half', label: l('Email', 'Email'), placeholder: 'info@kazkioti.kz' },
        { key: 'address', kind: 'textarea', rows: 2, required: true, label: l('Адрес завода', 'Зауыт мекенжайы') },
      ],
    },
  ],
}

export const dealersForm: SettingsFormConfig = {
  key: 'dealers',
  title: l('Дилеры и сервис', 'Дилерлер және сервис'),
  description: l('Точки на карте и в списке дилеров', 'Картадағы және дилерлер тізіміндегі нүктелер'),
  sitePath: '/dealers',
  sections: [
    {
      title: l('Точки', 'Нүктелер'),
      fields: [
        {
          key: 'dealers',
          kind: 'repeater',
          label: l('Дилеры', 'Дилерлер'),
          addLabel: l('Добавить точку', 'Нүкте қосу'),
          collapsible: true,
          newItem: () => ({ dealer: true, service: false, placeholder: false, cx: 500, cy: 400 }),
          itemTitle: (item, index) => [textOf(item.name), textOf(item.region)].filter(Boolean).join(' · ') || `#${index + 1}`,
          fields: [
            { key: 'name', kind: 'text', required: true, width: 'half', label: l('Город', 'Қала') },
            { key: 'region', kind: 'text', required: true, width: 'half', label: l('Область', 'Облыс') },
            { key: 'address', kind: 'text', required: true, label: l('Адрес', 'Мекенжай') },
            { key: 'phone', kind: 'text', required: true, width: 'half', label: l('Телефон', 'Телефон') },
            { key: 'hours', kind: 'text', required: true, width: 'half', label: l('Часы работы', 'Жұмыс уақыты'), placeholder: 'пн–пт · 09:00–18:00' },
            { key: 'dealer', kind: 'toggle', width: 'third', label: l('Продажа техники', 'Техника сату') },
            { key: 'service', kind: 'toggle', width: 'third', label: l('Сервис', 'Сервис') },
            { key: 'placeholder', kind: 'toggle', width: 'third', label: l('Данные уточняются', 'Деректер нақтылануда') },
            { key: 'cx', kind: 'number', required: true, width: 'third', label: l('Карта: X', 'Карта: X'), hint: l('Позиция точки на карте', 'Картадағы нүкте орны') },
            { key: 'cy', kind: 'number', required: true, width: 'third', label: l('Карта: Y', 'Карта: Y') },
            { key: 'labelOffsetY', kind: 'number', width: 'third', label: l('Сдвиг подписи', 'Жазуды жылжыту'), hint: l('Плюс — подпись под точкой', 'Плюс — жазу нүкте астында') },
          ],
        },
      ],
    },
  ],
}
