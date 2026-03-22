import api from '../lib/api'

export interface Transfer {
  id: string
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
  transferDate: string
  exchangeRate: number
  currency?: string
}

export const transfersService = {
  getAll: (params?: { accountId?: string; startDate?: string; endDate?: string }) =>
    api.get('/api/transfers', { params }),

  create: (d: {
    fromAccountId: string
    toAccountId: string
    amount: number
    description: string
    transferDate: string
    exchangeRate: number
  }) => api.post('/api/transfers', d),

  delete: (id: string) => api.delete(`/api/transfers/${id}`),
}
