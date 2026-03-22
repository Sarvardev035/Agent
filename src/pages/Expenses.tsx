import { useEffect, useMemo, useState } from 'react'
import { format, subMonths } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, Lightbulb, PieChart, Plus, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../components/ui/Modal'
import EmptyState from '../components/ui/EmptyState'
import TransactionItem from '../components/ui/TransactionItem'
import Skeleton from '../components/ui/Skeleton'
import { expensesApi } from '../api/expensesApi'
import { useFinance } from '../context/FinanceContext'
import { formatCurrency, smartDate } from '../utils/helpers'
import { categoriesService } from '../services/categories.service'
import { safeArray } from '../lib/helpers'
import { CURRENCIES } from '../lib/constants'

type ExpenseFormState = {
  amount: string
  expenseDate: string
  description: string
  categoryId: string
  accountId: string
  currency: (typeof CURRENCIES)[number]
}

type CategoryOption = { id: string; name: string }

const monthOptions = Array.from({ length: 6 }).map((_, idx) => {
  const d = subMonths(new Date(), idx)
  return { value: format(d, 'yyyy-MM'), label: format(d, 'MMM yyyy') }
})

const Expenses = () => {
  const { accounts, refreshAccounts } = useFinance()
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [formData, setFormData] = useState<ExpenseFormState>({
    amount: '',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    categoryId: '',
    accountId: '',
    currency: 'UZS',
  })

  const loadCategories = async () => {
    try {
      const res = await categoriesService.getByType('EXPENSE')
      setCategoryOptions(
        safeArray<any>(res.data).map(cat => ({
          id: cat.id ?? cat.categoryId ?? cat.name,
          name: cat.name ?? cat.category ?? 'Other',
        }))
      )
    } catch {
      setCategoryOptions([])
    }
  }

  const loadExpenses = async () => {
    try {
      setLoading(true)
      const { data } = await expensesApi.getAll()
      const list = safeArray<any>(data).map(item => ({
        ...item,
        date: item.expenseDate || item.date,
        categoryId: item.categoryId || item.category,
        currency: item.currency || 'UZS',
      }))
      setExpenses(list)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load expenses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadExpenses()
    loadCategories()
    refreshAccounts()
  }, [refreshAccounts])

  const filteredExpenses = useMemo(() => {
    const monthMatch = (date: string) => date?.startsWith(month)
    return (expenses || [])
      .filter(item => (categoryFilter === 'ALL' ? true : item.categoryId === categoryFilter))
      .filter(item => (month ? monthMatch(item.date) : true))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, categoryFilter, month])

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {}
    filteredExpenses.forEach(item => {
      const key = smartDate(item.date)
      if (!map[key]) map[key] = []
      map[key].push(item)
    })
    return map
  }, [filteredExpenses])

  const handleChange = (key: keyof ExpenseFormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = () => {
    setTimeout(async () => {
      if (!formData.amount || !formData.expenseDate || !formData.accountId || !formData.categoryId) {
        toast.error('Please fill amount, date, category, account, and currency')
        return
      }
      try {
        await expensesApi.create({
          amount: Number(formData.amount),
          expenseDate: formData.expenseDate,
          description: formData.description,
          categoryId: formData.categoryId,
          accountId: formData.accountId,
          currency: formData.currency,
        })
        toast.success('Expense added')
        setShowModal(false)
        setFormData({
          amount: '',
          expenseDate: format(new Date(), 'yyyy-MM-dd'),
          description: '',
          categoryId: '',
          accountId: '',
          currency: 'UZS',
        })
        await Promise.allSettled([loadExpenses(), refreshAccounts()])
      } catch (err) {
        console.error(err)
        toast.error('Failed to add expense')
      }
    }, 0)
  }

  const dailyTotals = (items: any[]) => items.reduce((sum, item) => sum + (item.amount || 0), 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
      <div
        style={{
          background: 'linear-gradient(120deg,#0f172a,#1e3a8a)',
          color: '#fff',
          borderRadius: 16,
          padding: 18,
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.12)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Info size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11, opacity: 0.8 }}>
            Demo data
          </p>
          <h2 style={{ margin: '4px 0 2px', fontSize: 18, fontWeight: 800 }}>Expenses overview</h2>
          <p style={{ margin: 0, opacity: 0.8, fontSize: 13 }}>Add your expenses to replace the sample insights.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            color: '#0f172a',
            padding: '10px 14px',
            borderRadius: 12,
            border: 'none',
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(255,255,255,0.18)',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))',
          gap: 12,
        }}
      >
        {[
          { icon: <PieChart size={18} />, title: 'Category breakdown', desc: 'See where spending concentrates.' },
          { icon: <Lightbulb size={18} />, title: 'Monthly trends', desc: 'Spot spikes before they hurt.' },
          { icon: <ShieldAlert size={18} />, title: 'Budget alerts', desc: 'Get notified when nearing limits.' },
        ].map(card => (
          <div
            key={card.title}
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 14,
              border: '1px solid var(--border)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'var(--blue-soft)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--blue)',
              }}
            >
              {card.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{card.title}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{card.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: 12,
          background: '#fff',
          borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
          {monthOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setMonth(opt.value)}
              type="button"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: month === opt.value ? '1px solid var(--blue)' : '1px solid var(--border)',
                background: month === opt.value ? 'var(--blue-soft)' : '#fff',
                color: month === opt.value ? 'var(--blue)' : 'var(--text-1)',
                fontWeight: 700,
                minWidth: 120,
                whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {['ALL', ...categoryOptions.map(cat => cat.id || cat.name)].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              type="button"
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: categoryFilter === cat ? '1px solid var(--blue)' : '1px solid var(--border)',
                background: categoryFilter === cat ? 'var(--blue-soft)' : '#fff',
                fontWeight: 700,
                color: categoryFilter === cat ? 'var(--blue)' : 'var(--text-1)',
                whiteSpace: 'nowrap',
              }}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: 16,
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)',
          minHeight: 260,
        }}
      >
        {loading ? (
          <Skeleton height={66} count={4} />
        ) : filteredExpenses.length === 0 ? (
          <EmptyState
            title="No expenses yet"
            description="Track your daily spending to unlock insights."
            actionLabel="Add expense"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Object.entries(grouped).map(([dateLabel, items]) => (
              <div key={dateLabel} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontWeight: 800, color: 'var(--text-1)' }}>{dateLabel}</div>
                  <div style={{ fontWeight: 700, color: 'var(--red)' }}>{formatCurrency(dailyTotals(items))}</div>
                </div>
                <AnimatePresence>
                  {items.map((item: any) => {
                    const account = accounts.find(acc => acc.id === item.accountId)
                    return (
                      <TransactionItem
                        key={item.id}
                        type="expense"
                        amount={item.amount}
                        category={item.category || item.categoryId || 'OTHER'}
                        date={item.date}
                        description={item.description}
                        currency={account?.currency || 'UZS'}
                        accountLabel={account?.name}
                      />
                    )
                  })}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add expense"
        subtitle="Save a new expense entry with ISO date."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Amount</label>
              <input
                type="number"
                value={formData.amount}
                onChange={e => handleChange('amount', e.target.value)}
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
                value={formData.expenseDate}
                onChange={e => handleChange('expenseDate', e.target.value)}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Category</label>
              <select
                value={formData.categoryId}
                onChange={e => handleChange('categoryId', e.target.value)}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              >
                <option value="">Select category</option>
                {categoryOptions.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Currency</label>
              <select
                value={formData.currency}
                onChange={e => handleChange('currency', e.target.value)}
                style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
              >
                {CURRENCIES.map(cur => (
                  <option key={cur} value={cur}>
                    {cur}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Account</label>
            <select
              value={formData.accountId}
              onChange={e => handleChange('accountId', e.target.value)}
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
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Description</label>
            <input
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              placeholder="Optional"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
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
              background: 'linear-gradient(135deg,#f43f5e,#ef4444)',
              color: '#fff',
              fontWeight: 800,
              boxShadow: '0 12px 30px rgba(244,63,94,0.35)',
              cursor: 'pointer',
            }}
          >
            Save expense
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Expenses
