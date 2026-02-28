const locales = import.meta.glob('./basic/*.json')

export default async function loadLocale (_dir, lang) {
  const key = `./basic/${lang}.json`
  const loader = locales[key]
  if (loader) {
    const mod = await loader()
    return mod.default
  }
  const fallback = await locales['./basic/en-US.json']()
  return fallback.default
}
