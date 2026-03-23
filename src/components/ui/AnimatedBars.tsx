type AnimatedBarsProps = {
  items: Array<Record<string, any>>
  valueKey: string
  labelKey: string
  color: string
  formatter: (value: number) => string
  minWidthPercent?: number
}

const AnimatedBars = ({
  items,
  valueKey,
  labelKey,
  color,
  formatter,
  minWidthPercent = 8,
}: AnimatedBarsProps) => {
  const max = Math.max(...items.map(item => Number(item[valueKey]) || 0), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const width = `${Math.max((value / max) * 100, minWidthPercent)}%`

        return (
          <div key={`${item[labelKey]}_${index}`} style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>
                {item[labelKey]}
              </div>
              <div className="amount" style={{ fontSize: 13, color: 'var(--text-2)' }}>
                {formatter(value)}
              </div>
            </div>
            <div
              style={{
                height: 14,
                borderRadius: 999,
                background: 'rgba(148,163,184,0.12)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width,
                  height: '100%',
                  borderRadius: 999,
                  background: color,
                  boxShadow: '0 10px 24px rgba(37,99,235,0.18)',
                  transition: 'width 0.9s cubic-bezier(0.22, 1, 0.36, 1)',
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnimatedBars
