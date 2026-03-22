import api from './axios'

type DebtPayload = {
  personName: string
  type: 'DEBT' | 'RECEIVABLE'
  currency: 'USD' | 'EUR' | 'UZS'
  accountId?: string
  amount: number
  description?: string
  dueDate: string
}

export const debtsApi = {
  getAll: (params?: { type?: 'DEBT' | 'RECEIVABLE'; status?: 'OPEN' | 'CLOSED' }) =>
    api.get('/api/debts', { params }),
  create: (data: DebtPayload) => api.post('/api/debts', data),
  repay: (id: string | number, data: { paymentAmount: number; accountId?: string }) =>
    api.post(`/api/debts/${id}/repay`, data),
  delete: (id: string | number) => api.delete(`/api/debts/${id}`),
}
