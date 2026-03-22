import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Zap } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useRouteScrollReveal } from '../../hooks/useRouteScrollReveal'
import api from '../../lib/api'
import { safeArray } from '../../lib/helpers'
import { SoundToggle } from '../ui/SoundToggle'

const AppShell = () => {
  const location = useLocation()
  const isCompactLayout = useMediaQuery('(max-width: 1024px)')
  const isDesktopCondensed = useMediaQuery('(max-width: 1280px)')
  const [notifications, setNotifications] = useState<any[]>([])
  const routeContentRef = useRef<HTMLDivElement | null>(null)

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

  return (
    <div className="min-h-screen bg-slate-100">
      {!isCompactLayout && <Sidebar collapsed={isDesktopCondensed} />}

      <main
        style={{
          marginLeft: isCompactLayout ? 0 : isDesktopCondensed ? 64 : 240,
          padding: isCompactLayout ? '12px 12px 88px' : '24px 32px',
          minHeight: '100vh',
          width: '100%',
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        {isCompactLayout && (
          <header
            className="mobile-header"
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              padding: '12px 4px',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: 999,
                  background: 'var(--accent-gradient-soft)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 12px 28px rgba(95,123,255,0.24)',
                }}
              >
                <Zap size={16} color="white" />
                <span style={{ fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                  Finly
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SoundToggle />
              <button
                type="button"
                aria-label="Notifications"
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

      {isCompactLayout && <BottomNav />}
    </div>
  )
}

export default AppShell
