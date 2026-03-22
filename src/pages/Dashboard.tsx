import { useEffect, useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import CountUp from 'react-countup'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, TrendingUp, TrendingDown, ArrowLeftRight, HandCoins } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { formatCurrency, getCategoryMeta } from '../utils/helpers'
import TransactionItem from '../components/ui/TransactionItem'
import EmptyState from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'

const Dashboard = () => {
  const { stats, loading } = useDashboardStats()
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 120)
    return () => clearTimeout(t)
  }, [])

  const timeOfDay = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  }, [])

  const topCategories = useMemo(() => {
    if (!stats?.expenses) return []
    const totals: Record<string, number> = {}
    stats.expenses.forEach((e: any) => {
      const key = e.category || e.categoryId || 'OTHER'
      totals[key] = (totals[key] || 0) + (e.amount || 0)
    })
    return Object.entries(totals)
      .map(([k, v]) => ({ key: k, amount: v }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4)
  }, [stats?.expenses])

  const last7DaysData = useMemo(() => {
    const today = new Date()
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = subDays(today, 6 - idx)
      const label = format(d, 'EEE')
      const dayIncome = stats?.income
        ? stats.income.filter((i: any) => format(new Date(i.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).reduce((s: number, i: any) => s + (i.amount || 0), 0)
        : 0
      const dayExpense = stats?.expenses
        ? stats.expenses.filter((e: any) => format(new Date(e.date), 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd')).reduce((s: number, e: any) => s + (e.amount || 0), 0)
        : 0
      return { name: label, income: dayIncome, expense: dayExpense }
    })
    return days
  }, [stats?.income, stats?.expenses])

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
      {/* Hero header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500 font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: 26, fontWeight: 700 }}>
            Good {timeOfDay}, Finly user 👋
          </h1>
        </div>
        <button className="relative p-2 rounded-xl bg-white border border-slate-200">
          <Bell size={20} />
        </button>
      </div>

      {/* Balance hero */}
      <div
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1d4ed8 100%)',
          borderRadius: 20,
          padding: 28,
          color: '#ffffff',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
          marginBottom: 18,
        }}
      >
        <div style={{ position: 'absolute', top: -40, right: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', top: -10, right: 40, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', top: 30, right: 0, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

        <div style={{ letterSpacing: '0.12em', fontSize: 11, opacity: 0.7, fontWeight: 700 }}>TOTAL BALANCE</div>
        <div style={{ fontSize: 36, fontFamily: 'Space Grotesk', fontWeight: 700, marginTop: 8 }}>
          {loading ? (
            <div className="skeleton" style={{ height: 32, width: 180 }} />
          ) : (
            <CountUp end={stats?.totalBalance || 0} duration={1.2} separator="," prefix="UZS " />
          )}
        </div>
        <div style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>
          {loading ? <div className="skeleton" style={{ height: 14, width: 120 }} /> : `Across ${stats?.accounts?.length ?? 0} accounts`}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
          <div style={{ color: '#10b981', fontWeight: 700 }}>
            ↑ Income this month{' '}
            {loading ? (
              <div className="skeleton" style={{ height: 14, width: 90 }} />
            ) : (
              formatCurrency(stats?.monthlyIncome || 0)
            )}
          </div>
          <div style={{ color: '#f43f5e', fontWeight: 700, textAlign: 'right' }}>
            ↓ Expenses this month{' '}
            {loading ? (
              <div className="skeleton" style={{ height: 14, width: 90, marginLeft: 'auto' }} />
            ) : (
              formatCurrency(stats?.monthlyExpenses || 0)
            )}
          </div>
        </div>
      </div>

      {/* Quick stat pills */}
      <div className="flex gap-3 overflow-auto pb-2 mb-4">
        <div className="min-w-[160px]" style={{ background: 'var(--purple-soft)', color: '#6b21a8', padding: 14, borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>Net savings</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {loading ? <div className="skeleton" style={{ height: 16, width: 90 }} /> : formatCurrency(stats?.netSavings || 0)}
          </div>
        </div>
        <div className="min-w-[140px]" style={{ background: 'var(--blue-soft)', color: '#1d4ed8', padding: 14, borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>Accounts</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>
            {loading ? <div className="skeleton" style={{ height: 16, width: 50 }} /> : stats?.accounts?.length ?? 0}
          </div>
        </div>
        <div className="min-w-[150px]" style={{ background: 'var(--amber-soft)', color: '#b45309', padding: 14, borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>Open debts</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{/* data unavailable yet */}—</div>
        </div>
        <div className="min-w-[150px]" style={{ background: 'var(--green-soft)', color: '#0f766e', padding: 14, borderRadius: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, opacity: 0.7 }}>Budget used</div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>—</div>
        </div>
      </div>

      {/* Accounts scroller */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>My Accounts</h3>
          <button style={{ color: '#3b82f6', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
            See all
          </button>
        </div>
        <div className="flex gap-3 overflow-auto pb-2">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="skeleton" style={{ width: 140, height: 90, borderRadius: 14 }} />
            ))
          ) : stats?.accounts?.length ? (
            stats.accounts.map((acc: any) => (
              <div
                key={acc.id || acc.name}
                style={{
                  width: 160,
                  minWidth: 160,
                  background: '#fff',
                  borderRadius: 14,
                  padding: 12,
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a' }}>{acc.name || 'Account'}</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>{acc.type || 'Balance'}</div>
                <div style={{ marginTop: 8, fontWeight: 800, fontSize: 16 }}>{formatCurrency(acc.balance || 0)}</div>
              </div>
            ))
          ) : (
            <EmptyState title="No accounts" description="Add an account to see balances here." />
          )}
        </div>
      </div>

      {/* Two column grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Recent Activity</h3>
            <button style={{ color: '#3b82f6', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
              View all →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading ? (
              Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="skeleton" style={{ height: 48 }} />)
            ) : stats?.recentTransactions?.length ? (
              <AnimatePresence>
                {stats.recentTransactions.slice(0, 8).map((tx: any) => (
                  <TransactionItem
                    key={tx.id || `${tx.type}-${tx.date}-${tx.amount}-${tx.description}`}
                    type={tx.type}
                    amount={tx.amount || 0}
                    category={tx.category || tx.categoryId || 'OTHER'}
                    date={tx.date}
                    description={tx.description}
                    currency={tx.currency || 'UZS'}
                    accountLabel={tx.accountName}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <EmptyState title="No transactions yet" description="Start by adding income or expenses to see activity." />
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontWeight: 700, fontSize: 16 }}>Budget Health</h3>
            <button style={{ color: '#3b82f6', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>
              View budget →
            </button>
          </div>
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="skeleton" style={{ height: 18 }} />)
            ) : topCategories.length ? (
              topCategories.map(cat => {
                const meta = getCategoryMeta(cat.key)
                const percent = 0 // placeholder until budget limit data exists
                return (
                  <div key={cat.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{meta.emoji}</span>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{meta.label}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(cat.amount || 0)}</span>
                    </div>
                    <ProgressBar percent={percent} color={meta.color} showPercent={false} height={8} />
                  </div>
                )
              })
            ) : (
              <EmptyState title="No budget data" description="Set category limits to monitor your budget health." />
            )}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3 mt-5 md:grid-cols-4 sm:grid-cols-2">
        {[
          { label: 'Expense', icon: <TrendingDown size={18} />, color: '#fef2f2' },
          { label: 'Income', icon: <TrendingUp size={18} />, color: '#ecfdf3' },
          { label: 'Transfer', icon: <ArrowLeftRight size={18} />, color: '#eef2ff' },
          { label: 'Add Debt', icon: <HandCoins size={18} />, color: '#fffbeb' },
        ].map(action => (
          <button
            key={action.label}
            style={{
              background: action.color,
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              fontWeight: 700,
              cursor: 'pointer',
            }}
            type="button"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>

      {/* Last 7 days chart */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Last 7 days</h3>
        {!chartReady ? (
          <div className="skeleton" style={{ height: 220 }} />
        ) : (
          <div style={{ width: '100%', minHeight: 220, background: '#fff', borderRadius: 14, padding: 12, border: '1px solid #e2e8f0' }}>
            <ResponsiveContainer width="100%" height={200} minHeight={200}>
              <BarChart data={last7DaysData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}
                  formatter={(value: any) => formatCurrency(value as number)}
                />
                <Legend />
                <Bar dataKey="income" fill="#10b981" isAnimationActive animationBegin={200} />
                <Bar dataKey="expense" fill="#f43f5e" isAnimationActive animationBegin={200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default Dashboard
