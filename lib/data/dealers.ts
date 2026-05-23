export interface Dealer {
  id: string
  name: string
  region: string
  address: string
  phone: string
  phoneHref: string
  hours: string
  cx: number
  cy: number
  /** Override pin label position. Set positive to push the label below the
   * pin when the default position above collides with a region label. */
  labelOffsetY?: number
  dealer: boolean
  service: boolean
  placeholder: true
}

export const DEALERS: readonly Dealer[] = [
  {
    id: 'shymkent',
    name: 'Шымкент',
    region: 'Туркестанская',
    address: 'г. Шымкент, ул. Кунаева 3/3',
    phone: '+7 747 876 44 44',
    phoneHref: 'tel:+77478764444',
    hours: 'пн–пт · 09:00–18:00',
    cx: 578,
    cy: 567,
    dealer: true,
    service: true,
    placeholder: true,
  },
  {
    id: 'aktobe',
    name: 'Актобе',
    region: 'Актюбинская',
    address: 'г. Актобе, Санкибай батыра 22',
    phone: '+7 701 536 96 76',
    phoneHref: 'tel:+77015369676',
    hours: 'пн–пт · 09:00–18:00',
    cx: 274,
    cy: 284,
    dealer: true,
    service: true,
    placeholder: true,
  },
  {
    id: 'taraz',
    name: 'Тараз',
    region: 'Жамбылская',
    address: 'г. Тараз, ул. Толе би 95',
    phone: '+7 747 954 70 83',
    phoneHref: 'tel:+77479547083',
    hours: 'пн–пт · 09:00–18:00',
    cx: 621,
    cy: 548,
    dealer: true,
    service: true,
    placeholder: true,
  },
  {
    id: 'astana',
    name: 'Астана',
    region: 'Акмолинская',
    address: 'г. Астана, ул. І.Жансүгірұлы 8/2, БЦ «Аружан», офис 906',
    phone: '+7 776 154 88 19',
    phoneHref: 'tel:+77761548819',
    hours: 'пн–пт · 09:00–18:00',
    cx: 624,
    cy: 250,
    dealer: true,
    service: true,
    placeholder: true,
  },
  {
    id: 'karagandy',
    name: 'Караганда',
    region: 'Карагандинская',
    address: 'г. Караганда, ул. Бухар жырау 53/1, ТД «Даулет», каб. 412',
    phone: '+7 708 775 13 40',
    phoneHref: 'tel:+77087751340',
    hours: 'пн–пт · 09:00–18:00',
    cx: 664,
    cy: 302,
    dealer: true,
    service: true,
    placeholder: true,
  },
  {
    id: 'uralsk',
    name: 'Уральск',
    region: 'Западно-Казахстанская',
    address: 'г. Уральск, ул. Шолохова 20/2',
    phone: '+7 777 061 55 11',
    phoneHref: 'tel:+77770615511',
    hours: 'пн–пт · 09:00–18:00',
    cx: 131,
    cy: 247,
    dealer: true,
    service: true,
    placeholder: true,
  },
  {
    id: 'kyzylorda',
    name: 'Кызылорда',
    region: 'Кызылординская',
    address: 'г. Кызылорда, ул. Қорқыт Ата 123, БЦ «Самғау», кабинет 6',
    phone: '+7 777 058 18 82',
    phoneHref: 'tel:+77770581882',
    hours: 'пн–пт · 09:00–18:00',
    cx: 477,
    cy: 482,
    labelOffsetY: 12,
    dealer: true,
    service: true,
    placeholder: true,
  },
]

export const DEALER_REGIONS: readonly string[] = Array.from(
  new Set(DEALERS.map((dealer) => dealer.region)),
)
