import api from './axios'

type IncomePayload = {
  amount: number
  currency: 'USD' | 'EUR' | 'UZS'
  description?: string
  incomeDate: string
  categoryId: string
  accountId: string
}

export const incomeApi = {
  getAll: (params?: { accountId?: string; startDate?: string; endDate?: string; categoryId?: string }) =>
    api.get('/api/incomes', { params }),
  create: (data: IncomePayload) => api.post('/api/incomes', data),
  update: (id: string | number, data: Partial<IncomePayload>) => api.put(`/api/incomes/${id}`, data),
  delete: (id: string | number) => api.delete(`/api/incomes/${id}`),
}
