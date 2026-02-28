import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useConfig } from '@/lib/config'
import * as gtag from '@/lib/gtag'

const Gtag = () => {
  const config = useConfig()
  const { location } = useRouterState()
  const prevPathname = useRef(location.pathname)

  useEffect(() => {
    if (location.pathname !== prevPathname.current) {
      gtag.pageview(config.analytics.gaConfig.measurementId, location.pathname)
      prevPathname.current = location.pathname
    }
  }, [config, location.pathname])

  return null
}
export default Gtag
