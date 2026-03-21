import api from '../lib/api'
import { LoginInput, RegisterInput } from '../lib/security'

export interface AuthResponse {
  token: string
  user: { id: number; name: string; email: string }
}

export const authService = {
  login: (data: LoginInput) => {
    console.log('🌐 [AuthService] POST /api/auth/login', { email: data.email });
    return api.post<AuthResponse>('/api/auth/login', data);
  },

  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/api/auth/register', data),

  logout: () =>
    api.post('/api/auth/logout').catch(() => {}),
}
