import api from '../lib/api'

export interface Account {
  id: number
  name: string
  type: 'CARD' | 'CASH' | 'BANK'
  currency: string
  balance: number
}

export const accountsService = {
  getAll:  ()              => api.get<Account[]>('/api/accounts'),
  create:  (data: unknown) => api.post<Account>('/api/accounts', data),
  update:  (id: number, d: unknown) => api.put<Account>(`/api/accounts/${id}`, d),
  delete:  (id: number)    => api.delete(`/api/accounts/${id}`),
}
