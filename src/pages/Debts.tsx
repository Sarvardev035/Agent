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
import { formatCurrency, smartDate } from '../lib/helpers'
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

interface RepayModalState {
  id: string
  amount: string
  accountId: string
  maxDebtAmount: number
}

const Debts = () => {
  const { refreshAccounts, accounts } = useFinance()
  const [debts, setDebts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<DebtType>('DEBT')
  const [modalOpen, setModalOpen] = useState(false)
  const [repayModal, setRepayModal] = useState<RepayModalState | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [isSavingDebt, setIsSavingDebt] = useState(false)
  const [isRepayingDebt, setIsRepayingDebt] = useState(false)
  const [isDeletingDebt, setIsDeletingDebt] = useState(false)
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
    refreshAccounts()
  }, [refreshAccounts])

  const filtered = useMemo(() => debts.filter(d => d.type === tab), [debts, tab])

  const totals = useMemo(() => {
    const borrowed = debts.filter(d => d.type === 'DEBT').reduce((s, d) => s + (d.amount || 0), 0)
    const lent = debts.filter(d => d.type === 'RECEIVABLE').reduce((s, d) => s + (d.amount || 0), 0)
    return { borrowed, lent }
  }, [debts])

  const accountChoices = useMemo(
    () =>
      accounts.filter(acc => {
        const archived = Boolean(acc?.isArchived || acc?.archived || acc?.isDeleted || acc?.deletedAt)
        const inactive = acc?.isActive === false || acc?.status === 'INACTIVE' || acc?.status === 'CLOSED'
        return !archived && !inactive
      }),
    [accounts]
  )

  const getDebtRemainingAmount = (debt: any) => {
    const directRemaining = [
      debt?.remainingDebtAmount,
      debt?.remainingAmount,
      debt?.remaining,
      debt?.outstandingAmount,
      debt?.balanceDue,
    ]
      .map(value => Number(value))
      .find(value => Number.isFinite(value) && value >= 0)

    if (directRemaining !== undefined) return directRemaining

    const repayments = safeArray<any>(debt?.repayments)
    const totalRepaid = repayments.reduce((sum, repayment) => {
      const amount = Number(repayment?.paymentAmount ?? repayment?.amount ?? repayment?.paidAmount ?? 0)
      return sum + (Number.isFinite(amount) ? amount : 0)
    }, 0)

    const amountPaid = Number(debt?.amountPaid ?? debt?.paidAmount ?? debt?.totalRepaid ?? 0)
    const paid = Number.isFinite(amountPaid) ? amountPaid : totalRepaid
    const original = Number(debt?.amount ?? 0)
    if (!Number.isFinite(original) || original <= 0) return 0
    return Math.max(original - paid, 0)
  }

  const hasRepaymentHistory = (debt: any) => {
    const repayments = safeArray<any>(debt?.repayments)
    if (repayments.length > 0) return true

    const trackedRepaymentCount = Number(debt?.repaymentsCount ?? debt?.repaymentCount ?? 0)
    if (Number.isFinite(trackedRepaymentCount) && trackedRepaymentCount > 0) return true

    const trackedPaidAmount = Number(debt?.amountPaid ?? debt?.paidAmount ?? debt?.totalRepaid ?? 0)
    return Number.isFinite(trackedPaidAmount) && trackedPaidAmount > 0
  }

  const selectedRepayAccount = useMemo(
    () => accountChoices.find(acc => String(acc.id) === String(repayModal?.accountId || '')),
    [accountChoices, repayModal?.accountId]
  )

  const selectedRepayAccountBalance = Number(selectedRepayAccount?.balance ?? 0)
  const remainingDebtAmount = Number(repayModal?.maxDebtAmount ?? 0)
  const repayAmountValue = Number(repayModal?.amount ?? 0)

  const repayValidationMessage = useMemo(() => {
    if (!repayModal) return ''
    if (!repayModal.accountId) return 'Please choose the account/card to fund this repayment.'
    if (!Number.isFinite(repayAmountValue) || repayAmountValue <= 0) return 'Enter a valid repayment amount.'
    if (repayAmountValue > remainingDebtAmount) {
      return `Payment amount cannot exceed the remaining debt (${formatCurrency(remainingDebtAmount)}).`
    }
    if (repayAmountValue > selectedRepayAccountBalance) {
      return `Insufficient balance. Selected account has ${formatCurrency(selectedRepayAccountBalance)} available.`
    }
    return ''
  }, [repayAmountValue, remainingDebtAmount, repayModal, selectedRepayAccountBalance])

  const isRepayActionDisabled = isRepayingDebt || Boolean(repayValidationMessage)

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message
    return fallback
  }

  const handleSubmit = async () => {
    const amount = Number(form.amount)
    if (!form.personName.trim() || !Number.isFinite(amount) || amount <= 0) {
      sounds.error()
      toast.error('Please enter valid person and amount')
      return
    }
    if (!form.dueDate) {
      sounds.error()
      toast.error('Please choose a due date')
      return
    }
    if (!form.accountId) {
      sounds.error()
      const message = form.type === 'DEBT' 
        ? 'Please select which account to withdraw money from'
        : 'Please select which account to deposit money into'
      toast.error(message)
      return
    }

    const selectedAccount = accountChoices.find(acc => String(acc.id) === String(form.accountId))
    if (form.type === 'DEBT' && selectedAccount) {
      const balance = Number(selectedAccount.balance || 0)
      if (amount > balance) {
        sounds.error()
        toast.error(`Insufficient balance. ${selectedAccount.name} has ${formatCurrency(balance, selectedAccount.currency || 'UZS')} available.`)
        return
      }
    }

    try {
      setIsSavingDebt(true)
      await debtsApi.create({
        personName: form.personName.trim(),
        amount,
        currency: form.currency as 'USD' | 'EUR' | 'UZS',
        dueDate: form.dueDate,
        type: form.type,
        description: form.description.trim() || undefined,
        accountId: form.accountId,
      })
      sounds.notification()
      const message = form.type === 'DEBT' 
        ? 'Debt recorded and money withdrawn! ✅'
        : 'Loan recorded and money added! ✅'
      toast.success(message)
      setModalOpen(false)
      setForm(prev => ({ ...prev, amount: '', description: '', personName: '', accountId: '' }))
      await Promise.allSettled([loadDebts(), refreshAccounts()])
    } catch (err) {
      console.error('Failed to save debt:', err)
      sounds.error()
      toast.error(getErrorMessage(err, 'Failed to save debt'))
    } finally {
      setIsSavingDebt(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmId) return
    const debtToDelete = debts.find(item => String(item.id) === String(confirmId))
    if (debtToDelete && hasRepaymentHistory(debtToDelete)) {
      sounds.error()
      toast.error('Cannot delete debts with payment history.')
      setConfirmId(null)
      return
    }
    try {
      setIsDeletingDebt(true)
      await debtsApi.delete(confirmId)
      sounds.success()
      toast.success('Debt removed')
      setConfirmId(null)
      await Promise.allSettled([loadDebts(), refreshAccounts()])
    } catch (err) {
      console.error('Failed to delete debt:', err)
      sounds.error()
      toast.error(getErrorMessage(err, 'Failed to delete debt'))
    } finally {
      setIsDeletingDebt(false)
    }
  }

  const handleRepay = async () => {
    if (!repayModal) return
    const paymentAmount = Number(repayModal.amount)
    if (!repayModal.accountId) {
      sounds.error()
      toast.error('Please choose the account/card for this repayment')
      return
    }
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      sounds.error()
      toast.error('Enter repayment amount')
      return
    }
    if (paymentAmount > remainingDebtAmount) {
      sounds.error()
      toast.error(`Payment amount cannot exceed ${formatCurrency(remainingDebtAmount)}`)
      return
    }
    if (paymentAmount > selectedRepayAccountBalance) {
      sounds.error()
      toast.error(`Insufficient balance in selected account (${formatCurrency(selectedRepayAccountBalance)})`)
      return
    }
    try {
      setIsRepayingDebt(true)
      await debtsApi.repay(repayModal.id, {
        paymentAmount,
        accountId: repayModal.accountId,
      })
      sounds.success()
      toast.success('Repayment recorded! ✅')
      setRepayModal(null)
      await Promise.allSettled([loadDebts(), refreshAccounts()])
    } catch (err) {
      console.error('Failed to record repayment:', err)
      sounds.error()
      toast.error(getErrorMessage(err, 'Failed to record repayment'))
    } finally {
      setIsRepayingDebt(false)
    }
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
                          onClick={() =>
                            setRepayModal({
                              id: String(item.id),
                              amount: String(getDebtRemainingAmount(item) || ''),
                              accountId: '',
                              maxDebtAmount: getDebtRemainingAmount(item),
                            })
                          }
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
                        disabled={hasRepaymentHistory(item)}
                        title={hasRepaymentHistory(item) ? 'Cannot delete debts with payment history.' : 'Delete debt'}
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
                          cursor: hasRepaymentHistory(item) ? 'not-allowed' : 'pointer',
                          opacity: hasRepaymentHistory(item) ? 0.6 : 1,
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
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Account (required)</label>
            <select
              value={form.accountId}
              onChange={e => setForm(prev => ({ ...prev, accountId: e.target.value }))}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            >
              <option value="">
                {form.type === 'DEBT' 
                  ? 'Select account to withdraw from...' 
                  : 'Select account to deposit into...'}
              </option>
              {accountChoices.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency}) - {formatCurrency(Number(acc.balance || 0), acc.currency || 'UZS')}
                </option>
              ))}
            </select>
            {accountChoices.length === 0 && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>
                ⚠️ Add an active account/card first to create a debt.
              </div>
            )}
            {form.accountId && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)', fontWeight: 700 }}>
                {form.type === 'DEBT' 
                  ? '💸 Money will be withdrawn from this account' 
                  : '💰 Money will be added to this account'}
              </div>
            )}
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
            disabled={isSavingDebt || !form.accountId}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
              color: '#fff',
              fontWeight: 800,
              boxShadow: '0 12px 30px rgba(37,99,235,0.35)',
              cursor: isSavingDebt || !form.accountId ? 'not-allowed' : 'pointer',
              opacity: isSavingDebt || !form.accountId ? 0.7 : 1,
            }}
          >
            {isSavingDebt ? 'Saving...' : 'Save debt'}
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
              max={
                repayModal?.accountId
                  ? String(Math.max(Math.min(remainingDebtAmount, selectedRepayAccountBalance), 0))
                  : String(Math.max(remainingDebtAmount, 0))
              }
              step="any"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            />
            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
              Remaining debt: {formatCurrency(remainingDebtAmount)}
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Pay from account/card</label>
            <select
              value={repayModal?.accountId || ''}
              onChange={e =>
                setRepayModal(prev => (prev ? { ...prev, accountId: e.target.value } : prev))
              }
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            >
              <option value="">Select account</option>
              {accountChoices.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.currency}) - {formatCurrency(Number(acc.balance || 0), acc.currency || 'UZS')}
                </option>
              ))}
            </select>
            {!!repayModal?.accountId && (
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>
                Available: {formatCurrency(selectedRepayAccountBalance, selectedRepayAccount?.currency || 'UZS')}
              </div>
            )}
          </div>
          {!!repayValidationMessage && (
            <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>
              {repayValidationMessage}
            </div>
          )}
          {accountChoices.length === 0 && (
            <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 700 }}>
              Add an active account/card first to make a repayment.
            </div>
          )}
          <button
            onClick={handleRepay}
            type="button"
            disabled={isRepayActionDisabled}
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#16a34a,#15803d)',
              color: '#fff',
              fontWeight: 800,
              cursor: isRepayActionDisabled ? 'not-allowed' : 'pointer',
              opacity: isRepayActionDisabled ? 0.7 : 1,
              boxShadow: '0 12px 30px rgba(22,163,74,0.25)',
            }}
          >
            {isRepayingDebt ? 'Saving...' : 'Confirm repayment'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        onCancel={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete debt?"
        message="This will permanently remove the debt record."
        confirmLabel={isDeletingDebt ? 'Deleting...' : 'Delete'}
      />
    </div>
  )
}

export default Debts
