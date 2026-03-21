import api from '../lib/api'

export interface Expense {
  id: number
  amount: number
  date: string
  description?: string
  category: string
  accountId: number
}

export const expensesService = {
  getAll:  (params?: Record<string, unknown>) =>
             api.get<Expense[]>('/api/expenses', { params }),
  create:  (data: unknown) => api.post<Expense>('/api/expenses', data),
  update:  (id: number, d: unknown) => api.put<Expense>(`/api/expenses/${id}`, d),
  delete:  (id: number)    => api.delete(`/api/expenses/${id}`),
}
