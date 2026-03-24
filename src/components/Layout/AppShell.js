import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { startTransition, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { differenceInCalendarDays } from 'date-fns';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useRouteScrollReveal } from '../../hooks/useRouteScrollReveal';
import api from '../../lib/api';
import { safeArray } from '../../lib/helpers';
import BrandLogo from '../ui/BrandLogo';
import { useAuthStore } from '../../store/auth.store';
import Chatbot from '../Chatbot/Chatbot';
import { AccessibilityBar } from '../ui/AccessibilityBar';
import { GlobalSearch } from '../ui/GlobalSearch';
import { SoundButton } from '../ui/SoundButton';
import { debtsApi } from '../../api/debtsApi';
import { sounds } from '../../lib/sounds';
const AppShell = () => {
    const location = useLocation();
    const isCompactLayout = useMediaQuery('(max-width: 1024px)');
    const isMobile = useMediaQuery('(max-width: 768px)');
    const isDesktopCondensed = useMediaQuery('(max-width: 1280px)');
    const [notifications, setNotifications] = useState([]);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [searchOpenOnMobile, setSearchOpenOnMobile] = useState(false);
    const routeContentRef = useRef(null);
    const logout = useAuthStore(state => state.logout);
    const sidebarWidth = isCompactLayout ? 0 : isDesktopCondensed ? 64 : 240;
    useRouteScrollReveal(routeContentRef, location.pathname);
    useEffect(() => {
        let cancelled = false;
        api.get('/api/notifications')
            .then(res => {
            if (!cancelled)
                setNotifications(safeArray(res.data));
        })
            .catch(() => { });
        return () => { cancelled = true; };
    }, []);
    useEffect(() => {
        const THRESHOLD_DAYS = 2;
        const REMINDER_KEY = 'finly_debt_reminders';
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        const checkDebtReminders = async () => {
            try {
                const response = await debtsApi.getAll({ status: 'OPEN' });
                const debts = safeArray(response.data);
                const stored = JSON.parse(localStorage.getItem(REMINDER_KEY) || '{}');
                let changed = false;
                debts.forEach((debt) => {
                    const debtId = String(debt.id ?? '');
                    const dueDate = String(debt.dueDate ?? '');
                    if (!debtId || !dueDate)
                        return;
                    const daysLeft = differenceInCalendarDays(new Date(dueDate), new Date());
                    if (daysLeft > THRESHOLD_DAYS)
                        return;
                    const lastShownAt = stored[debtId] || 0;
                    const shouldNotify = Date.now() - lastShownAt > ONE_DAY_MS;
                    if (!shouldNotify)
                        return;
                    const label = daysLeft < 0 ? `${Math.abs(daysLeft)} day(s) overdue` : `${daysLeft} day(s) left`;
                    const direction = debt.type === 'DEBT' ? `to ${debt.personName}` : `from ${debt.personName}`;
                    toast(`Debt reminder: ${label} • ${direction}`, {
                        icon: '⏰',
                        duration: 5000,
                    });
                    sounds.notification();
                    stored[debtId] = Date.now();
                    changed = true;
                });
                if (changed) {
                    localStorage.setItem(REMINDER_KEY, JSON.stringify(stored));
                }
            }
            catch {
                // Keep silent to avoid noisy reminders when backend is unavailable.
            }
        };
        void checkDebtReminders();
        const timer = window.setInterval(() => {
            void checkDebtReminders();
        }, 60000);
        return () => {
            window.clearInterval(timer);
        };
    }, []);
    const handleRequestLogout = () => {
        startTransition(() => setShowLogoutConfirm(true));
    };
    const handleConfirmLogout = () => {
        if (loggingOut)
            return;
        setLoggingOut(true);
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        }
        catch { }
        window.setTimeout(() => {
            logout();
        }, 300);
    };
    return (_jsxs("div", { className: "app-shell-root min-h-screen bg-slate-100", children: [_jsx(AccessibilityBar, {}), !isCompactLayout && (_jsx(Sidebar, { collapsed: isDesktopCondensed, onRequestLogout: handleRequestLogout })), _jsxs("main", { className: "app-shell-main", style: {
                    marginLeft: sidebarWidth,
                    width: isCompactLayout ? '100%' : `calc(100% - ${sidebarWidth}px)`,
                    padding: isCompactLayout ? '12px 12px 88px' : '24px 32px',
                    minHeight: '100vh',
                    maxWidth: '100%',
                    overflowX: 'hidden',
                    boxSizing: 'border-box',
                }, children: [isCompactLayout && (_jsxs("header", { className: "mobile-header", style: {
                            position: 'sticky',
                            top: 0,
                            zIndex: 20,
                            padding: '10px 14px',
                            background: 'var(--surface-strong)',
                            backdropFilter: 'blur(18px) saturate(145%)',
                            borderBottom: '1px solid var(--border)',
                            marginBottom: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            borderRadius: 18,
                            boxShadow: 'var(--shadow-sm)',
                        }, children: [!searchOpenOnMobile && _jsx(BrandLogo, {}), _jsx("div", { style: { flex: searchOpenOnMobile ? 1 : 'unset' }, children: _jsx(GlobalSearch, { onOpenChange: setSearchOpenOnMobile }) }), isMobile && !searchOpenOnMobile && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx(SoundButton, {}), _jsxs("button", { type: "button", "aria-label": "Notifications", "data-button-reset": "true", style: {
                                            width: 38,
                                            height: 38,
                                            borderRadius: 12,
                                            border: '1px solid var(--border)',
                                            background: 'var(--surface)',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--text-1)',
                                            position: 'relative',
                                            backdropFilter: 'blur(14px) saturate(145%)',
                                            boxShadow: 'var(--shadow-sm)',
                                        }, children: [_jsx(Bell, { size: 18 }), notifications.length > 0 && (_jsx("span", { style: {
                                                    position: 'absolute', top: -4, right: -4,
                                                    background: '#ef4444', color: 'white',
                                                    width: 18, height: 18, borderRadius: '50%',
                                                    fontSize: 10, fontWeight: 700,
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'center',
                                                }, children: notifications.length > 9 ? '9+' : notifications.length }))] })] }))] })), !isCompactLayout && (_jsx("div", { style: {
                            position: 'sticky',
                            top: 0,
                            zIndex: 30,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            padding: '12px 32px',
                            margin: '-24px -32px 16px',
                            background: 'inherit',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            borderBottom: '1px solid var(--border)',
                        }, children: _jsx(GlobalSearch, {}) })), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { ref: routeContentRef, className: "route-scroll-shell", initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 }, transition: { duration: 0.2 }, children: _jsx(Outlet, {}) }, location.pathname) })] }), showLogoutConfirm && (_jsx("div", { onClick: e => {
                    if (e.target === e.currentTarget) {
                        startTransition(() => setShowLogoutConfirm(false));
                    }
                }, style: {
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16, zIndex: 999,
                    animation: 'fadeIn 0.2s ease-out',
                }, children: _jsxs("div", { style: {
                        background: 'var(--card-bg)',
                        borderRadius: 28,
                        padding: '36px 32px',
                        maxWidth: 360, width: '100%',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
                        animation: 'slideUpBounce 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        textAlign: 'center',
                    }, children: [_jsxs("div", { style: {
                                width: 80, height: 80,
                                borderRadius: 24,
                                background: 'linear-gradient(135deg,#1e293b,#334155)',
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                position: 'relative',
                                overflow: 'hidden',
                                border: '1px solid rgba(255,255,255,0.1)',
                            }, children: [_jsx("div", { style: {
                                        position: 'absolute', inset: 0,
                                        background: 'linear-gradient(90deg,' +
                                            'transparent 0%,' +
                                            'rgba(255,255,255,0.08) 50%,' +
                                            'transparent 100%)',
                                        animation: 'shimmerSweep 2s ease-in-out infinite',
                                    } }), _jsx("span", { style: {
                                        fontSize: 36,
                                        animation: 'doorWiggle 0.5s ease-in-out 0.5s',
                                    }, children: "\uD83D\uDEAA" })] }), _jsx("h3", { style: {
                                fontSize: 22, fontWeight: 800,
                                color: 'var(--text-1)',
                                margin: '0 0 10px',
                                letterSpacing: '-0.02em',
                            }, children: "Leaving so soon?" }), _jsxs("p", { style: {
                                fontSize: 14, color: 'var(--text-3)',
                                margin: '0 0 28px', lineHeight: 1.6,
                            }, children: ["Are you sure you want to log out of", ' ', _jsx("strong", { style: { color: 'var(--text-2)' }, children: "Finly" }), "?"] }), _jsxs("div", { style: {
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: 10,
                            }, children: [_jsx("button", { onClick: () => startTransition(() => setShowLogoutConfirm(false)), style: {
                                        height: 48, borderRadius: 14,
                                        border: '1.5px solid var(--border)',
                                        background: 'var(--surface)',
                                        color: 'var(--text-2)',
                                        fontSize: 15, fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 6,
                                        position: 'relative', overflow: 'hidden',
                                    }, onMouseEnter: e => {
                                        e.currentTarget.style.transform =
                                            'scale(1.04) translateY(-2px)';
                                        e.currentTarget.style.boxShadow =
                                            '0 8px 20px rgba(0,0,0,0.12)';
                                        e.currentTarget.style.borderColor = '#7c3aed';
                                        e.currentTarget.style.color = '#7c3aed';
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.color = 'var(--text-2)';
                                    }, onMouseDown: e => {
                                        const btn = e.currentTarget;
                                        const ripple = document.createElement('span');
                                        const rect = btn.getBoundingClientRect();
                                        const size = Math.max(rect.width, rect.height);
                                        ripple.style.cssText = `
                    position:absolute;
                    width:${size}px; height:${size}px;
                    left:${e.clientX - rect.left - size / 2}px;
                    top:${e.clientY - rect.top - size / 2}px;
                    background:rgba(124,58,237,0.15);
                    border-radius:50%;
                    transform:scale(0);
                    animation:rippleOut 0.5s ease-out forwards;
                    pointer-events:none;
                  `;
                                        btn.appendChild(ripple);
                                        setTimeout(() => ripple.remove(), 500);
                                        e.currentTarget.style.transform = 'scale(0.97)';
                                    }, onMouseUp: e => e.currentTarget.style.transform =
                                        'scale(1.04) translateY(-2px)', children: "Stay \uD83D\uDE0A" }), _jsx("button", { onClick: handleConfirmLogout, disabled: loggingOut, style: {
                                        height: 48, borderRadius: 14, border: 'none',
                                        background: 'linear-gradient(135deg,#ef4444 0%,#dc2626 100%)',
                                        color: 'white',
                                        fontSize: 15, fontWeight: 700,
                                        cursor: loggingOut ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.18s cubic-bezier(0.4,0,0.2,1)',
                                        boxShadow: '0 4px 16px rgba(239,68,68,0.4)',
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: 6,
                                        position: 'relative', overflow: 'hidden',
                                    }, onMouseEnter: e => {
                                        if (loggingOut)
                                            return;
                                        e.currentTarget.style.transform =
                                            'scale(1.04) translateY(-2px)';
                                        e.currentTarget.style.boxShadow =
                                            '0 10px 28px rgba(239,68,68,0.55), ' +
                                                '0 0 0 4px rgba(239,68,68,0.15)';
                                    }, onMouseLeave: e => {
                                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        e.currentTarget.style.boxShadow =
                                            '0 4px 16px rgba(239,68,68,0.4)';
                                    }, onMouseDown: e => {
                                        if (loggingOut)
                                            return;
                                        const btn = e.currentTarget;
                                        const ripple = document.createElement('span');
                                        const rect = btn.getBoundingClientRect();
                                        const size = Math.max(rect.width, rect.height);
                                        ripple.style.cssText = `
                    position:absolute;
                    width:${size}px; height:${size}px;
                    left:${e.clientX - rect.left - size / 2}px;
                    top:${e.clientY - rect.top - size / 2}px;
                    background:rgba(255,255,255,0.25);
                    border-radius:50%;
                    transform:scale(0);
                    animation:rippleOut 0.5s ease-out forwards;
                    pointer-events:none;
                  `;
                                        btn.appendChild(ripple);
                                        setTimeout(() => ripple.remove(), 500);
                                        e.currentTarget.style.transform = 'scale(0.97)';
                                    }, onMouseUp: e => e.currentTarget.style.transform =
                                        'scale(1.04) translateY(-2px)', children: loggingOut ? (_jsxs(_Fragment, { children: [_jsx("div", { style: {
                                                    width: 14, height: 14,
                                                    border: '2px solid rgba(255,255,255,0.4)',
                                                    borderTopColor: 'white',
                                                    borderRadius: '50%',
                                                    animation: 'spin 0.8s linear infinite',
                                                } }), "Logging out..."] })) : (_jsx(_Fragment, { children: "Log out \uD83D\uDEAA" })) })] })] }) })), _jsx(Chatbot, {}), isCompactLayout && _jsx(BottomNav, { onRequestLogout: handleRequestLogout })] }));
};
export default AppShell;
