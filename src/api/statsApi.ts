import api from './axios'

export const statsApi = {
  summary: () => api.get('/api/analytics/summary'),
  overview: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/overview', { params }),
  cashflow: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/cashflow', { params }),
  balanceHistory: (params?: { months?: number }) =>
    api.get('/api/analytics/balance-history', { params }),
  accountBalances: () => api.get('/api/analytics/account-balances'),
  recentLargeExpenses: (params?: { startDate?: string; endDate?: string; limit?: number }) =>
    api.get('/api/analytics/recent-large-expenses', { params }),
  incomeGrowth: (params?: { months?: number }) =>
    api.get('/api/analytics/income-growth', { params }),
  insight: (params?: { startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/insight', { params }),
  expensesByCategory: (params?: { from?: string; to?: string; period?: string }) =>
    api.get('/api/analytics/expenses-by-category', { params }),
  monthlyExpenses: (params?: { from?: string; to?: string; period?: string }) =>
    api.get('/api/analytics/monthly-expenses', { params }),
  incomeVsExpense: (params?: { from?: string; to?: string; period?: string }) =>
    api.get('/api/analytics/income-vs-expense', { params }),
  categories: (params?: { type?: 'EXPENSE' | 'INCOME'; startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/categories', { params }),
  timeseries: (params: { period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'; startDate?: string; endDate?: string }) =>
    api.get('/api/analytics/timeseries', { params }),
}
