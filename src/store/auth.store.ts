import { create } from 'zustand'
import { AxiosError } from 'axios'
import { TokenStorage, UserProfileStorage } from '../lib/security'
import { authService } from '../services/auth.service'
import { unwrap } from '../lib/api'

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
  initAuth: () => Promise<void>
}

type UnknownRecord = Record<string, unknown>

const asRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? (value as UnknownRecord) : {}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: TokenStorage.isValid(),
  isLoading: false,

  initAuth: async () => {
    const valid = TokenStorage.isValid()
    if (!valid) {
      TokenStorage.clear()
      UserProfileStorage.clear()
      set({ isAuthenticated: false, user: null })
      return
    }

    const cachedProfile = UserProfileStorage.get()
    if (cachedProfile.name || cachedProfile.email) {
      set({
        isAuthenticated: true,
        user: {
          id: '',
          name: cachedProfile.name || cachedProfile.email.split('@')[0] || 'User',
          email: cachedProfile.email,
        },
      })
    }

    try {
      const response = await authService.me()
      const profile = asRecord(unwrap<Record<string, unknown>>(response))
      const user = {
        id: String(profile.id || ''),
        name: String(profile.fullName || profile.name || cachedProfile.name || 'User'),
        email: String(profile.email || cachedProfile.email || ''),
      }

      UserProfileStorage.set({ name: user.name, email: user.email })
      set({ isAuthenticated: true, user })
    } catch {
      if (!cachedProfile.name && !cachedProfile.email) {
        set({ isAuthenticated: true, user: null })
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const response = await authService.login({ email, password })
      const payload = asRecord(response.data)
      const inner = asRecord(payload.data)
      const accessToken = (inner.accessToken || payload.accessToken) as string | undefined
      const refreshToken = (inner.refreshToken || payload.refreshToken) as string | undefined
      if (!accessToken) throw new Error('No token in response')
      TokenStorage.setTokens(accessToken, refreshToken)
      const userFromResponse = (inner.user || payload.user) as User | undefined
      const nextUser = userFromResponse || { id: '', name: email.split('@')[0], email }
      UserProfileStorage.set({ name: nextUser.name, email: nextUser.email })
      set({
        isAuthenticated: true,
        user: nextUser,
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
    localStorage.removeItem('finly_theme')
    sessionStorage.clear()
    TokenStorage.clear()
    UserProfileStorage.clear()
    set({ user: null, isAuthenticated: false })
    window.location.href = '/login'
  },
}))
