import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { sounds } from '../../lib/sounds';
export function ThemeToggle({ compact = false }) {
    const { isDark, setTheme } = useTheme();
    return (_jsx("button", { type: "button", className: `theme-switch${isDark ? ' is-dark' : ''}${compact ? ' is-compact' : ''}`, onClick: () => {
            setTheme(isDark ? 'light' : 'dark');
            sounds.click();
        }, title: isDark ? 'Switch to light theme' : 'Switch to dark theme', "aria-label": isDark ? 'Switch to light theme' : 'Switch to dark theme', "data-button-reset": "true", children: _jsxs("span", { className: "theme-switch__face", children: [_jsx("span", { className: "theme-switch__shine" }), _jsxs("span", { className: "theme-switch__content", children: [isDark ? _jsx(Moon, { size: 16, className: "theme-switch__icon" }) : _jsx(Sun, { size: 16, className: "theme-switch__icon" }), _jsx("span", { className: "theme-switch__label", children: compact ? (isDark ? 'Dark' : 'Light') : (isDark ? 'Dark Mode' : 'Light Mode') })] }), _jsx("span", { className: "theme-switch__state", children: isDark ? 'ON' : 'OFF' })] }) }));
}
