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
        className="safe-bottom"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          height: 64,
          display: 'flex',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
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
                color: active ? '#3b82f6' : '#94a3b8',
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
                    background: '#3b82f6',
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
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60 }}
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
                background: '#ffffff',
                borderRadius: '20px 20px 0 0',
                padding: 24,
                zIndex: 70,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 4,
                  background: '#e2e8f0',
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
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: 14,
                      cursor: 'pointer',
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
                    border: 'none',
                    background: 'rgba(244,63,94,0.1)',
                    color: '#e11d48',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer',
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
