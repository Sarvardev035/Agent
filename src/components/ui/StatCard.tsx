import CountUp from 'react-countup'
import Skeleton from './Skeleton'

type ChangeType = 'up' | 'down' | 'flat'

interface StatCardProps {
  label: string
  value: number | string
  change?: number
  changeType?: ChangeType
  prefix?: string
  suffix?: string
  color?: string
  isLoading?: boolean
}

const StatCard = ({
  label,
  value,
  change,
  changeType = 'flat',
  prefix = '',
  suffix = '',
  color = '#2563eb',
  isLoading,
}: StatCardProps) => {
  const changeColor =
    changeType === 'up' ? '#10b981' : changeType === 'down' ? '#ef4444' : '#94a3b8'
  const changeSymbol = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 'var(--r-lg)',
        padding: 20,
        boxShadow: 'var(--sh-sm)',
        borderLeft: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: '#64748b',
          fontWeight: 700,
        }}
      >
        {label}
      </div>

      {isLoading ? (
        <Skeleton height={16} count={3} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            className="tabular"
            style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em', color: '#0f172a' }}
          >
            {typeof value === 'number' ? (
              <CountUp end={value} duration={1.5} separator="," prefix={prefix} suffix={suffix} />
            ) : (
              <>
                {prefix}
                {value}
                {suffix}
              </>
            )}
          </div>
          {typeof change === 'number' && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
                color: changeColor,
                background: '#f8fafc',
                borderRadius: 999,
                padding: '4px 8px',
              }}
            >
              {changeSymbol} {Math.abs(change)}%
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default StatCard

