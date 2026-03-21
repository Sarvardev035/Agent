import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, TrendingDown, TrendingUp, Send, CreditCard, PieChart, Calendar, Settings, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import toast from 'react-hot-toast'

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out successfully')
      navigate('/login', { replace: true })
    } catch (err) {
      toast.error('Logout failed')
    }
  }

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
    { path: '/income', icon: TrendingUp, label: 'Income' },
    { path: '/transfers', icon: Send, label: 'Transfers' },
    { path: '/debts', icon: CreditCard, label: 'Debts' },
    { path: '/budget', icon: PieChart, label: 'Budget' },
    { path: '/statistics', icon: LayoutDashboard, label: 'Statistics' },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ duration: 0.2 }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: 280,
          height: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          zIndex: 40,
        }}
      >
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 18, fontWeight: 700, color: '#0a1628',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold',
            }}>
              💰
            </div>
            Finly
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map(item => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{ textDecoration: 'none' }}
                onClick={() => setSidebarOpen(false)}
              >
                <motion.div
                  whileHover={{ x: 4 }}
                  style={{
                    padding: '12px 16px',
                    margin: '4px 0',
                    borderRadius: 10,
                    display: 'flex', alignItems: 'center', gap: 12,
                    color: active ? '#2563eb' : '#64748b',
                    background: active ? '#eff6ff' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: 14, fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div style={{
          padding: '16px 12px',
          borderTop: '1px solid #e2e8f0',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{
            padding: '12px 16px',
            background: '#f8fafc',
            borderRadius: 10,
            fontSize: 12,
            color: '#64748b',
          }}>
            <div style={{ color: '#0f172a', fontWeight: 600, marginBottom: 2 }}>
              {user?.name || 'User'}
            </div>
            <div style={{ wordBreak: 'break-all' }}>
              {user?.email || 'email@example.com'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', gap: 10,
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 14, fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#fff1f2'
              e.currentTarget.style.borderColor = '#fecdd3'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div style={{
        marginLeft: 280,
        flex: 1,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Top bar */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 30,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              color: '#0f172a',
            }}
          >
            <Menu size={24} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#0f172a', margin: 0 }}>
            {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
          </h1>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <button
              onClick={() => navigate('/settings')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                color: '#64748b',
                display: 'flex', alignItems: 'center',
              }}
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main style={{
          flex: 1,
          padding: 24,
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 30,
          }}
        />
      )}
    </div>
  )
}
