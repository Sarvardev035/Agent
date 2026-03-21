import axios, { AxiosError, AxiosResponse } from 'axios'
import { TokenStorage } from './security'

// API URL configuration — can be overridden via environment variable
const apiBaseURL = import.meta.env.VITE_API_URL || 'https://finly.uyqidir.uz'

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10_000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

// ── Request interceptor ──────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = TokenStorage.get()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'https:' &&
      config.baseURL?.startsWith('http:')
    ) {
      return Promise.reject(new Error('Insecure request blocked'))
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      TokenStorage.clear()
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired'))
    }
    if (error.response?.status === 403) {
      return Promise.reject(new Error('Access denied'))
    }
    if (error.response?.status === 429) {
      return Promise.reject(new Error('Too many requests. Please wait.'))
    }
    // CORS error detection
    if (error.message === 'Network Error' && !error.response) {
      return Promise.reject(
        new Error(
          'CORS error: Backend server is not allowing requests from this domain. ' +
          'Please configure CORS on your backend to allow ' + window.location.origin
        )
      )
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out'))
    }
    if (error.code === 'ERR_NETWORK') {
      return Promise.reject(
        new Error(
          'Cannot reach backend server at ' + apiBaseURL + '. ' +
          'Verify backend is running and CORS is configured.'
        )
      )
    }
    return Promise.reject(error)
  }
)

export default api
