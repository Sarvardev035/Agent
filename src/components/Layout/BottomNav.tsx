import { NavLink } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import type { ComponentType } from 'react'

type Tab = { label: string; path: string; icon: ComponentType<{ size?: number }> }

interface Props {
  tabs: Tab[]
  onMoreOpen: () => void
}

const BottomNav = ({ tabs, onMoreOpen }: Props) => {
  return (
    <nav
      className="safe-bottom"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: '#ffffff',
        borderTop: '1px solid var(--border)',
        padding: '10px 12px 8px',
        display: 'grid',
        gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0,1fr))`,
        gap: 8,
        zIndex: 50,
      }}
    >
      {tabs.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          style={{ textDecoration: 'none' }}
        >
          {({ isActive }) => (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 4px',
                borderRadius: 12,
                textDecoration: 'none',
                color: isActive ? '#2563eb' : '#475569',
                background: isActive ? '#eff6ff' : 'transparent',
                fontSize: 12,
                fontWeight: 600,
                position: 'relative',
              }}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
              {isActive && (
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#2563eb',
                    position: 'absolute',
                    top: 6,
                    right: 14,
                    boxShadow: '0 0 0 6px rgba(37,99,235,0.12)',
                  }}
                />
              )}
            </div>
          )}
        </NavLink>
      ))}

      <button
        onClick={onMoreOpen}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          padding: '8px 4px',
          borderRadius: 12,
          border: '1px dashed var(--border)',
          background: '#f8fafc',
          color: '#0f172a',
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer',
        }}
        type="button"
      >
        <MoreHorizontal size={18} />
        <span>More</span>
      </button>
    </nav>
  )
}

export default BottomNav
