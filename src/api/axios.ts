import axios from 'axios'
import { API_BASE_URL } from '../lib/config'
import { TokenStorage, UserProfileStorage } from '../lib/security'
import { showCoffeeToast } from '../lib/coffeeToast'

let redirectingToLogin = false
let activeRequests = 0
let activeSlowRequests = 0
let nextRequestId = 1
const requestMeta = new Map<number, { timer?: number; slow: boolean }>()
let refreshPromise: Promise<string | null> | null = null

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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const extractAccessToken = (value: unknown): string | null => {
  const root = asRecord(value)
  const inner = asRecord(root.data)
  const result = asRecord(root.result)
  const candidates = [
    root.accessToken,
    root.access_token,
    root.token,
    inner.accessToken,
    inner.access_token,
    inner.token,
    result.accessToken,
    result.access_token,
    result.token,
  ]
  const found = candidates.find((candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0)
  return found ?? null
}

const extractRefreshToken = (value: unknown): string | null => {
  const root = asRecord(value)
  const inner = asRecord(root.data)
  const result = asRecord(root.result)
  const candidates = [
    root.refreshToken,
    root.refresh_token,
    inner.refreshToken,
    inner.refresh_token,
    result.refreshToken,
    result.refresh_token,
  ]
  const found = candidates.find((candidate): candidate is string => typeof candidate === 'string' && candidate.length > 0)
  return found ?? null
}

const performTokenRefresh = async (): Promise<string | null> => {
  const refreshToken = TokenStorage.getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = axios
      .post(
        `${API_BASE_URL}/api/auth/token/refresh`,
        { refreshToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 10000,
        }
      )
      .then(response => {
        const nextAccessToken = extractAccessToken(response.data)
        const nextRefreshToken = extractRefreshToken(response.data)
        if (!nextAccessToken) throw new Error('No access token returned from refresh')
        TokenStorage.setTokens(nextAccessToken, nextRefreshToken || refreshToken)
        return nextAccessToken
      })
      .catch(() => {
        TokenStorage.clear()
        UserProfileStorage.clear()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

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
  baseURL: API_BASE_URL,
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

  const token = TokenStorage.get()
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
    const originalConfig = error.config as Record<string, any> | undefined
    const requestPath = String(originalConfig?.url || '')
    const isRefreshRequest = requestPath.includes('/api/auth/token/refresh')
    const isAuthRequest =
      requestPath.includes('/api/auth/login')
      || requestPath.includes('/api/auth/register')
      || isRefreshRequest

    const isNetworkError =
      error.code === 'ERR_NETWORK'
      || error.code === 'ECONNABORTED'
      || error.message === 'Network Error'
      || !error.response

    if (isNetworkError) {
      const offline = typeof navigator !== 'undefined' ? !navigator.onLine : false
      finalizeRequest(originalConfig, {
        offline,
        backendError: true,
        message: offline
          ? 'You are offline. We will reconnect automatically when the internet returns.'
          : 'The backend took too long to respond. Please try again in a moment.',
      })
      showCoffeeToast()
      return Promise.reject(new Error('SERVER_COFFEE'))
    }

    if (error.response?.status === 401 && originalConfig && !originalConfig.__isRetryRequest && !isAuthRequest) {
      originalConfig.__isRetryRequest = true
      finalizeRequest(originalConfig)
      return performTokenRefresh().then(nextAccessToken => {
        if (!nextAccessToken) {
          const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
          const isAuthRoute = pathname === '/login' || pathname === '/register'
          if (!isAuthRoute && !redirectingToLogin && typeof window !== 'undefined') {
            redirectingToLogin = true
            window.location.replace('/login')
          }
          throw error
        }
        originalConfig.headers = originalConfig.headers || {}
        originalConfig.headers.Authorization = `Bearer ${nextAccessToken}`
        return api(originalConfig)
      })
    }

    if (error.response?.status === 401) {
      const hadToken = Boolean(TokenStorage.get() || TokenStorage.getRefreshToken())
      const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
      const isAuthRoute = pathname === '/login' || pathname === '/register'

      TokenStorage.clear()
      UserProfileStorage.clear()

      if (hadToken && !isAuthRoute && !redirectingToLogin) {
        redirectingToLogin = true
        window.location.replace('/login')
      }
    }
    finalizeRequest(error.config)

    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ERR_NETWORK' ? 'Network error — check connection' : error.message)
    return Promise.reject(new Error(msg))
  }
)

export default api
