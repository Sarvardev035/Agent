import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { categoriesService } from '../services/categories.service'
import { safeArray } from '../lib/helpers'

interface Category {
  id: string
  name: string
  type: 'EXPENSE' | 'INCOME'
}

type CategoryType = 'EXPENSE' | 'INCOME'

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<CategoryType>('EXPENSE')
  const [showModal, setShowModal] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '' })

  const loadCategories = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await categoriesService.getByType(activeType)
      setCategories(safeArray<Category>(res.data))
    } catch (err: any) {
      setError(err.message || 'Failed to load categories')
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [activeType])

  const filteredCategories = categories.filter(c => c.type === activeType)

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }
    try {
      await categoriesService.create({
        name: form.name.trim(),
        type: activeType,
      })
      toast.success('Category added!')
      setShowModal(false)
      setForm({ name: '' })
      await loadCategories()
    } catch (err: any) {
      toast.error(err.message || 'Failed to add category')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      // Note: categoriesService doesn't have a delete method yet
      // This would need to be added to the service
      // For now, we'll just show a message
      toast.error('Delete not yet implemented in backend')
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete')
    }
  }

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>
            CATEGORIES
          </p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Manage categories</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Organize your spending and income.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            border: 'none',
            background: '#7c3aed',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 12,
            fontWeight: 800,
            boxShadow: '0 12px 30px rgba(124,58,237,0.3)',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} /> Add category
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        {(['EXPENSE', 'INCOME'] as const).map(type => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            type="button"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: activeType === type ? '1px solid #7c3aed' : '1px solid #e2e8f0',
              background: activeType === type ? '#f5f3ff' : '#fff',
              color: activeType === type ? '#7c3aed' : '#0f172a',
              fontWeight: 700,
            }}
          >
            {type === 'EXPENSE' ? 'Expenses' : 'Income'}
          </button>
        ))}
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
        {loading ? (
          <Skeleton height={64} count={4} />
        ) : filteredCategories.length === 0 ? (
          <EmptyState
            title="No categories"
            description={`Add your first ${activeType === 'EXPENSE' ? 'expense' : 'income'} category.`}
            actionLabel="Add"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <AnimatePresence>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {filteredCategories.map(cat => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  style={{
                    background: '#f8fafc',
                    borderRadius: 12,
                    padding: 12,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>{cat.name}</p>
                  <button
                    onClick={() => setConfirmId(cat.id)}
                    type="button"
                    style={{
                      marginTop: 8,
                      border: '1px solid #ffe4e6',
                      background: '#fff1f2',
                      color: '#ef4444',
                      borderRadius: 8,
                      padding: '6px 8px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontWeight: 700,
                      fontSize: 12,
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add category">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontWeight: 700, fontSize: 13 }}>Category name</label>
            <input
              type="text"
              value={form.name}
              placeholder="e.g., Groceries"
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: 10 }}
            />
          </div>
          <button
            onClick={handleAdd}
            type="button"
            style={{
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              padding: '10px 16px',
              borderRadius: 10,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Add category
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmId !== null}
        title="Delete category"
        message="Are you sure? This cannot be undone."
        onConfirm={() => {
          if (confirmId) {
            handleDelete(confirmId)
            setConfirmId(null)
          }
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}

export default Categories
