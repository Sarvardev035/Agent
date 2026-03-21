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
      border: '1px dashed #e2e8f0',
      borderRadius: 16,
      padding: '28px 20px',
      textAlign: 'center',
      background: '#ffffff',
      color: '#0f172a',
    }}
  >
    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon ?? '🧾'}</div>
    <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 800 }}>{title}</h3>
    {description && (
      <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>{description}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        style={{
          padding: '10px 16px',
          borderRadius: 12,
          border: '1px solid #2563eb',
          background: '#eff6ff',
          color: '#2563eb',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {actionLabel}
      </button>
    )}
  </div>
)

export default EmptyState

