import 'prismjs/themes/prism.css'
import 'react-notion-x/src/styles.css'
import 'katex/dist/katex.min.css'
import '@/styles/globals.css'
import '@/styles/notion.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'

import BLOG from '../blog.config'
import { queryClient } from './queryClient'
import { router } from './router'
import { ConfigProvider } from '@/lib/config'
import { LocaleProvider } from '@/lib/locale'
import { ThemeProvider } from '@/lib/theme'
import { prepareDayjs } from '@/lib/dayjs'
import loadLocale from '@/assets/i18n'

async function init () {
  const locale = await loadLocale('basic', BLOG.lang)
  prepareDayjs(BLOG.timezone)

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ConfigProvider value={BLOG}>
            <LocaleProvider value={locale}>
              <ThemeProvider>
                <RouterProvider router={router} />
              </ThemeProvider>
            </LocaleProvider>
          </ConfigProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </React.StrictMode>
  )
}

init()
