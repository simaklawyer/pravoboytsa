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
    count: 3,
  },
  {
    id: 'housing',
    title: 'Жильё и недвижимость',
    description: 'НИС, военная ипотека, субсидии, служебное жильё',
    icon: '🏠',
    count: 2,
  },
  {
    id: 'health',
    title: 'Здоровье и комиссии',
    description: 'ВВК, лечение, ранения, реабилитация',
    icon: '🏥',
    count: 1,
  },
  {
    id: 'family',
    title: 'Семья и дети',
    description: 'Льготы детям, сады, школы, алименты, пособия',
    icon: '👨‍👩‍👧',
    count: 2,
  },
  {
    id: 'legal',
    title: 'Защита прав',
    description: 'Жалобы, прокуратура, суды, документы',
    icon: '⚖️',
    count: 2,
  },
  {
    id: 'service',
    title: 'Служба',
    description: 'Контракт, отпуска, переводы, увольнение',
    icon: '🪖',
    count: 1,
  },
  {
    id: 'after',
    title: 'После службы',
    description: 'Статус ветерана, пенсия, трудоустройство',
    icon: '🎗️',
    count: 1,
  },
  {
    id: 'emergency',
    title: 'Экстренные ситуации',
    description: 'Пропал, плен, гибель — срочные действия',
    icon: '🔍',
    count: 2,
  },
]

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
    id: 'money-3',
    sectionId: 'money',
    title: 'Выплаты при увольнении с военной службы',
    summary: 'Отпускные, пособия и что проверить в расчётном листке',
    tags: ['увольнение', 'выплаты'],
  },
  {
    id: 'housing-1',
    sectionId: 'housing',
    title: 'Военная ипотека при гибели военнослужащего',
    summary: 'Что происходит с накоплениями и обязательствами семьи',
    tags: ['ипотека', 'гибель'],
  },
  {
    id: 'housing-2',
    sectionId: 'housing',
    title: 'Накопительно-ипотечная система (НИС) — основы',
    summary: 'Как работает НИС и на что обратить внимание участнику',
    tags: ['НИС', 'жильё'],
  },
  {
    id: 'health-1',
    sectionId: 'health',
    title: 'Военно-врачебная комиссия (ВВК) — зачем и как проходить',
    summary: 'Категории годности, документы и обжалование заключения',
    tags: ['ВВК', 'здоровье'],
  },
  {
    id: 'family-1',
    sectionId: 'family',
    title: 'Детский сад без очереди для детей военнослужащих',
    summary: 'Как оформить право на первоочередное зачисление',
    tags: ['дети', 'сад'],
  },
  {
    id: 'family-2',
    sectionId: 'family',
    title: 'Алименты и денежное довольствие',
    summary: 'Как удерживаются алименты и что делать при споре',
    tags: ['алименты', 'семья'],
  },
  {
    id: 'legal-1',
    sectionId: 'legal',
    title: 'Как подать жалобу военному прокурору',
    summary: 'Форма, сроки, что писать и куда направлять',
    tags: ['жалоба', 'прокуратура'],
  },
  {
    id: 'legal-2',
    sectionId: 'legal',
    title: 'Как правильно написать рапорт',
    summary: 'Структура, экземпляры и что делать, если не принимают',
    tags: ['рапорт', 'документы'],
  },
  {
    id: 'service-1',
    sectionId: 'service',
    title: 'Контракт о прохождении военной службы — на что смотреть',
    summary: 'Срок, условия расторжения и типичные спорные моменты',
    tags: ['контракт', 'служба'],
  },
  {
    id: 'after-1',
    sectionId: 'after',
    title: 'Статус ветерана боевых действий — как получить',
    summary: 'Документы, порядок оформления и основные льготы',
    tags: ['ветеран', 'льготы'],
  },
  {
    id: 'emergency-1',
    sectionId: 'emergency',
    title: 'Пропал без вести — первые действия родственников',
    summary: 'Куда обращаться в первые часы и дни',
    tags: ['пропал', 'поиск'],
  },
  {
    id: 'emergency-2',
    sectionId: 'emergency',
    title: 'Гибель военнослужащего — что делать семье',
    summary: 'Документы, выплаты и на что обратить внимание',
    tags: ['гибель', 'семья'],
  },
]
