import { CATEGORY_META } from '../../lib/helpers'
import clsx from 'clsx'

interface CategoryBadgeProps {
  category: keyof typeof CATEGORY_META | string
  children?: React.ReactNode
}

const CategoryBadge = ({ category, children }: CategoryBadgeProps) => {
  const meta = CATEGORY_META[category] ?? {
    color: '#475569',
    bg: '#f8fafc',
    label: category,
    emoji: '',
    barColor: '#94a3b8',
  }

  return (
    <span
      className={clsx('tabular')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        background: meta.bg,
        color: meta.color,
      }}
    >
      {meta.emoji && <span>{meta.emoji}</span>}
      <span>{children ?? meta.label}</span>
    </span>
  )
}

export default CategoryBadge

