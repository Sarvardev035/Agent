import axios from 'axios'
import { TokenStorage } from './security'

const api = axios.create({
  baseURL: '/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use(config => {
  const token = TokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      TokenStorage.clear()
      window.location.href = '/login'
    }
    const msg =
      err.response?.data?.message ||
      err.response?.data?.error ||
      (err.code === 'ERR_NETWORK'
        ? 'Network error. Check your connection.'
        : err.message)
    return Promise.reject(new Error(msg))
  }
)

export default api
