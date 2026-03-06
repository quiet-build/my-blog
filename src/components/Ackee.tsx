import { useRouterState } from '@tanstack/react-router'
import useAckee from 'use-ackee'

interface AckeeProps {
  ackeeServerUrl: string
  ackeeDomainId: string
}

const Ackee = ({ ackeeServerUrl, ackeeDomainId }: AckeeProps) => {
  const { location } = useRouterState()
  useAckee(
    location.pathname,
    { server: ackeeServerUrl, domainId: ackeeDomainId },
    { detailed: false, ignoreLocalhost: true }
  )
  return null
}

export default Ackee
