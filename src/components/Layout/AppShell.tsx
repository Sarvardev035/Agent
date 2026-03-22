import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  Handshake,
  Wallet,
  PieChart,
  BarChart3,
  Calendar,
  LogOut,
  Zap,
  Bell,
} from 'lucide-react'
import { TokenStorage } from '../../lib/security'
import { useAuthStore } from '../../store/auth.store'
import Chatbot from '../Chatbot/Chatbot'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'MAIN' },
  { label: 'Expenses', path: '/expenses', icon: TrendingDown, group: 'MAIN' },
  { label: 'Income', path: '/income', icon: TrendingUp, group: 'MAIN' },
  { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight, group: 'MAIN' },
  { label: 'Accounts', path: '/accounts', icon: Wallet, group: 'MAIN' },
  { label: 'Debts', path: '/debts', icon: Handshake, group: 'MANAGE' },
  { label: 'Budget', path: '/budget', icon: PieChart, group: 'MANAGE' },
  { label: 'Statistics', path: '/statistics', icon: BarChart3, group: 'MANAGE' },
  { label: 'Calendar', path: '/calendar', icon: Calendar, group: 'MANAGE' },
  { label: 'Categories', path: '/categories', icon: Wallet, group: 'MANAGE' },
]

type MobileTab = { path?: string; action?: () => void; icon: string; label: string }

const MobileTabs: MobileTab[] = [
  { path: '/dashboard', icon: '🏠', label: 'Home' },
  { path: '/expenses', icon: '📉', label: 'Expenses' },
  { path: '/income', icon: '📈', label: 'Income' },
  { path: '/transfers', icon: '↔️', label: 'Transfer' },
]

const MoreItems = [
  { path: '/debts', label: 'Debts', icon: '🤝' },
  { path: '/budget', label: 'Budget', icon: '🎯' },
  { path: '/statistics', label: 'Statistics', icon: '📊' },
  { path: '/calendar', label: 'Calendar', icon: '📅' },
  { path: '/accounts', label: 'Accounts', icon: '💳' },
  { path: '/categories', label: 'Categories', icon: '📂' },
]

const BottomNav = ({ onLogout }: { onLogout: () => void }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      <nav
        className="safe-bottom"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: 'linear-gradient(150deg, rgba(255,255,255,0.8), rgba(227,240,255,0.6))',
          borderTop: '1px solid rgba(255,255,255,0.72)',
          backdropFilter: 'blur(18px) saturate(130%)',
          WebkitBackdropFilter: 'blur(18px) saturate(130%)',
          boxShadow: '0 -10px 30px rgba(30,64,175,0.14)',
          display: 'flex',
          alignItems: 'center',
          zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {[...MobileTabs, { action: () => setShowMore(true), icon: '⋯', label: 'More' }].map(tab => {
          const isActive = 'path' in tab && tab.path ? location.pathname === tab.path : false
          return (
            <button
              key={tab.label}
              onClick={() => {
                if ('action' in tab && tab.action) tab.action()
                else if ('path' in tab && tab.path) navigate(tab.path)
              }}
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
                color: isActive ? '#1d4ed8' : '#64748b',
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                padding: '8px 0',
                transition: 'color 0.15s ease',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {isActive && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 3,
                    background: 'linear-gradient(135deg,#1d4ed8,#38bdf8)',
                    borderRadius: '0 0 4px 4px',
                  }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {showMore && (
        <>
          <div
            onClick={() => setShowMore(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(11,30,58,0.36)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              zIndex: 60,
            }}
          />
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(165deg, rgba(255,255,255,0.82), rgba(223,239,255,0.72))',
              borderRadius: '20px 20px 0 0',
              padding: '16px 16px 32px',
              zIndex: 70,
              boxShadow: '0 -14px 38px rgba(30,64,175,0.2)',
              borderTop: '1px solid rgba(255,255,255,0.82)',
              backdropFilter: 'blur(18px) saturate(130%)',
              WebkitBackdropFilter: 'blur(18px) saturate(130%)',
            }}
          >
            <div
              style={{
                width: 36,
                height: 4,
                background: '#e2e8f0',
                borderRadius: 2,
                margin: '0 auto 20px',
              }}
            />
            {MoreItems.map(item => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path)
                  setShowMore(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '13px 16px',
                  background: 'none',
                  border: 'none',
                  borderRadius: 12,
                  cursor: 'pointer',
                  fontSize: 15,
                  color: '#0f172a',
                  fontWeight: 500,
                  transition: 'background 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                {item.label}
                <span style={{ marginLeft: 'auto', color: '#94a3b8' }}>›</span>
              </button>
            ))}
            <button
              onClick={() => {
                setShowMore(false)
                onLogout()
              }}
              style={{
                width: '100%',
                padding: '13px',
                marginTop: 8,
                background: 'rgba(239,68,68,0.12)',
                border: 'none',
                borderRadius: 12,
                color: '#ef4444',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              🚪 Log out
            </button>
          </div>
        </>
      )}
    </>
  )
}

const AppShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768)
  const [isTablet, setIsTablet] = useState(window.innerWidth > 768 && window.innerWidth <= 1024)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const handler = () => {
      setIsMobile(window.innerWidth <= 768)
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const initials = useMemo(() => {
    if (!user?.name) return 'F'
    const parts = user.name.trim().split(' ')
    const joined = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
    return joined.toUpperCase()
  }, [user?.name])

  const logout = () => {
    TokenStorage.clear()
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'transparent',
        position: 'relative',
      }}
    >
      {!isMobile && (
        <aside
          style={{
            width: isTablet ? 64 : 240,
            background: 'linear-gradient(180deg, rgba(10,22,40,0.92), rgba(15,35,70,0.84))',
            backdropFilter: 'blur(16px) saturate(120%)',
            WebkitBackdropFilter: 'blur(16px) saturate(120%)',
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            zIndex: 40,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
          }}
        >
          <div
            style={{
              padding: isTablet ? '18px 12px' : '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 9,
                  background: 'linear-gradient(135deg,#1d4ed8,#38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Zap size={18} color="white" fill="white" />
              </div>
              {!isTablet && (
                <span
                  style={{
                    color: '#fff',
                    fontWeight: 800,
                    fontSize: 18,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Finly
                </span>
              )}
            </div>
            {!isTablet && (
              <div
                aria-label="Account avatar"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.12)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  border: '1px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <nav style={{ flex: 1, padding: isTablet ? '12px 0' : '12px 8px', overflowY: 'auto' }}>
            {['MAIN', 'MANAGE'].map(group => (
              <div key={group}>
                {!isTablet && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'rgba(255,255,255,0.3)',
                      letterSpacing: '0.12em',
                      padding: '12px 12px 4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {group}
                  </div>
                )}
                {NAV_ITEMS.filter(i => i.group === group).map(item => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: isTablet ? 0 : 10,
                      padding: isTablet ? '10px 0' : '9px 12px',
                      justifyContent: isTablet ? 'center' : 'flex-start',
                      borderRadius: isTablet ? 0 : 10,
                      marginBottom: 2,
                      color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      background: isActive
                        ? 'linear-gradient(135deg, rgba(37,99,235,0.33), rgba(56,189,248,0.18))'
                        : 'transparent',
                      borderLeft: isActive && !isTablet ? '3px solid #38bdf8' : '3px solid transparent',
                      textDecoration: 'none',
                      fontSize: 14,
                      fontWeight: 500,
                      transition: 'all 0.15s ease',
                    })}
                  >
                    <item.icon size={18} />
                    {!isTablet && item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          <div
            style={{
              padding: isTablet ? '12px 0' : '12px 8px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <button
              onClick={logout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isTablet ? 'center' : 'flex-start',
                gap: 8,
                padding: isTablet ? '10px 0' : '9px 12px',
                borderRadius: 10,
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 500,
                transition: 'color 0.15s',
              }}
            >
              <LogOut size={18} />
              {!isTablet && 'Log out'}
            </button>
          </div>
        </aside>
      )}

      <main
        style={{
          marginLeft: isMobile ? 0 : isTablet ? 64 : 240,
          flex: 1,
          minHeight: '100vh',
          paddingBottom: isMobile ? 80 : 0,
        }}
      >
        {isMobile && (
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 30,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.76), rgba(229,240,255,0.65))',
              backdropFilter: 'blur(16px) saturate(125%)',
              WebkitBackdropFilter: 'blur(16px) saturate(125%)',
              borderBottom: '1px solid rgba(255,255,255,0.78)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'linear-gradient(135deg,#1d4ed8,#38bdf8)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 18px rgba(30,64,175,0.32)',
                }}
              >
                <Zap size={16} color="white" />
                <span style={{ fontWeight: 800, letterSpacing: '-0.01em' }}>Finly</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                aria-label="Notifications"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.72)',
                  background: 'rgba(255,255,255,0.72)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1d4ed8',
                  boxShadow: '0 8px 22px rgba(30,64,175,0.14)',
                }}
              >
                <Bell size={18} />
              </button>
              <div
                aria-label="Account avatar"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#1e3a8a,#0284c7)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  border: '1px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 10px 24px rgba(30,64,175,0.28)',
                }}
              >
                {initials}
              </div>
            </div>
          </header>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ padding: isMobile ? '16px 16px 24px' : '28px 32px' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {isMobile && <BottomNav onLogout={logout} />}
      <Chatbot />
    </div>
  )
}

export default AppShell
