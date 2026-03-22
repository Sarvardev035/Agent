import { useCallback, useEffect, useMemo, useState } from 'react'
import { format, subMonths } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import TransactionItem from '../components/ui/TransactionItem'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { safeArray } from '../lib/helpers'
import { Income, incomesService } from '../services/income.service'
import { IncomeSchema } from '../lib/security'
import { formatCurrency } from '../lib/currency'
import { useFinanceStore } from '../store/finance.store'
import { CURRENCIES } from '../lib/constants'
import { useCategories } from '../hooks/useCategories'

type IncomeForm = {
  amount: string
  incomeDate: string
  description: string
  categoryId: string
  accountId: string
  currency: string
}

const monthOptions = Array.from({ length: 6 }).map((_, idx) => {
  const d = subMonths(new Date(), idx)
  return { value: format(d, 'yyyy-MM'), label: format(d, 'MMM yyyy') }
})

const IncomePage = () => {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Income | null>(null)
  const [form, setForm] = useState<IncomeForm>({
    amount: '',
    incomeDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    categoryId: '',
    accountId: '',
    currency: 'UZS',
  })

  const { categories } = useCategories('INCOME')
  const { accounts, refreshAccounts } = useFinanceStore()

  const loadData = useCallback(async () => {
    setLoading(true)
    setIncomes([])
    try {
      const res = await incomesService.getAll()
      const all = safeArray<Income>(res.data)
      setIncomes(all.filter(i => i.incomeDate?.startsWith(month)))
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load income'
      toast.error(msg)
      setIncomes([])
    } finally {
      setLoading(false)
    }
  }, [month, refreshAccounts])

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
    return incomes.filter(item => {
      const matchesCategory = selectedCategory ? item.categoryId === selectedCategory : true
      const matchesMonth = month ? item.incomeDate.startsWith(month) : true
      return matchesCategory && matchesMonth
    })
  }, [incomes, selectedCategory, month])

  const summary = useMemo(() => {
    const total = filtered.reduce((s, i) => s + i.amount, 0)
    const avg = filtered.length ? total / filtered.length : 0
    return { total, avg }
  }, [filtered])

  const openNew = () => {
    setEditing(null)
    setForm({
      amount: '',
      incomeDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      categoryId: '',
      accountId: '',
      currency: 'UZS',
    })
    setShowModal(true)
  }

  const openEdit = (item: Income) => {
    setEditing(item)
    setForm({
      amount: String(item.amount),
      incomeDate: item.incomeDate,
      description: item.description || '',
      categoryId: item.categoryId,
      accountId: item.accountId,
      currency: item.currency || 'UZS',
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    const parsed = IncomeSchema.safeParse({
      amount: Number(form.amount),
      incomeDate: form.incomeDate,
      description: form.description || undefined,
      categoryId: form.categoryId,
      accountId: form.accountId,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    const payload = {
      amount: Number(form.amount),
      currency: form.currency || 'UZS',
      description: form.description || '',
      incomeDate: form.incomeDate,
      categoryId: form.categoryId,
      accountId: form.accountId,
    }

    try {
      if (editing) {
        await incomesService.update(editing.id, payload)
        toast.success('Income updated')
      } else {
        await incomesService.create(payload)
        toast.success('Income added')
      }
      setShowModal(false)
      setEditing(null)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save income'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await incomesService.delete(id)
      toast.success('Income deleted')
      setIncomes(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete'
      toast.error(msg)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>INCOME</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Earnings overview</h1>
          <p style={{ margin: 0, color: '#64748b' }}>See how your income grows.</p>
        </div>
        <button
          onClick={openNew}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: '#10b981',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(16,185,129,0.3)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add income
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
              border: month === opt.value ? '1px solid #10b981' : '1px solid #e2e8f0',
              background: month === opt.value ? '#ecfdf5' : '#fff',
              color: month === opt.value ? '#065f46' : '#0f172a',
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
        }}
      >
        {loading ? (
          <Skeleton height={52} count={5} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No income" description="Try another month or add one." actionLabel="Add income" onAction={openNew} />
        ) : (
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div key={item.id} layout style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <TransactionItem
                    type="income"
                    amount={item.amount}
                    category={item.categoryName || item.categoryId}
                    date={item.incomeDate}
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

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit income' : 'Add income'}>
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
                value={form.incomeDate}
                onChange={e => setForm({ ...form, incomeDate: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
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
                <option value="">Select</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Salary"
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <button
            onClick={handleSave}
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
            {editing ? 'Update income' : 'Save income'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleDelete(confirmId)}
        message="Delete this income?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default IncomePage
