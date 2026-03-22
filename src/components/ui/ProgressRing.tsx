import { getBudgetColor } from '../../utils/helpers'
import Skeleton from './Skeleton'

interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  label?: string
  isLoading?: boolean
}

const ProgressRing = ({ percent, size = 160, strokeWidth = 10, label, isLoading }: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(Math.max(percent, 0), 150)
  const offset = circumference - (clamped / 100) * circumference
  const palette = getBudgetColor(percent)

  if (isLoading) {
    return (
      <div style={{ width: size, height: size }}>
        <Skeleton width={size} height={size} />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          stroke="#e2e8f0"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${circumference} ${circumference}`}
        />
        <circle
          stroke={palette.bar}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: palette.text,
          fontWeight: 800,
          fontSize: 28,
          gap: 6,
        }}
      >
        <div className="tabular">{Math.round(percent)}%</div>
        {label && (
          <div style={{ fontSize: 13, color: '#475569', fontWeight: 600, textAlign: 'center' }}>
            {label}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressRing
