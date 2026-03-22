import { useEffect, useMemo, useState } from 'react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  AlertTriangle,
  CalendarRange,
  CircleDollarSign,
  Landmark,
  ScanSearch,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import StatCard from '../components/ui/StatCard'
import { statsApi } from '../api/statsApi'
import { formatCurrency, getCategoryMeta } from '../utils/helpers'
import { safeArray } from '../lib/helpers'
import { useMediaQuery } from '../hooks/useMediaQuery'

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

type Overview = {
  totalBalance?: number
  savingsRate?: number
  monthlyExpenses?: number
  topCategory?: string
  topCategoryPercent?: number
}

type Insight = {
  title?: string
  message?: string
}

const periods: Period[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

const rangeForPeriod = (period: Period) => {
  const now = new Date()

  if (period === 'DAILY') {
    return { startDate: format(subDays(now, 6), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') }
  }
  if (period === 'WEEKLY') {
    return { startDate: format(subDays(now, 27), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') }
  }
  if (period === 'MONTHLY') {
    return { startDate: format(subMonths(now, 5), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') }
  }

  return { startDate: format(subYears(now, 1), 'yyyy-MM-dd'), endDate: format(now, 'yyyy-MM-dd') }
}

const AnimatedBars = ({
  items,
  valueKey,
  labelKey,
  color,
  formatter,
}: {
  items: Array<Record<string, any>>
  valueKey: string
  labelKey: string
  color: string
  formatter: (value: number) => string
}) => {
  const max = Math.max(...items.map(item => Number(item[valueKey]) || 0), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0
        const width = `${Math.max((value / max) * 100, 8)}%`

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

const Statistics = () => {
  const [period, setPeriod] = useState<Period>('MONTHLY')
  const [chartReady, setChartReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [backendNotice, setBackendNotice] = useState<string | null>(null)
  const [visibleSections, setVisibleSections] = useState(0)
  const stackCharts = useMediaQuery('(max-width: 1500px)')

  const [summary, setSummary] = useState<any>({})
  const [overview, setOverview] = useState<Overview>({})
  const [insight, setInsight] = useState<Insight | null>(null)
  const [cashflow, setCashflow] = useState<any[]>([])
  const [balanceHistory, setBalanceHistory] = useState<any[]>([])
  const [accountBalances, setAccountBalances] = useState<any[]>([])
  const [largeExpenses, setLargeExpenses] = useState<any[]>([])
  const [breakdown, setBreakdown] = useState<any[]>([])
  const [vsData, setVsData] = useState<any[]>([])
  const [incomeGrowth, setIncomeGrowth] = useState<any[]>([])

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (loading) {
      setVisibleSections(0)
      return
    }

    const totalSections = 6
    let current = 0
    const timer = window.setInterval(() => {
      current += 1
      setVisibleSections(current)
      if (current >= totalSections) {
        window.clearInterval(timer)
      }
    }, 140)

    return () => window.clearInterval(timer)
  }, [loading, period])

  useEffect(() => {
    const fetchStats = async () => {
      const range = rangeForPeriod(period)

      try {
        setLoading(true)
        setBackendNotice(null)

        const [
          summaryRes,
          overviewRes,
          cashflowRes,
          balanceHistoryRes,
          accountBalancesRes,
          largeExpensesRes,
          insightRes,
          breakdownRes,
          vsRes,
          incomeGrowthRes,
        ] = await Promise.allSettled([
          statsApi.summary(),
          statsApi.overview(range),
          statsApi.cashflow(range),
          statsApi.balanceHistory({ months: period === 'YEARLY' ? 12 : 6 }),
          statsApi.accountBalances(),
          statsApi.recentLargeExpenses({ ...range, limit: 5 }),
          statsApi.insight(range),
          statsApi.expensesByCategory({ from: range.startDate, to: range.endDate, period }),
          statsApi.incomeVsExpense({ from: range.startDate, to: range.endDate, period }),
          statsApi.incomeGrowth({ months: period === 'YEARLY' ? 12 : 6 }),
        ])

        const summaryData = summaryRes.status === 'fulfilled'
          ? summaryRes.value.data?.data ?? summaryRes.value.data ?? {}
          : {}
        const overviewData = overviewRes.status === 'fulfilled'
          ? overviewRes.value.data?.data ?? overviewRes.value.data ?? {}
          : {}
        const insightData = insightRes.status === 'fulfilled'
          ? insightRes.value.data?.data ?? insightRes.value.data ?? {}
          : null
        const cashflowData = cashflowRes.status === 'fulfilled'
          ? safeArray<any>(cashflowRes.value.data?.data ?? cashflowRes.value.data)
          : []
        const balanceHistoryData = balanceHistoryRes.status === 'fulfilled'
          ? safeArray<any>(balanceHistoryRes.value.data?.data ?? balanceHistoryRes.value.data)
          : []
        const accountBalanceData = accountBalancesRes.status === 'fulfilled'
          ? safeArray<any>(accountBalancesRes.value.data?.data ?? accountBalancesRes.value.data)
          : []
        const largeExpenseData = largeExpensesRes.status === 'fulfilled'
          ? safeArray<any>(largeExpensesRes.value.data?.data ?? largeExpensesRes.value.data)
          : []
        const breakdownData = breakdownRes.status === 'fulfilled'
          ? safeArray<any>(breakdownRes.value.data?.data ?? breakdownRes.value.data)
          : []
        const vsIncomeData = vsRes.status === 'fulfilled'
          ? safeArray<any>(vsRes.value.data?.data ?? vsRes.value.data)
          : []
        const incomeGrowthData = incomeGrowthRes.status === 'fulfilled'
          ? safeArray<any>(incomeGrowthRes.value.data?.data ?? incomeGrowthRes.value.data)
          : []

        setSummary(summaryData)
        setOverview(overviewData)
        setInsight(insightData && (insightData.title || insightData.message) ? insightData : null)
        setCashflow(
          cashflowData.map((item: any, idx: number) => ({
            label: item.date
              ? format(new Date(item.date), period === 'DAILY' ? 'MMM d' : 'MMM d')
              : item.label || `P${idx + 1}`,
            income: Number(item.income ?? 0),
            expense: Number(item.expense ?? 0),
          }))
        )
        setBalanceHistory(
          balanceHistoryData.map((item: any, idx: number) => ({
            label: item.month || item.label || `M${idx + 1}`,
            balance: Number(item.balance ?? 0),
          }))
        )
        setAccountBalances(
          accountBalanceData
            .map((item: any) => ({
              accountName: item.accountName || item.name || 'Account',
              balance: Number(item.balance ?? 0),
            }))
            .sort((a, b) => b.balance - a.balance)
        )
        setLargeExpenses(
          largeExpenseData.map((item: any) => ({
            id: item.id,
            description: item.description || 'Expense',
            categoryName: item.categoryName || 'Other',
            amount: Number(item.amount ?? 0),
            expenseDate: item.expenseDate,
          }))
        )
        setBreakdown(
          breakdownData.map((item: any) => ({
            category: item.category || item.name || 'OTHER',
            value: Number(item.total ?? item.value ?? item.amount ?? 0),
          }))
        )
        setVsData(
          vsIncomeData.map((item: any, idx: number) => ({
            period: item.month || item.period || item.label || `P${idx + 1}`,
            income: Number(item.income ?? item.amount ?? item.totalIncome ?? 0),
            expense: Number(item.expense ?? item.total ?? item.amount ?? 0),
          }))
        )
        setIncomeGrowth(
          incomeGrowthData.map((item: any, idx: number) => ({
            month: item.month || item.label || `M${idx + 1}`,
            amount: Number(item.amount ?? 0),
          }))
        )

        const hasAnyData =
          Object.keys(summaryData).length
          || Object.keys(overviewData).length
          || cashflowData.length
          || balanceHistoryData.length
          || accountBalanceData.length
          || largeExpenseData.length
          || breakdownData.length
          || vsIncomeData.length
          || incomeGrowthData.length

        if (!hasAnyData) {
          setBackendNotice('The backend returned no analytics for the selected range yet. Add more transactions to unlock insights.')
        }
      } catch (err) {
        console.error(err)
        setSummary({})
        setOverview({})
        setInsight(null)
        setCashflow([])
        setBalanceHistory([])
        setAccountBalances([])
        setLargeExpenses([])
        setBreakdown([])
        setVsData([])
        setIncomeGrowth([])
        setBackendNotice('Analytics could not be loaded from the backend right now. Sign in again or add transactions if your account is still empty.')
      } finally {
        setLoading(false)
      }
    }

    void fetchStats()
  }, [period])

  const netSavings = useMemo(() => {
    if (!vsData.length) return []
    return vsData.map(item => ({
      label: item.period,
      value: (item.income || 0) - (item.expense || 0),
    }))
  }, [vsData])

  const totalIncome = Number(summary.totalIncome ?? vsData.reduce((s, i) => s + (i.income || 0), 0))
  const totalExpense = Number(summary.totalExpense ?? vsData.reduce((s, i) => s + (i.expense || 0), 0))
  const topCategory = breakdown[0]?.category || overview.topCategory || 'No category yet'
  const sourceRange = rangeForPeriod(period)
  const analyticsReady =
    breakdown.length
    || vsData.length
    || cashflow.length
    || balanceHistory.length
    || accountBalances.length
    || largeExpenses.length
    || incomeGrowth.length
    || Object.keys(summary).length
    || Object.keys(overview).length

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
            <span className="amount">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  const revealStyle = (index: number) => ({
    opacity: visibleSections >= index ? 1 : 0,
    transform: visibleSections >= index ? 'translateY(0)' : 'translateY(18px)',
    transition: 'opacity 0.45s ease, transform 0.45s ease',
  })

  return (
    <div
      className="page-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        paddingBottom: 12,
        width: '100%',
        maxWidth: 1360,
        margin: '0 auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <p style={{ color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', fontSize: 12 }}>STATISTICS</p>
          <h1 style={{ margin: '4px 0', fontSize: 22, fontWeight: 800 }}>Analytics that explain your money</h1>
          <p style={{ margin: 0, color: 'var(--text-2)' }}>
            Live backend data from {sourceRange.startDate} to {sourceRange.endDate}.
          </p>
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

      {backendNotice && (
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            padding: 14,
            borderRadius: 12,
            border: '1px dashed var(--border)',
            background: 'rgba(124,58,237,0.09)',
            color: 'var(--text-1)',
          }}
        >
          <ScanSearch size={18} />
          <div>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Backend analytics status</div>
            <div style={{ color: 'var(--text-2)', fontSize: 14 }}>{backendNotice}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,240px),1fr))', gap: 12, ...revealStyle(1) }}>
        <StatCard label="Income total" value={totalIncome} prefix="UZS " changeType="up" isLoading={loading} icon={<TrendingUp size={18} />} />
        <StatCard label="Expense total" value={totalExpense} prefix="UZS " changeType="down" isLoading={loading} icon={<TrendingDown size={18} />} />
        <StatCard
          label="Net savings"
          value={totalIncome - totalExpense}
          prefix="UZS "
          changeType={(totalIncome - totalExpense) >= 0 ? 'up' : 'down'}
          isLoading={loading}
          icon={<Wallet size={18} />}
        />
        <StatCard
          label="Savings rate"
          value={Math.round(Number(overview.savingsRate ?? 0))}
          suffix="%"
          changeType={(overview.savingsRate ?? 0) >= 0 ? 'up' : 'down'}
          isLoading={loading}
          icon={<CircleDollarSign size={18} />}
        />
      </div>

      {analyticsReady ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,260px),1fr))', gap: 12, ...revealStyle(2) }}>
            <div className="card glass-card" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Landmark size={18} color="#7c3aed" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Overview</h3>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 4 }}>Current balance</div>
                  <div className="balance-large">{formatCurrency(Number(overview.totalBalance ?? summary.totalBalance ?? 0))}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--blue-soft)', color: 'var(--blue)', fontWeight: 700, fontSize: 12 }}>
                    Top category: {topCategory}
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: 999, background: 'var(--amber-soft)', color: 'var(--amber)', fontWeight: 700, fontSize: 12 }}>
                    Share: {Math.round(Number(overview.topCategoryPercent ?? 0))}%
                  </span>
                </div>
              </div>
            </div>

            <div className="card glass-card" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <CalendarRange size={18} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>What this range says</h3>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-2)', margin: 0 }}>
                {insight?.message || 'The backend did not return a generated insight for this range, so the page is showing direct metrics only.'}
              </p>
              {insight?.title && (
                <div style={{ marginTop: 12, fontWeight: 800, color: 'var(--text-1)' }}>
                  {insight.title}
                </div>
              )}
            </div>

            <div className="card glass-card" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <AlertTriangle size={18} color="#ef4444" />
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Monthly pressure</h3>
              </div>
              <div className="stat-number">{formatCurrency(Number(overview.monthlyExpenses ?? totalExpense))}</div>
              <p style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 14 }}>
                This is the expense pressure detected by the backend for the current visible range.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1.12fr) minmax(360px,0.88fr)',
              gap: 14,
              alignItems: 'stretch',
              ...revealStyle(3),
            }}
          >
            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 340 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Cashflow</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Income vs expense over time</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={260} />
              ) : cashflow.length === 0 ? (
                <EmptyState title="No cashflow data" description="The backend has no cashflow points for this range yet." />
              ) : (
                <div style={{ width: '100%', minHeight: 270 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={cashflow}>
                      <defs>
                        <linearGradient id="cashIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.04} />
                        </linearGradient>
                        <linearGradient id="cashExpense" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip content={customTooltip} />
                      <Area type="monotone" dataKey="income" stroke="#10b981" fill="url(#cashIncome)" strokeWidth={2} name="Income" />
                      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="url(#cashExpense)" strokeWidth={2} name="Expense" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 340 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Expense mix</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Category bars</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={260} />
              ) : breakdown.length === 0 ? (
                <EmptyState title="No category split" description="Add expenses first so the backend can group them by category." />
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div style={{ width: '100%', minHeight: 250 }}>
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart layout="vertical" data={breakdown.slice(0, 6)} margin={{ left: 8, right: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="category" width={88} tick={{ fill: 'var(--text-2)', fontSize: 12 }} />
                        <Tooltip content={customTooltip} />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} name="Expense">
                          {breakdown.slice(0, 6).map(item => {
                            const meta = getCategoryMeta(item.category)
                            return <Cell key={item.category} fill={meta.color} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <AnimatedBars
                    items={breakdown.slice(0, 5)}
                    valueKey="value"
                    labelKey="category"
                    color="linear-gradient(90deg,#43A19E,#7B43A1,#F2317A)"
                    formatter={value => formatCurrency(value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
              gap: 14,
              alignItems: 'stretch',
              ...revealStyle(4),
            }}
          >
            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Account balances</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>CodePen-inspired bars</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={240} />
              ) : accountBalances.length === 0 ? (
                <EmptyState title="No account balances" description="The backend has no balance ranking yet." />
              ) : (
                <AnimatedBars
                  items={accountBalances.slice(0, 6)}
                  valueKey="balance"
                  labelKey="accountName"
                  color="linear-gradient(90deg,#43A19E,#7B43A1,#F2317A)"
                  formatter={value => formatCurrency(value)}
                />
              )}
            </div>

            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Balance history</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>How your total balance moved</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={240} />
              ) : balanceHistory.length === 0 ? (
                <EmptyState title="No balance history" description="The backend has not generated any balance history points yet." />
              ) : (
                <div style={{ width: '100%', minHeight: 250 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={balanceHistory}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip content={customTooltip} />
                      <Line type="monotone" dataKey="balance" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} name="Balance" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
              gap: 14,
              alignItems: 'stretch',
              ...revealStyle(5),
            }}
          >
            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Income growth</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Backend monthly growth signal</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={240} />
              ) : incomeGrowth.length === 0 ? (
                <EmptyState title="No income growth yet" description="Record income entries to unlock this trend." />
              ) : (
                <div style={{ width: '100%', minHeight: 250 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={incomeGrowth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip content={customTooltip} />
                      <Bar dataKey="amount" fill="#0ea5e9" radius={[10, 10, 0, 0]} name="Income" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Income vs expense comparison</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{period.toLowerCase()} grouped comparison</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={240} />
              ) : vsData.length === 0 ? (
                <EmptyState title="No comparison data" description="The backend did not return grouped income and expense values for this range." />
              ) : (
                <div style={{ width: '100%', minHeight: 250 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={vsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip content={customTooltip} />
                      <Bar dataKey="income" fill="#10b981" radius={[8, 8, 0, 0]} name="Income" />
                      <Bar dataKey="expense" fill="#f43f5e" radius={[8, 8, 0, 0]} name="Expense" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: stackCharts ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)',
              gap: 14,
              alignItems: 'stretch',
              ...revealStyle(6),
            }}
          >
            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Net savings trend</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Positive or negative momentum</span>
              </div>
              {loading || !chartReady ? (
                <Skeleton height={240} />
              ) : netSavings.length === 0 ? (
                <EmptyState title="No net savings data" description="Income and expense comparisons are needed to calculate savings momentum." />
              ) : (
                <div style={{ width: '100%', minHeight: 250 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={netSavings}>
                      <defs>
                        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.08} />
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

            <div className="card glass-card" style={{ padding: 18, borderRadius: 18, minHeight: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Recent large expenses</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>High-impact transactions</span>
              </div>
              {loading ? (
                <Skeleton height={240} />
              ) : largeExpenses.length === 0 ? (
                <EmptyState title="No large expenses" description="The backend did not detect any large expenses in this range." />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {largeExpenses.map(item => (
                    <div
                      key={item.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 14,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-1)', marginBottom: 4 }}>
                          {item.description}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          {item.categoryName} • {item.expenseDate}
                        </div>
                      </div>
                      <div className="amount amount-negative" style={{ flexShrink: 0 }}>
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        !loading && (
          <EmptyState
            icon={<Sparkles size={34} color="#7c3aed" />}
            title="No analytics yet"
            description="The backend is available, but this account does not have enough financial activity for the selected range."
          />
        )
      )}

      {!loading && !chartReady && <Skeleton height={120} />}
    </div>
  )
}

export default Statistics
