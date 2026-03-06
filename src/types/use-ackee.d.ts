declare module 'use-ackee' {
  interface AckeeEnvironment {
    server: string
    domainId: string
  }

  interface AckeeOptions {
    detailed?: boolean
    ignoreLocalhost?: boolean
    ignoreOwnVisits?: boolean
  }

  export default function useAckee(
    pathname: string,
    environment: AckeeEnvironment,
    options?: AckeeOptions
  ): void
}
