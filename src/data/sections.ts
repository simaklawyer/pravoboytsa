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
  updated: string
}

export const sections: Section[] = [
  {
    id: 'money',
    title: 'Деньги и выплаты',
    description: 'Довольствие, выплаты за ранение, пенсии, долги по налогам',
    icon: '💰',
    count: 11,
  },
  {
    id: 'housing',
    title: 'Жильё и недвижимость',
    description: 'НИС и военная ипотека, в том числе при гибели военнослужащего',
    icon: '🏠',
    count: 3,
  },
  {
    id: 'health',
    title: 'Здоровье и комиссии',
    description: 'ВВК, обжалование заключений, лечение после ранения',
    icon: '🏥',
    count: 9,
  },
  {
    id: 'family',
    title: 'Семья и дети',
    description: 'Детский сад, алименты, выплаты детям погибшего',
    icon: '👨‍👩‍👧',
    count: 5,
  },
  {
    id: 'legal',
    title: 'Защита прав',
    description: 'Рапорты, жалобы, прокуратура, суд',
    icon: '⚖️',
    count: 7,
  },
  {
    id: 'service',
    title: 'Служба',
    description: 'Контракт, увольнение, воинский учёт',
    icon: '🪖',
    count: 11,
  },
  {
    id: 'after',
    title: 'После службы',
    description: 'Статус ветерана боевых действий и льготы',
    icon: '🎗️',
    count: 1,
  },
  {
    id: 'emergency',
    title: 'Экстренные ситуации',
    description: 'Пропал без вести, гибель военнослужащего: что делать семье',
    icon: '🚨',
    count: 4,
  },
]
