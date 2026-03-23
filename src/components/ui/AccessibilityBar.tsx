import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { screenReader } from '../../lib/screenReader'

const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/dashboard':  'Dashboard page. Your financial overview.',
  '/expenses':   'Expenses page. View and add your spending.',
  '/income':     'Income page. Track money you receive.',
  '/transfers':  'Transfers page. Move money between accounts.',
  '/debts':      'Debts page. Track loans and receivables.',
  '/budget':     'Budget page. Set and monitor spending limits.',
  '/statistics': 'Statistics page. Charts and financial trends.',
  '/calendar':   'Calendar page. See transactions by date.',
  '/accounts':   'Accounts page. Manage your cards and wallets.',
  '/categories': 'Categories page. Manage spending categories.',
  '/community':  'Community page. Read and leave comments.',
  '/notes':      'Notes page. Your personal financial notes.',
}

export const AccessibilityBar = () => {
  const location = useLocation()
  const [active, setActive] = useState(screenReader.isActive)

  useEffect(() => {
    const handler = (e: Event) => {
      setActive((e as CustomEvent<boolean>).detail)
    }
    window.addEventListener('accessibility-changed', handler)
    return () => window.removeEventListener('accessibility-changed', handler)
  }, [])

  // Read page name on navigation
  useEffect(() => {
    if (active && PAGE_DESCRIPTIONS[location.pathname]) {
      screenReader.speak(PAGE_DESCRIPTIONS[location.pathname])
    }
  }, [location.pathname, active])

  if (!active) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      background: '#1e293b',
      borderBottom: '2px solid #7c3aed',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 999,
      fontSize: 13,
      color: 'white',
    }}>
      <span>
        ♿ Accessibility mode ON — Screen reader active
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => screenReader.stop()}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: 6,
            padding: '4px 10px', color: 'white',
            cursor: 'pointer', fontSize: 12,
          }}
        >
          ⏸ Pause
        </button>
        <button
          onClick={() => screenReader.speak(
            PAGE_DESCRIPTIONS[location.pathname] || 'Current page', true
          )}
          style={{
            background: 'rgba(124,58,237,0.3)',
            border: 'none', borderRadius: 6,
            padding: '4px 10px', color: 'white',
            cursor: 'pointer', fontSize: 12,
          }}
        >
          🔁 Re-read
        </button>
        <button
          onClick={() => {
            screenReader.disable()
            setActive(false)
          }}
          style={{
            background: 'rgba(239,68,68,0.3)',
            border: 'none', borderRadius: 6,
            padding: '4px 10px', color: 'white',
            cursor: 'pointer', fontSize: 12,
          }}
        >
          ✕ Turn off
        </button>
      </div>
    </div>
  )
}
