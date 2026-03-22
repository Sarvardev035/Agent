import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AlertTriangle, BarChart4, Palette, Sparkles } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import StatCard from '../components/ui/StatCard'
import { statsApi } from '../api/statsApi'
import { formatCurrency, getCategoryMeta } from '../utils/helpers'
import { safeArray } from '../lib/helpers'

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

const periods: Period[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

const sampleTimeseries = [
  { label: 'Week 1', income: 1200, expense: 800 },
  { label: 'Week 2', income: 1500, expense: 1100 },
  { label: 'Week 3', income: 1300, expense: 900 },
  { label: 'Week 4', income: 1600, expense: 1000 },
]

const sampleBreakdown = [
  { category: 'FOOD', value: 320 },
  { category: 'TRANSPORT', value: 180 },
  { category: 'UTILITIES', value: 250 },
  { category: 'ENTERTAINMENT', value: 140 },
  { category: 'OTHER', value: 90 },
]

const sampleIncomeSources = [
  { category: 'SALARY', value: 1800 },
  { category: 'FREELANCE', value: 620 },
  { category: 'BUSINESS', value: 420 },
]

const Statistics = () => {
  const [period, setPeriod] = useState<Period>('MONTHLY')
  const [chartReady, setChartReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usingSample, setUsingSample] = useState(false)

  const [incomeSeries, setIncomeSeries] = useState<any[]>([])
  const [expenseSeries, setExpenseSeries] = useState<any[]>([])
  const [breakdown, setBreakdown] = useState<any[]>([])
  const [incomeSources, setIncomeSources] = useState<any[]>([])
  const [vsData, setVsData] = useState<any[]>([])

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      setUsingSample(false)
      const [expensesRes, vsRes, breakdownRes, summaryRes] = await Promise.allSettled([
        statsApi.monthlyExpenses({ period }),
        statsApi.incomeVsExpense({ period }),
        statsApi.expensesByCategory({ period }),
        statsApi.summary(),
      ])

      const expenseData =
        expensesRes.status === 'fulfilled' ? safeArray<any>(expensesRes.value.data) : []
      const vsIncomeData = vsRes.status === 'fulfilled' ? safeArray<any>(vsRes.value.data) : []
      const breakdownData =
        breakdownRes.status === 'fulfilled' ? safeArray<any>(breakdownRes.value.data) : []
      const summary = summaryRes.status === 'fulfilled'
        ? summaryRes.value.data?.data ?? summaryRes.value.data ?? {}
        : {}
      const incomeSourceData = safeArray<any>(
        (summary as any).incomeByCategory ?? (summary as any).incomeSources ?? []
      )

      const incomeData =
        vsIncomeData.length > 0
          ? vsIncomeData
          : incomeSourceData.map((item: any, idx: number) => ({
              period: item.period || item.label || `P${idx + 1}`,
              income: item.income ?? item.amount ?? item.total ?? 0,
            }))

      const hasRealData =
        expenseData.length || incomeData.length || breakdownData.length || vsIncomeData.length || incomeSourceData.length

      if (!hasRealData) {
        setUsingSample(true)
        setExpenseSeries(sampleTimeseries.map(d => ({ label: d.label, value: d.expense })))
        setIncomeSeries(sampleTimeseries.map(d => ({ label: d.label, value: d.income })))
        setBreakdown(sampleBreakdown)
        setIncomeSources(sampleIncomeSources)
        setVsData(sampleTimeseries.map(d => ({ period: d.label, income: d.income, expense: d.expense })))
        return
      }

      setExpenseSeries(
        expenseData.map((item: any, idx: number) => ({
          label: item.period || item.label || item.date || `P${idx + 1}`,
          value: item.amount ?? item.total ?? item.expense ?? item.value ?? 0,
        }))
      )
      setIncomeSeries(
        incomeData.map((item: any, idx: number) => ({
          label: item.period || item.label || item.date || `P${idx + 1}`,
          value: item.income ?? item.amount ?? item.total ?? item.value ?? 0,
        }))
      )
      setBreakdown(
        breakdownData.map((item: any) => ({
          category: item.category || item.name || 'OTHER',
          value: item.total ?? item.value ?? item.amount ?? 0,
        }))
      )
      setIncomeSources(
        (incomeSourceData.length ? incomeSourceData : incomeData).map((item: any) => ({
          category: item.category || item.source || item.label || 'OTHER',
          value: item.amount ?? item.total ?? item.income ?? 0,
        }))
      )
      setVsData(
        (vsIncomeData.length ? vsIncomeData : expenseData).map((item: any, idx: number) => ({
          period: item.period || item.label || `P${idx + 1}`,
          income: item.income ?? item.amount ?? item.totalIncome ?? 0,
          expense: item.expense ?? item.total ?? item.amount ?? 0,
        }))
      )
    } catch (err) {
      console.error(err)
      setUsingSample(true)
      setExpenseSeries(sampleTimeseries.map(d => ({ label: d.label, value: d.expense })))
      setIncomeSeries(sampleTimeseries.map(d => ({ label: d.label, value: d.income })))
      setBreakdown(sampleBreakdown)
      setIncomeSources(sampleIncomeSources)
      setVsData(sampleTimeseries.map(d => ({ period: d.label, income: d.income, expense: d.expense })))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [period])

  const netSavings = useMemo(() => {
    if (!vsData.length) return []
    return vsData.map(item => ({
      label: item.period,
      value: (item.income || 0) - (item.expense || 0),
    }))
  }, [vsData])

  const totalIncome = incomeSeries.reduce((s, i) => s + (i.value || 0), 0)
  const totalExpense = expenseSeries.reduce((s, i) => s + (i.value || 0), 0)

  const customTooltip = (props: any) => {
    const { active, payload, label } = props
    if (!active || !payload?.length) return null
    return (
      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '10px 12px',
          borderRadius: 12,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span>{p.name}</span>
            <span className="tabular">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>STATISTICS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Insights & trends</h1>
          <p style={{ margin: 0, color: 'var(--text-2)' }}>Visualize your spending and earnings.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {periods.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              type="button"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                border: period === p ? '1px solid var(--blue)' : '1px solid var(--border)',
                background: period === p ? 'var(--blue-soft)' : '#fff',
                color: period === p ? 'var(--blue)' : 'var(--text-1)',
                fontWeight: 700,
              }}
            >
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {usingSample && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: 14,
            borderRadius: 12,
            border: '1px dashed var(--border)',
            background: 'var(--purple-soft)',
            color: '#6b21a8',
          }}
        >
          <Sparkles size={18} />
          <div style={{ fontWeight: 700 }}>Showing sample data — add transactions to see your real stats.</div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
        <StatCard label="Income total" value={totalIncome} prefix="UZS " changeType="up" isLoading={loading} icon={<BarChart4 size={18} />} />
        <StatCard label="Expense total" value={totalExpense} prefix="UZS " changeType="down" isLoading={loading} icon={<Palette size={18} />} />
        <StatCard
          label="Net savings"
          value={totalIncome - totalExpense}
          prefix="UZS "
          changeType={(totalIncome - totalExpense) >= 0 ? 'up' : 'down'}
          isLoading={loading}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
            minHeight: 320,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Income vs Expenses</h3>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{period.toLowerCase()} view</span>
          </div>
          {loading || !chartReady ? (
            <Skeleton height={240} />
          ) : (
            <div style={{ width: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={vsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="period" />
                  <YAxis tickFormatter={v => `${Math.round(Number(v) || 0)}`} />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
            minHeight: 320,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Expense by category</h3>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Donut</span>
          </div>
          {loading || !chartReady ? (
            <Skeleton height={240} />
          ) : breakdown.length === 0 ? (
            <EmptyState title="No data" description="Add expenses to see the distribution." />
          ) : (
            <div style={{ width: '100%', minHeight: 260 }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                  >
                    {breakdown.map(item => {
                      const meta = getCategoryMeta(item.category)
                      return <Cell key={item.category} fill={meta.color} />
                    })}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: 14 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
            minHeight: 300,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Income sources</h3>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Stacked</span>
          </div>
          {loading || !chartReady ? (
            <Skeleton height={220} />
          ) : incomeSources.length === 0 ? (
            <EmptyState title="No data" description="Record income to see where it comes from." />
          ) : (
            <div style={{ width: '100%', minHeight: 240 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart layout="vertical" data={incomeSources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" width={90} />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="value" fill="#0ea5e9" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border)',
            minHeight: 300,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Net savings trend</h3>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Area</span>
          </div>
          {loading || !chartReady ? (
            <Skeleton height={220} />
          ) : netSavings.length === 0 ? (
            <EmptyState title="No data" description="Add income and expenses to calculate savings." />
          ) : (
            <div style={{ width: '100%', minHeight: 240 }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={netSavings}>
                  <defs>
                    <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip content={customTooltip} />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#netGradient)" name="Net" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {!loading && !chartReady && <Skeleton height={120} />}
    </div>
  )
}

export default Statistics
