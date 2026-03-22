import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence } from 'framer-motion'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import TransactionItem from '../components/ui/TransactionItem'
import { expensesApi } from '../api/expensesApi'
import { incomeApi } from '../api/incomeApi'
import { useFinance } from '../context/FinanceContext'
import { smartDate } from '../utils/helpers'
import { safeArray } from '../lib/helpers'

type CalendarTx = {
  id: string
  type: 'expense' | 'income'
  date: string
  category: string
  amount: number
  description?: string
  accountId?: string
  currency?: string
}

const CalendarView = () => {
  const { accounts, refreshAccounts } = useFinance()
  const [transactions, setTransactions] = useState<CalendarTx[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [expRes, incRes] = await Promise.allSettled([expensesApi.getAll(), incomeApi.getAll()])
      const expenses =
        expRes.status === 'fulfilled'
          ? safeArray<any>(expRes.value.data).map((e: any) => ({
              id: e.id,
              type: 'expense' as const,
              date: e.expenseDate || e.date,
              category: e.categoryId || e.category || 'OTHER',
              amount: e.amount,
              description: e.description,
              accountId: e.accountId,
              currency: e.currency || 'UZS',
            }))
          : []
      const income =
        incRes.status === 'fulfilled'
          ? safeArray<any>(incRes.value.data).map((i: any) => ({
              id: i.id,
              type: 'income' as const,
              date: i.incomeDate || i.date,
              category: i.categoryId || i.category || 'OTHER',
              amount: i.amount,
              description: i.description,
              accountId: i.accountId,
              currency: i.currency || 'UZS',
            }))
          : []
      setTransactions([...expenses, ...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      await refreshAccounts()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const grouped = useMemo(() => {
    const map: Record<string, CalendarTx[]> = {}
    transactions.forEach(tx => {
      const key = smartDate(tx.date) || format(new Date(tx.date), 'PPP')
      if (!map[key]) map[key] = []
      map[key].push(tx)
    })
    return map
  }, [transactions])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
      <div>
        <p style={{ color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>CALENDAR</p>
        <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Timeline of transactions</h1>
        <p style={{ margin: 0, color: 'var(--text-2)' }}>Browse transactions grouped by day.</p>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          minHeight: 240,
        }}
      >
        {loading ? (
          <Skeleton height={62} count={5} />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Add income or expenses to see them here." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800 }}>{dateLabel}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{items.length} items</div>
                </div>
                <AnimatePresence>
                  {items.map(item => {
                    const account = accounts.find(a => a.id === item.accountId)
                    return (
                      <TransactionItem
                        key={item.id}
                        type={item.type}
                        amount={item.amount}
                        category={item.category}
                        date={item.date}
                        description={item.description}
                        currency={account?.currency || 'UZS'}
                        accountLabel={account?.name}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarView
