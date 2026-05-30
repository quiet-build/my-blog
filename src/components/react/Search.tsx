import { useMemo, useState } from 'react'
import { Input } from '@quietbuildlab/ui'

interface Item { title: string; slug: string; summary: string; tags: string[] }
interface Props { items: Item[] }

export default function Search({ items }: Props) {
  const [q, setQ] = useState('')
  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return items
    return items.filter(i =>
      i.title.toLowerCase().includes(s) ||
      i.summary.toLowerCase().includes(s) ||
      i.tags.some(t => t.toLowerCase().includes(s))
    )
  }, [q, items])
  return (
    <div>
      <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search posts..." />
      <ul className="mt-6 space-y-4">
        {results.map(i => (
          <li key={i.slug}>
            <a href={`/posts/${i.slug}`} className="text-xl font-semibold hover:underline">{i.title}</a>
            {i.summary && <p className="text-sm text-[var(--muted-foreground)]">{i.summary}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
