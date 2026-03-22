import axios from 'axios'

let redirectingToLogin = false
let activeRequests = 0
let activeSlowRequests = 0
let nextRequestId = 1
const requestMeta = new Map<number, { timer?: number; slow: boolean }>()

type NetworkStatusDetail = {
  offline: boolean
  slow: boolean
  backendError: boolean
  message: string
}

declare global {
  interface Window {
    __FINLY_NETWORK_EVENTS_BOUND__?: boolean
  }
}

const networkStatus: NetworkStatusDetail = {
  offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  slow: false,
  backendError: false,
  message: '',
}

const emitNetworkStatus = (patch: Partial<NetworkStatusDetail>) => {
  if (typeof window === 'undefined') return

  Object.assign(networkStatus, patch)
  window.dispatchEvent(new CustomEvent('finly:network-status', { detail: { ...networkStatus } }))
}

const slowMessage = 'Backend is responding slowly. Finly is still waiting for the server.'

const bindBrowserNetworkEvents = () => {
  if (typeof window === 'undefined' || window.__FINLY_NETWORK_EVENTS_BOUND__) return

  window.__FINLY_NETWORK_EVENTS_BOUND__ = true

  window.addEventListener('offline', () => {
    emitNetworkStatus({
      offline: true,
      backendError: true,
      message: 'You are offline. We will reconnect automatically when the internet returns.',
    })
  })

  window.addEventListener('online', () => {
    emitNetworkStatus({
      offline: false,
      backendError: false,
      message: activeSlowRequests > 0 ? slowMessage : '',
    })
  })
}

bindBrowserNetworkEvents()

const finalizeRequest = (config?: Record<string, any>, patch?: Partial<NetworkStatusDetail>) => {
  const requestId = Number(config?.__finlyRequestId)
  const meta = requestMeta.get(requestId)

  if (meta?.timer) window.clearTimeout(meta.timer)
  if (meta?.slow && activeSlowRequests > 0) activeSlowRequests -= 1
  if (!Number.isNaN(requestId)) requestMeta.delete(requestId)
  if (activeRequests > 0) activeRequests -= 1

  emitNetworkStatus({
    slow: activeSlowRequests > 0,
    ...(patch ?? {}),
    message:
      patch?.message
      ?? (networkStatus.offline
        ? networkStatus.message
        : activeSlowRequests > 0
          ? slowMessage
          : ''),
  })
}

export const unwrap = <T>(response: { data: any }): T => {
  const payload = response?.data
  if (payload?.data !== undefined) return payload.data as T
  if (payload?.result !== undefined) return payload.result as T
  return payload as T
}

const api = axios.create({
  baseURL: 'https://finly.uyqidir.uz',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const requestId = nextRequestId++
  ;(config as Record<string, any>).__finlyRequestId = requestId

  activeRequests += 1
  if (typeof window !== 'undefined') {
    const timer = window.setTimeout(() => {
      const meta = requestMeta.get(requestId)
      if (!meta || meta.slow) return
      meta.slow = true
      activeSlowRequests += 1
      emitNetworkStatus({
        slow: true,
        backendError: false,
        message: slowMessage,
      })
    }, 1600)

    requestMeta.set(requestId, { timer, slow: false })
  }

  const token = localStorage.getItem('finly_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => {
    finalizeRequest(response.config, {
      backendError: false,
      offline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    })
    return response
  },
  error => {
    const isConnectivityError =
      error.code === 'ERR_NETWORK'
      || error.code === 'ECONNABORTED'
      || (!error.response && !!error.request)

    if (error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem('finly_access_token'))
      const pathname = window.location.pathname
      const isAuthRoute = pathname === '/login' || pathname === '/register'

      localStorage.removeItem('finly_access_token')
      localStorage.removeItem('finly_refresh_token')

      if (hadToken && !isAuthRoute && !redirectingToLogin) {
        redirectingToLogin = true
        window.location.replace('/login')
      }
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('CORS or network error on:', error.config?.url)
    }

    if (isConnectivityError) {
      const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false
      const message = offline
        ? 'You are offline. We will retry when the connection comes back.'
        : error.code === 'ECONNABORTED'
          ? 'The backend took too long to respond. Please try again in a moment.'
          : 'No response from backend. Please check your connection and retry.'

      finalizeRequest(error.config, {
        offline,
        backendError: true,
        message,
      })
    } else {
      finalizeRequest(error.config)
    }

    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ERR_NETWORK' ? 'Network error — check connection' : error.message)
    return Promise.reject(new Error(msg))
  }
)

export default api
