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
  ChevronRight,
} from 'lucide-react'
import { TokenStorage } from '../../lib/security'
import BottomNav from './BottomNav'
import { useAuthStore } from '../../store/auth.store'

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
]

const BottomTabs = NAV_ITEMS.slice(0, 4)

const AppShell = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    const handler = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const isDesktop = windowWidth > 1024
  const isTablet = windowWidth > 768 && windowWidth <= 1024
  const isMobile = windowWidth <= 768

  const initials = useMemo(() => {
    if (!user?.name) return 'F'
    const parts = user.name.trim().split(' ')
    const joined = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0]
    return joined.toUpperCase()
  }, [user?.name])

  const logout = () => {
    TokenStorage.clear()
    navigate('/login', { replace: true })
    setMobileMenuOpen(false)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {!isMobile && (
        <aside
          style={{
            width: isTablet ? 64 : 240,
            background: '#0a1628',
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
                  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
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
                      background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                      borderLeft: isActive && !isTablet ? '3px solid #2563eb' : '3px solid transparent',
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
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid var(--border)',
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
                  background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 6px 16px rgba(37,99,235,0.35)',
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
                  border: '1px solid var(--border)',
                  background: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  boxShadow: 'var(--sh-sm)',
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
                  background: '#0f172a',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  border: '1px solid #e2e8f0',
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
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ padding: isMobile ? '16px 16px 24px' : '28px 32px' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {isMobile && <BottomNav tabs={BottomTabs} onMoreOpen={() => setMobileMenuOpen(true)} />}

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.5)',
                zIndex: 60,
              }}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'white',
                borderRadius: '20px 20px 0 0',
                padding: '20px 16px 32px',
                zIndex: 70,
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
              {NAV_ITEMS.slice(4).map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 16px',
                    borderRadius: 12,
                    color: isActive ? '#2563eb' : '#475569',
                    background: isActive ? '#eff6ff' : 'transparent',
                    textDecoration: 'none',
                    fontSize: 15,
                    fontWeight: 500,
                    marginBottom: 4,
                  })}
                >
                  <item.icon size={20} />
                  {item.label}
                  <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </NavLink>
              ))}
              <button
                onClick={logout}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 12,
                  background: '#fff1f2',
                  border: 'none',
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: 15,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  marginTop: 8,
                }}
              >
                <LogOut size={18} />
                Log out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AppShell
