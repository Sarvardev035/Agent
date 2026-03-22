import { create } from 'zustand'
import { AxiosError } from 'axios'
import { TokenStorage } from '../lib/security'

interface User {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  initAuth: () => void
}

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {}

const extractToken = (value: unknown): string | null => {
  const record = asRecord(value)
  const candidates = [
    record.token,
    record.accessToken,
    record.access_token,
    record.jwt,
  ]
  const found = candidates.find((v): v is string => typeof v === 'string' && v.length > 0)
  return found ?? null
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: TokenStorage.isValid(),
  isLoading: false,

  initAuth: () => {
    const valid = TokenStorage.isValid()
    if (!valid) {
      TokenStorage.clear()
      set({ isAuthenticated: false, user: null })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      // 1. Log request details
      const endpoint = '/api/auth/login'
      const fullUrl = `https://finly.uyqidir.uz${endpoint}`
      console.log('🚀 [Auth] Initiating login request')
      console.log('🔗 [Auth] Full URL:', fullUrl)
      console.log('📦 [Auth] Payload:', { email, password: '***' })

      const response = await authService.login({ email, password })
      const payload = asRecord(response.data)
      const inner = asRecord(payload.data)
      const accessToken = (inner.accessToken || payload.accessToken) as string | undefined
      const refreshToken = (inner.refreshToken || payload.refreshToken) as string | undefined
      if (!accessToken) throw new Error('No token in response')
      TokenStorage.set(accessToken)
      if (refreshToken) localStorage.setItem('finly_refresh_token', refreshToken)
      const userFromResponse = (inner.user || payload.user) as User | undefined
      set({
        isAuthenticated: true,
        user: userFromResponse || { id: '', name: email.split('@')[0], email },
        isLoading: false,
      })
    } catch (err: unknown) {
      set({ isLoading: false })

      // 4. Detailed error handling
      const axiosErr = err as AxiosError
      if (axiosErr.response) {
        // Server responded with a status code
        const status = axiosErr.response.status
        console.error('🔴 [Auth] Server error status:', status)
        console.error('🔴 [Auth] Server error data:', axiosErr.response.data)

        if (status === 404) {
          throw new Error('Connection error: API endpoint not found.')
        }
        if (status === 401 || status === 403) {
          throw new Error('Invalid email or password.')
        }
        if (status >= 500) {
          throw new Error('Server error. Please try again later.')
        }
      } else if (axiosErr.request) {
        // Request was made but no response received
        console.error('⚠️ [Auth] No response received:', axiosErr.request)
        throw new Error('No response from server. Check your internet connection.')
      } else {
        // Something happened in setting up the request
        const genericErr = err as Error
        console.error('❌ [Auth] Request setup error:', genericErr.message)
      }

      throw err
    }
  },

  logout: () => {
    localStorage.removeItem('finly_access_token')
    localStorage.removeItem('finly_refresh_token')
    localStorage.removeItem('finly_user_name')
    localStorage.removeItem('finly_user_email')
    localStorage.removeItem('finly_theme')
    sessionStorage.clear()
    TokenStorage.clear()
    set({ user: null, isAuthenticated: false })
    window.location.href = '/login'
  },
}))
