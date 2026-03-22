import { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { Transfer, transfersService } from '../services/transfers.service'
import { TransferSchema } from '../lib/security'
import { useFinanceStore } from '../store/finance.store'
import { formatCurrency, useExchangeRates } from '../lib/currency'
import { smartDate, safeArray } from '../lib/helpers'

interface TransferForm {
  fromAccountId: string
  toAccountId: string
  amount: string
  transferDate: string
  description: string
  exchangeRate: string
}

const Transfers = () => {
  const [items, setItems] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TransferForm>({
    amount: '',
    transferDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    exchangeRate: '1',
    fromAccountId: '',
    toAccountId: '',
  })
  const { accounts, refreshAccounts } = useFinanceStore()
  const { convert } = useExchangeRates()

  const loadData = useCallback(async () => {
    setLoading(true)
    setItems([])
    try {
      const res = await transfersService.getAll()
      setItems(safeArray<Transfer>(res.data))
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load transfers'
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

  const handleSubmit = async () => {
    const parsed = TransferSchema.safeParse({
      fromAccountId: form.fromAccountId,
      toAccountId: form.toAccountId,
      amount: Number(form.amount),
      transferDate: form.transferDate,
      description: form.description || undefined,
      exchangeRate: Number(form.exchangeRate) || 1,
    })

    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }

    try {
      await transfersService.create({
        fromAccountId: form.fromAccountId,
        toAccountId: form.toAccountId,
        amount: Number(form.amount),
        description: form.description || '',
        transferDate: form.transferDate,
        exchangeRate: Number(form.exchangeRate) || 1.0,
      })
      toast.success('Transfer added')
      setModalOpen(false)
      await loadData()
      await refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save transfer'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await transfersService.delete(id)
      toast.success('Transfer deleted')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete transfer'
      toast.error(msg)
    }
  }

  const transferCards = useMemo(
    () =>
      items.map(item => {
        const from = accounts.find(a => a.id === item.fromAccountId)
        const to = accounts.find(a => a.id === item.toAccountId)
        const preview = from && to ? convert(item.amount, from.currency, to.currency) : null
        return { item, from, to, preview }
      }),
    [items, accounts, convert]
  )

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>TRANSFERS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Move money</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Track internal movements.</p>
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
          <Plus size={16} /> Add transfer
        </button>
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
        ) : transferCards.length === 0 ? (
          <EmptyState title="No transfers" description="Create your first transfer." actionLabel="Add" onAction={() => setModalOpen(true)} />
        ) : (
          <AnimatePresence>
            {transferCards.map(({ item, from, to, preview }) => (
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
                  gap: 8,
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 10,
                        background: '#eff6ff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                      }}
                    >
                      <ArrowLeftRight size={16} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        {from?.name ?? 'Unknown'} {'->'} {to?.name ?? 'Unknown'}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{smartDate(item.transferDate)}</div>
                    </div>
                  </div>
                  {item.description && <div style={{ marginTop: 6, color: '#475569' }}>{item.description}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>
                    {from ? formatCurrency(item.amount, from.currency) : item.amount}
                  </div>
                  {preview != null && to && (
                    <div style={{ color: '#94a3b8', fontSize: 12 }}>
                      ~= {formatCurrency(preview, to.currency)}
                    </div>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    type="button"
                    style={{
                      marginTop: 6,
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
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add transfer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>From account</label>
              <select
                value={form.fromAccountId}
                onChange={e => setForm({ ...form, fromAccountId: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value="">Select</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>To account</label>
              <select
                value={form.toAccountId}
                onChange={e => setForm({ ...form, toAccountId: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
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
                value={form.transferDate}
                onChange={e => setForm({ ...form, transferDate: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Exchange rate</label>
              <input
                type="number"
                value={form.exchangeRate}
                min="0"
                step="any"
                onChange={e => setForm({ ...form, exchangeRate: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Description</label>
              <input
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              />
            </div>
          </div>

          {Number(form.amount) > 0 && form.fromAccountId && form.toAccountId && (() => {
            const from = accounts.find(a => a.id === form.fromAccountId)
            const to = accounts.find(a => a.id === form.toAccountId)
            if (!from || !to) return null
            const preview = convert(Number(form.amount) || 0, from.currency, to.currency)
            return (
              <div style={{ background: '#f8fafc', borderRadius: 10, padding: 10, color: '#0f172a' }}>
                {formatCurrency(Number(form.amount) || 0, from.currency)} ~= {formatCurrency(preview, to.currency)}
              </div>
            )
          })()}

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
            Save transfer
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Transfers
