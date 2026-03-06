import { createContext, useContext, type ReactNode } from 'react'
import type { Locale } from '@/types'

const LocaleContext = createContext<Locale | undefined>(undefined)

export function LocaleProvider ({ value, children }: { value: Locale; children: ReactNode }) {
  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale (): Locale {
  const locale = useContext(LocaleContext)
  if (!locale) {
    throw new Error('useLocale must be used within a LocaleProvider')
  }
  return locale
}
