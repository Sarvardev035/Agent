import api from './axios'

type ExpensePayload = {
  amount: number
  currency: 'USD' | 'EUR' | 'UZS'
  description?: string
  expenseDate: string
  categoryId: string
  accountId: string
}

export const expensesApi = {
  getAll: (params?: { accountId?: string; startDate?: string; endDate?: string; categoryId?: string }) =>
    api.get('/api/expenses', { params }),
  create: (data: ExpensePayload) => api.post('/api/expenses', data),
  update: (id: string | number, data: Partial<ExpensePayload>) => api.put(`/api/expenses/${id}`, data),
  delete: (id: string | number) => api.delete(`/api/expenses/${id}`),
}
