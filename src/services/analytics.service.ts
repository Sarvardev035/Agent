import api from '../lib/api'

export const analyticsService = {
  summary: () => api.get('/api/analytics/summary'),
  expensesByCategory: (params?: { from?: string; to?: string }) =>
    api.get('/api/analytics/expenses-by-category', { params }),
  monthlyExpenses: (params?: { from?: string; to?: string }) =>
    api.get('/api/analytics/monthly-expenses', { params }),
  incomeVsExpense: (params?: { from?: string; to?: string }) =>
    api.get('/api/analytics/income-vs-expense', { params }),
  accountBalances: () => api.get('/api/analytics/account-balances'),
  dashboard: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/dashboard', { params }),
  categories: (params?: {
    type?: 'EXPENSE' | 'INCOME'
    startDate?: string
    endDate?: string
  }) => api.get('/api/analytics/categories', { params }),
  timeseries: (params: {
    period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    startDate?: string
    endDate?: string
  }) => api.get('/api/analytics/timeseries', { params }),
}
