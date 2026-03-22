interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div
    style={{
      border: '1px dashed var(--border)',
      borderRadius: 'var(--radius-xl)',
      padding: '28px 20px',
      textAlign: 'center',
      background: 'linear-gradient(180deg,#fff 0%,#f8fafc 100%)',
      color: 'var(--text-1)',
      boxShadow: 'var(--shadow-sm)',
    }}
  >
    <div style={{ fontSize: 36, marginBottom: 12 }}>{icon ?? '🐷'}</div>
    <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>{title}</h3>
    {description && (
      <p style={{ margin: '0 0 14px', color: 'var(--text-2)', fontSize: 14, lineHeight: 1.5 }}>{description}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        style={{
          padding: '12px 16px',
          borderRadius: 14,
          border: 'none',
          background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
          color: '#fff',
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
        }}
        type="button"
      >
        {actionLabel}
      </button>
    )}
  </div>
)

export default EmptyState
