import axios from 'axios'
import { TokenStorage } from './security'

const BASE_URL = 'https://finly.uyqidir.uz'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use(config => {
  const token = TokenStorage.get()
  if (token) config.headers.Authorization = `Bearer ${token}`
  console.log('✅ API call to:', (config.baseURL ?? '') + (config.url ?? ''))
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    console.error('❌ API error:', err.config?.url, err.message)
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
