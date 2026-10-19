export interface Section {
  id: string
  title: string
  description: string
  icon: string
  count: number
}

export interface ArticleMeta {
  id: string
  sectionId: string
  title: string
  summary: string
  tags: string[]
}

export const sections: Section[] = [
  {
    id: 'money',
    title: 'Деньги и выплаты',
    description: 'Довольствие, компенсации, пособия, индексации',
    icon: '💰',
    count: 14,
  },
  {
    id: 'housing',
    title: 'Жильё и недвижимость',
    description: 'НИС, военная ипотека, субсидии, служебное жильё',
    icon: '🏠',
    count: 9,
  },
  {
    id: 'health',
    title: 'Здоровье и комиссии',
    description: 'ВВК, лечение, ранения, реабилитация',
    icon: '🏥',
    count: 11,
  },
  {
    id: 'family',
    title: 'Семья и дети',
    description: 'Льготы детям, сады, школы, алименты, пособия',
    icon: '👨‍👩‍👧',
    count: 10,
  },
  {
    id: 'legal',
    title: 'Защита прав',
    description: 'Жалобы, прокуратура, суды, документы',
    icon: '⚖️',
    count: 13,
  },
  {
    id: 'service',
    title: 'Служба',
    description: 'Контракт, отпуска, переводы, увольнение',
    icon: '🪖',
    count: 10,
  },
  {
    id: 'after',
    title: 'После службы',
    description: 'Статус ветерана, пенсия, трудоустройство',
    icon: '🎗️',
    count: 9,
  },
  {
    id: 'emergency',
    title: 'Экстренные ситуации',
    description: 'Пропал, плен, гибель — срочные действия',
    icon: '🔍',
    count: 8,
  },
]

// Первые материалы (позже наполним полностью)
export const articles: ArticleMeta[] = [
  {
    id: 'money-1',
    sectionId: 'money',
    title: 'Ежемесячное денежное довольствие — из чего складывается',
    summary: 'Оклады по воинскому званию и должности, надбавки, районные коэффициенты',
    tags: ['довольствие', 'оклад'],
  },
  {
    id: 'money-2',
    sectionId: 'money',
    title: 'Компенсация за ранение — пошаговый порядок',
    summary: 'Какие документы нужны и куда подавать заявление',
    tags: ['ранение', 'компенсация'],
  },
  {
    id: 'housing-1',
    sectionId: 'housing',
    title: 'Военная ипотека при гибели военнослужащего',
    summary: 'Что происходит с накоплениями и обязательствами семьи',
    tags: ['ипотека', 'гибель'],
  },
  {
    id: 'emergency-1',
    sectionId: 'emergency',
    title: 'Пропал без вести — первые действия родственников',
    summary: 'Куда обращаться в первые часы и дни',
    tags: ['пропал', 'поиск'],
  },
  {
    id: 'legal-1',
    sectionId: 'legal',
    title: 'Как подать жалобу военному прокурору',
    summary: 'Форма, сроки, что писать и куда направлять',
    tags: ['жалоба', 'прокуратура'],
  },
  {
    id: 'family-1',
    sectionId: 'family',
    title: 'Детский сад без очереди для детей военнослужащих',
    summary: 'Как оформить право на первоочередное зачисление',
    tags: ['дети', 'сад'],
  },
]
