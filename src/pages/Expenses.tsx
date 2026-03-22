import { useEffect, useMemo, useState } from 'react'
import { format, subMonths } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import TransactionItem from '../components/ui/TransactionItem'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { CATEGORY_META, smartDate, toArray, safeArray } from '../lib/helpers'
import { Expense } from '../services/expenses.service'
import { ExpenseSchema } from '../lib/security'
import { formatCurrency } from '../lib/currency'
import { useFinanceStore } from '../store/finance.store'
import api from '../lib/api'
import { ACCOUNT_TYPES, CURRENCIES, EXPENSE_CATEGORIES } from '../lib/constants'

const keywordMap: Record<string, string> = {
  coffee: 'FOOD',
  lunch: 'FOOD',
  dinner: 'FOOD',
  taxi: 'TRANSPORT',
  fuel: 'TRANSPORT',
  gas: 'UTILITIES',
  doctor: 'HEALTH',
  clinic: 'HEALTH',
  movie: 'ENTERTAINMENT',
}

type ExpenseFormState = {
  amount: string
  date: string
  description: string
  category: Expense['category']
  accountId: number
}

const monthOptions = Array.from({ length: 6 }).map((_, idx) => {
  const d = subMonths(new Date(), idx)
  return { value: format(d, 'yyyy-MM'), label: format(d, 'MMM yyyy') }
})

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState<ExpenseFormState>({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: 'FOOD',
    accountId: 0,
  })

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [expRes, accRes] = await Promise.allSettled([
        api.get('/api/expenses'),
        api.get('/api/accounts'),
      ])
      const allExpenses = safeArray<Expense>(expRes.status === 'fulfilled' ? expRes.value.data : [])
      setExpenses(
        allExpenses.filter(e => e.date && e.date.startsWith(month))
      )
      setAccounts(
        safeArray(accRes.status === 'fulfilled' ? accRes.value.data : [])
      )
      if (expRes.status === 'rejected') {
        setError((expRes.reason as Error).message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [month])

  const filtered = useMemo(() => {
    return expenses.filter(item => {
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true
      const matchesMonth = month
        ? item.date.startsWith(month)
        : true
      return matchesCategory && matchesMonth
    })
  }, [expenses, selectedCategory, month])

  const summary = useMemo(() => {
    const total = filtered.reduce((s, i) => s + i.amount, 0)
    const avg = filtered.length ? total / filtered.length : 0
    return { total, avg }
  }, [filtered])

  const openNew = () => {
    setEditing(null)
    setForm({ amount: '', date: format(new Date(), 'yyyy-MM-dd'), description: '', category: 'FOOD', accountId: 0 })
    setShowModal(true)
  }

  const openEdit = (item: Expense) => {
    setEditing(item)
    setForm({
      ...item,
      amount: String(item.amount),
      description: item.description || '',
    })
    setShowModal(true)
  }

  const handleAdd = async (formData: any) => {
    try {
      await api.post('/api/expenses', {
        amount:      Number(formData.amount) || 0,
        date:        formData.date,
        description: formData.description || '',
        category:    formData.category,
        accountId:   Number(formData.accountId),
      })
      toast.success('Expense added!')
      setShowModal(false)
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add expense')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/api/expenses/${id}`)
      toast.success('Expense deleted')
      setExpenses(prev => prev.filter(i => i.id !== id))
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>EXPENSES</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Spending overview</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Track where your money goes.</p>
        </div>
        <button
          onClick={openNew}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(239,68,68,0.3)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add expense
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {monthOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setMonth(opt.value)}
            type="button"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: month === opt.value ? '1px solid #ef4444' : '1px solid #e2e8f0',
              background: month === opt.value ? '#fff1f2' : '#fff',
              color: month === opt.value ? '#ef4444' : '#0f172a',
              fontWeight: 700,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedCategory(null)}
          type="button"
          style={{
            padding: '8px 10px',
            borderRadius: 10,
            border: selectedCategory === null ? '1px solid #2563eb' : '1px solid #e2e8f0',
            background: selectedCategory === null ? '#eff6ff' : '#fff',
            fontWeight: 700,
          }}
        >
          All
        </button>
        {Object.entries(CATEGORY_META)
          .filter(([key]) => ['FOOD', 'TRANSPORT', 'HEALTH', 'ENTERTAINMENT', 'UTILITIES', 'OTHER'].includes(key))
          .map(([key, meta]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              type="button"
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: selectedCategory === key ? `1px solid ${meta.color}` : '1px solid #e2e8f0',
                background: selectedCategory === key ? meta.bg : '#fff',
                color: meta.color,
                fontWeight: 700,
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          ))}
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--sh-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 12,
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Total</p>
          {loading ? <Skeleton height={24} /> : <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(summary.total)}</div>}
        </div>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Average</p>
          {loading ? <Skeleton height={24} /> : <div className="tabular" style={{ fontSize: 22, fontWeight: 800 }}>{formatCurrency(summary.avg)}</div>}
        </div>
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Transactions</p>
          {loading ? <Skeleton height={24} /> : <div style={{ fontSize: 22, fontWeight: 800 }}>{filtered.length}</div>}
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--sh-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Transactions</h3>
        </div>
        {loading ? (
          <Skeleton height={52} count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No expenses" description="Try another month or add one." actionLabel="Add expense" onAction={openNew} />
        ) : (
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div key={item.id} layout style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <TransactionItem
                    type="expense"
                    amount={item.amount}
                    category={item.category}
                    date={item.date}
                    description={item.description}
                    currency={accounts.find(a => a.id === item.accountId)?.currency}
                    accountLabel={accounts.find(a => a.id === item.accountId)?.name}
                  />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openEdit(item)}
                    type="button"
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#0f172a',
                      borderRadius: 10,
                      padding: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    type="button"
                    style={{
                      border: '1px solid #ffe4e6',
                      background: '#fff1f2',
                      color: '#ef4444',
                      borderRadius: 10,
                      padding: 8,
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit expense' : 'Add expense'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input
                type="number"
                value={form.amount}
                placeholder="0.00"
                min="0"
                step="any"
                onChange={e => setForm({ ...form, amount: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
            <input
              value={form.description ?? ''}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Coffee"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Account</label>
              <select
                value={form.accountId}
                onChange={e => setForm({ ...form, accountId: Number(e.target.value) })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value={0}>Select</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={() => handleAdd(form)}
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
            {editing ? 'Update expense' : 'Save expense'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        message="Delete this expense?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default Expenses
