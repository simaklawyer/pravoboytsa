import { articles } from '../data/sections'

/** Слова, которые не помогают искать. */
const STOP_WORDS = new Set([
  'без', 'как', 'что', 'для', 'при', 'или', 'про', 'это', 'мне', 'нет', 'над', 'под',
  'его', 'ещё', 'уже', 'был', 'мой', 'моя', 'мои', 'наш', 'где', 'чем', 'кто',
])

function normalize(text: string): string {
  return text.toLowerCase().replace(/ё/g, 'е')
}

/** Грубая «основа»: отрезаем окончание, чтобы «платят» находило «выплаты». */
function stem(word: string): string {
  if (word.length <= 4) return word
  if (word.length <= 6) return word.slice(0, 4)
  return word.slice(0, Math.min(word.length - 2, 6))
}

export function searchArticles(query: string) {
  const tokens = normalize(query)
    .split(/[^a-zа-я0-9]+/)
    .filter((t) => t.length >= 3 && !STOP_WORDS.has(t))
  if (tokens.length === 0) return []
  const stems = tokens.map(stem)

  return articles
    .map((article) => {
      const title = normalize(article.title)
      const rest = normalize(`${article.summary} ${article.tags.join(' ')}`)
      let score = 0
      for (const s of stems) {
        if (title.includes(s)) score += 3
        else if (rest.includes(s)) score += 1
      }
      return { article, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.article)
}
