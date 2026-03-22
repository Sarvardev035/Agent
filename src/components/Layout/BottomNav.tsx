import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Menu,
  HandCoins,
  PieChart,
  BarChart3,
  Calendar,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)
  const authStore = useAuthStore()

  const tabs = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
    { path: '/income', icon: TrendingUp, label: 'Income' },
    { path: '/transfers', icon: ArrowLeftRight, label: 'Transfer' },
    { action: () => setShowMore(true), icon: Menu, label: 'More' },
  ]

  const moreItems = [
    { path: '/debts', label: 'Debts', icon: HandCoins },
    { path: '/budget', label: 'Budget', icon: PieChart },
    { path: '/statistics', label: 'Statistics', icon: BarChart3 },
    { path: '/calendar', label: 'Calendar', icon: Calendar },
  ]

  const logout = () => {
    authStore.logout()
  }

  return (
    <>
      <nav
        className="safe-bottom bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'var(--surface-strong)',
          borderTop: '1px solid var(--border)',
          height: 64,
          display: 'flex',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(18px) saturate(145%)',
        }}
      >
        {tabs.map(tab => {
          const active = tab.path === location.pathname
          return (
            <button
              key={tab.label}
              onClick={() => (tab.action ? tab.action() : tab.path && navigate(tab.path))}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: active ? '#4b5fe8' : 'var(--text-3)',
                position: 'relative',
                fontSize: 10,
                fontWeight: active ? 700 : 500,
              }}
              type="button"
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 4,
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#71e7ff',
                    boxShadow: '0 0 12px rgba(113,231,255,0.7)',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <AnimatePresence>
        {showMore && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(10,14,28,0.38)', zIndex: 60, backdropFilter: 'blur(10px)' }}
              onClick={() => setShowMore(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--surface-strong)',
                borderRadius: '20px 20px 0 0',
                padding: 24,
                zIndex: 70,
                borderTop: '1px solid var(--border)',
                backdropFilter: 'blur(22px) saturate(145%)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 4,
                  background: 'rgba(100,120,255,0.35)',
                  borderRadius: 2,
                  margin: '0 auto 20px',
                }}
              />
              <div style={{ display: 'grid', gap: 10 }}>
                {moreItems.map(item => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path)
                      setShowMore(false)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid var(--border)',
                      background: 'var(--surface)',
                      color: 'var(--text-1)',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
                      backdropFilter: 'blur(14px) saturate(140%)',
                    }}
                    type="button"
                  >
                    <item.icon size={18} />
                    {item.label}
                    <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>›</span>
                  </button>
                ))}
                <button
                  onClick={() => {
                    setShowMore(false)
                    logout()
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--accent-border)',
                    background: 'var(--accent-gradient-warm)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 14px 32px rgba(196,93,255,0.2)',
                  }}
                  type="button"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default BottomNav
