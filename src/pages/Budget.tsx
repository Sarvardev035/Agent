import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { PiggyBank, Plus, ShieldCheck, Sparkles } from 'lucide-react'
import ProgressRing from '../components/ui/ProgressRing'
import ProgressBar from '../components/ui/ProgressBar'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import { budgetApi } from '../api/budgetApi'
import { statsApi } from '../api/statsApi'
import { formatCurrency, getBudgetColor } from '../utils/helpers'
import { useFinance } from '../context/FinanceContext'
import { categoriesService } from '../services/categories.service'
import { safeArray } from '../lib/helpers'

interface CategoryBudget {
  categoryId: string
  category: string
  limit: number
  spent: number
}

const Budget = () => {
  const { refreshAccounts } = useFinance()
  const [loading, setLoading] = useState(true)
  const [incomeGoal, setIncomeGoal] = useState<number>(0)
  const [actualIncome, setActualIncome] = useState<number>(0)
  const [categories, setCategories] = useState<CategoryBudget[]>([])
  const [goalModal, setGoalModal] = useState(false)
  const [categoryModal, setCategoryModal] = useState(false)
  const [goalInput, setGoalInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [categoryLimit, setCategoryLimit] = useState('')
  const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([])

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const loadBudget = async () => {
    try {
      setLoading(true)
      const [budgetRes, summaryRes, catsRes] = await Promise.allSettled([
        budgetApi.get({ year: currentYear, month: currentMonth }),
        statsApi.summary(),
        categoriesService.getByType('EXPENSE'),
      ])

      const catList =
        catsRes.status === 'fulfilled'
          ? safeArray<any>(catsRes.value.data).map(cat => ({
              id: cat.id ?? cat.categoryId ?? cat.name,
              name: cat.name ?? cat.category ?? 'Category',
            }))
          : []
      setCategoryOptions(catList)
      if (!selectedCategory && catList[0]) setSelectedCategory(catList[0].id)

      const budgetData =
        budgetRes.status === 'fulfilled' ? safeArray<any>(budgetRes.value.data) : []

      const mapName = (id: string) =>
        catList.find(cat => cat.id === id)?.name ||
        budgetData.find(b => b.categoryId === id)?.category ||
        'Category'

      setIncomeGoal(
        budgetData.reduce((sum, item) => sum + (item.monthlyLimit ?? item.limit ?? 0), 0)
      )

      setCategories(
        budgetData.map((item: any) => ({
          categoryId: item.categoryId || item.category,
          category: mapName(item.categoryId || item.category),
          limit: item.monthlyLimit ?? item.limit ?? 0,
          spent: item.spent ?? item.spentAmount ?? 0,
        }))
      )

      if (summaryRes.status === 'fulfilled') {
        const summary = summaryRes.value.data?.data ?? summaryRes.value.data ?? {}
        const expenseTotal = summary.totalExpenses ?? summary.expenses ?? summary.expense ?? 0
        setActualIncome(expenseTotal)
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to load budget')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBudget()
  }, [])

  const handleSaveGoal = async () => {
    const parsed = Number(goalInput || incomeGoal)
    if (!parsed || parsed <= 0) {
      toast.error('Enter a valid budget amount')
      return
    }
    setTimeout(async () => {
      try {
        await budgetApi.set({ monthlyLimit: parsed, year: currentYear, month: currentMonth })
        toast.success('Monthly budget saved')
        setGoalModal(false)
        setIncomeGoal(parsed)
        await Promise.allSettled([loadBudget(), refreshAccounts()])
      } catch (err) {
        console.error(err)
        toast.error('Failed to save goal')
      }
    }, 0)
  }

  const handleSaveCategory = async () => {
    const parsed = Number(categoryLimit)
    if (!parsed || parsed <= 0) {
      toast.error('Limit must be positive')
      return
    }
    setTimeout(async () => {
      try {
        await budgetApi.setCategory({
          categoryId: selectedCategory,
          monthlyLimit: parsed,
          type: 'MONTHLY',
          year: currentYear,
          month: currentMonth,
        })
        toast.success('Category limit saved')
        setCategoryModal(false)
        setCategoryLimit('')
        await Promise.allSettled([loadBudget(), refreshAccounts()])
      } catch (err) {
        console.error(err)
        toast.error('Failed to save category limit')
      }
    }, 0)
  }

  const goalProgress = useMemo(() => {
    if (!incomeGoal) return 0
    return Math.min((actualIncome / incomeGoal) * 100, 150)
  }, [actualIncome, incomeGoal])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>BUDGET</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Stay within goals</h1>
          <p style={{ margin: 0, color: 'var(--text-2)' }}>Track overall and per-category budgets.</p>
        </div>
        <button
          onClick={() => setGoalModal(true)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: 'linear-gradient(135deg,#f59e0b,#f43f5e)',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(244,63,94,0.28)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Set monthly budget
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 16, alignItems: 'stretch' }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-md)',
            minHeight: 260,
            display: 'flex',
            gap: 16,
            alignItems: 'center',
            border: '1px solid var(--border)',
          }}
        >
          {loading ? (
            <Skeleton height={220} />
          ) : incomeGoal ? (
            <>
              <ProgressRing percent={goalProgress} label="Budget vs spent" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  Budget {formatCurrency(incomeGoal)}
                </div>
                <div style={{ color: 'var(--text-2)' }}>
                  Spent {formatCurrency(actualIncome)}
                </div>
                <div
                  style={{
                    background: 'var(--blue-soft)',
                    padding: 12,
                    borderRadius: 12,
                    color: 'var(--blue)',
                    fontWeight: 800,
                  }}
                >
                  Remaining {formatCurrency(Math.max(incomeGoal - actualIncome, 0))}
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              title="No monthly budget"
              description="Set a monthly budget to start tracking progress."
              actionLabel="Set goal"
              onAction={() => setGoalModal(true)}
            />
          )}
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-md)',
            minHeight: 260,
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PiggyBank size={18} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Budget health</h3>
            </div>
            <button
              onClick={() => setCategoryModal(true)}
              type="button"
              style={{
                padding: '8px 12px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Add category limit
            </button>
          </div>
          <div style={{ color: 'var(--text-2)', fontSize: 13, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span>• Review your category caps</span>
            <span>• Keep below 90% to avoid alerts</span>
            <span>• Update anytime</span>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Review weekly', 'Automate savings', 'Track big purchases'].map(tip => (
              <span
                key={tip}
                style={{
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: 'var(--blue-soft)',
                  color: 'var(--blue)',
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                <Sparkles size={14} style={{ marginRight: 6 }} />
                {tip}
              </span>
            ))}
          </div>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Category limits</h3>
          <button
            onClick={() => setCategoryModal(true)}
            type="button"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Manage limits
          </button>
        </div>
        {loading ? (
          <Skeleton height={200} />
        ) : categories.length === 0 ? (
          <EmptyState
            title="No category limits"
            description="Create limits to keep spending in check."
            actionLabel="Add limit"
            onAction={() => setCategoryModal(true)}
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 12 }}>
            {categories.map(cat => {
              const percent = cat.limit ? (cat.spent / cat.limit) * 100 : 0
              const palette = getBudgetColor(percent)
              const warn = percent >= 90
              return (
                <div
                  key={cat.categoryId || cat.category}
                  style={{
                    padding: 14,
                    borderRadius: 14,
                    border: warn ? `2px solid ${palette.bar}` : '1px solid var(--border)',
                    boxShadow: warn ? '0 0 0 6px rgba(244,63,94,0.08)' : 'var(--shadow-sm)',
                    background: '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 800 }}>{cat.category}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <ProgressBar percent={percent} color={palette.bar} label="Progress" />
                  </div>
                  {warn && (
                    <div
                      style={{
                        marginTop: 8,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: palette.bg,
                        color: palette.text,
                        padding: '6px 10px',
                        borderRadius: 10,
                        fontWeight: 700,
                      }}
                    >
                      <ShieldCheck size={14} />
                      Nearing limit
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={goalModal} onClose={() => setGoalModal(false)} title="Set monthly budget">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Monthly budget</label>
          <input
            type="number"
            value={goalInput || incomeGoal || ''}
            onChange={e => setGoalInput(e.target.value)}
            placeholder="0.00"
            style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
          />
          <button
            onClick={handleSaveGoal}
            type="button"
            style={{
              width: '100%',
              height: 48,
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#f43f5e)',
              color: '#fff',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 30px rgba(244,63,94,0.35)',
            }}
          >
            Save goal
          </button>
        </div>
      </Modal>

      <Modal open={categoryModal} onClose={() => setCategoryModal(false)} title="Add category limit">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            >
              {categoryOptions.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-2)' }}>Monthly limit</label>
            <input
              type="number"
              value={categoryLimit}
              onChange={e => setCategoryLimit(e.target.value)}
              placeholder="0.00"
              style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}
            />
          </div>
          <button
            onClick={handleSaveCategory}
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
            Save category limit
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Budget
