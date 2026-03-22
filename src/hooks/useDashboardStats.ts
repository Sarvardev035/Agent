import { useEffect, useState } from 'react'
import api, { unwrap } from '../api/axios'
import { safeArray } from '../lib/helpers'

type DashboardStats = {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  netSavings: number
  accounts: any[]
  expenses: any[]
  income: any[]
  recentTransactions: any[]
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>(null)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true)
        const [accounts, expenses, income] = await Promise.allSettled([
          api.get('/api/accounts'),
          api.get('/api/expenses'),
          api.get('/api/incomes'),
        ])

        const accountsData =
          accounts.status === 'fulfilled' ? safeArray<any>(unwrap(accounts.value)) : []
        const expensesData =
          expenses.status === 'fulfilled'
            ? safeArray<any>(unwrap(expenses.value)).map(e => ({
                ...e,
                date: e.expenseDate || e.date,
              }))
            : []
        const incomeData =
          income.status === 'fulfilled'
            ? safeArray<any>(unwrap(income.value)).map(i => ({
                ...i,
                date: i.incomeDate || i.date,
              }))
            : []

        const now = new Date()
        const thisMonth = (items: any[]) =>
          items.filter(i => {
            const d = new Date(i.date)
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
          })

        const totalBalance = accountsData.reduce((s: number, a: any) => s + (a.balance || 0), 0)
        const monthlyIncome = thisMonth(incomeData).reduce((s: number, i: any) => s + (i.amount || 0), 0)
        const monthlyExpenses = thisMonth(expensesData).reduce((s: number, e: any) => s + (e.amount || 0), 0)

        setStats({
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          netSavings: monthlyIncome - monthlyExpenses,
          accounts: accountsData,
          expenses: expensesData,
          income: incomeData,
          recentTransactions: [
            ...expensesData.map((e: any) => ({ ...e, type: 'expense' })),
            ...incomeData.map((i: any) => ({ ...i, type: 'income' })),
          ]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10),
        })
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  return { stats, loading, error }
}
