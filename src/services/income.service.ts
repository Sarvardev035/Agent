import api from '../lib/api'

export interface Income {
  id: number
  amount: number
  date: string
  description?: string
  category: string
  accountId: number
}

export const incomeService = {
  getAll:  (params?: Record<string, unknown>) =>
             api.get<Income[]>('/api/income', { params }),
  create:  (data: unknown) => api.post<Income>('/api/income', data),
  update:  (id: number, d: unknown) => api.put<Income>(`/api/income/${id}`, d),
  delete:  (id: number)    => api.delete(`/api/income/${id}`),
}
