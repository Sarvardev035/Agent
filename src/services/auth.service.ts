import api from '../lib/api'
import { LoginInput, RegisterInput } from '../lib/security'

export interface AuthResponse {
  token: string
  user: { id: number; name: string; email: string }
}

export const authService = {
  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', data),

  logout: () =>
    api.post('/auth/logout').catch(() => {}),
}
