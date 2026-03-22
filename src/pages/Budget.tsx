import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { PiggyBank, Plus, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ProgressRing from '../components/ui/ProgressRing'
import ProgressBar from '../components/ui/ProgressBar'
import Modal from '../components/ui/Modal'
import { formatCurrency } from '../lib/currency'
import { safeArray, safeObject } from '../lib/helpers'
import { budgetsService } from '../services/budget.service'
import { categoriesService } from '../services/categories.service'
import { seedDefaultCategories } from '../lib/seedCategories'

interface ApiCategory {
  id: string
  name: string
  type: 'EXPENSE' | 'INCOME'
}

interface BudgetItem {
  id: string
  categoryId: string
  categoryName?: string
  monthlyLimit: number
  spentAmount?: number
  year: number
  month: number
}

const Budget = () => {
  const [items, setItems] = useState<BudgetItem[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [limit, setLimit] = useState<string>('')

  const load = async () => {
    setLoading(true)
    try {
      const now = new Date()
      await seedDefaultCategories()
      const [budgetsRes, catsRes] = await Promise.all([
        budgetsService.getAll({ year: now.getFullYear(), month: now.getMonth() + 1 }),
        categoriesService.getByType('EXPENSE'),
      ])
      setItems(safeArray<BudgetItem>(budgetsRes.data))
      setCategories(safeArray<ApiCategory>(catsRes.data))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load budget'
      toast.error(msg)
      setItems([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const overview = useMemo(() => {
    const goal = items.reduce((sum, item) => sum + (item.monthlyLimit || 0), 0)
    const spent = items.reduce((sum, item) => sum + (item.spentAmount || 0), 0)
    return { goal, spent }
  }, [items])

  const pct = useMemo(() => {
    if (!overview.goal) return 0
    return Math.min((overview.spent / overview.goal) * 100, 150)
  }, [overview.goal, overview.spent])

  const handleSaveCategory = async () => {
    if (!selectedCategoryId) {
      toast.error('Select a category')
      return
    }
    const parsedLimit = Number(limit)
    if (!parsedLimit || parsedLimit <= 0) {
      toast.error('Limit must be positive')
      return
    }

    try {
      const now = new Date()
      await budgetsService.create({
        categoryId: selectedCategoryId,
        type: 'EXPENSE',
        monthlyLimit: parsedLimit,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      })
      toast.success('Category limit saved')
      setModalOpen(false)
      setLimit('')
      await load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save limit'
      toast.error(msg)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await budgetsService.delete(id)
      toast.success('Budget deleted')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete budget'
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
                <div style={{ fontSize: 18, fontWeight: 800 }}>Goal {formatCurrency(overview.goal)}</div>
                <div style={{ color: '#94a3b8' }}>Spent {formatCurrency(overview.spent)}</div>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12 }}>
                  <div style={{ fontWeight: 800 }}>Remaining</div>
                  <div style={{ color: '#2563eb', fontWeight: 800 }}>
                    {formatCurrency(Math.max(overview.goal - overview.spent, 0))}
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
          ) : items.length === 0 ? (
            <EmptyState title="No category limits" description="Add a limit to start tracking." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <AnimatePresence>
                {items.map(item => {
                  const spent = item.spentAmount || 0
                  const pctCat = (spent / (item.monthlyLimit || 1)) * 100
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 12,
                        padding: 12,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                        <span>{item.categoryName || categories.find(c => c.id === item.categoryId)?.name || item.categoryId}</span>
                        <span style={{ color: '#64748b' }}>
                          {formatCurrency(spent)} / {formatCurrency(item.monthlyLimit)}
                        </span>
                      </div>
                      <ProgressBar percent={pctCat} animate />
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                        <span style={{ color: pctCat >= 100 ? '#b91c1c' : '#64748b', fontSize: 12 }}>
                          {pctCat >= 100 ? 'Limit exceeded' : 'In progress'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          style={{
                            border: '1px solid #ffe4e6',
                            background: '#fff1f2',
                            color: '#ef4444',
                            borderRadius: 8,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
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
              value={selectedCategoryId}
              onChange={e => setSelectedCategoryId(e.target.value)}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Limit amount</label>
            <input
              type="number"
              value={limit}
              placeholder="0"
              onChange={e => setLimit(e.target.value)}
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
