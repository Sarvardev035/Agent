import api from './axios'

export const budgetApi = {
  get: (params?: { year?: number; month?: number }) => api.get('/api/budgets', { params }),
  set: (data: { monthlyLimit: number; year: number; month: number }) => api.post('/api/budgets', data),
  getCategories: (params?: { year?: number; month?: number }) => api.get('/api/budgets', { params }),
  setCategory: (data: {
    monthlyLimit: number
    categoryId: string
    type: 'MONTHLY'
    year: number
    month: number
  }) => api.post('/api/budgets/categories', data),
}
