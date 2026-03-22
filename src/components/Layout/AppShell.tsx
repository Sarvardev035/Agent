import { startTransition, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useRouteScrollReveal } from '../../hooks/useRouteScrollReveal'
import api from '../../lib/api'
import { safeArray } from '../../lib/helpers'
import BrandLogo from '../ui/BrandLogo'
import { sounds } from '../../lib/sounds'
import { useAuthStore } from '../../store/auth.store'

const AppShell = () => {
  const location = useLocation()
  const isCompactLayout = useMediaQuery('(max-width: 1024px)')
  const isDesktopCondensed = useMediaQuery('(max-width: 1280px)')
  const [notifications, setNotifications] = useState<any[]>([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const routeContentRef = useRef<HTMLDivElement | null>(null)
  const logout = useAuthStore(state => state.logout)
  const sidebarWidth = isCompactLayout ? 0 : isDesktopCondensed ? 64 : 240

  useRouteScrollReveal(routeContentRef, location.pathname)

  useEffect(() => {
    let cancelled = false
    api.get('/api/notifications')
      .then(res => {
        if (!cancelled)
          setNotifications(safeArray(res.data))
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [])

  const handleRequestLogout = () => {
    startTransition(() => setShowLogoutConfirm(true))
  }

  const handleConfirmLogout = () => {
    if (loggingOut) return

    setLoggingOut(true)
    sounds.frog()

    window.setTimeout(() => {
      logout()
    }, 420)
  }

  return (
    <div className="app-shell-root min-h-screen bg-slate-100">
      {!isCompactLayout && (
        <Sidebar collapsed={isDesktopCondensed} onRequestLogout={handleRequestLogout} />
      )}

      <main
        className="app-shell-main"
        style={{
          marginLeft: sidebarWidth,
          width: isCompactLayout ? '100%' : `calc(100% - ${sidebarWidth}px)`,
          padding: isCompactLayout ? '12px 12px 88px' : '24px 32px',
          minHeight: '100vh',
          maxWidth: '100%',
          overflowX: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        {isCompactLayout && (
          <header
            className="mobile-header"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              padding: '12px 10px',
              background: 'var(--surface-strong)',
              backdropFilter: 'blur(18px) saturate(145%)',
              borderBottom: '1px solid var(--border)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 18,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <BrandLogo />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                aria-label="Notifications"
                data-button-reset="true"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-1)',
                  position: 'relative',
                  backdropFilter: 'blur(14px) saturate(145%)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Bell size={18} />
                {notifications.length > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#ef4444', color: 'white',
                    width: 18, height: 18, borderRadius: '50%',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>
            </div>
          </header>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            ref={routeContentRef}
            className="route-scroll-shell"
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {showLogoutConfirm && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget && !loggingOut) {
              startTransition(() => setShowLogoutConfirm(false))
            }
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 999,
          }}
        >
          <div
            className="glass-card"
            style={{
              borderRadius: 24,
              padding: 32,
              maxWidth: 360,
              width: '100%',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              border: '1px solid var(--border)',
              textAlign: 'center',
              animation: 'slideUp 0.2s ease-out',
            }}
          >
            <div
              style={{
                fontSize: 52,
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              🐸
            </div>

            <h3
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: 'var(--text-1)',
                margin: '0 0 8px',
                letterSpacing: '-0.02em',
              }}
            >
              Leaving so soon?
            </h3>

            <p
              style={{
                fontSize: 14,
                color: 'var(--text-3)',
                margin: '0 0 28px',
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to log out of Finly?
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button
                type="button"
                data-button-reset="true"
                disabled={loggingOut}
                onClick={() => startTransition(() => setShowLogoutConfirm(false))}
                style={{
                  padding: '12px',
                  borderRadius: 12,
                  border: '1.5px solid var(--border)',
                  background: 'transparent',
                  color: 'var(--text-2)',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--surface)'
                  e.currentTarget.style.borderColor = 'var(--text-3)'
                  e.currentTarget.style.transform = 'scale(1.02)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                Stay 😊
              </button>

              <button
                type="button"
                data-button-reset="true"
                disabled={loggingOut}
                onClick={handleConfirmLogout}
                style={{
                  padding: '12px',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.04)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.5)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(239,68,68,0.35)'
                }}
              >
                {loggingOut ? 'Logging out...' : 'Log out 🚪'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isCompactLayout && <BottomNav onRequestLogout={handleRequestLogout} />}
    </div>
  )
}

export default AppShell
