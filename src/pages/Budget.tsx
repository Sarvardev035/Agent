import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { PiggyBank, Plus } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ProgressRing from '../components/ui/ProgressRing'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import { BudgetCategory } from '../lib/notifications'
import { formatCurrency } from '../lib/currency'
import { CATEGORY_META, safeArray } from '../lib/helpers'
import api from '../lib/api'

interface BudgetOverview {
  goal?: number
  spent?: number
  categories?: BudgetCategory[]
}

const Budget = () => {
  const [overview, setOverview] = useState<BudgetOverview>({})
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('FOOD')
  const [limit, setLimit] = useState<number>(0)

  const load = async () => {
    setLoading(true)
    try {
      const [over, cats] = await Promise.all([
        api.get('/api/budget'),
        api.get('/api/budget/categories'),
      ])
      setOverview(over.data as BudgetOverview)
      setCategories(safeArray<BudgetCategory>(cats.data) ?? [])
    } catch (err) {
      console.error('❌ budget load failed:', err)
      const msg = err instanceof Error ? err.message : 'Failed to load budget'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const pct = useMemo(() => {
    if (!overview.goal || !overview.spent) return 0
    return Math.min((overview.spent / overview.goal) * 100, 150)
  }, [overview.goal, overview.spent])

  const handleSaveCategory = async () => {
    if (limit <= 0) {
      toast.error('Limit must be positive')
      return
    }
    try {
      await api.post('/api/budget/categories', { category: selectedCategory, limit })
      toast.success('Category limit saved')
      setModalOpen(false)
      load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save limit'
      toast.error(msg)
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>BUDGET</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Stay within goals</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Track overall and per-category budgets.</p>
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
          <Plus size={16} /> Set category limit
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--sh-sm)',
            minHeight: 240,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <>
              <ProgressRing percent={pct} label="Overall" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>Goal {formatCurrency(overview.goal ?? 0)}</div>
                <div style={{ color: '#94a3b8' }}>Spent {formatCurrency(overview.spent ?? 0)}</div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                  <div style={{ fontWeight: 800 }}>Remaining</div>
                  <div style={{ color: '#2563eb', fontWeight: 800 }}>
                    {formatCurrency(Math.max((overview.goal ?? 0) - (overview.spent ?? 0), 0))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--sh-sm)',
            minHeight: 240,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <PiggyBank size={18} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Category budgets</h3>
          </div>
          {loading ? (
            <Skeleton height={140} />
          ) : categories.length === 0 ? (
            <EmptyState title="No category limits" description="Add a limit to start tracking." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {categories.map(cat => {
                  const meta = CATEGORY_META[cat.category] ?? { emoji: '🏷️', label: cat.category, color: '#0f172a', bg: '#f8fafc', barColor: '#94a3b8' }
                  const pctCat = (cat.spent / (cat.limit || 1)) * 100
                  return (
                    <motion.div
                      key={cat.category}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: 12,
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: meta.bg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {meta.emoji}
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                          <span>{meta.label}</span>
                          <span style={{ color: '#64748b' }}>
                            {formatCurrency(cat.spent)} / {formatCurrency(cat.limit)}
                          </span>
                        </div>
                        <ProgressBar percent={pctCat} animate />
                        {pctCat >= 90 && (
                          <div style={{ color: pctCat >= 100 ? '#b91c1c' : '#92400e', fontSize: 12, marginTop: 4 }}>
                            {pctCat >= 100 ? 'Limit exceeded' : 'Close to limit'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Set category limit">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Category</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            >
              {Object.keys(CATEGORY_META).map(cat => (
                <option key={cat} value={cat}>
                  {CATEGORY_META[cat].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Limit amount</label>
            <input
              type="number"
              value={limit}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <button
            onClick={handleSaveCategory}
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
            Save limit
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default Budget
