import { create } from 'zustand'
import { TokenStorage } from '../lib/security'
import { authService } from '../services/auth.service'

interface User {
  id: number
  name: string
  email: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  initAuth: () => void
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

      // 2. Validate response status
      console.log('✅ [Auth] Response status:', response.status)

      if (response.status !== 200 && response.status !== 201) {
        throw new Error(`Unexpected status code: ${response.status}`)
      }

      const { data } = response
      console.log('📥 [Auth] Response data:', data)

      // 3. Extract token
      const token =
        data.token ||
        ((data as unknown) as Record<string, unknown>).accessToken ||
        ((data as unknown) as Record<string, unknown>).access_token ||
        ((data as unknown) as Record<string, unknown>).jwt

      if (!token) {
        console.error('❌ [Auth] No token found in response:', data)
        throw new Error('No token in response')
      }

      TokenStorage.set(token as string)
      set({
        isAuthenticated: true,
        user: data.user || { id: 0, name: email.split('@')[0], email },
        isLoading: false,
      })
    } catch (err: any) {
      set({ isLoading: false })

      // 4. Detailed error handling
      if (err.response) {
        // Server responded with a status code
        const status = err.response.status
        console.error('🔴 [Auth] Server error status:', status)
        console.error('🔴 [Auth] Server error data:', err.response.data)

        if (status === 404) {
          throw new Error('Connection error: API endpoint not found.')
        }
        if (status === 401 || status === 403) {
          throw new Error('Invalid email or password.')
        }
        if (status >= 500) {
          throw new Error('Server error. Please try again later.')
        }
      } else if (err.request) {
        // Request was made but no response received
        console.error('⚠️ [Auth] No response received:', err.request)
        throw new Error('No response from server. Check your internet connection.')
      } else {
        // Something happened in setting up the request
        console.error('❌ [Auth] Request setup error:', err.message)
      }

      throw err
    }
  },

  logout: async () => {
    await authService.logout()
    TokenStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
}))
