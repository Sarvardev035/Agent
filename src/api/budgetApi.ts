import api from './axios'

type BudgetType = 'OVERALL' | 'EXPENSE' | 'INCOME'

export const budgetApi = {
  get: (params?: { year?: number; month?: number }) => api.get('/api/budgets', { params }),
  set: (data: {
    monthlyLimit: number
    year: number
    month: number
    type: BudgetType
    currency: 'UZS' | 'USD' | 'EUR'
  }) => api.post('/api/budgets', data),
  getCategories: (params?: { year?: number; month?: number }) => api.get('/api/budgets', { params }),
  setCategory: (data: {
    monthlyLimit: number
    categoryId: string
    type: BudgetType
    currency: 'UZS' | 'USD' | 'EUR'
    year: number
    month: number
  }) => api.post('/api/budgets', data),
}
