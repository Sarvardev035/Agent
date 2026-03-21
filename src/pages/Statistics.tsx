import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle } from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { statsService } from '../services/stats.service'
import { CATEGORY_META } from '../lib/helpers'
import { formatCurrency } from '../lib/currency'

interface TrendPoint { date: string; total: number }
interface BreakdownPoint { category: string; value: number }
interface VsPoint { month: string; income: number; expense: number }

const sampleTrend: TrendPoint[] = [
  { date: 'Jan', total: 1200 },
  { date: 'Feb', total: 1500 },
  { date: 'Mar', total: 900 },
]
const sampleBreakdown: BreakdownPoint[] = [
  { category: 'FOOD', value: 400 },
  { category: 'TRANSPORT', value: 200 },
  { category: 'OTHER', value: 100 },
]
const sampleVs: VsPoint[] = [
  { month: 'Jan', income: 2000, expense: 1200 },
  { month: 'Feb', income: 2100, expense: 1500 },
]

const Statistics = () => {
  const [expenseTrend, setExpenseTrend] = useState<TrendPoint[] | null>(null)
  const [incomeTrend, setIncomeTrend] = useState<TrendPoint[] | null>(null)
  const [breakdown, setBreakdown] = useState<BreakdownPoint[] | null>(null)
  const [vs, setVs] = useState<VsPoint[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartReady, setChartReady] = useState(false)
  const [isSample, setIsSample] = useState(false)

  useEffect(() => setChartReady(true), [])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [exp, inc, brk, ivs] = await Promise.all([
          statsService.expenses('3m'),
          statsService.income('3m'),
          statsService.breakdown(),
          statsService.vsIncome(),
        ])
        setExpenseTrend((exp.data as TrendPoint[]) ?? [])
        setIncomeTrend((inc.data as TrendPoint[]) ?? [])
        setBreakdown((brk.data as BreakdownPoint[]) ?? [])
        setVs((ivs.data as VsPoint[]) ?? [])
        setIsSample(false)
      } catch {
        setExpenseTrend(sampleTrend)
        setIncomeTrend(sampleTrend)
        setBreakdown(sampleBreakdown)
        setVs(sampleVs)
        setIsSample(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const pieData = useMemo(() =>
    (breakdown ?? []).map(d => ({
      name: CATEGORY_META[d.category]?.label ?? d.category,
      value: d.value,
      color: CATEGORY_META[d.category]?.barColor ?? '#2563eb',
    })),
  [breakdown])

  const ChartContainer = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-sm)', minHeight: 260 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h3>
        {isSample && <span style={{ color: '#f59e0b', fontSize: 12 }}>Sample data</span>}
      </div>
      {loading || !chartReady ? <Skeleton height={200} /> : children}
    </div>
  )

  return (
    <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <p style={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>STATISTICS</p>
        <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Insights & trends</h1>
        <p style={{ margin: 0, color: '#64748b' }}>Visualize your spending and earnings.</p>
      </div>

      {isSample && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fffbeb', border: '1px solid #fef3c7', padding: 10, borderRadius: 12 }}>
          <AlertTriangle color="#f59e0b" size={18} />
          <span style={{ color: '#92400e' }}>Live stats unavailable. Showing sample data.</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
        <ChartContainer title="Expense trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={expenseTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={v => `${Math.round(v)}`} />
              <Tooltip formatter={value => formatCurrency(Number(value ?? 0))} />
              <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Income trend">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={incomeTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={v => `${Math.round(v)}`} />
              <Tooltip formatter={value => formatCurrency(Number(value ?? 0))} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
        <ChartContainer title="Category breakdown">
          {pieData.length === 0 ? (
            <EmptyState title="No data" description="Set some budgets or record transactions." />
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
        </ChartContainer>

        <ChartContainer title="Income vs Expense">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={vs ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={v => `${Math.round(v)}`} />
              <Tooltip formatter={value => formatCurrency(Number(value ?? 0))} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

export default Statistics
