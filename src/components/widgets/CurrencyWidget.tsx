import { useMemo, useState } from 'react'
import { RotateCw } from 'lucide-react'
import { useExchangeRates, formatCurrency } from '../../lib/currency'
import Skeleton from '../ui/Skeleton'

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸' },
  { code: 'UZS', flag: '🇺🇿' },
  { code: 'EUR', flag: '🇪🇺' },
]

const CurrencyWidget = () => {
  const { rates, loading, lastUpdated, refresh, convert } = useExchangeRates()
  const [amount, setAmount] = useState(1)
  const [from, setFrom] = useState('USD')

  const converted = useMemo(
    () =>
      CURRENCIES.map(c => ({
        ...c,
        value: convert(amount, from, c.code),
      })),
    [amount, from, convert]
  )

  const minutesAgo =
    lastUpdated != null ? Math.max(0, Math.round((Date.now() - lastUpdated.getTime()) / 60000)) : null

  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 16,
        padding: 16,
        boxShadow: 'var(--sh-sm)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Live exchange rates</div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Currency Converter</div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{
            border: '1px solid #e2e8f0',
            background: '#f8fafc',
            borderRadius: 10,
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 700,
            color: '#2563eb',
            opacity: loading ? 0.7 : 1,
          }}
          type="button"
        >
          <RotateCw size={16} />
          {loading ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {loading ? (
        <Skeleton height={18} count={4} />
      ) : (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="number"
              min={0}
              value={amount}
              onChange={e => setAmount(Number(e.target.value) || 0)}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '0 12px',
                fontSize: 14,
              }}
            />
            <select
              value={from}
              onChange={e => setFrom(e.target.value)}
              style={{
                width: 110,
                height: 44,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                padding: '0 10px',
                fontWeight: 700,
                background: '#fff',
              }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 10 }}>
            {converted.map(c => (
              <div
                key={c.code}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  padding: 12,
                  background: '#f8fafc',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18 }}>{c.flag}</span>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{c.code}</span>
                </div>
                <div style={{ marginTop: 8, fontWeight: 700, fontSize: 15, color: '#2563eb' }}>
                  {formatCurrency(c.value, c.code)}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>vs {from}</div>
              </div>
            ))}
          </div>

           <div style={{ marginTop: 12, fontSize: 12, color: '#94a3b8' }}>
             Last updated: {minutesAgo != null ? `${minutesAgo} minute(s) ago` : 'Fetching...'}
           </div>
        </>
      )}
    </div>
  )
}

export default CurrencyWidget
