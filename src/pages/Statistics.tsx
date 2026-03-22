import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { CATEGORY_META, safeArray } from '../lib/helpers'
import { formatCurrency } from '../lib/currency'
import { analyticsService } from '../services/analytics.service'

interface TrendPoint { date: string; total: number }
interface BreakdownPoint { category: string; value: number }
interface VsPoint { period: string; income: number; expense: number }

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

const periods: Period[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

const Statistics = () => {
  const [period, setPeriod] = useState<Period>('MONTHLY')
  const [timeseries, setTimeseries] = useState<TrendPoint[]>([])
  const [categoryData, setCategoryData] = useState<BreakdownPoint[]>([])
  const [incVsExp, setIncVsExp] = useState<VsPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const loadStats = async () => {
      setLoading(true)
      setTimeseries([])
      setCategoryData([])
      setIncVsExp([])
      try {
        const now = new Date()
        const endDate = now.toISOString().slice(0, 10)
        const startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString().slice(0, 10)

        const [tsRes, catRes, ivseRes] = await Promise.allSettled([
          analyticsService.timeseries({ period, startDate, endDate }),
          analyticsService.expensesByCategory({ from: startDate, to: endDate }),
          analyticsService.incomeVsExpense({ from: startDate, to: endDate }),
        ])

        if (!cancelled) {
          setTimeseries(safeArray(tsRes.status === 'fulfilled' ? tsRes.value.data : []))
          setCategoryData(safeArray(catRes.status === 'fulfilled' ? catRes.value.data : []))
          setIncVsExp(safeArray(ivseRes.status === 'fulfilled' ? ivseRes.value.data : []))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      cancelled = true
    }
  }, [period])

  const pieData = useMemo(
    () =>
      categoryData.map(d => ({
        name: CATEGORY_META[d.category]?.label ?? d.category,
        value: d.value,
        color: CATEGORY_META[d.category]?.barColor ?? '#2563eb',
      })),
    [categoryData]
  )

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>STATISTICS</p>
        <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Insights & trends</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Visualize your spending and earnings.</p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {periods.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            type="button"
            style={{
              padding: '8px 12px',
              borderRadius: 10,
              border: period === p ? '1px solid #2563eb' : '1px solid #e2e8f0',
              background: period === p ? '#eff6ff' : '#fff',
              color: period === p ? '#1d4ed8' : '#0f172a',
              fontWeight: 700,
            }}
          >
            {p}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 260 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>Expense trend</h3>
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={v => `${Math.round(Number(v) || 0)}`} />
                <Tooltip formatter={value => formatCurrency(Number(value ?? 0))} />
                <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 260 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>Income vs Expense</h3>
          {loading ? (
            <Skeleton height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={incVsExp}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="period" />
                <YAxis tickFormatter={v => `${Math.round(Number(v) || 0)}`} />
                <Tooltip formatter={value => formatCurrency(Number(value ?? 0))} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 260 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 800 }}>Category breakdown</h3>
        {loading ? (
          <Skeleton height={200} />
        ) : pieData.length === 0 ? (
          <EmptyState title="No data" description="Add some transactions to see category analytics." />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                {pieData.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={value => formatCurrency(Number(value ?? 0))} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default Statistics
