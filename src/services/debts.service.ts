import api from '../lib/api'

export interface Debt {
  id: string
  personName: string
  type: 'DEBT' | 'RECEIVABLE'
  currency: string
  accountId: string
  amount: number
  description?: string
  dueDate: string
  status?: 'OPEN' | 'CLOSED'
}

export const debtsService = {
  getAll: (params?: { type?: 'DEBT' | 'RECEIVABLE'; status?: 'OPEN' | 'CLOSED' }) =>
    api.get('/api/debts', { params }),

  create: (d: {
    personName: string
    type: 'DEBT' | 'RECEIVABLE'
    currency: string
    accountId: string
    amount: number
    description: string
    dueDate: string
  }) => api.post('/api/debts', d),

  repay: (id: string, d: { paymentAmount: number; accountId: string }) =>
    api.post(`/api/debts/${id}/repay`, d),

  delete: (id: string) => api.delete(`/api/debts/${id}`),
}
