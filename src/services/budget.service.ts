import api from '../lib/api'

export const budgetService = {
  getAll: (params?: { year?: number; month?: number }) =>
    api.get('/api/budgets', { params }),

  create: (d: {
    categoryId: string
    type: 'EXPENSE'
    monthlyLimit: number
    year: number
    month: number
  }) => api.post('/api/budgets', d),

  delete: (id: string) => api.delete(`/api/budgets/${id}`),
}

export const budgetsService = budgetService
