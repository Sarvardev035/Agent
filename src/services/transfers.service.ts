import api from '../lib/api'

export interface Transfer {
  id: number
  fromAccountId: number
  toAccountId: number
  amount: number
  date: string
  note?: string
}

export const transfersService = {
  getAll:  () => api.get<Transfer[]>('/api/transfers'),
  create:  (data: unknown) => api.post<Transfer>('/api/transfers', data),
}
