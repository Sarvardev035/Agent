import { motion } from 'framer-motion'
import { CATEGORY_META, smartDate } from '../../lib/helpers'
import CategoryBadge from './CategoryBadge'
import { formatCurrency } from '../../lib/currency'

type TransactionType = 'income' | 'expense'

interface TransactionItemProps {
  type: TransactionType
  amount: number
  category: keyof typeof CATEGORY_META | string
  date: string
  description?: string
  currency?: string
  accountLabel?: string
}

const TransactionItem = ({
  type,
  amount,
  category,
  date,
  description,
  currency = 'UZS',
  accountLabel,
}: TransactionItemProps) => {
  const meta = CATEGORY_META[category] ?? {
    emoji: '💼',
    bg: '#f8fafc',
    color: '#475569',
    label: category,
    barColor: '#94a3b8',
  }

  const isExpense = type === 'expense'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        borderRadius: 12,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
      }}
      whileHover={{ backgroundColor: '#f8fafc' }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: meta.bg,
          color: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          flexShrink: 0,
        }}
        aria-label={meta.label}
      >
        {meta.emoji}
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, lineHeight: 1.2, minWidth: 0 }}>
            {description || meta.label}
          </div>
          {accountLabel && (
            <span
              style={{
                background: '#e2e8f0',
                color: '#0f172a',
                borderRadius: 999,
                padding: '2px 8px',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {accountLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>{smartDate(date)}</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#e2e8f0', display: 'inline-block' }} />
          <CategoryBadge category={category} />
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
        <div
          className="tabular"
          style={{
            fontWeight: 700,
            color: isExpense ? '#ef4444' : '#10b981',
            fontSize: 14,
          }}
        >
          {isExpense ? '-' : '+'}
          {formatCurrency(amount, currency)}
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionItem
