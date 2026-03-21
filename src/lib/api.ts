import axios, { AxiosError, AxiosResponse } from 'axios'
import { TokenStorage } from './security'

// API URL configuration
// HARDCODED to ensure it always hits the correct backend
// The user reported issues with env variables, so we are making this explicit
const API_URL = 'https://finly.uyqidir.uz'

console.log('🔌 API Base URL configured to:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  withCredentials: true, // Backend allows credentials, so we enable it
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
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
    // 1. Handle 401 (Unauthorized)
    if (error.response?.status === 401) {
      // If this is a login attempt, don't redirect — just let the error bubble up
      // so the UI can show "Invalid credentials"
      if (error.config?.url?.includes('/login')) {
        return Promise.reject(error)
      }

      // For other requests, it means the token expired
      TokenStorage.clear()
      window.location.href = '/login'
      return Promise.reject(new Error('Session expired'))
    }

    // 2. Handle 403 (Forbidden)
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
          'Cannot reach backend server at ' + API_URL + '. ' +
          'Verify backend is running and CORS is configured.'
        )
      )
    }
    return Promise.reject(error)
  }
)

export default api
