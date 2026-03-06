import { useEffect } from 'react'
import { useConfig } from '@/lib/config'

const Scripts = () => {
  const BLOG = useConfig()

  useEffect(() => {
    if (BLOG.analytics && BLOG.analytics.provider === 'ackee') {
      const script = document.createElement('script')
      script.src = BLOG.analytics.ackeeConfig.tracker
      script.setAttribute('data-ackee-server', BLOG.analytics.ackeeConfig.dataAckeeServer)
      script.setAttribute('data-ackee-domain-id', BLOG.analytics.ackeeConfig.domainId)
      script.async = true
      document.head.appendChild(script)
      return () => {
        document.head.removeChild(script)
      }
    }
  }, [BLOG.analytics])

  useEffect(() => {
    if (BLOG.analytics && BLOG.analytics.provider === 'ga') {
      const gtagScript = document.createElement('script')
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${BLOG.analytics.gaConfig.measurementId}`
      gtagScript.async = true
      document.head.appendChild(gtagScript)

      const inlineScript = document.createElement('script')
      inlineScript.innerHTML = `window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${BLOG.analytics.gaConfig.measurementId}', {
          page_path: window.location.pathname,
        });`
      document.head.appendChild(inlineScript)

      return () => {
        document.head.removeChild(gtagScript)
        document.head.removeChild(inlineScript)
      }
    }
  }, [BLOG.analytics])

  return null
}

export default Scripts
