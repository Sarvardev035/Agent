import { useEffect, useMemo, useState } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Check, Clock, HandCoins, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { debtsApi } from '../api/debtsApi'
import { formatCurrency, smartDate } from '../utils/helpers'
import { useFinance } from '../context/FinanceContext'
import { safeArray } from '../lib/helpers'
import { CURRENCIES } from '../lib/constants'
import { sounds } from '../lib/sounds'

type DebtType = 'DEBT' | 'RECEIVABLE'
type DebtStatus = 'OPEN' | 'CLOSED'

interface DebtForm {
  personName: string
  amount: string
  currency: string
  dueDate: string
  type: DebtType
  description: string
  accountId: string
}

const Debts = () => {
  const { refreshAccounts, accounts } = useFinance()
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<DebtType>('DEBT')
  const [modalOpen, setModalOpen] = useState(false)
  const [repayModal, setRepayModal] = useState<{ id: string; amount: string; accountId?: string } | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState<DebtForm>({
    personName: '',
    amount: '',
    currency: 'UZS',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    type: 'DEBT',
    description: '',
    accountId: '',
  })

  const loadDebts = async () => {
    try {
      setLoading(true)
      const { data } = await debtsApi.getAll()
      setDebts(
        safeArray<any>(data).map(item => ({
          ...item,
          type: item.type || 'DEBT',
          currency: item.currency || 'UZS',
        }))
      )
    } catch (err) {
      console.error(err)
      sounds.error()
      toast.error('Failed to load debts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDebts()
  }, [])

  const filtered = useMemo(() => debts.filter(d => d.type === tab), [debts, tab])

  const totals = useMemo(() => {
    const borrowed = debts.filter(d => d.type === 'DEBT').reduce((s, d) => s + (d.amount || 0), 0)
    const lent = debts.filter(d => d.type === 'RECEIVABLE').reduce((s, d) => s + (d.amount || 0), 0)
    return { borrowed, lent }
  }, [debts])

  const handleSubmit = () => {
    setTimeout(async () => {
      if (!form.personName || !form.amount) {
        sounds.error()
        toast.error('Please fill person and amount')
        return
      }
      try {
        await debtsApi.create({
          personName: form.personName,
          amount: Number(form.amount),
          currency: form.currency as 'USD' | 'EUR' | 'UZS',
          dueDate: form.dueDate,
          type: form.type,
          description: form.description,
          accountId: form.accountId || undefined,
        })
        sounds.notification()
        toast.success('Debt recorded!')
        setModalOpen(false)
        setForm(prev => ({ ...prev, amount: '', description: '' }))
        await Promise.allSettled([loadDebts(), refreshAccounts()])
      } catch (err) {
        console.error(err)
        sounds.error()
        toast.error('Failed to save debt')
      }
    }, 0)
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await debtsApi.delete(confirmId)
      sounds.success()
      toast.success('Debt removed')
      setConfirmId(null)
      await Promise.allSettled([loadDebts(), refreshAccounts()])
    } catch (err) {
      console.error(err)
      sounds.error()
      toast.error('Failed to delete debt')
    }
  }

  const handleRepay = async () => {
    if (!repayModal) return
    const paymentAmount = Number(repayModal.amount)
    if (!paymentAmount) {
      sounds.error()
      toast.error('Enter repayment amount')
      return
    }
    setTimeout(async () => {
      try {
        await debtsApi.repay(repayModal.id, {
          paymentAmount,
          accountId: repayModal.accountId || undefined,
        })
        sounds.success()
        toast.success('Repayment recorded! ✅')
        setRepayModal(null)
        await Promise.allSettled([loadDebts(), refreshAccounts()])
      } catch (err) {
        console.error(err)
        sounds.error()
        toast.error('Failed to record repayment')
      }
    }, 0)
  }

  const renderDueBadge = (dueDate?: string) => {
    if (!dueDate) return null
    const days = differenceInCalendarDays(new Date(dueDate), new Date())
    const overdue = days < 0
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: overdue ? 'var(--red-soft)' : 'var(--amber-soft)',
          color: overdue ? 'var(--red)' : 'var(--amber)',
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        <Clock size={14} />
        {overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
      </span>
    )
  }

  const renderStatus = (status?: DebtStatus) => {
    if (status === 'CLOSED') {
      return (
        <span
          style={{
            padding: '6px 10px',
            borderRadius: 999,
            background: 'var(--green-soft)',
            color: 'var(--green)',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          Closed
        </span>
      )
    }
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'var(--blue-soft)',
          color: 'var(--blue)',
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        <span className="pulse-dot" style={{ background: 'var(--blue)' }} />
        Open
      </span>
    )
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>DEBTS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Manage debts</h1>
          <p style={{ margin: 0, color: 'var(--text-2)' }}>Track what you owe and what is owed to you.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
        <div
          style={{
            background: 'var(--surface-strong)',
            borderRadius: 14,
            padding: 14,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.06em' }}>I OWE</p>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--red)' }}>{formatCurrency(totals.borrowed)}</div>
        </div>
        <div
          style={{
            background: 'var(--surface-strong)',
            borderRadius: 14,
            padding: 14,
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <p style={{ margin: 0, color: 'var(--text-3)', fontSize: 12, letterSpacing: '0.06em' }}>OWED TO ME</p>
          <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--green)' }}>{formatCurrency(totals.lent)}</div>
        </div>
      </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'I Owe', value: 'DEBT', color: 'var(--red)' },
            { label: 'Owed to Me', value: 'RECEIVABLE', color: 'var(--green)' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => {
                setTab(btn.value as DebtType)
                setForm(prev => ({ ...prev, type: btn.value as DebtType }))
              }}
              type="button"
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 12,
              border: tab === btn.value ? `2px solid ${btn.color}` : '1px solid var(--border)',
              background: tab === btn.value ? `${btn.color}10` : 'var(--surface)',
              color: tab === btn.value ? btn.color : 'var(--text-2)',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <div
        style={{
          background: 'var(--surface-strong)',
          borderRadius: 16,
          padding: 16,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-md)',
          minHeight: 240,
        }}
      >
        {loading ? (
          <Skeleton height={72} count={4} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No debts here"
            description="Add a debt to start tracking due dates."
            actionLabel="Add debt"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <AnimatePresence>
              {filtered.map(item => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    background: 'var(--surface)',
                    borderLeft: `6px solid ${item.type === 'DEBT' ? 'var(--red)' : 'var(--green)'}`,
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{item.personName}</div>
                      {renderStatus(item.status)}
                      {renderDueBadge(item.dueDate)}
                    </div>
                    <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{item.description || 'No description'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-3)', fontSize: 12 }}>
                      <HandCoins size={14} />
                      <span>{smartDate(item.dueDate)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                    <div
                      className="tabular"
                      style={{
                        fontWeight: 800,
                        fontSize: 16,
                        color: item.type === 'DEBT' ? 'var(--red)' : 'var(--green)',
                      }}
                    >
                      {formatCurrency(item.amount, item.currency || 'UZS')}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {item.status !== 'CLOSED' && (
                        <button
                          onClick={() => setRepayModal({ id: item.id, amount: String(item.amount || ''), accountId: item.accountId })}
                          type="button"
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            border: '1px solid var(--border)',
                            background: 'var(--green-soft)',
                            color: 'var(--green)',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            cursor: 'pointer',
                          }}
                        >
                          <Check size={16} /> Repay
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmId(item.id)}
                        type="button"
                        style={{
                          padding: '8px 10px',
                          borderRadius: 10,
                          border: '1px solid var(--border)',
                          background: 'var(--red-soft)',
                          color: 'var(--red)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add debt" subtitle="Use ISO date format YYYY-MM-DD.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Person</label>
              <input
                value={form.personName}
                onChange={e => setForm(prev => ({ ...prev, personName: e.target.value }))}
                placeholder="Name"
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                min="0"
                step="any"
                placeholder="0.00"
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Currency</label>
              <select
                value={form.currency}
                onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              >
                {CURRENCIES.map(cur => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Due date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Account (optional)</label>
            <select
              value={form.accountId}
              onChange={e => setForm(prev => ({ ...prev, accountId: e.target.value }))}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            >
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Type</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[
                { label: 'I owe (Debt)', value: 'DEBT', color: 'var(--red)' },
                { label: 'Owed to me (Receivable)', value: 'RECEIVABLE', color: 'var(--green)' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setForm(prev => ({ ...prev, type: opt.value as DebtType }))}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: 12,
                    border: form.type === opt.value ? `2px solid ${opt.color}` : '1px solid var(--border)',
                    background: form.type === opt.value ? `${opt.color}10` : '#fff',
                    color: form.type === opt.value ? opt.color : 'var(--text-2)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Optional details"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10, resize: 'vertical' }}
            />
          </div>
          <button
            onClick={handleSubmit}
            type="button"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              color: '#fff',
              fontWeight: 800,
              boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
              cursor: 'pointer',
            }}
          >
            Save debt
          </button>
        </div>
      </Modal>

      <Modal open={!!repayModal} onClose={() => setRepayModal(null)} title="Record repayment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Amount</label>
            <input
              type="number"
              value={repayModal?.amount || ''}
              onChange={e =>
                setRepayModal(prev => (prev ? { ...prev, amount: e.target.value } : prev))
              }
              min="0"
              step="any"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            />
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Account (optional)</label>
            <select
              value={repayModal?.accountId || ''}
              onChange={e =>
                setRepayModal(prev => (prev ? { ...prev, accountId: e.target.value } : prev))
              }
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            >
              <option value="">Select account</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleRepay}
            type="button"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(22,163,74,0.25)',
            }}
          >
            Save repayment
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete debt?"
        message="This will permanently remove the debt record."
        confirmLabel="Delete"
      />
    </div>
  )
}

export default Debts
