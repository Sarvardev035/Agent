import { useEffect, useMemo, useState, useCallback } from 'react'
import { format, subDays } from 'date-fns'
import {
  ArrowRight,
  AlertTriangle,
  Flame,
  Plus,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import StatCard from '../components/ui/StatCard'
import Skeleton from '../components/ui/Skeleton'
import BankCard from '../components/ui/BankCard'
import TransactionItem from '../components/ui/TransactionItem'
import ProgressBar from '../components/ui/ProgressBar'
import ProgressRing from '../components/ui/ProgressRing'
import CurrencyWidget from '../components/widgets/CurrencyWidget'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { CATEGORY_META, getTimeOfDay, isThisMonth, toArray, safeArray, mapAccountType } from '../lib/helpers'
import { formatCurrency, useExchangeRates } from '../lib/currency'
import api from '../lib/api'
import { Expense } from '../services/expenses.service'
import { Income } from '../services/income.service'
import { Debt } from '../services/debts.service'
import { Account } from '../services/accounts.service'
import { generateNotifications, dismissNotification, BudgetCategory } from '../lib/notifications'
import { ExpenseSchema, IncomeSchema, TransferSchema } from '../lib/security'
import { useFinanceStore } from '../store/finance.store'
import { useAuthStore } from '../store/auth.store'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface BudgetOverview {
  goal?: number
  spent?: number
  categories?: BudgetCategory[]
}

type ExpenseForm = Omit<Expense, 'id'>
type IncomeForm = Omit<Income, 'id'>
interface TransferForm {
  fromAccountId: number
  toAccountId: number
  amount: number
  date: string
  note?: string
}

const defaultExpense: ExpenseForm = {
  amount: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  category: 'FOOD',
  accountId: 0,
}

const defaultIncome: IncomeForm = {
  amount: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
  description: '',
  category: 'SALARY',
  accountId: 0,
}

const defaultTransfer: TransferForm = {
  amount: 0,
  date: format(new Date(), 'yyyy-MM-dd'),
  note: '',
  fromAccountId: 0,
  toAccountId: 0,
}

const ChartSkeleton = () => (
  <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
      <Skeleton width={160} height={16} />
      <Skeleton width={80} height={16} />
    </div>
    <Skeleton height={160} />
  </div>
)

const Dashboard = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [income, setIncome] = useState<Income[]>([])
  const [debts, setDebts] = useState<Debt[]>([])
  const [budget, setBudget] = useState<BudgetOverview>({})
  const [warnings, setWarnings] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [chartReady, setChartReady] = useState(false)
  const [expenseModal, setExpenseModal] = useState(false)
  const [incomeModal, setIncomeModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseForm>(defaultExpense)
  const [incomeForm, setIncomeForm] = useState<IncomeForm>(defaultIncome)
  const [transferForm, setTransferForm] = useState<TransferForm>(defaultTransfer)
  const [noteTick, setNoteTick] = useState(0)
  const refreshAccounts = useFinanceStore(s => s.refreshAccounts)
  const { accounts: storeAccounts } = useFinanceStore()
  const user = useAuthStore(s => s.user)
  const { convert } = useExchangeRates()

  useEffect(() => {
    setChartReady(true)
  }, [])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [accRes, expRes, incRes, debtRes] = await Promise.allSettled([
        api.get('/api/accounts'),
        api.get('/api/expenses'),
        api.get('/api/income'),
        api.get('/api/debts'),
      ])

      const accounts = safeArray<Account>(
        accRes.status === 'fulfilled' ? accRes.value.data : []
      )
      const expenses = safeArray<Expense>(
        expRes.status === 'fulfilled' ? expRes.value.data : []
      )
      const incomes = safeArray<Income>(
        incRes.status === 'fulfilled' ? incRes.value.data : []
      )
      const debts = safeArray<Debt>(
        debtRes.status === 'fulfilled' ? debtRes.value.data : []
      )

      const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0)
      const monthlyIncome = incomes
        .filter(i => isThisMonth(i.date))
        .reduce((s, i) => s + (i.amount ?? 0), 0)
      const monthlyExpenses = expenses
        .filter(e => isThisMonth(e.date))
        .reduce((s, e) => s + (e.amount ?? 0), 0)

      const recentTxns = [
        ...expenses.map(e => ({ ...e, txnType: 'expense' as const })),
        ...incomes.map(i => ({ ...i, txnType: 'income' as const })),
      ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const greeting = useMemo(() => {
    const tod = getTimeOfDay()
    const name = user?.name ? `, ${user.name.split(' ')[0]}` : ''
    return `Good ${tod}${name}`
  }, [user?.name])

  const totalBalance = accounts.reduce((sum, a) => sum + (a.balance ?? 0), 0)
  const expensesThisMonth = expenses
    .filter(e => isThisMonth(e.date))
    .reduce((s, e) => s + (e.amount ?? 0), 0)
  const incomeThisMonth = income
    .filter(i => isThisMonth(i.date))
    .reduce((s, i) => s + (i.amount ?? 0), 0)
  const totalBalanceFormatted = formatCurrency(totalBalance)
  const expensesThisMonthFormatted = formatCurrency(expensesThisMonth)
  const incomeThisMonthFormatted = formatCurrency(incomeThisMonth)
  const openDebts = debts.filter(d => d.status === 'OPEN').length

  const activities = useMemo(
    () =>
      [...expenses.map(e => ({
        id: `exp_${e.id}`,
        type: 'expense' as const,
        amount: e.amount,
        category: e.category,
        date: e.date,
        description: e.description,
        currency: accounts.find(a => a.id === e.accountId)?.currency,
        accountLabel: accounts.find(a => a.id === e.accountId)?.name,
      })),
      ...income.map(i => ({
        id: `inc_${i.id}`,
        type: 'income' as const,
        amount: i.amount,
        category: i.category,
        date: i.date,
        description: i.description,
        currency: accounts.find(a => a.id === i.accountId)?.currency,
        accountLabel: accounts.find(a => a.id === i.accountId)?.name,
      }))]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6),
    [accounts, expenses, income]
  )

  const notificationList = useMemo(
    () => generateNotifications(expenses, budget.categories ?? [], debts),
    [expenses, budget.categories, debts, noteTick]
  )

  const recentSpendTrend = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const date = subDays(new Date(), 6 - idx)
      const dayKey = format(date, 'yyyy-MM-dd')
      const total = expenses
        .filter(e => e.date === dayKey)
        .reduce((s, e) => s + (e.amount ?? 0), 0)
      return { date: format(date, 'MMM d'), total }
    })
    return days
  }, [expenses])

  const handleExpenseSubmit = async () => {
    const parsed = ExpenseSchema.safeParse({ ...expenseForm, amount: Number(expenseForm.amount) })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/expenses', parsed.data)
      toast.success('Expense added')
      setExpenseModal(false)
      loadData()
      refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add expense'
      toast.error(msg)
    }
  }

  const handleIncomeSubmit = async () => {
    const parsed = IncomeSchema.safeParse({ ...incomeForm, amount: Number(incomeForm.amount) })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/income', parsed.data)
      toast.success('Income added')
      setIncomeModal(false)
      loadData()
      refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add income'
      toast.error(msg)
    }
  }

  const handleTransferSubmit = async () => {
    const parsed = TransferSchema.safeParse({
      ...transferForm,
      amount: Number(transferForm.amount),
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/transfers', parsed.data)
      toast.success('Transfer completed')
      setTransferModal(false)
      loadData()
      refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to transfer'
      toast.error(msg)
    }
  }

  const expenseQuickActions = [
    { label: 'Expense', icon: <TrendingDown size={16} />, onClick: () => setExpenseModal(true) },
    { label: 'Income', icon: <TrendingUp size={16} />, onClick: () => setIncomeModal(true) },
    { label: 'Transfer', icon: <ArrowLeftRight size={16} />, onClick: () => setTransferModal(true) },
  ]

  const budgetPct = budget.goal ? Math.min((budget.spent ?? 0) / budget.goal * 100, 150) : 0

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <p style={{ color: '#94a3b8', margin: 0, fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>
            OVERVIEW
          </p>
          <h1 style={{ margin: '6px 0 0', fontSize: 24, fontWeight: 800 }}>{greeting}</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Track your finances in real time.</p>
        </div>
        <button
          onClick={() => setExpenseModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 12px 30px rgba(37,99,235,0.2)',
            cursor: 'pointer',
            fontWeight: 700,
          }}
          type="button"
        >
          <Plus size={16} />
          Quick add
        </button>
      </div>

      {!!warnings.length && (
        <div
          style={{
            background: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '12px 14px',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
          }}
        >
          <AlertTriangle color="#f59e0b" size={18} />
          <span style={{ color: '#92400e', fontSize: 14 }}>{warnings.join(' • ')}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
        <StatCard label="Total balance" value={totalBalanceFormatted} color="#2563eb" isLoading={loading} />
        <StatCard label="Expenses (mo)" value={expensesThisMonthFormatted} color="#ef4444" changeType="down" isLoading={loading} />
        <StatCard label="Income (mo)" value={incomeThisMonthFormatted} color="#10b981" changeType="up" isLoading={loading} />
        <StatCard label="Open debts" value={openDebts} suffix=" open" color="#f59e0b" isLoading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 12, minHeight: 180 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} style={{ minWidth: 280 }}>
                    <Skeleton height={180} />
                  </div>
                ))
              : accounts.map(acc => (
                  <div key={acc.id} style={{ minWidth: 280 }}>
                    <BankCard
                      name={acc.name}
                      last4={String(acc.id).slice(-4)}
                      balance={acc.balance}
                      currency={acc.currency}
                      type={mapAccountType(acc.type)}
                      accountId={acc.id}
                    />
                  </div>
                ))}
          </div>
        </div>
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--sh-sm)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))',
            gap: 10,
          }}
        >
          {expenseQuickActions.map(action => (
            <button
              key={action.label}
              onClick={action.onClick}
              type="button"
              style={{
                padding: '12px 10px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {action.icon}
              {action.label}
              <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr)', gap: 16 }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--sh-sm)',
            minHeight: 260,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Recent activity</h3>
            <span style={{ color: '#94a3b8', fontSize: 13 }}>Last updates</span>
          </div>
          {loading ? (
            <Skeleton count={4} height={52} />
          ) : activities.length === 0 ? (
            <EmptyState title="No activity" description="Add an expense or income to get started." />
          ) : (
            <AnimatePresence>
              {activities.map(item => (
                <TransactionItem key={item.id} {...item} />
              ))}
            </AnimatePresence>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--sh-sm)',
            minHeight: 260,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Budget health</h3>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Overview of this month</p>
            </div>
            <span style={{ color: '#0f172a', fontWeight: 800 }}>{formatCurrency(budget.spent ?? 0)}</span>
          </div>
          {loading ? (
            <Skeleton height={140} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 16, alignItems: 'center' }}>
              <ProgressRing percent={budgetPct} label="Overall" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(budget.categories ?? []).length === 0 ? (
                  <EmptyState title="No budgets set" description="Set category limits to stay on track." />
                ) : (
                  (budget.categories ?? []).slice(0, 4).map(cat => (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{CATEGORY_META[cat.category]?.label ?? cat.category}</span>
                        <span style={{ color: '#64748b' }}>
                          {formatCurrency(cat.spent, 'UZS')} / {formatCurrency(cat.limit, 'UZS')}
                        </span>
                      </div>
                      <ProgressBar percent={(cat.spent / (cat.limit || 1)) * 100} animate />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: 16 }}>
        <div>
          {loading || !chartReady ? (
            <ChartSkeleton />
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 240 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>7-day expense trend</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Recent daily spending</p>
                </div>
              </div>
              <div style={{ width: '100%', minHeight: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={recentSpendTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tickLine={false} axisLine={false} dy={6} />
                    <YAxis tickLine={false} axisLine={false} tickFormatter={v => `${Math.round(v / 1000)}k`} width={50} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="url(#expenseGradient)"
                      dot={{ r: 3 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--sh-sm)',
            minHeight: 240,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Notifications</h3>
            <Flame size={18} color="#f97316" />
          </div>
          {loading ? (
            <Skeleton count={3} height={56} />
          ) : notificationList.length === 0 ? (
            <EmptyState title="All clear" description="No urgent alerts right now." />
          ) : (
            <AnimatePresence>
              {notificationList.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    display: 'flex',
                    gap: 10,
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: note.type === 'danger' ? '#fff1f2' : '#f8fafc',
                    color: '#0f172a',
                    marginBottom: 8,
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{note.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{note.message}</div>
                    {note.actionLabel && (
                      <button
                        onClick={() => {
                          dismissNotification(note.id)
                          setNoteTick(t => t + 1)
                        }}
                        type="button"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {note.actionLabel}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      dismissNotification(note.id)
                      setNoteTick(t => t + 1)
                    }}
                    type="button"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    ×
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <CurrencyWidget />

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add expense">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={e => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
            <input
              value={expenseForm.description ?? ''}
              onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="Lunch, ride, etc"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
              <select
                value={expenseForm.category}
                onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                {['FOOD', 'TRANSPORT', 'HEALTH', 'ENTERTAINMENT', 'UTILITIES', 'OTHER'].map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat]?.label ?? cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Account</label>
              <select
                value={expenseForm.accountId}
                onChange={e => setExpenseForm({ ...expenseForm, accountId: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value={0}>Select account</option>
                {storeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleExpenseSubmit}
            type="button"
            style={{
              marginTop: 4,
              padding: '12px',
              borderRadius: 12,
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Save expense
          </button>
        </div>
      </Modal>

      <Modal open={incomeModal} onClose={() => setIncomeModal(false)} title="Add income">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input
                type="number"
                value={incomeForm.amount}
                onChange={e => setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input
                type="date"
                value={incomeForm.date}
                onChange={e => setIncomeForm({ ...incomeForm, date: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
            <input
              value={incomeForm.description ?? ''}
              onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })}
              placeholder="Salary, gift, etc"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
              <select
                value={incomeForm.category}
                onChange={e => setIncomeForm({ ...incomeForm, category: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                {['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'].map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_META[cat]?.label ?? cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Account</label>
              <select
                value={incomeForm.accountId}
                onChange={e => setIncomeForm({ ...incomeForm, accountId: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value={0}>Select account</option>
                {storeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleIncomeSubmit}
            type="button"
            style={{
              marginTop: 4,
              padding: '12px',
              borderRadius: 12,
              background: '#10b981',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Save income
          </button>
        </div>
      </Modal>

      <Modal open={transferModal} onClose={() => setTransferModal(false)} title="New transfer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>From account</label>
              <select
                value={transferForm.fromAccountId}
                onChange={e => setTransferForm({ ...transferForm, fromAccountId: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value={0}>Select</option>
                {storeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>To account</label>
              <select
                value={transferForm.toAccountId}
                onChange={e => setTransferForm({ ...transferForm, toAccountId: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value={0}>Select</option>
                {storeAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input
                type="number"
                value={transferForm.amount}
                onChange={e => setTransferForm({ ...transferForm, amount: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input
                type="date"
                value={transferForm.date}
                onChange={e => setTransferForm({ ...transferForm, date: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Note</label>
            <input
              value={transferForm.note ?? ''}
              onChange={e => setTransferForm({ ...transferForm, note: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          {transferForm.amount > 0 && transferForm.fromAccountId && transferForm.toAccountId && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, color: '#0f172a' }}>
              {(() => {
                const from = storeAccounts.find(a => a.id === transferForm.fromAccountId)
                const to = storeAccounts.find(a => a.id === transferForm.toAccountId)
                if (!from || !to) return null
                const converted = convert(transferForm.amount, from.currency, to.currency)
                return (
                  <span>
                    {formatCurrency(transferForm.amount, from.currency)} ≈ {formatCurrency(converted, to.currency)}
                  </span>
                )
              })()}
            </div>
          )}
          <button
            onClick={handleTransferSubmit}
            type="button"
            style={{
              marginTop: 4,
              padding: '12px',
              borderRadius: 12,
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Confirm transfer
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard
