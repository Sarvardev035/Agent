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
import { CATEGORY_META } from '../lib/helpers'
import { incomeService, Income } from '../services/income.service'
import { IncomeSchema } from '../lib/security'
import { formatCurrency } from '../lib/currency'
import { useFinanceStore } from '../store/finance.store'

type IncomeForm = Omit<Income, 'id'>

const keywordMap: Record<string, string> = {
  salary: 'SALARY',
  bonus: 'SALARY',
  freelance: 'FREELANCE',
  contract: 'BUSINESS',
  rent: 'BUSINESS',
  gift: 'GIFT',
  investment: 'INVESTMENT',
}

const monthOptions = Array.from({ length: 6 }).map((_, idx) => {
  const d = subMonths(new Date(), idx)
  return { value: format(d, 'yyyy-MM'), label: format(d, 'MMM yyyy') }
})

const IncomePage = () => {
  const [items, setItems] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [editing, setEditing] = useState<Income | null>(null)
  const [form, setForm] = useState<IncomeForm>({
    amount: 0,
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    category: 'SALARY',
    accountId: 0,
  })
  const { accounts, refreshAccounts } = useFinanceStore()

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await incomeService.getAll({ month: selectedMonth })
      setItems(data ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load income'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    refreshAccounts()
  }, [selectedMonth])

  const filtered = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true
      const matchesMonth = selectedMonth ? item.date.startsWith(selectedMonth) : true
      return matchesCategory && matchesMonth
    })
  }, [items, selectedCategory, selectedMonth])

  const summary = useMemo(() => {
    const total = filtered.reduce((s, i) => s + i.amount, 0)
    const avg = filtered.length ? total / filtered.length : 0
    return { total, avg }
  }, [filtered])

  const openNew = () => {
    setEditing(null)
    setForm({ amount: 0, date: format(new Date(), 'yyyy-MM-dd'), description: '', category: 'SALARY', accountId: 0 })
    setModalOpen(true)
  }

  const openEdit = (item: Income) => {
    setEditing(item)
    setForm({ ...item })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    const autoCategory = Object.entries(keywordMap).find(([key]) =>
      form.description?.toLowerCase().includes(key)
    )?.[1]
    const payload = { ...form, category: autoCategory ?? form.category, amount: Number(form.amount) }
    const parsed = IncomeSchema.safeParse(payload)
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      if (editing) {
        await incomeService.update(editing.id, parsed.data)
        toast.success('Income updated')
      } else {
        await incomeService.create(parsed.data)
        toast.success('Income added')
      }
      setModalOpen(false)
      setEditing(null)
      load()
      refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save income'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await incomeService.delete(confirmId)
      toast.success('Income removed')
      setConfirmId(null)
      load()
      refreshAccounts()
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
            onClick={() => setSelectedMonth(opt.value)}
            type="button"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: selectedMonth === opt.value ? '1px solid #10b981' : '1px solid #e2e8f0',
              background: selectedMonth === opt.value ? '#ecfdf5' : '#fff',
              color: selectedMonth === opt.value ? '#065f46' : '#0f172a',
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
          .filter(([key]) => ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'].includes(key))
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
          <EmptyState title="No income" description="Try another month or add one." actionLabel="Add income" onAction={openNew} />
        ) : (
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div key={item.id} layout style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <TransactionItem
                    type="income"
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit income' : 'Add income'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
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
              placeholder="e.g. Salary"
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
            onClick={handleSubmit}
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
        onConfirm={handleDelete}
        message="Delete this income?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default IncomePage
