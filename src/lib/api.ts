import axios from 'axios'

const api = axios.create({
  baseURL: 'https://finly.uyqidir.uz',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('finly_access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const base = config.baseURL ?? ''
  const url = config.url ?? ''
  console.log('✅ API call to:', base + url)
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    console.error('❌ API error:', {
      url:    error.config?.url,
      status: error.response?.status,
      data:   error.response?.data,
      sent:   error.config?.data,
    })
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.code === 'ERR_NETWORK'
        ? 'Network error — check connection'
        : error.message)
    return Promise.reject(new Error(msg))
  }
)

// Helper to extract data from { success: true, data: {} }
export const unwrap = <T>(response: { data: { data: T } }): T => {
  return response.data?.data ?? (response.data as unknown as T)
}

export default api
