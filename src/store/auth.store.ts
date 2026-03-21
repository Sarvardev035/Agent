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
      const { data } = await authService.login({ email, password })
      const token =
        data.token ||
        ((data as unknown) as Record<string, unknown>).accessToken ||
        ((data as unknown) as Record<string, unknown>).access_token ||
        ((data as unknown) as Record<string, unknown>).jwt
      if (!token) throw new Error('No token in response')
      TokenStorage.set(token as string)
      set({
        isAuthenticated: true,
        user: data.user || { id: 0, name: email.split('@')[0], email },
        isLoading: false,
      })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await authService.logout()
    TokenStorage.clear()
    set({ user: null, isAuthenticated: false })
  },
}))
