import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { AnimatePresence, motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import BankCard from '../components/ui/BankCard'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
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
import { ActivityLog } from '../components/ui/ActivityLog'

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
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState<Account | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState<AccountForm>(getDefaultAccountForm)
  const [displayCurrency, setDisplayCurrency] = useState('USD')
  const [activeQuickActionsFor, setActiveQuickActionsFor] = useState<string | null>(null)
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

  const handleDeleteAccount = async (account: Account) => {
    setDeletingId(account.id)
    try {
      await api.delete(`/api/accounts/${account.id}`)

      sounds.expense()

      const log = {
        id: `log_${Date.now()}`,
        action: 'ACCOUNT_DELETED',
        message: `Account "${account.name}" was deleted`,
        type: account.type,
        currency: account.currency,
        balance: account.balance,
        time: new Date().toISOString(),
        icon: '🗑️',
      }
      const existing = JSON.parse(localStorage.getItem('finly_activity_log') || '[]')
      existing.unshift(log)
      localStorage.setItem('finly_activity_log', JSON.stringify(existing.slice(0, 50)))

      toast.success(`Account "${account.name}" deleted`)
      setConfirmDeleteAccount(null)
      await refreshAccounts()
    } catch (err: any) {
      sounds.error()
      const msg = err?.message || 'Failed to delete account'
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleQuickNavigate = (path: string, accountId: string) => {
    navigate(`${path}?accountId=${encodeURIComponent(accountId)}`)
    setActiveQuickActionsFor(null)
  }

  const handleDeleteCard = async (account: Account) => {
    try {
      setDeletingId(account.id)
      await api.delete(`/api/accounts/${account.id}`)

      sounds.expense()

      // Log the card deletion to activity log
      const log = {
        id: `log_${Date.now()}`,
        action: 'CARD_DROPPED',
        message: `Card "${account.name}" (${account.type}) was dropped`,
        type: account.type,
        currency: account.currency,
        balance: account.balance,
        time: new Date().toISOString(),
        icon: '🗑️',
      }
      const existing = JSON.parse(localStorage.getItem('finly_activity_log') || '[]')
      existing.unshift(log)
      localStorage.setItem('finly_activity_log', JSON.stringify(existing.slice(0, 50)))

      toast.success(`Card "${account.name}" has been dropped`)
      setActiveQuickActionsFor(null)
      await refreshAccounts()
    } catch (err: any) {
      sounds.error()
      const msg = err?.response?.data?.error || err?.message || 'Failed to drop card'
      toast.error(msg)
    } finally {
      setDeletingId(null)
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <ActivityLog />
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

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
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
                  flex: isPhone ? '1 1 100%' : '0 1 calc(20% - 10px)',
                  width: isPhone ? '100%' : 'calc(20% - 10px)',
                  minWidth: isPhone ? '100%' : 230,
                  maxWidth: isPhone ? '100%' : 'calc(20% - 10px)',
                  borderRadius: 18,
                  outline: focusedAccountId === acc.id ? '2px solid #7c3aed' : 'none',
                  boxShadow: focusedAccountId === acc.id ? '0 0 0 4px rgba(124,58,237,0.15)' : 'none',
                }}
              >
                <div
                  style={{ position: 'relative' }}
                  onClick={() => setActiveQuickActionsFor(prev => (prev === acc.id ? null : acc.id))}
                >
                  <BankCard
                    name={acc.name}
                     last4={String(acc.id).slice(-4)}
                    balance={acc.balance}
                    currency={acc.currency}
                    type={mapAccountType(acc.type)}
                    accountId={acc.id}
                  />

                  {activeQuickActionsFor === acc.id && (
                    <div
                      style={{
                        position: 'absolute',
                        left: 8,
                        right: 8,
                        bottom: 8,
                        background: 'rgba(15,23,42,0.86)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        borderRadius: 12,
                        padding: 8,
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 6,
                        zIndex: 3,
                        backdropFilter: 'blur(8px)',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        data-button-reset="true"
                        onClick={() => handleQuickNavigate('/transfers', acc.id)}
                        style={{
                          border: '1px solid rgba(59,130,246,0.35)',
                          borderRadius: 10,
                          padding: '8px 6px',
                          background: 'rgba(59,130,246,0.15)',
                          color: '#bfdbfe',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ↔ Transfer
                      </button>
                      <button
                        type="button"
                        data-button-reset="true"
                        onClick={() => handleQuickNavigate('/income', acc.id)}
                        style={{
                          border: '1px solid rgba(16,185,129,0.35)',
                          borderRadius: 10,
                          padding: '8px 6px',
                          background: 'rgba(16,185,129,0.15)',
                          color: '#a7f3d0',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: 'pointer',
                        }}
                      >
                        ↓ Receive
                      </button>
                      <button
                        type="button"
                        data-button-reset="true"
                        disabled={deletingId === acc.id}
                        onClick={() => handleDeleteCard(acc)}
                        style={{
                          border: '1px solid rgba(239,68,68,0.35)',
                          borderRadius: 10,
                          padding: '8px 6px',
                          background: 'rgba(239,68,68,0.15)',
                          color: deletingId === acc.id ? 'rgba(248,113,113,0.5)' : '#fca5a5',
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: deletingId === acc.id ? 'not-allowed' : 'pointer',
                          opacity: deletingId === acc.id ? 0.5 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => {
                          if (deletingId !== acc.id) {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.25)'
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'
                          }
                        }}
                        onMouseLeave={e => {
                          if (deletingId !== acc.id) {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.15)'
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'
                          }
                        }}
                      >
                        {deletingId === acc.id ? '⏳' : '🗑️'} Drop
                      </button>
                    </div>
                  )}
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
                        background: cardTypeError ? '#fef2f2' : '#ffffff',
                        color: '#111827',
                        colorScheme: 'light',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="" style={{ color: '#6b7280', background: '#ffffff' }}>Select card type</option>
                      {CARD_TYPES.map(card => (
                        <option key={card.value} value={card.value} style={{ color: '#111827', background: '#ffffff' }}>
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

      {confirmDeleteAccount && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setConfirmDeleteAccount(null)
          }}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: 24,
            padding: '32px 28px',
            maxWidth: 380,
            width: '100%',
            boxShadow:
              '0 32px 80px rgba(0,0,0,0.3), ' +
              '0 0 0 1px rgba(255,255,255,0.05)',
            animation: 'slideUpBounce 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            textAlign: 'center',
          }}>

            <div style={{
              width: 72, height: 72,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: -4,
                borderRadius: '50%',
                border: '2px solid rgba(239,68,68,0.3)',
                animation: 'pulseRing 1.5s ease-out infinite',
              }}/>
              <span style={{ fontSize: 32 }}>🗑️</span>
            </div>

            <h3 style={{
              fontSize: 20, fontWeight: 800,
              color: 'var(--text-1)',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Delete Account?
            </h3>

            <p style={{
              fontSize: 14, color: 'var(--text-3)',
              margin: '0 0 6px', lineHeight: 1.5,
            }}>
              You are about to delete
            </p>

            <div style={{
              background: 'var(--surface-2)',
              borderRadius: 12,
              padding: '12px 16px',
              margin: '0 0 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 18, flexShrink: 0,
              }}>
                {confirmDeleteAccount.type === 'CASH' ? '💵' : '💳'}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: 'var(--text-1)',
                }}>
                  {confirmDeleteAccount.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  {confirmDeleteAccount.type} ·{' '}
                  {confirmDeleteAccount.currency} ·{' '}
                  Balance: {formatCurrency(
                    confirmDeleteAccount.balance,
                    confirmDeleteAccount.currency
                  )}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              padding: '10px 14px',
              marginBottom: 24,
              fontSize: 13,
              color: '#ef4444',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              textAlign: 'left',
            }}>
              <span style={{ flexShrink: 0, fontSize: 16 }}>⚠️</span>
              <span>
                <strong>There is no comeback.</strong> This account
                and all its data will be permanently deleted.
                This action cannot be undone.
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
            }}>
              <button
                onClick={() => setConfirmDeleteAccount(null)}
                style={{
                  height: 46,
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-2)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface-2)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                  e.currentTarget.style.borderColor = 'var(--text-3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
                onMouseDown={e =>
                  e.currentTarget.style.transform = 'scale(0.97)'}
                onMouseUp={e =>
                  e.currentTarget.style.transform = 'scale(1.02)'}
              >
                ← Keep it
              </button>

              <button
                onClick={() => handleDeleteAccount(confirmDeleteAccount)}
                disabled={!!deletingId}
                style={{
                  height: 46,
                  borderRadius: 12,
                  border: 'none',
                  background: deletingId
                    ? 'rgba(239,68,68,0.4)'
                    : 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: deletingId ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: deletingId
                    ? 'none'
                    : '0 4px 14px rgba(239,68,68,0.4), ' +
                      '0 0 0 0 rgba(239,68,68,0)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  if (deletingId) return
                  e.currentTarget.style.transform = 'scale(1.04) translateY(-1px)'
                  e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(239,68,68,0.5), ' +
                    '0 0 0 4px rgba(239,68,68,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)'
                  e.currentTarget.style.boxShadow =
                    '0 4px 14px rgba(239,68,68,0.4)'
                }}
                onMouseDown={e => {
                  if (deletingId) return
                  e.currentTarget.style.transform = 'scale(0.97)'
                }}
                onMouseUp={e => {
                  if (deletingId) return
                  e.currentTarget.style.transform = 'scale(1.04)'
                }}
              >
                {deletingId ? (
                  <>
                    <div style={{
                      width: 14, height: 14,
                      border: '2px solid rgba(255,255,255,0.4)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}/>
                    Deleting...
                  </>
                ) : (
                  <>🗑️ Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Accounts
