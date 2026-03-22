import axios from 'axios'

let redirectingToLogin = false

export const unwrap = <T>(response: { data: any }): T => {
  const payload = response?.data
  if (payload?.data !== undefined) return payload.data as T
  if (payload?.result !== undefined) return payload.result as T
  return payload as T
}

const api = axios.create({
  baseURL: 'https://finly.uyqidir.uz',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000,
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('finly_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const hadToken = Boolean(localStorage.getItem('finly_access_token'))
      const pathname = window.location.pathname
      const isAuthRoute = pathname === '/login' || pathname === '/register'

      localStorage.removeItem('finly_access_token')
      localStorage.removeItem('finly_refresh_token')

      if (hadToken && !isAuthRoute && !redirectingToLogin) {
        redirectingToLogin = true
        window.location.replace('/login')
      }
    }
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.warn('CORS or network error on:', error.config?.url)
    }
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ERR_NETWORK' ? 'Network error — check connection' : error.message)
    return Promise.reject(new Error(msg))
  }
)

export default api
