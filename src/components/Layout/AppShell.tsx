import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Zap } from 'lucide-react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { useMediaQuery } from '../../hooks/useMediaQuery'

const AppShell = () => {
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  return (
    <div className="min-h-screen bg-slate-100">
      {!isMobile && <Sidebar collapsed={isTablet} />}

      <main
        style={{
          marginLeft: isMobile ? 0 : isTablet ? 64 : 240,
          padding: isMobile ? '16px 16px 88px' : '24px 32px',
          minHeight: '100vh',
        }}
      >
        {isMobile && (
          <header
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 20,
              padding: '12px 4px',
              background: 'rgba(241,245,249,0.95)',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid #e2e8f0',
              marginBottom: 12,
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
                <span style={{ fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Space Grotesk, Inter, sans-serif' }}>
                  Finly
                </span>
              </div>
            </div>
            <button
              type="button"
              aria-label="Notifications"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
              }}
            >
              <Bell size={18} />
            </button>
          </header>
        )}

        <AnimatePresence mode="wait">
          <motion.div
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

      {isMobile && <BottomNav />}
    </div>
  )
}

export default AppShell
