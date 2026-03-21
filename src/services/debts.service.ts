import api from '../lib/api'

export interface Debt {
  id: number
  personName: string
  amount: number
  currency: string
  dueDate: string
  type: 'LENT' | 'BORROWED'
  status: 'OPEN' | 'CLOSED'
  description?: string
}

export const debtsService = {
  getAll:  () => api.get<Debt[]>('/api/debts'),
  create:  (data: unknown) => api.post<Debt>('/api/debts', data),
  update:  (id: number, d: unknown) => api.put<Debt>(`/api/debts/${id}`, d),
  delete:  (id: number)    => api.delete(`/api/debts/${id}`),
  close:   (id: number)    => api.put(`/api/debts/${id}`, { status: 'CLOSED' }),
}
