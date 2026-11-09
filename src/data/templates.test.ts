import { describe, expect, it } from 'vitest'
import { articles } from './sections'
import { templates } from './templates'

describe('templates', () => {
  it('собирает каждый шаблон без undefined', () => {
    for (const template of templates) {
      const values = Object.fromEntries(template.fields.map((field) => [field.id, '']))
      expect(template.build(values), template.id).not.toContain('undefined')
    }
  })

  it('ссылается только на существующие статьи', () => {
    const ids = new Set(articles.map((article) => article.id))
    for (const template of templates) {
      for (const articleId of template.articleIds ?? []) {
        expect(ids.has(articleId), `${template.id}: ${articleId}`).toBe(true)
      }
    }
  })
})
