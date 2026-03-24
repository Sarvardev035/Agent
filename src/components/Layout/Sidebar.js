import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, TrendingDown, TrendingUp, ArrowLeftRight, HandCoins, PieChart, BarChart3, Calendar, LogOut, ChevronUp, Settings2, Wallet, } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import BrandLogo from '../ui/BrandLogo';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageTranslator from '../ui/LanguageTranslator';
import { SoundButton } from '../ui/SoundButton';
import { UserProfileStorage } from '../../lib/security';
import { onAccessibilityChange, screenReader } from '../../lib/screenReader';
import { SessionsModal } from './SessionsModal';
import { FamilyShareModal } from './FamilyShareModal';
const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, group: 'MAIN' },
    { label: 'Accounts', path: '/accounts', icon: Wallet, group: 'MAIN' },
    { label: 'Expenses', path: '/expenses', icon: TrendingDown, group: 'MAIN' },
    { label: 'Income', path: '/income', icon: TrendingUp, group: 'MAIN' },
    { label: 'Transfers', path: '/transfers', icon: ArrowLeftRight, group: 'MAIN' },
    { label: 'Debts', path: '/debts', icon: HandCoins, group: 'MANAGE' },
    { label: 'Budget', path: '/budget', icon: PieChart, group: 'MANAGE' },
    { label: 'Statistics', path: '/statistics', icon: BarChart3, group: 'MANAGE' },
    { label: 'Calendar', path: '/calendar', icon: Calendar, group: 'MANAGE' },
];
const CommunityIcon = ({ size = 18 }) => (_jsx("span", { style: { fontSize: Math.max(12, size - 2), lineHeight: 1 }, children: "\uD83D\uDCAC" }));
const NotesIcon = ({ size = 18 }) => (_jsx("span", { style: { fontSize: Math.max(12, size - 2), lineHeight: 1 }, children: "\uD83D\uDCDD" }));
const Sidebar = ({ collapsed, onRequestLogout }) => {
    const navigate = useNavigate();
    const authStore = useAuthStore();
    const user = authStore.user;
    const { isDark } = useTheme();
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [showSessions, setShowSessions] = useState(false);
    const [showFamilyShare, setShowFamilyShare] = useState(false);
    const [accessibilityActive, setAccessibilityActive] = useState(screenReader.isActive());
    const settingsRef = useRef(null);
    const isTablet = Boolean(collapsed);
    const storedProfile = UserProfileStorage.get();
    const storedName = storedProfile.name;
    const storedEmail = storedProfile.email;
    const displayName = user?.name || storedName || 'User';
    const displayEmail = user?.email || storedEmail || '';
    const initials = useMemo(() => displayName
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U', [displayName]);
    const navItems = useMemo(() => [
        ...NAV_ITEMS,
        { label: 'Community', path: '/community', icon: CommunityIcon, group: 'MANAGE' },
        { label: 'Notes', path: '/notes', icon: NotesIcon, group: 'MANAGE' },
    ], []);
    useEffect(() => {
        const handler = (e) => {
            if (settingsRef.current && !settingsRef.current.contains(e.target)) {
                setSettingsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    useEffect(() => onAccessibilityChange(setAccessibilityActive), []);
    return (_jsxs("aside", { style: {
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
        }, children: [_jsx("div", { style: {
                    padding: collapsed ? '18px 12px' : '20px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    borderBottom: '1px solid var(--border)',
                }, children: _jsx(BrandLogo, { compact: collapsed }) }), _jsx("nav", { style: { flex: 1, overflowY: 'auto', padding: collapsed ? '10px 6px' : '14px 12px' }, children: ['MAIN', 'MANAGE'].map(group => (_jsxs("div", { style: { marginBottom: 10 }, children: [!collapsed && (_jsx("div", { style: {
                                fontSize: 10,
                                letterSpacing: '0.14em',
                                fontWeight: 700,
                                color: 'rgba(255,255,255,0.36)',
                                padding: '10px 10px 6px',
                                textTransform: 'uppercase',
                            }, children: group })), navItems.filter(i => i.group === group).map(item => (_jsxs(NavLink, { to: item.path, onFocus: () => screenReader.speak(`${item.label} page link`), onMouseEnter: () => screenReader.speak(`${item.label} page link`), style: ({ isActive }) => ({
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
                            }), children: [_jsx(item.icon, { size: 18 }), !collapsed && item.label] }, item.path)))] }, group))) }), _jsxs("div", { ref: settingsRef, style: {
                    padding: isTablet ? '12px 8px' : '12px 8px',
                    borderTop: '1px solid var(--border)',
                    flexShrink: 0,
                    position: 'relative',
                    overflow: 'visible',
                }, children: [!isTablet && (_jsxs("div", { style: {
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
                        }, onMouseEnter: () => { }, onMouseLeave: () => { }, children: [_jsxs("div", { style: { position: 'relative', flexShrink: 0 }, children: [_jsx("div", { style: {
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
                                        }, children: initials }), _jsx("div", { style: {
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            width: 10,
                                            height: 10,
                                            borderRadius: '50%',
                                            background: '#10b981',
                                            border: '2px solid #0a1628',
                                        } })] }), _jsxs("div", { style: { minWidth: 0, flex: 1 }, children: [_jsx("div", { style: {
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: 13,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }, children: displayName }), _jsx("div", { style: {
                                            color: 'rgba(255,255,255,0.4)',
                                            fontSize: 10,
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }, children: displayEmail })] }), _jsx("span", { style: {
                                    fontSize: 12,
                                    color: 'rgba(255,255,255,0.3)',
                                    flexShrink: 0,
                                }, children: "\u270E" })] })), _jsxs("button", { type: "button", "data-button-reset": "true", className: `settings-launcher${settingsOpen ? ' is-open' : ''}`, onClick: () => startTransition(() => setSettingsOpen(prev => !prev)), onFocus: () => screenReader.speak('Open settings panel'), onMouseEnter: () => screenReader.speak('Open settings panel'), style: {
                            width: '100%',
                            justifyContent: isTablet ? 'center' : 'flex-start',
                            padding: isTablet ? '12px 0' : '12px 14px',
                        }, children: [_jsx("span", { className: "settings-launcher__icon-wrap", children: _jsx(Settings2, { size: 18, className: "settings-launcher__icon" }) }), !isTablet && _jsx("span", { style: { flex: 1, textAlign: 'left' }, children: "Settings" }), !isTablet && (_jsx(ChevronUp, { size: 14, style: {
                                    opacity: 0.72,
                                    transform: settingsOpen ? 'rotate(0deg)' : 'rotate(180deg)',
                                    transition: 'transform 0.2s ease',
                                } }))] }), settingsOpen && (_jsxs("div", { className: "settings-panel", style: {
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
                        }, children: [_jsx("div", { className: "settings-panel__title", children: "Settings" }), _jsxs("div", { className: "settings-panel__row", style: { alignItems: 'flex-start' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }, children: [_jsx("span", { style: { color: '#71e7ff' }, children: "\uD83C\uDF10" }), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 600, color: 'white' }, children: "Language" }), _jsx("div", { style: { fontSize: 10, color: 'rgba(255,255,255,0.45)' }, children: "50+ languages" })] })] }), _jsx(LanguageTranslator, { compact: true })] }), _jsxs("div", { className: "settings-panel__row", style: { alignItems: 'center' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }, children: [_jsx("span", { style: { color: '#a78bfa' }, children: "\uD83D\uDD0A" }), _jsxs("div", { style: { minWidth: 0 }, children: [_jsx("div", { style: { fontSize: 13, fontWeight: 600, color: 'white' }, children: "Sounds" }), _jsx("div", { style: { fontSize: 10, color: 'rgba(255,255,255,0.45)' }, children: "Toggle effects" })] })] }), _jsx(SoundButton, {})] }), _jsx("div", { className: "settings-panel__divider" }), _jsxs("button", { type: "button", "data-button-reset": "true", onClick: () => setShowSessions(true), className: "settings-panel__logout", style: { color: '#93c5fd' }, onFocus: () => screenReader.speak('View sessions'), onMouseEnter: () => screenReader.speak('View sessions'), children: [_jsx("span", { children: "\u23F1\uFE0F Active Sessions" }), _jsx("span", { style: { fontSize: 10, opacity: 0.5, marginLeft: 'auto' }, children: "View & manage" })] }), _jsxs("button", { type: "button", "data-button-reset": "true", onClick: () => setShowFamilyShare(true), className: "settings-panel__logout", style: { color: '#86efac' }, onFocus: () => screenReader.speak('Family sharing'), onMouseEnter: () => screenReader.speak('Family sharing'), children: [_jsx("span", { children: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 Family Sharing" }), _jsx("span", { style: { fontSize: 10, opacity: 0.5, marginLeft: 'auto' }, children: "Share data" })] }), _jsx("div", { className: "settings-panel__divider" }), _jsxs("button", { type: "button", "data-button-reset": "true", className: "settings-panel__logout", style: { color: '#c4b5fd' }, onClick: () => {
                                    if (accessibilityActive) {
                                        screenReader.disable();
                                    }
                                    else {
                                        screenReader.enable();
                                    }
                                }, onFocus: () => screenReader.speak('Accessibility mode toggle'), onMouseEnter: () => screenReader.speak('Accessibility mode toggle'), children: [_jsx("span", { children: "\u267F Accessibility" }), _jsx("span", { style: { fontSize: 10, opacity: 0.65, marginLeft: 'auto' }, children: accessibilityActive ? 'ON' : 'OFF' })] }), _jsxs("button", { type: "button", "data-button-reset": "true", className: "settings-panel__logout", style: { color: '#93c5fd' }, onClick: () => {
                                    navigate('/vr');
                                    setSettingsOpen(false);
                                }, onFocus: () => screenReader.speak('VR mode'), onMouseEnter: () => screenReader.speak('VR mode'), children: [_jsx("span", { children: "\uD83E\uDD7D VR Mode" }), _jsx("span", { style: { fontSize: 10, opacity: 0.5, marginLeft: 'auto' }, children: "3D" })] }), _jsx("div", { className: "settings-panel__divider" }), _jsxs("button", { type: "button", "data-button-reset": "true", className: "settings-panel__logout", style: { color: '#e2e8f0' }, onClick: () => setShowAbout(true), onFocus: () => screenReader.speak('About Finly'), onMouseEnter: () => screenReader.speak('About Finly'), children: [_jsx("span", { children: "\u2139\uFE0F About" }), _jsx("span", { style: { fontSize: 10, opacity: 0.5, marginLeft: 'auto' }, children: "v1.0" })] }), _jsxs("button", { type: "button", "data-button-reset": "true", className: "settings-panel__logout", onClick: () => {
                                    setSettingsOpen(false);
                                    onRequestLogout();
                                }, onFocus: () => screenReader.speak('Log out'), onMouseEnter: () => screenReader.speak('Log out'), children: [_jsx(LogOut, { size: 16 }), _jsx("span", { children: "Log out" })] })] }))] }), showAbout && (_jsx("div", { onClick: e => {
                    if (e.target === e.currentTarget)
                        setShowAbout(false);
                }, style: {
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(2,6,23,0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                }, children: _jsx("div", { style: {
                        width: 'min(560px, 100%)',
                        borderRadius: 20,
                        border: '1px solid var(--border)',
                        background: 'var(--surface-strong)',
                        boxShadow: 'var(--shadow-lg)',
                    }, children: _jsxs("div", { style: { textAlign: 'center', padding: 24 }, children: [_jsx("div", { style: { fontSize: 60, marginBottom: 12 }, children: "\u26A1" }), _jsx("h2", { style: { margin: '0 0 6px', color: 'var(--text-1)' }, children: "Finly" }), _jsx("p", { style: { margin: '0 0 6px', color: 'var(--text-2)' }, children: "Personal Finance Manager" }), _jsx("p", { style: { margin: '0 0 6px', color: 'var(--text-2)' }, children: "Built for Hackathon 2026" }), _jsx("p", { style: { margin: '0 0 6px', color: 'var(--text-2)' }, children: "Frontend: React + TypeScript + Vite" }), _jsx("p", { style: { margin: '0 0 6px', color: 'var(--text-2)' }, children: "Backend: Java Spring Boot" }), _jsx("p", { style: { margin: '0 0 6px', color: 'var(--text-2)' }, children: "Features: Expenses, Income, Transfers, Debts, Budget, Analytics, VR Mode, Accessibility, Community, Notes" }), _jsx("p", { style: { margin: '0 0 18px', color: 'var(--text-2)' }, children: "Team: Sarvar + Backend Dev" }), _jsx("button", { type: "button", "data-button-reset": "true", onClick: () => setShowAbout(false), style: {
                                    padding: '10px 18px',
                                    borderRadius: 10,
                                    border: '1px solid var(--border)',
                                    background: 'var(--surface)',
                                    color: 'var(--text-1)',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }, children: "Close" })] }) }) })), _jsx(SessionsModal, { isOpen: showSessions, onClose: () => setShowSessions(false) }), _jsx(FamilyShareModal, { isOpen: showFamilyShare, onClose: () => setShowFamilyShare(false) })] }));
};
export default Sidebar;
