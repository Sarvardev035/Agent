import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { sounds } from '../../lib/sounds'

interface ThemeToggleProps {
  compact?: boolean
}

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { isDark, setTheme } = useTheme()

  return (
    <button
      type="button"
      className={`theme-switch${isDark ? ' is-dark' : ''}${compact ? ' is-compact' : ''}`}
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark')
        sounds.click()
      }}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      data-button-reset="true"
    >
      <span className="theme-switch__face">
        <span className="theme-switch__shine" />
        <span className="theme-switch__content">
          {isDark ? <Moon size={16} className="theme-switch__icon" /> : <Sun size={16} className="theme-switch__icon" />}
          <span className="theme-switch__label">
            {compact ? (isDark ? 'Dark' : 'Light') : (isDark ? 'Dark Mode' : 'Light Mode')}
          </span>
        </span>
        <span className="theme-switch__state">
          {isDark ? 'ON' : 'OFF'}
        </span>
      </span>
    </button>
  )
}
