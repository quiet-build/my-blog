import { createContext, useContext, type ReactNode } from 'react'
import type { BlogConfig } from '@/types'

const ConfigContext = createContext<BlogConfig | undefined>(undefined)

export function ConfigProvider ({ value, children }: { value: BlogConfig; children: ReactNode }) {
  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig (): BlogConfig {
  const config = useContext(ConfigContext)
  if (!config) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return config
}
