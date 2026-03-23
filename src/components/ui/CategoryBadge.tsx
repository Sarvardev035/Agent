import clsx from 'clsx'
import { getCategoryMeta } from '../../lib/helpers'

interface CategoryBadgeProps {
  category: string
  children?: React.ReactNode
}

const CategoryBadge = ({ category, children }: CategoryBadgeProps) => {
  const meta = getCategoryMeta(category)

  return (
    <span
      className={clsx('tabular')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
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
