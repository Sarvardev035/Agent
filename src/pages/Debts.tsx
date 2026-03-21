import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { CheckCircle2, HandCoins, Plus, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Debt } from '../services/debts.service'
import { DebtSchema } from '../lib/security'
import { formatCurrency } from '../lib/currency'
import { smartDate, toArray, safeArray } from '../lib/helpers'
import api from '../lib/api'

interface DebtForm {
  personName: string
  amount: number
  currency: string
  dueDate: string
  type: 'LENT' | 'BORROWED'
  description?: string
}

const Debts = () => {
  const [items, setItems] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'LENT' | 'BORROWED'>('LENT')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [form, setForm] = useState<DebtForm>({
    personName: '',
    amount: 0,
    currency: 'UZS',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    type: 'LENT',
    description: '',
  })

  const load = async () => {
    setLoading(true)
    try {
      const [debtsRes] = await Promise.allSettled([
        api.get('/api/debts'),
      ])
      setItems(
        safeArray(debtsRes.status === 'fulfilled' ? debtsRes.value.data : [])
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load debts'
      console.error('❌ debts load failed:', msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => items.filter(i => i.type === tab), [items, tab])

  const handleSubmit = async () => {
    const parsed = DebtSchema.safeParse({ ...form, amount: Number(form.amount) })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/debts', parsed.data)
      toast.success('Debt added')
      setModalOpen(false)
      load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save debt'
      toast.error(msg)
    }
  }

  const handleClose = async (id: number) => {
    try {
      await api.patch(`/api/debts/${id}`, { status: 'CLOSED' })
      toast.success('Marked as closed')
      load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update debt'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await api.delete(`/api/debts/${confirmId}`)
      toast.success('Debt deleted')
      setConfirmId(null)
      load()
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
          <p style={{ margin: 0, color: '#64748b' }}>Stay on top of lent and borrowed money.</p>
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

      <div style={{ display: 'flex', gap: 8 }}>
        {(['LENT', 'BORROWED'] as const).map(key => (
          <button
            key={key}
            onClick={() => setTab(key)}
            type="button"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: tab === key ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: tab === key ? '#eff6ff' : '#fff',
              fontWeight: 800,
              color: tab === key ? '#1d4ed8' : '#0f172a',
            }}
          >
            {key === 'LENT' ? 'Lent out' : 'Borrowed'}
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
                <div style={{ display: 'flex', gap: 10 }}>
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: '#f8fafc',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#2563eb',
                    }}
                  >
                    <HandCoins size={18} />
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontWeight: 800 }}>{item.personName}</div>
                    {item.description && (
                      <div style={{ color: '#475569' }}>{item.description}</div>
                    )}
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      Due {smartDate(item.dueDate)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>
                    {formatCurrency(item.amount, item.currency)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
                    {item.status === 'OPEN' ? (
                      <button
                        onClick={() => handleClose(item.id)}
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
                        <CheckCircle2 size={16} /> Mark closed
                      </button>
                    ) : (
                      <span style={{ color: '#16a34a', fontWeight: 800 }}>Closed</span>
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
                onChange={e => setForm({ ...form, amount: Number(e.target.value) })}
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
                {['UZS', 'USD', 'EUR', 'RUB'].map(cur => (
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
              <label style={{ fontWeight: 700, fontSize: 13 }}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as DebtForm['type'] })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value="LENT">Lent</option>
                <option value="BORROWED">Borrowed</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input
                value={form.description ?? ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
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
