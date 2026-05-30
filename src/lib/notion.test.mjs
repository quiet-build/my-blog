import { test } from 'node:test'
import assert from 'node:assert/strict'
import { extractProps, propByName } from './notion.mjs'

const page = {
  id: 'abc-123',
  properties: {
    Title: { type: 'title', title: [{ plain_text: 'Hello ' }, { plain_text: 'World' }] },
    Slug: { type: 'rich_text', rich_text: [{ plain_text: 'hello-world' }] },
    Date: { type: 'date', date: { start: '2024-01-15' } },
    Type: { type: 'select', select: { name: 'Post' } },
    Status: { type: 'status', status: { name: 'Published' } },
    Tags: { type: 'multi_select', multi_select: [{ name: 'astro' }, { name: 'notion' }] },
    Summary: { type: 'rich_text', rich_text: [{ plain_text: 'A summary.' }] }
  }
}

test('propByName is case-insensitive', () => {
  assert.equal(propByName(page.properties, 'title'), page.properties.Title)
})

test('extractProps maps a published post', () => {
  const p = extractProps(page)
  assert.equal(p.id, 'abc-123')
  assert.equal(p.title, 'Hello World')
  assert.equal(p.slug, 'hello-world')
  assert.equal(p.date, '2024-01-15')
  assert.equal(p.type, 'Post')
  assert.equal(p.status, 'Published')
  assert.deepEqual(p.tags, ['astro', 'notion'])
  assert.equal(p.summary, 'A summary.')
})

test('extractProps tolerates missing optional fields', () => {
  const bare = { id: 'x', properties: { Title: { type: 'title', title: [{ plain_text: 'T' }] }, Slug: { type: 'rich_text', rich_text: [{ plain_text: 's' }] } } }
  const p = extractProps(bare)
  assert.deepEqual(p.tags, [])
  assert.equal(p.summary, '')
  assert.equal(p.status, '')
})
