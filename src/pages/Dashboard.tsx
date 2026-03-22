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
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { formatCurrency, getCategoryMeta } from '../utils/helpers'
import TransactionItem from '../components/ui/TransactionItem'
import EmptyState from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'

const Dashboard = () => {
  const navigate = useNavigate()
  const { stats, loading } = useDashboardStats()
  const [chartReady, setChartReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setChartReady(true), 200)
    return () => clearTimeout(t)
  }, [])

  const timeOfDay = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
  }, [])

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  const userName = useMemo(() => {
    return localStorage.getItem('finly_user_name')
      || localStorage.getItem('finly_user_email')?.split('@')[0]
      || 'there'
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
      return { label, income: dayIncome, expense: dayExpense }
    })
    return days
  }, [stats?.income, stats?.expenses])

  const expByCategory = useMemo(() => {
    if (!stats?.expenses) return []
    const totals: Record<string, number> = {}
    stats.expenses.forEach((e: any) => {
      const key = e.category || e.categoryId || 'OTHER'
      totals[key] = (totals[key] || 0) + (e.amount || 0)
    })
    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [stats?.expenses])

  const recentTxns = useMemo(() => {
    const combined: any[] = []
    if (stats?.recentTransactions) {
      combined.push(...stats.recentTransactions)
    }
    if (stats?.income) {
      combined.push(...stats.income.map((i: any) => ({ ...i, txnType: 'income' })))
    }
    if (stats?.expenses) {
      combined.push(...stats.expenses.map((e: any) => ({ ...e, txnType: 'expense' })))
    }
    return combined
      .sort((a, b) => new Date(b.date || b.incomeDate || b.expenseDate || 0).getTime() - new Date(a.date || a.incomeDate || a.expenseDate || 0).getTime())
      .slice(0, 8)
  }, [stats?.recentTransactions, stats?.income, stats?.expenses])

  const smartDate = (dateStr?: string) => {
    if (!dateStr) return 'Today'
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) return 'Today'
    if (format(date, 'yyyy-MM-dd') === format(yesterday, 'yyyy-MM-dd')) return 'Yesterday'
    return format(date, 'MMM d')
  }

  const accounts = stats?.accounts || []
  const summary = {
    totalBalance: stats?.totalBalance ?? 0,
    totalIncome: stats?.monthlyIncome ?? 0,
    totalExpense: stats?.monthlyExpenses ?? 0,
    savings: (stats?.monthlyIncome ?? 0) - (stats?.monthlyExpenses ?? 0),
  }

  const openDebts = [] // Placeholder
  const budgetUsedPct = 0 // Placeholder

  return (
    <div style={{ padding: 'clamp(16px,3vw,32px)' }}>
      {/* ── ROW 1: Welcome header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
      }}>
        <div>
          <p style={{
            fontSize: 13, color: 'var(--text-3)',
            margin: '0 0 4px',
          }}>
            {format(new Date(), 'EEEE, MMMM do')}
          </p>
          <h1 style={{
            fontSize: 'clamp(20px,3vw,28px)',
            fontWeight: 800,
            color: 'var(--text-1)',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Good {timeOfDay}, {capitalize(userName)} 👋
          </h1>
        </div>
        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: '9px 12px',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 6,
            color: 'var(--text-2)', fontSize: 13,
            transition: 'all 0.2s',
          }}>
            🔔
          </button>
        </div>
      </div>

      {/* ── ROW 2: Hero balance card ── */}
      <div style={{
        background:
          'linear-gradient(135deg,rgba(10,22,40,0.9) 0%,' +
          'rgba(30,58,110,0.85) 50%,' +
          'rgba(37,99,235,0.8) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 24,
        padding: 'clamp(20px,3vw,28px)',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        color: 'white',
        boxShadow:
          '0 8px 32px rgba(37,99,235,0.3),' +
          'inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
        {/* Decorative circles */}
        <div style={{
          position:'absolute', right:-40, top:-40,
          width:200, height:200, borderRadius:'50%',
          background:'rgba(255,255,255,0.05)',
        }}/>
        <div style={{
          position:'absolute', right:40, top:20,
          width:120, height:120, borderRadius:'50%',
          background:'rgba(255,255,255,0.04)',
        }}/>

        <p style={{ margin:'0 0 4px', fontSize:11,
          textTransform:'uppercase', letterSpacing:'0.1em',
          opacity:0.6, fontWeight:600,
        }}>
          TOTAL BALANCE
        </p>
        <h2 style={{
          margin:'0 0 4px',
          fontWeight:800,
        }}>
          <span className="balance-large">
            {loading ? '—' : formatCurrency(summary.totalBalance)}
          </span>
        </h2>
        <p style={{ margin:'0 0 20px', opacity:0.6, fontSize:13 }}>
          Across {accounts.length} account{accounts.length !== 1 ? 's' : ''}
        </p>
        <div style={{
          display:'flex', gap:32, flexWrap:'wrap',
          borderTop:'1px solid rgba(255,255,255,0.1)',
          paddingTop:16,
        }}>
          <div>
            <p style={{ margin:'0 0 2px', opacity:0.6, fontSize:12 }}>
              ↑ Income this month
            </p>
            <p style={{ margin:0, fontWeight:700, fontSize:16,
              color:'#4ade80' }}>
              <span className="amount amount-positive">
                {loading ? '—' : formatCurrency(summary.totalIncome)}
              </span>
            </p>
          </div>
          <div>
            <p style={{ margin:'0 0 2px', opacity:0.6, fontSize:12 }}>
              ↓ Expenses this month
            </p>
            <p style={{ margin:0, fontWeight:700, fontSize:16,
              color:'#f87171' }}>
              <span className="amount amount-negative">
                {loading ? '—' : formatCurrency(summary.totalExpense)}
              </span>
            </p>
          </div>
          <div>
            <p style={{ margin:'0 0 2px', opacity:0.6, fontSize:12 }}>
              💰 Net Savings
            </p>
            <p style={{ margin:0, fontWeight:700, fontSize:16,
              color:'#a78bfa' }}>
              <span className="amount">
                {loading ? '—' : formatCurrency(summary.savings)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ── ROW 3: Quick stat pills ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,200px),1fr))',
        gap:12,
        marginBottom:20,
      }}>
        {[
          { label:'Net Savings',   value:summary.savings,      color:'#7c3aed', bg:'#f5f3ff', icon:'💰' },
          { label:'Accounts',      value:accounts.length,          color:'#2563eb', bg:'#eff6ff', icon:'💳', isCount:true },
          { label:'Open Debts',    value:openDebts.length,         color:'#f59e0b', bg:'#fffbeb', icon:'🤝', isCount:true },
          { label:'Budget Health', value:budgetUsedPct,            color:'#10b981', bg:'#ecfdf5', icon:'🎯', isPct:true },
        ].map(card => (
          <motion.div key={card.label}
            whileHover={{ y: -4 }}
            style={{
              borderLeft:`4px solid ${card.color}`,
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.5)',
              cursor:'pointer',
              padding:'16px',
              borderRadius:'16',
              transition:'all 0.2s',
              boxShadow:
                '0 2px 12px rgba(0,0,0,0.06),' +
                'inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            <div style={{ fontSize:11,fontWeight:700,
              color:card.color,textTransform:'uppercase',
              letterSpacing:'0.06em',marginBottom:6,
            }}>
              {card.icon} {card.label}
            </div>
            <div className="stat-number" style={{ color: card.color }}>
              {card.isCount
                ? card.value
                : card.isPct
                  ? `${Math.round(card.value)}%`
                  : formatCurrency(card.value)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── ROW 4: Quick Actions ── */}
      <div style={{ marginBottom:20 }}>
        <h3 style={{ fontSize:15,fontWeight:700,
          color:'var(--text-1)',marginBottom:12,
        }}>
          Quick Actions
        </h3>
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',
          gap:10,
        }}>
          {[
            { label:'+ Expense',  color:'#ef4444', bg:'#fff1f2', path:'/expenses',  icon:'📉' },
            { label:'+ Income',   color:'#10b981', bg:'#ecfdf5', path:'/income',    icon:'📈' },
            { label:'Transfer',   color:'#2563eb', bg:'#eff6ff', path:'/transfers', icon:'↔️' },
            { label:'+ Debt',     color:'#f59e0b', bg:'#fffbeb', path:'/debts',     icon:'🤝' },
          ].map(action => (
            <motion.button key={action.label}
              whileHover={{ y: -4 }}
              onClick={() => navigate(action.path)}
              style={{
                background:action.bg,
                border:`1.5px solid ${action.color}30`,
                borderRadius:14,
                padding:'14px 10px',
                cursor:'pointer',
                display:'flex',
                flexDirection:'column',
                alignItems:'center',
                gap:6,
                color:action.color,
                fontWeight:700,
                fontSize:13,
                transition:'all 0.2s',
              }}
            >
              <span style={{ fontSize:22 }}>{action.icon}</span>
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── ROW 5: Two column — Transactions + Accounts ── */}
      <div style={{
        display:'grid',
        gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth > 1024 ? '1fr 380px' : '1fr',
        gap:16,
        marginBottom:20,
      }}>
        {/* Recent Transactions */}
        <div style={{
          background:'var(--card-bg)',
          borderRadius:'14px',
          padding:'16px',
          border:'1px solid var(--border)',
          boxShadow:'var(--shadow-sm)',
        }}>
          <div style={{
            display:'flex',justifyContent:'space-between',
            alignItems:'center',marginBottom:16,
          }}>
            <h3 style={{ fontSize:16,fontWeight:700,
              color:'var(--text-1)',margin:0,
            }}>
              Recent Activity
            </h3>
            <button
              onClick={() => navigate('/expenses')}
              style={{
                background:'none',border:'none',
                color:'#7c3aed',fontSize:13,
                fontWeight:600,cursor:'pointer',
              }}
            >
              View all →
            </button>
          </div>
          {loading ? (
            [...Array(5)].map((_,i)=>(
              <div key={i} className="skeleton"
                style={{height:52,marginBottom:8}}/>
            ))
          ) : recentTxns.length === 0 ? (
            <div style={{
              textAlign:'center',padding:'32px 16px',
              color:'var(--text-3)',
            }}>
              <div style={{fontSize:32,marginBottom:8}}>📋</div>
              <p style={{margin:0,fontSize:14}}>No transactions yet</p>
              <p style={{margin:'4px 0 0',fontSize:12}}>
                Add your first expense or income
              </p>
            </div>
          ) : (
            recentTxns.map((txn:any,i:number) => (
              <div key={i} style={{
                display:'flex',alignItems:'center',
                gap:12,padding:'10px 0',
                borderBottom: i < recentTxns.length-1
                  ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width:38,height:38,borderRadius:10,
                  background: txn.txnType==='expense' || txn.type === 'expense'
                    ? '#fff1f2' : '#ecfdf5',
                  display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:18,flexShrink:0,
                }}>
                  {txn.txnType==='expense' || txn.type === 'expense' ? '📉' : '📈'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{
                    fontSize:14,fontWeight:600,
                    color:'var(--text-1)',
                    whiteSpace:'nowrap',overflow:'hidden',
                    textOverflow:'ellipsis',
                  }}>
                    {txn.description || 'Transaction'}
                  </div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>
                    {smartDate(txn.date || txn.expenseDate || txn.incomeDate)}
                  </div>
                </div>
                <div
                  className={txn.txnType==='expense' || txn.type === 'expense' ? 'amount amount-negative' : 'amount amount-positive'}
                  style={{ fontSize: 14, flexShrink: 0 }}
                >
                  {txn.txnType==='expense' || txn.type === 'expense' ? '−' : '+'}
                  {formatCurrency(txn.amount, txn.currency)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column: My Accounts */}
        <div style={{
          background:'var(--card-bg)',
          borderRadius:'14px',
          padding:'16px',
          border:'1px solid var(--border)',
          boxShadow:'var(--shadow-sm)',
        }}>
          <div style={{
            display:'flex',justifyContent:'space-between',
            alignItems:'center',marginBottom:16,
          }}>
            <h3 style={{
              fontSize:16,fontWeight:700,
              color:'var(--text-1)',margin:0,
            }}>
              My Accounts
            </h3>
            <button
              onClick={() => navigate('/accounts')}
              style={{
                background:'none',border:'none',
                color:'#7c3aed',fontSize:13,
                fontWeight:600,cursor:'pointer',
              }}
            >
              See all →
            </button>
          </div>
          {accounts.length === 0 ? (
            <div style={{
              textAlign:'center',padding:'24px 16px',
              color:'var(--text-3)',
            }}>
              <div style={{fontSize:32,marginBottom:8}}>💳</div>
              <p style={{margin:'0 0 12px',fontSize:14}}>
                No accounts yet
              </p>
              <button
                onClick={() => navigate('/accounts')}
                style={{
                  background:'linear-gradient(135deg,#7c3aed,#2563eb)',
                  color:'white',border:'none',borderRadius:10,
                  padding:'8px 16px',fontSize:13,
                  fontWeight:600,cursor:'pointer',
                }}
              >
                + Add Account
              </button>
            </div>
          ) : (
            <div style={{
              display:'flex',flexDirection:'column',gap:10,
            }}>
              {accounts.slice(0,4).map((acc:any) => (
                <motion.div key={acc.id}
                  whileHover={{ x: 4 }}
                  style={{
                  display:'flex',alignItems:'center',
                  justifyContent:'space-between',
                  padding:'12px 14px',
                  background:'var(--surface-2)',
                  borderRadius:12,
                  border:'1px solid var(--border)',
                  transition:'all 0.15s',
                  cursor:'pointer',
                }}
                >
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{
                      width:36,height:36,borderRadius:10,
                      background:'linear-gradient(135deg,#7c3aed,#2563eb)',
                      display:'flex',alignItems:'center',
                      justifyContent:'center',fontSize:16,
                    }}>
                      {acc.type==='CASH' ? '💵' : '💳'}
                    </div>
                    <div>
                      <div style={{
                        fontSize:13,fontWeight:600,
                        color:'var(--text-1)',
                      }}>
                        {acc.name}
                      </div>
                      <div style={{fontSize:11,color:'var(--text-3)'}}>
                        {acc.type} · {acc.currency}
                      </div>
                    </div>
                  </div>
                  <div className="amount" style={{
                    fontSize:14,
                    color:'var(--text-1)',
                  }}>
                    {formatCurrency(acc.balance, acc.currency)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── ROW 6: Charts ── */}
      {chartReady && (
        <div style={{
          display:'grid',
          gridTemplateColumns: typeof window !== 'undefined' && window.innerWidth > 1024 ? '1fr 1fr' : '1fr',
          gap:16,
          marginBottom:20,
        }}>
          {/* 7-day spending chart */}
          <div style={{
            background:'var(--card-bg)',
            borderRadius:'14px',
            padding:'16px',
            border:'1px solid var(--border)',
            boxShadow:'var(--shadow-sm)',
          }}>
            <h3 style={{
              fontSize:15,fontWeight:700,
              color:'var(--text-1)',marginBottom:16,
            }}>
              Last 7 Days
            </h3>
            <div style={{width:'100%',minHeight:200}}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={last7DaysData}>
                  <CartesianGrid strokeDasharray="3 3"
                    stroke="var(--border)" vertical={false}/>
                  <XAxis dataKey="label"
                    tick={{fill:'var(--text-3)',fontSize:11}}
                    axisLine={false} tickLine={false}/>
                  <YAxis hide/>
                  <Tooltip
                    contentStyle={{
                      background:'var(--card-bg)',
                      border:'1px solid var(--border)',
                      borderRadius:10,fontSize:12,
                    }}
                    formatter={(value: any) => formatCurrency(value as number)}
                  />
                  <Bar dataKey="expense" fill="#ef4444"
                    radius={[6,6,0,0]} name="Expenses"/>
                  <Bar dataKey="income" fill="#10b981"
                    radius={[6,6,0,0]} name="Income"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expenses by category pie */}
          <div style={{
            background:'var(--card-bg)',
            borderRadius:'14px',
            padding:'16px',
            border:'1px solid var(--border)',
            boxShadow:'var(--shadow-sm)',
          }}>
            <h3 style={{
              fontSize:15,fontWeight:700,
              color:'var(--text-1)',marginBottom:16,
            }}>
              Spending Breakdown
            </h3>
            {expByCategory.length === 0 ? (
              <div style={{
                display:'flex',alignItems:'center',
                justifyContent:'center',height:200,
                color:'var(--text-3)',fontSize:13,
                flexDirection:'column',gap:8,
              }}>
                <span style={{fontSize:32}}>🥧</span>
                No spending data yet
              </div>
            ) : (
              <div style={{width:'100%',minHeight:200}}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={expByCategory}
                      dataKey="amount"
                      nameKey="category"
                      cx="40%" cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {expByCategory.map((_:any,i:number)=>(
                        <Cell key={i} fill={[
                          '#7c3aed','#2563eb','#10b981',
                          '#f59e0b','#ef4444','#06b6d4',
                        ][i%6]}/>
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background:'var(--card-bg)',
                        border:'1px solid var(--border)',
                        borderRadius:10,fontSize:12,
                      }}
                      formatter={(value: any) => formatCurrency(value as number)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
