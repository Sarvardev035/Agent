import api from '../lib/api'

export interface Expense {
  id: string
  amount: number
  currency: string
  description?: string
  expenseDate: string
  categoryId: string
  accountId: string
  categoryName?: string
}

export const expensesService = {
  getAll: (params?: {
    accountId?: string
    categoryId?: string
    startDate?: string
    endDate?: string
  }) => api.get('/api/expenses', { params }),

  create: (d: {
    amount: number
    currency: string
    description: string
    expenseDate: string
    categoryId: string
    accountId: string
  }) => api.post('/api/expenses', d),

  update: (id: string, d: unknown) => api.put(`/api/expenses/${id}`, d),

  delete: (id: string) => api.delete(`/api/expenses/${id}`),
}
