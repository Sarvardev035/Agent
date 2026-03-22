import api from '../lib/api'

export interface Income {
  id: string
  amount: number
  currency: string
  description?: string
  incomeDate: string
  categoryId: string
  accountId: string
  categoryName?: string
}

export const incomesService = {
  getAll: (params?: {
    accountId?: string
    startDate?: string
    endDate?: string
  }) => api.get('/api/incomes', { params }),

  create: (d: {
    amount: number
    currency: string
    description: string
    incomeDate: string
    categoryId: string
    accountId: string
  }) => api.post('/api/incomes', d),

  update: (id: string, d: unknown) => api.put(`/api/incomes/${id}`, d),

  delete: (id: string) => api.delete(`/api/incomes/${id}`),
}

export const incomeService = incomesService
