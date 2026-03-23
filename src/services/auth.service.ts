import api from '../lib/api'
import { LoginInput, RegisterInput } from '../lib/security'

export const authService = {
  login: (data: LoginInput) => api.post('/api/auth/login', data),
  register: (data: RegisterInput) => api.post('/api/auth/register', data),
  me: () => api.get('/api/users/me'),
  logout: () => Promise.resolve(),
}
