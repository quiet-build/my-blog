// Pure helpers for reading Notion official-API property objects.

export function propByName(properties, name) {
  const key = Object.keys(properties).find(
    k => k.toLowerCase() === name.toLowerCase()
  )
  return key ? properties[key] : undefined
}

function plain(prop) {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('')
  return ''
}

function selectName(prop) {
  if (!prop) return ''
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'status') return prop.status?.name ?? ''
  return ''
}

function multiNames(prop) {
  if (prop?.type === 'multi_select') return prop.multi_select.map(s => s.name)
  return []
}

function dateStart(prop) {
  if (prop?.type === 'date') return prop.date?.start ?? ''
  return ''
}

// Extract a normalized post record from a Notion page object.
export function extractProps(page) {
  const props = page.properties
  return {
    id: page.id,
    title: plain(propByName(props, 'title')),
    slug: plain(propByName(props, 'slug')),
    date: dateStart(propByName(props, 'date')),
    type: selectName(propByName(props, 'type')),
    status: selectName(propByName(props, 'status')),
    tags: multiNames(propByName(props, 'tags')),
    summary: plain(propByName(props, 'summary'))
  }
}
