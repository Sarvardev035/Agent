import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeftRight, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { transfersApi } from '../api/transfersApi'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, smartDate } from '../utils/helpers'
import { safeArray, safeObject } from '../lib/helpers'
import api from '../lib/api'
import { sounds } from '../lib/sounds'

interface TransferForm {
  amount: string
  fromAccountId: string
  toAccountId: string
  description: string
  transferDate: string
  exchangeRate: string
}

const Transfers = () => {
  const { accounts, refreshAccounts } = useFinance()
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [rates, setRates] = useState<any>(null)
  const [form, setForm] = useState<TransferForm>({
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    description: '',
    transferDate: format(new Date(), 'yyyy-MM-dd'),
    exchangeRate: '1',
  })

  const loadTransfers = async () => {
    try {
      setLoading(true)
      const { data } = await transfersApi.getAll()
      setTransfers(
        safeArray<any>(data).map(item => ({
          ...item,
          date: item.transferDate || item.date,
        }))
      )
    } catch (err) {
      console.error(err)
      sounds.error()
      toast.error('Failed to load transfers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransfers()
    api.get('/api/exchange-rates')
      .then(res => setRates(safeObject(res.data)))
      .catch(() => {})
  }, [])

  const handleSubmit = async () => {
    if (!form.amount || !form.fromAccountId || !form.toAccountId) {
      sounds.error()
      toast.error('Fill all required fields')
      return
    }
    if (form.fromAccountId === form.toAccountId) {
      sounds.error()
      toast.error('Choose different accounts')
      return
    }
    setTimeout(async () => {
      try {
        await transfersApi.create({
          amount: Number(form.amount),
          fromAccountId: form.fromAccountId,
          toAccountId: form.toAccountId,
          description: form.description,
          transferDate: form.transferDate,
          exchangeRate: Number(form.exchangeRate) || 1,
        })
        sounds.transfer()
        toast.success('Transfer completed!')
        setModalOpen(false)
        setForm({
          amount: '',
          fromAccountId: '',
          toAccountId: '',
          description: '',
          transferDate: format(new Date(), 'yyyy-MM-dd'),
          exchangeRate: '1',
        })
        await Promise.allSettled([loadTransfers(), refreshAccounts()])
      } catch (err) {
        console.error(err)
        sounds.error()
        toast.error('Failed to save transfer')
      }
    }, 0)
  }

  const fromAccount = useMemo(() => accounts.find(a => a.id === form.fromAccountId), [accounts, form.fromAccountId])
  const toAccount = useMemo(() => accounts.find(a => a.id === form.toAccountId), [accounts, form.toAccountId])
  const currenciesDiffer = !!(fromAccount?.currency && toAccount?.currency && fromAccount.currency !== toAccount.currency)
  
  const calculateConversion = (
    amount: number,
    from: string,
    to: string,
    exchangeRates: any
  ): number => {
    if (!exchangeRates || from === to) return amount
    const rateFrom = exchangeRates[from]?.rate || 1
    const rateTo = exchangeRates[to]?.rate || 1
    return (amount / rateFrom) * rateTo
  }
  
  const convertedAmount = useMemo(() => {
    const amt = Number(form.amount)
    if (!currenciesDiffer) return amt
    return calculateConversion(
      amt,
      fromAccount?.currency || 'UZS',
      toAccount?.currency || 'UZS',
      rates
    )
  }, [currenciesDiffer, form.amount, fromAccount?.currency, toAccount?.currency, rates])

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>TRANSFERS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Move money</h1>
          <p style={{ margin: 0, color: 'var(--text-2)' }}>Track internal movements.</p>
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
          <Plus size={16} /> Add transfer
        </button>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-md)',
          minHeight: 200,
          border: '1px solid var(--border)',
        }}
      >
        {loading ? (
          <Skeleton height={64} count={4} />
        ) : transfers.length === 0 ? (
          <EmptyState
            title="No transfers"
            description="Create your first transfer."
            actionLabel="Add transfer"
            onAction={() => setModalOpen(true)}
          />
        ) : (
          <AnimatePresence>
            {transfers.map(item => {
              const from = accounts.find(a => a.id === item.fromAccountId)
              const to = accounts.find(a => a.id === item.toAccountId)
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 8,
                    alignItems: 'center',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--blue-soft)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--blue)',
                        }}
                      >
                        <ArrowLeftRight size={18} />
                      </span>
                      <div style={{ fontWeight: 800, color: 'var(--text-1)' }}>
                        {from?.name || 'From'} → {to?.name || 'To'}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>
                      {item.description || 'No description'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{smartDate(item.date)}</div>
                  </div>
                  <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--blue)' }}>
                    {formatCurrency(item.amount, from?.currency || 'UZS')}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create transfer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>From account</label>
              <select
                value={form.fromAccountId}
                onChange={e => setForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
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
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>To account</label>
              <select
                value={form.toAccountId}
                onChange={e => setForm(prev => ({ ...prev, toAccountId: e.target.value }))}
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
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={e => setForm(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="any"
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Date</label>
              <input
                type="date"
                value={form.transferDate}
                onChange={e => setForm(prev => ({ ...prev, transferDate: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Exchange rate</label>
              <input
                type="number"
                value={form.exchangeRate}
                min="0"
                step="any"
                onChange={e => setForm(prev => ({ ...prev, exchangeRate: e.target.value }))}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
            <div></div>
          </div>

          {currenciesDiffer && form.amount && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 10, padding: '10px 14px',
              fontSize: 13, color: '#166534',
              marginBottom: 12,
            }}>
              💱 {form.amount} {fromAccount?.currency} ≈{' '}
              <strong>
                {convertedAmount.toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} {toAccount?.currency}
              </strong>
              <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
                Rate updates automatically
              </div>
            </div>
          )}
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Description</label>
            <input
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Optional"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            />
          </div>

          {form.fromAccountId === form.toAccountId && form.fromAccountId && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 10,
              padding: '10px 12px',
              fontSize: 13,
              color: '#991b1b',
            }}>
              ⚠️ From and To accounts must be different
            </div>
          )}

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
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
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
