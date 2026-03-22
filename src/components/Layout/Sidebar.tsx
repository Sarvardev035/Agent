import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  HandCoins,
  PieChart,
  BarChart3,
  Calendar,
  Zap,
  LogOut,
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'

type NavItem = {
  label: string
  path: string
  icon: React.ComponentType<{ size?: number }>
  group: 'MAIN' | 'MANAGE'
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'MAIN' },
  { label: 'Accounts', path: '/accounts', icon: Wallet, group: 'MAIN' },
  { label: 'Expenses', path: '/expenses', icon: TrendingDown, group: 'MAIN' },
  { label: 'Income', path: '/income', icon: TrendingUp, group: 'MAIN' },
  { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight, group: 'MAIN' },
  { label: 'Debts', path: '/debts', icon: HandCoins, group: 'MANAGE' },
  { label: 'Budget', path: '/budget', icon: PieChart, group: 'MANAGE' },
  { label: 'Statistics', path: '/statistics', icon: BarChart3, group: 'MANAGE' },
  { label: 'Calendar', path: '/calendar', icon: Calendar, group: 'MANAGE' },
]

interface SidebarProps {
  collapsed?: boolean
}

const Sidebar = ({ collapsed }: SidebarProps) => {
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const user = authStore.user
  const initials =
    user?.name
      ? user.name
          .split(' ')
          .map(part => part[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()
      : 'F'

  const handleLogout = () => {
    authStore.logout()
    navigate('/login')
  }

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        background: '#0f172a',
        color: '#cbd5e1',
        position: 'fixed',
        inset: 0,
        right: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 40,
      }}
    >
      <div
        style={{
          padding: collapsed ? '18px 12px' : '20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: 'linear-gradient(135deg,#1d4ed8,#38bdf8)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Zap size={18} color="#fff" />
        </div>
        {!collapsed && (
          <span
            style={{
              color: '#fff',
              fontWeight: 800,
              letterSpacing: '-0.01em',
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: 18,
            }}
          >
            Finly
          </span>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: collapsed ? '10px 6px' : '14px 12px' }}>
        {(['MAIN', 'MANAGE'] as const).map(group => (
          <div key={group} style={{ marginBottom: 10 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.36)',
                  padding: '10px 10px 6px',
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
                  gap: collapsed ? 0 : 10,
                  padding: collapsed ? '10px 0' : '10px 12px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: collapsed ? 12 : 10,
                  marginBottom: 4,
                  color: isActive ? '#fff' : '#cbd5e1',
                  background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                  borderLeft: !collapsed ? (isActive ? '3px solid var(--blue)' : '3px solid transparent') : undefined,
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: 14,
                  transition: 'all 0.18s ease',
                })}
              >
                <item.icon size={18} />
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div
        style={{
          padding: collapsed ? '12px 8px' : '14px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              letterSpacing: '0.01em',
            }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
                {user?.name || 'Welcome'}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{user?.email || 'finly user'}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 12,
            border: 'none',
            background: '#f43f5e',
            color: '#fff',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            boxShadow: '0 8px 18px rgba(244,63,94,0.28)',
          }}
          type="button"
        >
          <LogOut size={16} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
