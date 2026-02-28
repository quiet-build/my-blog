import { useRouterState } from '@tanstack/react-router'
import useAckee from 'use-ackee'

const Ackee = ({ ackeeServerUrl, ackeeDomainId }) => {
  const { location } = useRouterState()
  useAckee(
    location.pathname,
    { server: ackeeServerUrl, domainId: ackeeDomainId },
    { detailed: false, ignoreLocalhost: true }
  )
  return null
}

export default Ackee
