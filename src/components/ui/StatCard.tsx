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
  icon?: React.ReactNode
}

const StatCard = ({
  label,
  value,
  change,
  changeType = 'flat',
  prefix = '',
  suffix = '',
  color = 'var(--blue)',
  isLoading,
  icon,
}: StatCardProps) => {
  const changeColor =
    changeType === 'up' ? 'var(--green)' : changeType === 'down' ? 'var(--red)' : 'var(--text-3)'
  const changeSymbol = changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '→'

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: 20,
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderLeft: `4px solid ${color}`,
          borderRadius: 'var(--radius-lg)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(59,130,246,0.08)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color,
              }}
            >
              {icon}
            </div>
          )}
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              color: 'var(--text-3)',
              fontWeight: 800,
            }}
          >
            {label}
          </div>
        </div>

        {isLoading ? (
          <Skeleton height={16} count={3} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div
              className="tabular"
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: 'var(--text-1)',
                lineHeight: 1,
              }}
            >
              {typeof value === 'number' ? (
                <CountUp end={value} duration={1.2} separator="," prefix={prefix} suffix={suffix} />
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
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  color: changeColor,
                  background: 'var(--surface)',
                  borderRadius: 999,
                  padding: '6px 10px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {changeSymbol} {Math.abs(change)}%
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
