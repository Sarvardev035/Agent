import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingDown,
  TrendingUp,
  ArrowLeftRight,
  HandCoins,
  PieChart,
  BarChart3,
  Calendar,
  LogOut,
  ChevronUp,
  Moon,
  Settings2,
  Sun,
  Volume2,
  VolumeX,
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import BrandLogo from '../ui/BrandLogo'
import { sounds } from '../../lib/sounds'
import { useTheme } from '../../contexts/ThemeContext'

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
  onRequestLogout: () => void
}

const Sidebar = ({ collapsed, onRequestLogout }: SidebarProps) => {
  const authStore = useAuthStore()
  const user = authStore.user
  const { isDark, setTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [muted, setMuted] = useState(() => sounds.getMuted())
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const isTablet = Boolean(collapsed)
  const storedName =
    (typeof window !== 'undefined' && window.localStorage.getItem('finly_user_name')) || ''
  const storedEmail =
    (typeof window !== 'undefined' && window.localStorage.getItem('finly_user_email')) || ''
  const displayName = user?.name || storedName || 'User'
  const displayEmail = user?.email || storedEmail || ''
  const initials = useMemo(
    () =>
      displayName
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U',
    [displayName]
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleThemeToggle = () => {
    startTransition(() => {
      setTheme(isDark ? 'light' : 'dark')
      sounds.click()
    })
  }

  const handleSoundToggle = () => {
    startTransition(() => {
      const nextMuted = sounds.toggleMute()
      setMuted(nextMuted)
    })
  }

  return (
    <aside
      style={{
        width: collapsed ? 64 : 240,
        background: 'var(--sidebar-surface)',
        color: '#cbd5e1',
        position: 'fixed',
        inset: 0,
        right: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--border)',
        backdropFilter: 'blur(22px) saturate(145%)',
        zIndex: 40,
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div
        style={{
          padding: collapsed ? '18px 12px' : '20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <BrandLogo compact={collapsed} />
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
                  background: isActive ? 'linear-gradient(135deg, rgba(113,231,255,0.2), rgba(196,93,255,0.18))' : 'transparent',
                  borderLeft: !collapsed ? (isActive ? '3px solid rgba(113,231,255,0.9)' : '3px solid transparent') : undefined,
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
        ref={settingsRef}
        style={{
          padding: isTablet ? '12px 8px' : '12px 8px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        {!isTablet && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 12px',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  color: 'rgba(255,255,255,0.4)',
                  fontSize: 10,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {displayEmail}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          data-button-reset="true"
          className={`settings-launcher${settingsOpen ? ' is-open' : ''}`}
          onClick={() => startTransition(() => setSettingsOpen(prev => !prev))}
          style={{
            width: '100%',
            justifyContent: isTablet ? 'center' : 'flex-start',
            padding: isTablet ? '12px 0' : '12px 14px',
          }}
        >
          <span className="settings-launcher__icon-wrap">
            <Settings2 size={18} className="settings-launcher__icon" />
          </span>
          {!isTablet && <span style={{ flex: 1, textAlign: 'left' }}>Settings</span>}
          {!isTablet && (
            <ChevronUp
              size={14}
              style={{
                opacity: 0.72,
                transform: settingsOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                transition: 'transform 0.2s ease',
              }}
            />
          )}
        </button>

        {settingsOpen && (
          <div
            className="settings-panel"
            style={{
              bottom: 'calc(100% + 10px)',
              ...(isTablet
                ? {
                    left: 'calc(100% + 10px)',
                    width: 250,
                  }
                : {
                    left: 8,
                    right: 8,
                  }),
            }}
          >
            <div className="settings-panel__title">Settings</div>

            <div className="settings-panel__row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: isDark ? '#c4b5fd' : '#fbbf24' }}>
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                    2s scene transition
                  </div>
                </div>
              </div>
              <button
                type="button"
                data-button-reset="true"
                onClick={handleThemeToggle}
                className={`settings-panel__switch${isDark ? ' is-on' : ''}`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="settings-panel__switch-thumb" />
              </button>
            </div>

            <div className="settings-panel__row">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: muted ? '#fda4af' : '#86efac' }}>
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>
                    {muted ? 'Sound Off' : 'Sound On'}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>
                    Coin sounds and alerts
                  </div>
                </div>
              </div>
              <button
                type="button"
                data-button-reset="true"
                onClick={handleSoundToggle}
                className={`settings-panel__switch${!muted ? ' is-success' : ''}`}
                aria-label={muted ? 'Enable sounds' : 'Mute sounds'}
              >
                <span className="settings-panel__switch-thumb" />
              </button>
            </div>

            <div className="settings-panel__divider" />

            <button
              type="button"
              data-button-reset="true"
              className="settings-panel__logout"
              onClick={() => {
                setSettingsOpen(false)
                onRequestLogout()
              }}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
