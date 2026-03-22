import { useEffect, useState } from 'react'

type NetworkStatusDetail = {
  offline: boolean
  slow: boolean
  backendError: boolean
  message: string
}

const initialStatus: NetworkStatusDetail = {
  offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  slow: false,
  backendError: false,
  message: '',
}

const NetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatusDetail>(initialStatus)

  useEffect(() => {
    const handleStatus = (event: Event) => {
      const customEvent = event as CustomEvent<NetworkStatusDetail>
      if (customEvent.detail) setStatus(customEvent.detail)
    }

    window.addEventListener('finly:network-status', handleStatus as EventListener)
    return () => window.removeEventListener('finly:network-status', handleStatus as EventListener)
  }, [])

  if (!status.offline && !status.slow && !status.backendError) return null

  const title = status.offline
    ? 'Internet connection lost'
    : status.backendError
      ? 'Backend is not responding'
      : 'Connection is slower than usual'

  const description = status.message
    || (status.offline
      ? 'We will reconnect automatically when your internet comes back.'
      : 'Please wait a moment while Finly syncs with the server.')

  return (
    <div
      className={`network-status${status.offline ? ' is-offline' : ''}${status.backendError ? ' is-error' : ''}${status.slow ? ' is-slow' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="network-status__loader" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="network-status__copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
    </div>
  )
}

export default NetworkStatus
