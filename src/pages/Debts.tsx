import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Debt, debtsService } from '../services/debts.service'
import { DebtSchema } from '../lib/security'
import { formatCurrency } from '../lib/currency'
import { smartDate } from '../lib/helpers'
import { CURRENCIES } from '../lib/constants'
import { useFinanceStore } from '../store/finance.store'

interface DebtForm {
  personName: string
  amount: string
  currency: string
  dueDate: string
  type: 'DEBT' | 'RECEIVABLE'
  description: string
  accountId: string
}

interface RepayForm {
  paymentAmount: string
  accountId: string
}

const TABS: Array<{ value: 'DEBT' | 'RECEIVABLE'; label: string; color: string }> = [
  { value: 'DEBT', label: 'I Owe', color: '#ef4444' },
  { value: 'RECEIVABLE', label: 'Owed to Me', color: '#10b981' },
]

const Debts = () => {
  const [items, setItems] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'DEBT' | 'RECEIVABLE'>('DEBT')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [showRepayModal, setShowRepayModal] = useState<string | null>(null)
  const [form, setForm] = useState<DebtForm>({
    personName: '',
    amount: '',
    currency: 'UZS',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    type: 'DEBT',
    description: '',
    accountId: '',
  })
  const [repayForm, setRepayForm] = useState<RepayForm>({ paymentAmount: '', accountId: '' })
  const { accounts, refreshAccounts } = useFinanceStore()

  const loadData = useCallback(async () => {
    setLoading(true)
    setItems([])
    try {
      const res = await debtsService.getAll()
      setItems(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []))
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load debts'
      toast.error(msg)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [refreshAccounts])

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

  const filtered = useMemo(() => items.filter(i => i.type === tab), [items, tab])

  const handleSubmit = async () => {
    const parsed = DebtSchema.safeParse({
      personName: form.personName,
      amount: Number(form.amount) || 0,
      currency: form.currency,
      dueDate: form.dueDate,
      type: form.type,
      description: form.description || undefined,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    try {
      await debtsService.create({
        personName: form.personName.trim(),
        type: form.type,
        currency: form.currency || 'UZS',
        accountId: form.accountId || undefined,
        amount: Number(form.amount),
        description: form.description || '',
        dueDate: form.dueDate,
      })
      toast.success('Debt added')
      setModalOpen(false)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save debt'
      toast.error(msg)
    }
  }

  const handleRepay = async () => {
    if (!showRepayModal) return
    try {
      await debtsService.repay(showRepayModal, {
        paymentAmount: Number(repayForm.paymentAmount),
        accountId: repayForm.accountId || undefined,
      })
      toast.success('Repayment recorded')
      setShowRepayModal(null)
      setRepayForm({ paymentAmount: '', accountId: '' })
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to repay debt'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await debtsService.delete(confirmId)
      toast.success('Debt deleted')
      setConfirmId(null)
      await loadData()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete debt'
      toast.error(msg)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>DEBTS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Manage debts</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Track what you owe and what is owed to you.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(37,99,235,0.3)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add debt
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {TABS.map(tabItem => (
          <button
            key={tabItem.value}
            type="button"
            onClick={() => {
              setTab(tabItem.value)
              setForm(p => ({ ...p, type: tabItem.value }))
            }}
            style={{
              padding: '10px',
              borderRadius: 10,
              border: `2px solid ${tab === tabItem.value ? tabItem.color : '#e2e8f0'}`,
              background: tab === tabItem.value ? `${tabItem.color}15` : 'transparent',
              color: tab === tabItem.value ? tabItem.color : '#64748b',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {tabItem.value === 'DEBT' ? '💸' : '💰'} {tabItem.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--sh-sm)',
          minHeight: 200,
        }}
      >
        {loading ? (
          <Skeleton height={64} count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="Nothing here"
            description="Add a debt to track repayments."
            actionLabel="Add debt"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <AnimatePresence>
            {filtered.map(item => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800 }}>{item.personName}</div>
                  {item.description && <div style={{ color: '#475569' }}>{item.description}</div>}
                  <div style={{ color: '#94a3b8', fontSize: 12 }}>Due {smartDate(item.dueDate)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(item.amount, item.currency)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
                    {item.status === 'OPEN' && (
                      <button
                        onClick={() => setShowRepayModal(item.id)}
                        type="button"
                        style={{
                          border: '1px solid #dcfce7',
                          background: '#ecfdf5',
                          color: '#16a34a',
                          borderRadius: 10,
                          padding: '6px 10px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          fontWeight: 700,
                        }}
                      >
                        💵 Repay
                      </button>
                    )}
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
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add debt">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Name</label>
              <input
                value={form.personName}
                onChange={e => setForm({ ...form, personName: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
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
              <label style={{ fontWeight: 700, fontSize: 13 }}>Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Account (optional)</label>
              <select
                value={form.accountId}
                onChange={e => setForm({ ...form, accountId: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value="">Not selected</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TABS.map(tabItem => (
              <button
                key={tabItem.value}
                type="button"
                onClick={() => setForm(p => ({ ...p, type: tabItem.value }))}
                style={{
                  padding: '10px',
                  borderRadius: 10,
                  border: `2px solid ${form.type === tabItem.value ? tabItem.color : '#e2e8f0'}`,
                  background: form.type === tabItem.value ? `${tabItem.color}15` : 'transparent',
                  color: form.type === tabItem.value ? tabItem.color : '#64748b',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {tabItem.value === 'DEBT' ? '💸' : '💰'} {tabItem.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
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
            Save debt
          </button>
        </div>
      </Modal>

      <Modal open={showRepayModal !== null} onClose={() => setShowRepayModal(null)} title="Repay debt">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Payment amount</label>
            <input
              type="number"
              value={repayForm.paymentAmount}
              onChange={e => setRepayForm({ ...repayForm, paymentAmount: e.target.value })}
              min="0"
              step="any"
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Account (optional)</label>
            <select
              value={repayForm.accountId}
              onChange={e => setRepayForm({ ...repayForm, accountId: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            >
              <option value="">Not selected</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRepay}
            type="button"
            style={{
              marginTop: 4,
              padding: '12px',
              borderRadius: 12,
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Confirm repayment
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        message="Delete this debt?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default Debts
