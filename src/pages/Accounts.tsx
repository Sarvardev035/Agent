import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import BankCard from '../components/ui/BankCard'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import CardNumberField from '../components/ui/CardNumberField'
import { useFinanceStore } from '../store/finance.store'
import { Account } from '../services/accounts.service'
import { AccountSchema, getCardNumberError } from '../lib/security'
import { formatCurrency, useExchangeRates } from '../lib/currency'
import api from '../lib/api'
import { safeArray, mapAccountType } from '../lib/helpers'
import { ACCOUNT_TYPES, CARD_TYPES, CURRENCIES } from '../lib/constants'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { sounds } from '../lib/sounds'

type AccountType = (typeof ACCOUNT_TYPES)[number]['value']
type CurrencyCode = (typeof CURRENCIES)[number]
type CardType = (typeof CARD_TYPES)[number]['value']

interface AccountForm {
  name: string
  type: AccountType
  currency: CurrencyCode
  initialBalance: string
  cardNumber: string
  cardType: CardType | ''
}

const getDefaultAccountForm = (): AccountForm => ({
  name: '',
  type: 'CASH',
  currency: 'UZS',
  initialBalance: '',
  cardNumber: '',
  cardType: '',
})

const Accounts = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { accounts, refreshAccounts, isLoadingAccounts } = useFinanceStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<{ title: string; lines: string[]; accountId: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<AccountForm>(getDefaultAccountForm)
  const [displayCurrency, setDisplayCurrency] = useState('USD')
  const { convert, rates, loading: rateLoading, lastUpdated, refresh } = useExchangeRates()
  const isPhone = useMediaQuery('(max-width: 640px)')
  const isCardAccount = form.type === 'BANK_CARD'
  const cardNumberError = isCardAccount ? getCardNumberError(form.cardNumber) : null
  const cardTypeError = isCardAccount && !form.cardType
    ? 'Card type is required for BANK_CARD accounts'
    : null
  const isSubmitDisabled = isCardAccount && (Boolean(cardNumberError) || Boolean(cardTypeError))
  const focusedAccountId = searchParams.get('accountId')

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
      sounds.error()
      toast.error('Name is required')
      return
    }
    if (isCardAccount && cardNumberError) {
      sounds.error()
      toast.error(cardNumberError)
      return
    }
    if (isCardAccount && cardTypeError) {
      sounds.error()
      toast.error(cardTypeError)
      return
    }
    const parsed = AccountSchema.safeParse({
      ...form,
      initialBalance: Number(form.initialBalance) || 0,
      cardNumber: isCardAccount ? form.cardNumber : undefined,
      cardType: isCardAccount ? form.cardType || undefined : undefined,
    })
    if (!parsed.success) {
      sounds.error()
      toast.error(parsed.error.issues[0].message)
      return
    }
    try {
      await api.post('/api/accounts', {
        name: parsed.data.name,
        type: parsed.data.type,
        currency: parsed.data.currency,
        initialBalance: parsed.data.initialBalance,
        ...(parsed.data.type === 'BANK_CARD'
          ? {
              cardNumber: parsed.data.cardNumber,
              cardType: parsed.data.cardType,
            }
          : {}),
      })
      sounds.success()
      toast.success('Account created! 🎉')
      setModalOpen(false)
      setForm(getDefaultAccountForm())
      await refreshAccounts()
    } catch (err: any) {
      const msg = err?.response?.data?.message
        || err?.response?.data?.error
        || (err instanceof Error ? err.message : 'Failed to create account')
      sounds.error()
      toast.error(msg)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    setDeleting(true)
    try {
      await api.delete(`/api/accounts/${confirmId}`)
      sounds.success()
      toast.success('Account deleted successfully')
      setConfirmId(null)
      await refreshAccounts()
    } catch (err: any) {
      const status = err?.response?.status
        || (err.message?.includes('409') ? 409 : 0)

      if (status === 409 || err.message?.includes('409')
          || err.message?.includes('transactions')) {
        setDeleteError({
          title: 'Cannot delete this account',
          lines: [
            'This account has transactions linked to it.',
            'To delete this account you must first:',
            '• Delete all expenses from this account',
            '• Delete all income records from this account',
            '• Delete all transfers involving this account',
            'Then try deleting again.',
          ],
          accountId: confirmId,
        })
        setConfirmId(null)
      } else {
        const msg = err instanceof Error ? err.message : 'Failed to delete account'
        sounds.error()
        toast.error(msg)
        setConfirmId(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page-content page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
      }}>
        <div>
          <p style={{
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--text-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: '0 0 4px',
          }}>
            ACCOUNTS
          </p>
          <h1 style={{
            fontSize: 'clamp(20px,3vw,28px)',
            fontWeight: 800,
            color: 'var(--text-1)',
            margin: 0,
          }}>
            Portfolio
          </h1>
          <p style={{
            fontSize: 13,
            color: 'var(--text-3)',
            margin: '4px 0 0',
          }}>
            Manage your cash, cards, and banks.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '11px 20px',
            background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.45)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.35)'
          }}
        >
          + Add Account
        </button>
      </div>

      <div
        className="card"
        style={{
          background: 'var(--surface-strong)',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-sm)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: 13 }}>Portfolio value</p>
          <div className="balance-large">
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,280px),1fr))', gap: 12 }}>
        {isLoadingAccounts ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} height={180} />)
        ) : accounts.length === 0 ? (
          <EmptyState title="No accounts" description="Add an account to start tracking." actionLabel="Add" onAction={() => setModalOpen(true)} />
        ) : (
          <AnimatePresence>
            {accounts.map(acc => (
              <motion.div
                key={acc.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                  borderRadius: 18,
                  outline: focusedAccountId === acc.id ? '2px solid #7c3aed' : 'none',
                  boxShadow: focusedAccountId === acc.id ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
                }}
              >
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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: isPhone ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isPhone ? '12px 12px 0' : '24px 16px',
            zIndex: 100,
          }}
          onClick={e => {
            if (e.target === e.currentTarget) setModalOpen(false)
          }}
        >
          <div
            className="modal-box"
            style={{
              width: '100%',
              maxWidth: 620,
              background: 'var(--surface-strong)',
              borderRadius: isPhone ? '24px 24px 0 0' : 20,
              padding: isPhone ? 18 : 24,
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
              maxHeight: isPhone ? '92vh' : 'min(90vh, 720px)',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Add Account</h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'var(--surface)',
                  border: 'none',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  fontSize: 16,
                  color: 'var(--text-3)',
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
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
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
                    border: '1.5px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 14,
                    background: 'var(--surface)',
                    color: 'var(--text-1)',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,220px),1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value as AccountType })}
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 10,
                      fontSize: 14,
                      background: 'var(--surface)',
                      color: 'var(--text-1)',
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
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                    Currency *
                  </label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value as CurrencyCode })}
                    style={{
                      width: '100%',
                      height: 44,
                      padding: '0 14px',
                      border: '1.5px solid var(--border)',
                      borderRadius: 10,
                      fontSize: 14,
                      background: 'var(--surface)',
                      color: 'var(--text-1)',
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

              {isCardAccount && (
                <>
                  <CardNumberField
                    value={form.cardNumber}
                    error={cardNumberError}
                    onChange={cardNumber => setForm(prev => ({ ...prev, cardNumber }))}
                  />

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
                      Card Type *
                    </label>
                    <select
                      value={form.cardType}
                      onChange={e => setForm(prev => ({ ...prev, cardType: e.target.value as CardType | '' }))}
                      style={{
                        width: '100%',
                        height: 44,
                        padding: '0 14px',
                        border: `1.5px solid ${cardTypeError ? '#ef4444' : 'var(--border)'}`,
                        borderRadius: 10,
                        fontSize: 14,
                        background: cardTypeError ? '#fef2f2' : 'var(--surface)',
                        color: 'var(--text-1)',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="">Select card type</option>
                      {CARD_TYPES.map(card => (
                        <option key={card.value} value={card.value}>
                          {card.label}
                        </option>
                      ))}
                    </select>
                    <p style={{ margin: '6px 0 0', minHeight: 18, color: cardTypeError ? '#dc2626' : 'var(--text-3)', fontSize: 12 }}>
                      {cardTypeError ?? 'Supported by the backend: Uzcard, Humo, Visa, and Mastercard.'}
                    </p>
                  </div>
                </>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-2)', marginBottom: 6 }}>
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
                    border: '1.5px solid var(--border)',
                    borderRadius: 10,
                    fontSize: 14,
                    background: 'var(--surface)',
                    color: 'var(--text-1)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="btn-primary"
                style={{
                  width: '100%',
                  height: 48,
                  fontSize: 15,
                  opacity: isSubmitDisabled ? 0.6 : 1,
                  cursor: isSubmitDisabled ? 'not-allowed' : 'pointer',
                }}
              >
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

      {deleteError && (
        <div
          onClick={e => e.target === e.currentTarget
            && setDeleteError(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            padding: 16, zIndex: 200,
          }}
        >
          <div style={{
            background: 'var(--surface-strong)',
            borderRadius: 20, padding: 28,
            maxWidth: 420, width: '100%',
            boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: '#fff1f2',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24, margin: '0 auto 16px',
            }}>
              🔒
            </div>
            <h3 style={{
              textAlign: 'center', fontSize: 18,
              fontWeight: 700, color: 'var(--text-1)',
              marginBottom: 8,
            }}>
              {deleteError.title}
            </h3>
            <div style={{
              background: 'var(--surface)',
              borderRadius: 12, padding: '14px 16px',
              marginBottom: 20,
            }}>
              {deleteError.lines.map((line, i) => (
                <p key={i} style={{
                  fontSize: 13,
                  color: i === 0 ? 'var(--text-3)' : 'var(--text-2)',
                  margin: i === 0 ? '0 0 10px' : '4px 0',
                  fontWeight: line.startsWith('•') ? 400 : 500,
                }}>
                  {line}
                </p>
              ))}
            </div>
            <div style={{ display: 'grid',
              gridTemplateColumns: '1fr 1fr', gap: 10,
            }}>
              <button
                onClick={() => setDeleteError(null)}
                style={{
                  padding: '11px', borderRadius: 10,
                  border: '1.5px solid var(--border)',
                  background: 'none', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14,
                  color: 'var(--text-2)',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  setDeleteError(null)
                  navigate('/expenses')
                }}
                style={{
                  padding: '11px', borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  color: 'white', cursor: 'pointer',
                  fontWeight: 600, fontSize: 14,
                }}
              >
                View Expenses →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
