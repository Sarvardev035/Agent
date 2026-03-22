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
import { safeArray, mapAccountType } from '../lib/helpers'
import { ACCOUNT_TYPES, CURRENCIES } from '../lib/constants'

type AccountType = (typeof ACCOUNT_TYPES)[number]['value']
type CurrencyCode = (typeof CURRENCIES)[number]

interface AccountForm {
  name: string
  type: AccountType
  currency: CurrencyCode
  initialBalance: string
}

const Accounts = () => {
  const { accounts, refreshAccounts, isLoadingAccounts } = useFinanceStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState<AccountForm>({
    name: '',
    type: 'CASH',
    currency: 'UZS',
    initialBalance: '',
  })
  const [displayCurrency, setDisplayCurrency] = useState('USD')
  const { convert, rates, loading: rateLoading, lastUpdated, refresh } = useExchangeRates()

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      if (!cancelled) {
        await refreshAccounts()
      }
    }

    load()
    return () => { cancelled = true }
  }, [refreshAccounts])

  const portfolio = useMemo(() => {
    const totalUZS = accounts.reduce((sum, acc) => sum + convert(acc.balance, acc.currency, 'UZS'), 0)
    const converted = convert(totalUZS, 'UZS', displayCurrency)
    return converted
  }, [accounts, convert, displayCurrency])

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required')
      return
    }
    const parsed = AccountSchema.safeParse({
      ...form,
      initialBalance: Number(form.initialBalance) || 0,
    })
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/accounts', {
        name: form.name.trim(),
        type: form.type,
        currency: form.currency,
        initialBalance: Number(form.initialBalance) || 0,
        cardNumber: null,
        cardType: null,
        expiryDate: null,
      })
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
          {CURRENCIES.map(cur => (
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
                    type={mapAccountType(acc.type)}
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

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={e => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Add Account</h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#64748b',
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault()
                handleSubmit()
              }}
            >
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Account Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. My Uzcard"
                  required
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    background: '#f8fafc',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as AccountType })}
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    {ACCOUNT_TYPES.map(t => (
                      <option key={t.value} value={t.value}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    Currency *
                  </label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value as CurrencyCode })}
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: 10,
                      fontSize: 14,
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    {CURRENCIES.map(cur => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                  Initial Balance
                </label>
                <input
                  type="number"
                  value={form.initialBalance}
                  onChange={e => setForm({ ...form, initialBalance: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="any"
                  style={{
                    width: '100%',
                    height: 44,
                    padding: '0 14px',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: 10,
                    fontSize: 14,
                    background: '#f8fafc',
                  }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', height: 48, fontSize: 15 }}>
                Save Account
              </button>
            </form>
          </div>
        </div>
      )}

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
