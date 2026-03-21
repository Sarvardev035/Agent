import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import BankCard from '../components/ui/BankCard'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useFinanceStore } from '../store/finance.store'
import { Account } from '../services/accounts.service'
import { AccountSchema } from '../lib/security'
import { formatCurrency, useExchangeRates } from '../lib/currency'
import api from '../lib/api'
import { safeArray } from '../lib/helpers'

interface AccountForm {
  name: string
  type: 'CARD' | 'CASH' | 'BANK'
  currency: string
  balance: number
}

const Accounts = () => {
  const { accounts, refreshAccounts, isLoadingAccounts } = useFinanceStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [form, setForm] = useState<AccountForm>({ name: '', type: 'CARD', currency: 'UZS', balance: 0 })
  const [displayCurrency, setDisplayCurrency] = useState('USD')
  const { convert, rates, loading: rateLoading, lastUpdated, refresh } = useExchangeRates()

  useEffect(() => {
    refreshAccounts()
  }, [refreshAccounts])

  const portfolio = useMemo(() => {
    const totalUZS = accounts.reduce((sum, acc) => sum + convert(acc.balance, acc.currency, 'UZS'), 0)
    const converted = convert(totalUZS, 'UZS', displayCurrency)
    return converted
  }, [accounts, convert, displayCurrency])

  const handleSubmit = async () => {
    const parsed = AccountSchema.safeParse({ ...form, balance: Number(form.balance) })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/accounts', parsed.data)
      toast.success('Account created')
      setModalOpen(false)
      refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create account'
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    try {
      await api.delete(`/api/accounts/${confirmId}`)
      toast.success('Account deleted')
      setConfirmId(null)
      refreshAccounts()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account'
      toast.error(msg)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>ACCOUNTS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Portfolio</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Manage your cash, cards, and banks.</p>
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
          <Plus size={16} /> New account
        </button>
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
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Portfolio value</p>
          <div className="tabular" style={{ fontSize: 24, fontWeight: 800 }}>
            {rateLoading ? 'Loading...' : formatCurrency(portfolio, displayCurrency)}
          </div>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: 12 }}>
            Last updated {lastUpdated ? format(lastUpdated, 'PPpp') : '—'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {['USD', 'EUR', 'RUB', 'UZS'].map(cur => (
            <button
              key={cur}
              onClick={() => setDisplayCurrency(cur)}
              type="button"
              style={{
                padding: '8px 10px',
                borderRadius: 10,
                border: displayCurrency === cur ? '1px solid #2563eb' : '1px solid #e2e8f0',
                background: displayCurrency === cur ? '#eff6ff' : '#fff',
                fontWeight: 700,
              }}
            >
              {cur}
            </button>
          ))}
          <button
            onClick={refresh}
            type="button"
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              fontWeight: 700,
            }}
          >
            Refresh rates
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
        {isLoadingAccounts ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={180} />)
        ) : accounts.length === 0 ? (
          <EmptyState title="No accounts" description="Add an account to start tracking." actionLabel="Add" onAction={() => setModalOpen(true)} />
        ) : (
          <AnimatePresence>
            {accounts.map(acc => (
              <motion.div key={acc.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ position: 'relative' }}>
                  <BankCard
                    name={acc.name}
                    last4={String(acc.id).slice(-4)}
                    balance={acc.balance}
                    currency={acc.currency}
                    type={acc.type}
                    accountId={acc.id}
                  />
                  <button
                    onClick={() => setConfirmId(acc.id)}
                    type="button"
                    aria-label="Delete account"
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      border: 'none',
                      background: 'rgba(255,255,255,0.8)',
                      color: '#ef4444',
                      padding: 6,
                      borderRadius: 10,
                      cursor: 'pointer',
                      boxShadow: 'var(--sh-sm)',
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add account">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13 }}>Type</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value as Account['type'] })}
                style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
              >
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank</option>
              </select>
            </div>
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
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Balance</label>
            <input
              type="number"
              value={form.balance}
              onChange={e => setForm({ ...form, balance: Number(e.target.value) })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
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
            Save account
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        message="Delete this account?"
        confirmLabel="Delete"
      />
    </div>
  )
}

export default Accounts
