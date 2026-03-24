import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
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
  LogOut,
  ChevronUp,
  Settings2,
  Wallet,
} from 'lucide-react'
import { useAuthStore } from '../../store/auth.store'
import BrandLogo from '../ui/BrandLogo'
import { useTheme } from '../../contexts/ThemeContext'
import LanguageTranslator from '../ui/LanguageTranslator'
import { SoundButton } from '../ui/SoundButton'
import { UserProfileStorage } from '../../lib/security'
import { onAccessibilityChange, screenReader } from '../../lib/screenReader'
import { SessionsModal } from './SessionsModal'
import { FamilyShareModal } from './FamilyShareModal'

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

const CommunityIcon = ({ size = 18 }: { size?: number }) => (
  <span style={{ fontSize: Math.max(12, size - 2), lineHeight: 1 }}>💬</span>
)

const NotesIcon = ({ size = 18 }: { size?: number }) => (
  <span style={{ fontSize: Math.max(12, size - 2), lineHeight: 1 }}>📝</span>
)

interface SidebarProps {
  collapsed?: boolean
  onRequestLogout: () => void
}

const Sidebar = ({ collapsed, onRequestLogout }: SidebarProps) => {
  const navigate = useNavigate()
  const authStore = useAuthStore()
  const user = authStore.user
  const { isDark } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSessions, setShowSessions] = useState(false)
  const [showFamilyShare, setShowFamilyShare] = useState(false)
  const [accessibilityActive, setAccessibilityActive] = useState(screenReader.isActive())
  const settingsRef = useRef<HTMLDivElement | null>(null)
  const isTablet = Boolean(collapsed)
  const storedProfile = UserProfileStorage.get()
  const storedName = storedProfile.name
  const storedEmail = storedProfile.email
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
  const navItems = useMemo(
    () => [
      ...NAV_ITEMS,
      { label: 'Community', path: '/community', icon: CommunityIcon, group: 'MANAGE' as const },
      { label: 'Notes', path: '/notes', icon: NotesIcon, group: 'MANAGE' as const },
    ],
    []
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

  useEffect(() => onAccessibilityChange(setAccessibilityActive), [])

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
            {navItems.filter(i => i.group === group).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                onFocus={() => screenReader.speak(`${item.label} page link`)}
                onMouseEnter={() => screenReader.speak(`${item.label} page link`)}
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
              padding: '10px 12px',
              borderRadius: 12,
              cursor: 'default',
              marginBottom: 6,
              transition: 'all 0.18s ease',
              border: '1px solid transparent',
              opacity: 0.7,
            }}
            onMouseEnter={() => {}}
            onMouseLeave={() => {}}
          >
            {/* Avatar with gradient ring */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg,#7c3aed,#2563eb)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: '0 0 0 2px rgba(124,58,237,0.4)',
                  transition: 'box-shadow 0.2s',
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              {/* Online dot */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: '#10b981',
                  border: '2px solid #0a1628',
                }}
              />
            </div>

            {/* Name + email */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 13,
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

            {/* Edit icon hint */}
            <span
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.3)',
                flexShrink: 0,
              }}
            >
              ✎
            </span>
          </div>
        )}

        <button
          type="button"
          data-button-reset="true"
          className={`settings-launcher${settingsOpen ? ' is-open' : ''}`}
          onClick={() => startTransition(() => setSettingsOpen(prev => !prev))}
          onFocus={() => screenReader.speak('Open settings panel')}
          onMouseEnter={() => screenReader.speak('Open settings panel')}
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
              maxHeight: 'min(600px, calc(100vh - 200px))',
              overflowY: 'auto',
              ...(isTablet
                ? {
                    left: 'calc(100% + 10px)',
                    width: 'max(220px, 80vw)',
                    maxWidth: 300,
                  }
                : {
                    left: 8,
                    right: 8,
                    minWidth: 240,
                    maxWidth: 'calc(100% - 16px)',
                  }),
            }}
          >
            <div className="settings-panel__title">Settings</div>

            {/* Language & Sound Row */}
            <div className="settings-panel__row" style={{ alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ color: '#71e7ff' }}>🌐</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Language</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>50+ languages</div>
                </div>
              </div>
              <LanguageTranslator compact />
            </div>

            <div className="settings-panel__row" style={{ alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{ color: '#a78bfa' }}>🔊</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Sounds</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)' }}>Toggle effects</div>
                </div>
              </div>
              <SoundButton />
            </div>

            <div className="settings-panel__divider" />

            {/* Sessions & Family Sharing Buttons */}
            <button
              type="button"
              data-button-reset="true"
              onClick={() => setShowSessions(true)}
              className="settings-panel__logout"
              style={{ color: '#93c5fd' }}
              onFocus={() => screenReader.speak('View sessions')}
              onMouseEnter={() => screenReader.speak('View sessions')}
            >
              <span>⏱️ Active Sessions</span>
              <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 'auto' }}>View & manage</span>
            </button>

            <button
              type="button"
              data-button-reset="true"
              onClick={() => setShowFamilyShare(true)}
              className="settings-panel__logout"
              style={{ color: '#86efac' }}
              onFocus={() => screenReader.speak('Family sharing')}
              onMouseEnter={() => screenReader.speak('Family sharing')}
            >
              <span>👨‍👩‍👧‍👦 Family Sharing</span>
              <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 'auto' }}>Share data</span>
            </button>

            <div className="settings-panel__divider" />

            {/* Other Settings */}
            <button
              type="button"
              data-button-reset="true"
              className="settings-panel__logout"
              style={{ color: '#c4b5fd' }}
              onClick={() => {
                if (accessibilityActive) {
                  screenReader.disable()
                } else {
                  screenReader.enable()
                }
              }}
              onFocus={() => screenReader.speak('Accessibility mode toggle')}
              onMouseEnter={() => screenReader.speak('Accessibility mode toggle')}
            >
              <span>♿ Accessibility</span>
              <span style={{ fontSize: 10, opacity: 0.65, marginLeft: 'auto' }}>
                {accessibilityActive ? 'ON' : 'OFF'}
              </span>
            </button>

            <button
              type="button"
              data-button-reset="true"
              className="settings-panel__logout"
              style={{ color: '#93c5fd' }}
              onClick={() => {
                navigate('/vr')
                setSettingsOpen(false)
              }}
              onFocus={() => screenReader.speak('VR mode')}
              onMouseEnter={() => screenReader.speak('VR mode')}
            >
              <span>🥽 VR Mode</span>
              <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 'auto' }}>3D</span>
            </button>

            <div className="settings-panel__divider" />

            <button
              type="button"
              data-button-reset="true"
              className="settings-panel__logout"
              style={{ color: '#e2e8f0' }}
              onClick={() => setShowAbout(true)}
              onFocus={() => screenReader.speak('About Finly')}
              onMouseEnter={() => screenReader.speak('About Finly')}
            >
              <span>ℹ️ About</span>
              <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 'auto' }}>v1.0</span>
            </button>

            <button
              type="button"
              data-button-reset="true"
              className="settings-panel__logout"
              onClick={() => {
                setSettingsOpen(false)
                onRequestLogout()
              }}
              onFocus={() => screenReader.speak('Log out')}
              onMouseEnter={() => screenReader.speak('Log out')}
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
      </div>
      {showAbout && (
        <div
          onClick={e => {
            if (e.target === e.currentTarget) setShowAbout(false)
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2,6,23,0.7)',
            backdropFilter: 'blur(8px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: 'min(560px, 100%)',
              borderRadius: 20,
              border: '1px solid var(--border)',
              background: 'var(--surface-strong)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ textAlign: 'center', padding: 24 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>⚡</div>
              <h2 style={{ margin: '0 0 6px', color: 'var(--text-1)' }}>Finly</h2>
              <p style={{ margin: '0 0 6px', color: 'var(--text-2)' }}>Personal Finance Manager</p>
              <p style={{ margin: '0 0 6px', color: 'var(--text-2)' }}>Built for Hackathon 2026</p>
              <p style={{ margin: '0 0 6px', color: 'var(--text-2)' }}>Frontend: React + TypeScript + Vite</p>
              <p style={{ margin: '0 0 6px', color: 'var(--text-2)' }}>Backend: Java Spring Boot</p>
              <p style={{ margin: '0 0 6px', color: 'var(--text-2)' }}>
                Features: Expenses, Income, Transfers, Debts, Budget, Analytics, VR Mode, Accessibility, Community, Notes
              </p>
              <p style={{ margin: '0 0 18px', color: 'var(--text-2)' }}>Team: Sarvar + Backend Dev</p>
              <button
                type="button"
                data-button-reset="true"
                onClick={() => setShowAbout(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-1)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <SessionsModal isOpen={showSessions} onClose={() => setShowSessions(false)} />
      <FamilyShareModal isOpen={showFamilyShare} onClose={() => setShowFamilyShare(false)} />
      {/* Profile Modal disabled - users cannot edit profile */}
      {/* {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )} */}
    </aside>
  )
}

export default Sidebar
