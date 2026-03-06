import { lazy, Suspense } from 'react'
import { Outlet } from '@tanstack/react-router'
import { useConfig } from '@/lib/config'
import Scripts from '@/components/Scripts'

const Ackee = lazy(() => import('@/components/Ackee'))
const Gtag = lazy(() => import('@/components/Gtag'))

export default function App () {
  const config = useConfig()

  return (
    <>
      <Scripts />
      <Suspense fallback={null}>
        {config.isProd && config.analytics.provider === 'ackee' && (
          <Ackee
            ackeeServerUrl={config.analytics.ackeeConfig.dataAckeeServer}
            ackeeDomainId={config.analytics.ackeeConfig.domainId}
          />
        )}
        {config.isProd && config.analytics.provider === 'ga' && <Gtag />}
      </Suspense>
      <Outlet />
    </>
  )
}
