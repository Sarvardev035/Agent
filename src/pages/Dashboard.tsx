import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import StatCard from '../components/ui/StatCard'
import Skeleton from '../components/ui/Skeleton'
import BankCard from '../components/ui/BankCard'
import TransactionItem from '../components/ui/TransactionItem'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import { formatCurrency } from '../lib/currency'
import { mapAccountType, safeArray, safeObject } from '../lib/helpers'
import { useFinanceStore } from '../store/finance.store'
import { useAuthStore } from '../store/auth.store'
import { accountsService, Account } from '../services/accounts.service'
import { expensesService, Expense } from '../services/expenses.service'
import { incomesService, Income } from '../services/income.service'
import { transfersService } from '../services/transfers.service'
import { debtsService, Debt } from '../services/debts.service'
import { analyticsService } from '../services/analytics.service'
import { notificationsService } from '../services/notifications.service'
import { useCategories } from '../hooks/useCategories'
import { CURRENCIES } from '../lib/constants'

interface Summary {
  totalBalance: number
  totalIncome: number
  totalExpense: number
  savings: number
}

interface ExpenseCategoryPoint {
  category: string
  amount: number
}

interface IncVsExpPoint {
  period: string
  income: number
  expense: number
}

type ExpenseForm = {
  amount: string
  expenseDate: string
  description: string
  categoryId: string
  accountId: string
  currency: string
}

type IncomeForm = {
  amount: string
  incomeDate: string
  description: string
  categoryId: string
  accountId: string
  currency: string
}

type TransferForm = {
  fromAccountId: string
  toAccountId: string
  amount: string
  transferDate: string
  description: string
  exchangeRate: string
}

const Dashboard = () => {
  const [summary, setSummary] = useState<Summary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpense: 0,
    savings: 0,
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [openDebts, setOpenDebts] = useState<Debt[]>([])
  const [expByCategory, setExpByCategory] = useState<ExpenseCategoryPoint[]>([])
  const [incVsExp, setIncVsExp] = useState<IncVsExpPoint[]>([])
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([])
  const [recentIncomes, setRecentIncomes] = useState<Income[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [expenseModal, setExpenseModal] = useState(false)
  const [incomeModal, setIncomeModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)

  const [expenseForm, setExpenseForm] = useState<ExpenseForm>({
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    categoryId: '',
    accountId: '',
    currency: 'UZS',
  })

  const [incomeForm, setIncomeForm] = useState<IncomeForm>({
    amount: '',
    incomeDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    categoryId: '',
    accountId: '',
    currency: 'UZS',
  })

  const [transferForm, setTransferForm] = useState<TransferForm>({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    transferDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    exchangeRate: '1',
  })

  const { categories: expenseCategories } = useCategories('EXPENSE')
  const { categories: incomeCategories } = useCategories('INCOME')
  const refreshAccounts = useFinanceStore(s => s.refreshAccounts)
  const user = useAuthStore(s => s.user)

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryRes, accountsRes, debtsRes, expByCatRes, incVsExpRes, expRes, incRes] = await Promise.allSettled([
        analyticsService.summary(),
        accountsService.getAll(),
        debtsService.getAll({ status: 'OPEN' }),
        analyticsService.expensesByCategory(),
        analyticsService.incomeVsExpense(),
        expensesService.getAll(),
        incomesService.getAll(),
      ])

      if (summaryRes.status === 'fulfilled') {
        const s = safeObject<Summary>(summaryRes.value.data)
        if (s) setSummary(s)
      }

      setAccounts(safeArray<Account>(accountsRes.status === 'fulfilled' ? accountsRes.value.data : []))
      setOpenDebts(safeArray<Debt>(debtsRes.status === 'fulfilled' ? debtsRes.value.data : []))
      setExpByCategory(safeArray<ExpenseCategoryPoint>(expByCatRes.status === 'fulfilled' ? expByCatRes.value.data : []))
      setIncVsExp(safeArray<IncVsExpPoint>(incVsExpRes.status === 'fulfilled' ? incVsExpRes.value.data : []))

      const allExpenses = safeArray<Expense>(expRes.status === 'fulfilled' ? expRes.value.data : [])
      const allIncomes = safeArray<Income>(incRes.status === 'fulfilled' ? incRes.value.data : [])

      setRecentExpenses(
        allExpenses
          .slice()
          .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())
          .slice(0, 5)
      )
      setRecentIncomes(
        allIncomes
          .slice()
          .sort((a, b) => new Date(b.incomeDate).getTime() - new Date(a.incomeDate).getTime())
          .slice(0, 5)
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!cancelled) {
        await loadDashboard()
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [loadDashboard])

  useEffect(() => {
    notificationsService.getAll()
      .then(res => setNotifications(safeArray(res.data)))
      .catch(() => setNotifications([]))
  }, [])

  const markRead = async (id: string) => {
    try {
      await notificationsService.markRead(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to mark notification'
      toast.error(msg)
    }
  }

  const activities = useMemo(() => {
    const merged = [
      ...recentExpenses.map(e => ({
        id: `exp_${e.id}`,
        type: 'expense' as const,
        amount: e.amount,
        category: e.categoryName || e.categoryId,
        date: e.expenseDate,
        description: e.description,
        accountId: e.accountId,
      })),
      ...recentIncomes.map(i => ({
        id: `inc_${i.id}`,
        type: 'income' as const,
        amount: i.amount,
        category: i.categoryName || i.categoryId,
        date: i.incomeDate,
        description: i.description,
        accountId: i.accountId,
      })),
    ]

    return merged
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8)
  }, [recentExpenses, recentIncomes])

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    const tod = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
    const name = user?.name ? `, ${user.name.split(' ')[0]}` : ''
    return `Good ${tod}${name}`
  }, [user?.name])

  const handleExpenseSubmit = async () => {
    try {
      await expensesService.create({
        amount: Number(expenseForm.amount),
        currency: expenseForm.currency || 'UZS',
        description: expenseForm.description || '',
        expenseDate: expenseForm.expenseDate,
        categoryId: expenseForm.categoryId,
        accountId: expenseForm.accountId,
      })
      toast.success('Expense added')
      setExpenseModal(false)
      await loadDashboard()
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add expense'
      toast.error(msg)
    }
  }

  const handleIncomeSubmit = async () => {
    try {
      await incomesService.create({
        amount: Number(incomeForm.amount),
        currency: incomeForm.currency || 'UZS',
        description: incomeForm.description || '',
        incomeDate: incomeForm.incomeDate,
        categoryId: incomeForm.categoryId,
        accountId: incomeForm.accountId,
      })
      toast.success('Income added')
      setIncomeModal(false)
      await loadDashboard()
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add income'
      toast.error(msg)
    }
  }

  const handleTransferSubmit = async () => {
    try {
      await transfersService.create({
        fromAccountId: transferForm.fromAccountId,
        toAccountId: transferForm.toAccountId,
        amount: Number(transferForm.amount),
        description: transferForm.description || '',
        transferDate: transferForm.transferDate,
        exchangeRate: Number(transferForm.exchangeRate) || 1.0,
      })
      toast.success('Transfer completed')
      setTransferModal(false)
      await loadDashboard()
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to transfer'
      toast.error(msg)
    }
  }

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setExpenseModal(true)} type="button" className="btn-primary" style={{ height: 40 }}>
            <Plus size={14} /> Expense
          </button>
          <button onClick={() => setIncomeModal(true)} type="button" className="btn-primary" style={{ height: 40 }}>
            <Plus size={14} /> Income
          </button>
          <button onClick={() => setTransferModal(true)} type="button" className="btn-primary" style={{ height: 40 }}>
            <Plus size={14} /> Transfer
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 12 }}>
        <StatCard label="Total balance" value={formatCurrency(summary.totalBalance || 0)} color="#2563eb" isLoading={loading} />
        <StatCard label="Income this month" value={formatCurrency(summary.totalIncome || 0)} color="#10b981" isLoading={loading} />
        <StatCard label="Expenses this month" value={formatCurrency(summary.totalExpense || 0)} color="#ef4444" isLoading={loading} />
        <StatCard label="Net savings" value={formatCurrency(summary.savings || 0)} color="#f59e0b" isLoading={loading} />
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
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Quick stats</h3>
          <p style={{ color: '#64748b' }}>Open debts: {openDebts.length}</p>
          <p style={{ color: '#64748b' }}>Expense categories: {expByCategory.length}</p>
          <p style={{ color: '#64748b' }}>Income vs expense points: {incVsExp.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.2fr)', gap: 16 }}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 260 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Recent activity</h3>
          {loading ? (
            <Skeleton count={4} height={52} />
          ) : activities.length === 0 ? (
            <EmptyState title="No activity" description="Add an expense or income to get started." />
          ) : (
            activities.map(item => (
              <TransactionItem
                key={item.id}
                type={item.type}
                amount={item.amount}
                category={item.category}
                date={item.date}
                description={item.description}
                currency={accounts.find(a => a.id === item.accountId)?.currency}
                accountLabel={accounts.find(a => a.id === item.accountId)?.name}
              />
            ))
          )}
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 260 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800 }}>Notifications</h3>
          {loading ? (
            <Skeleton count={3} height={56} />
          ) : notifications.length === 0 ? (
            <EmptyState title="All clear" description="No unread notifications." />
          ) : (
            notifications.map(note => (
              <div key={note.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12, background: '#f8fafc', marginBottom: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{note.title || note.message || 'Notification'}</div>
                  {note.message && <div style={{ color: '#64748b', fontSize: 13 }}>{note.message}</div>}
                </div>
                <button
                  onClick={() => markRead(note.id)}
                  type="button"
                  style={{ border: '1px solid #dbeafe', background: '#eff6ff', color: '#2563eb', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Mark read
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={expenseModal} onClose={() => setExpenseModal(false)} title="Add expense">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input type="number" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input type="date" value={expenseForm.expenseDate} onChange={e => setExpenseForm({ ...expenseForm, expenseDate: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
              <select value={expenseForm.categoryId} onChange={e => setExpenseForm({ ...expenseForm, categoryId: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                <option value="">Select category</option>
                {expenseCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Account</label>
              <select value={expenseForm.accountId} onChange={e => setExpenseForm({ ...expenseForm, accountId: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                <option value="">Select account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Currency</label>
              <select value={expenseForm.currency} onChange={e => setExpenseForm({ ...expenseForm, currency: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                {CURRENCIES.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <button onClick={handleExpenseSubmit} type="button" className="btn-primary" style={{ width: '100%', height: 44 }}>Save expense</button>
        </div>
      </Modal>

      <Modal open={incomeModal} onClose={() => setIncomeModal(false)} title="Add income">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input type="number" value={incomeForm.amount} onChange={e => setIncomeForm({ ...incomeForm, amount: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input type="date" value={incomeForm.incomeDate} onChange={e => setIncomeForm({ ...incomeForm, incomeDate: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
              <select value={incomeForm.categoryId} onChange={e => setIncomeForm({ ...incomeForm, categoryId: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                <option value="">Select category</option>
                {incomeCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Account</label>
              <select value={incomeForm.accountId} onChange={e => setIncomeForm({ ...incomeForm, accountId: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                <option value="">Select account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Currency</label>
              <select value={incomeForm.currency} onChange={e => setIncomeForm({ ...incomeForm, currency: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                {CURRENCIES.map(cur => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input value={incomeForm.description} onChange={e => setIncomeForm({ ...incomeForm, description: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <button onClick={handleIncomeSubmit} type="button" className="btn-primary" style={{ width: '100%', height: 44 }}>Save income</button>
        </div>
      </Modal>

      <Modal open={transferModal} onClose={() => setTransferModal(false)} title="Add transfer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>From account</label>
              <select value={transferForm.fromAccountId} onChange={e => setTransferForm({ ...transferForm, fromAccountId: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                <option value="">Select</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>To account</label>
              <select value={transferForm.toAccountId} onChange={e => setTransferForm({ ...transferForm, toAccountId: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}>
                <option value="">Select</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input type="number" value={transferForm.amount} onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input type="date" value={transferForm.transferDate} onChange={e => setTransferForm({ ...transferForm, transferDate: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Exchange rate</label>
              <input type="number" value={transferForm.exchangeRate} onChange={e => setTransferForm({ ...transferForm, exchangeRate: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input value={transferForm.description} onChange={e => setTransferForm({ ...transferForm, description: e.target.value })} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }} />
            </div>
          </div>
          <button onClick={handleTransferSubmit} type="button" className="btn-primary" style={{ width: '100%', height: 44 }}>Save transfer</button>
        </div>
      </Modal>
    </div>
  )
}

export default Dashboard
