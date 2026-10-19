# ПравоБойца

Премиальный навигатор по правам военнослужащих и их семей.
Telegram Mini App.

## Концепция

Не просто база статей, а система чётких маршрутов «что делать прямо сейчас» для военнослужащих и их семей.

## Стек

- React 18 + TypeScript + Vite
- Tailwind CSS
- Telegram Mini Apps SDK (`@telegram-apps/sdk-react`)
- Framer Motion
- Zustand (состояние)
- React Router

## Цветовая система

- Фон: глубокий тёмно-зелёный / charcoal (`#0B0F0C`)
- Карточки: `#141A16`
- Акцент: военный изумруд / khaki-green (`#3D8B6E`)
- Текст: мягкий белый + приглушённые оттенки

## Запуск локально

```bash
npm install
npm run dev
```

## Структура

- `/src` — исходный код
- `/src/components` — UI-компоненты
- `/src/pages` — экраны
- `/src/data` — контент и конфигурация
- `/src/styles` — дизайн-токены
