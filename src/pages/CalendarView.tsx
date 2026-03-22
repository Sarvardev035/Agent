import { useEffect, useMemo, useState } from 'react'
import Calendar from 'react-calendar'
import { AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import TransactionItem from '../components/ui/TransactionItem'
import { Expense } from '../services/expenses.service'
import { Income } from '../services/income.service'
import { useFinanceStore } from '../store/finance.store'
import { safeArray } from '../lib/helpers'
import api from '../lib/api'

import 'react-calendar/dist/Calendar.css'

type CalendarTx = (Expense & { kind: 'expense' }) | (Income & { kind: 'income' })

const CalendarView = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())
  const { accounts, refreshAccounts } = useFinanceStore()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [expRes, incRes] = await Promise.allSettled([
          api.get('/api/expenses'),
          api.get('/api/incomes'),
        ])
        setExpenses(
          expRes.status === 'fulfilled' ? safeArray<Expense>(expRes.value.data) : []
        )
        setIncome(
          incRes.status === 'fulfilled' ? safeArray<Income>(incRes.value.data) : []
        )
        refreshAccounts()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to load calendar'
        console.error('❌ calendar load failed:', msg)
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const transactionsByDate = useMemo(() => {
    const map: Record<string, CalendarTx[]> = {}
    expenses.forEach(e => {
      const key = e.expenseDate
      if (!map[key]) map[key] = []
      map[key].push({ ...e, kind: 'expense' })
    })
    income.forEach(i => {
      const key = i.incomeDate
      if (!map[key]) map[key] = []
      map[key].push({ ...i, kind: 'income' })
    })
    return map
  }, [expenses, income])

  const selectedKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const selectedTransactions = transactionsByDate[selectedKey] ?? []

  return (
    <div className="page-enter" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--sh-sm)',
        }}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Calendar</h3>
        {loading ? (
          <Skeleton height={320} />
        ) : (
          <Calendar
            value={selectedDate}
            onChange={date => setSelectedDate(date as Date)}
            tileContent={({ date }) => {
              const key = format(date, 'yyyy-MM-dd')
              const has = transactionsByDate[key]
              return has ? (
                <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                  {has.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: item.kind === 'expense' ? '#ef4444' : '#10b981',
                        display: 'inline-block',
                      }}
                    />
                  ))}
                </div>
              ) : null
            }}
          />
        )}
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--sh-sm)',
          minHeight: 320,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Transactions</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>{selectedDate ? format(selectedDate, 'PPP') : ''}</p>
          </div>
        </div>
        {loading ? (
          <Skeleton height={52} count={4} />
        ) : selectedTransactions.length === 0 ? (
          <EmptyState title="No transactions" description="Choose another day or add one." />
        ) : (
          <AnimatePresence>
            {selectedTransactions.map((item, idx) => {
              const account = accounts.find(a => a.id === item.accountId)
              return (
                <TransactionItem
                  key={idx}
                  type={item.kind}
                  amount={item.amount}
                  category={item.categoryName || item.categoryId}
                  date={item.kind === 'expense' ? item.expenseDate : item.incomeDate}
                  description={item.description}
                  currency={account?.currency ?? 'UZS'}
                  accountLabel={account?.name}
                />
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default CalendarView
