import api from './axios'

type TransferPayload = {
  fromAccountId: string
  toAccountId: string
  amount: number
  description?: string
  transferDate: string
  exchangeRate: number
}

export const transfersApi = {
  getAll: (params?: { accountId?: string; startDate?: string; endDate?: string }) =>
    api.get('/api/transfers', { params }),
  create: (data: TransferPayload) => api.post('/api/transfers', data),
}
