import type { Locale } from '@/types'

const locales = import.meta.glob<{ default: Locale }>('./basic/*.json')

export default async function loadLocale (_dir: string, lang: string): Promise<Locale> {
  const key = `./basic/${lang}.json`
  const loader = locales[key]
  if (loader) {
    const mod = await loader()
    return mod.default
  }
  const fallback = await locales['./basic/en-US.json']()
  return fallback.default
}
