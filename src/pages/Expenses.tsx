import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, subMonths } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import TransactionItem from '../components/ui/TransactionItem'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { smartDate, safeArray } from '../lib/helpers'
import { Expense, expensesService } from '../services/expenses.service'
import { ExpenseSchema } from '../lib/security'
import { formatCurrency } from '../lib/currency'
import { useFinanceStore } from '../store/finance.store'
import { CURRENCIES } from '../lib/constants'
import { useCategories } from '../hooks/useCategories'

type ExpenseFormState = {
  amount: string
  expenseDate: string
  description: string
  categoryId: string
  accountId: string
  currency: string
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
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [form, setForm] = useState<ExpenseFormState>({
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    categoryId: '',
    accountId: '',
    currency: 'UZS',
  })
  const { categories } = useCategories('EXPENSE')
  const { accounts: storeAccounts, refreshAccounts } = useFinanceStore()

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    setExpenses([])
    try {
      const [expRes] = await Promise.allSettled([expensesService.getAll()])
      await refreshAccounts()
      if (expRes.status === 'fulfilled') {
        const allExpenses = safeArray<Expense>(expRes.value.data)
        setExpenses(allExpenses.filter(e => e.expenseDate && e.expenseDate.startsWith(month)))
      }
      setAccounts(storeAccounts)
      if (expRes.status === 'rejected') {
        setError((expRes.reason as Error).message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [month, storeAccounts, refreshAccounts])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!cancelled) {
        await loadData()
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [loadData])

  const filtered = useMemo(() => {
    return expenses.filter(item => {
      const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true
      const matchesMonth = month ? item.expenseDate.startsWith(month) : true
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
    setForm({
      amount: '',
      expenseDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      categoryId: '',
      accountId: '',
      currency: 'UZS',
    })
    setShowModal(true)
  }

  const openEdit = (item: Expense) => {
    setEditing(item)
    setForm({
      amount: String(item.amount),
      expenseDate: item.expenseDate,
      description: item.description || '',
      categoryId: item.categoryId,
      accountId: item.accountId,
      currency: item.currency || 'UZS',
    })
    setShowModal(true)
  }

  const handleAdd = async (formData: ExpenseFormState) => {
    const parsed = ExpenseSchema.safeParse({
      ...formData,
      amount: Number(formData.amount),
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await expensesService.create({
        amount: Number(formData.amount),
        currency: formData.currency || 'UZS',
        description: formData.description || '',
        expenseDate: formData.expenseDate,
        categoryId: formData.categoryId,
        accountId: formData.accountId,
      })
      toast.success('Expense added!')
      setShowModal(false)
      await loadData()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add expense')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await expensesService.delete(id)
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
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            type="button"
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: selectedCategory === cat.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: selectedCategory === cat.id ? '#eff6ff' : '#fff',
              fontWeight: 700,
            }}
          >
            {cat.name}
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
          minHeight: 240,
        }}
      >
        {loading ? (
          <Skeleton height={64} count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No expenses" description="Add your first expense." actionLabel="Add" onAction={openNew} />
        ) : (
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <TransactionItem
                  type="expense"
                  amount={item.amount}
                  category={item.categoryId}
                  date={item.expenseDate}
                  description={item.description}
                  currency={accounts.find(a => a.id === item.accountId)?.currency ?? 'UZS'}
                  accountLabel={accounts.find(a => a.id === item.accountId)?.name}
                />
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={() => openEdit(item)}
                    type="button"
                    style={{
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#0f172a',
                      borderRadius: 10,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 700,
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(item.id)}
                    type="button"
                    style={{
                      border: '1px solid #ffe4e6',
                      background: '#fff1f2',
                      color: '#ef4444',
                      borderRadius: 10,
                      padding: '6px 10px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 700,
                    }}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit expense' : 'Add expense'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
                value={form.expenseDate}
                onChange={e => setForm({ ...form, expenseDate: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
            <select
              value={form.categoryId}
              onChange={e => setForm({ ...form, categoryId: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Account</label>
            <select
              value={form.accountId}
              onChange={e => setForm({ ...form, accountId: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              required
            >
              <option value="">Select account</option>
              {accounts.map((acc: any) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
            <input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              placeholder="Optional"
            />
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Currency</label>
            <select
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            >
              {CURRENCIES.map(cur => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => handleAdd(form)}
            type="button"
            className="btn-primary"
            style={{ width: '100%', height: 48, fontSize: 15 }}
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
