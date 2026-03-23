import { getBudgetColor } from '../../lib/helpers'

interface ProgressBarProps {
  percent: number
  color?: string
  height?: number
  label?: string
  showPercent?: boolean
  animate?: boolean
  isLoading?: boolean
}

const ProgressBar = ({
  percent,
  color,
  height = 10,
  label,
  showPercent = true,
  animate = true,
  isLoading,
}: ProgressBarProps) => {
  const palette = getBudgetColor(percent)
  const barColor = color ?? palette.bar

  if (isLoading) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
          {label && <span>{label}</span>}
          {showPercent && <span>—</span>}
        </div>
        <div style={{ width: '100%', height, borderRadius: 999, background: 'var(--border)' }} />
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {(label || showPercent) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
          {label && <span>{label}</span>}
          {showPercent && (
            <span style={{ fontWeight: 700, color: palette.text }}>{Math.round(percent)}%</span>
          )}
        </div>
      )}

      <div
        style={{
          width: '100%',
          height,
          borderRadius: 999,
          background: 'var(--border)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className={animate ? 'progress-animate' : undefined}
          style={{
            height: '100%',
            width: `${Math.min(percent, 120)}%`,
            background: barColor,
            borderRadius: 999,
            transition: 'width 0.3s ease',
          }}
        />
        {percent > 100 && (
          <div
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--red)',
              boxShadow: '0 0 0 6px rgba(244,63,94,0.18)',
            }}
          />
        )}
      </div>
    </div>
  )
}

export default ProgressBar
