import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

export function ThemeToggle() {
  const { isDark, setTheme } = useTheme()

  return (
    <button
      type="button"
      className={`theme-switch${isDark ? ' is-dark' : ''}`}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      data-button-reset="true"
    >
      <span className="theme-switch__track">
        <Sun size={15} className="theme-switch__icon theme-switch__icon--sun" />
        <Moon size={15} className="theme-switch__icon theme-switch__icon--moon" />
        <span className="theme-switch__thumb" />
      </span>
    </button>
  )
}
