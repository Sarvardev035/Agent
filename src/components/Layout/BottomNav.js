import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { startTransition, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, TrendingDown, TrendingUp, ArrowLeftRight, HandCoins, PieChart, BarChart3, Calendar, LogOut, } from 'lucide-react';
import MobileMenuButton from '../ui/MobileMenuButton';
import LanguageTranslator from '../ui/LanguageTranslator';
import { screenReader } from '../../lib/screenReader';
const BottomNav = ({ onRequestLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showMore, setShowMore] = useState(false);
    const tabs = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
        { path: '/expenses', icon: TrendingDown, label: 'Expenses' },
        { path: '/income', icon: TrendingUp, label: 'Income' },
        { path: '/transfers', icon: ArrowLeftRight, label: 'Transfer' },
        { action: () => startTransition(() => setShowMore(true)), label: 'More' },
    ];
    const moreItems = [
        { path: '/debts', label: 'Debts', icon: HandCoins },
        { path: '/budget', label: 'Budget', icon: PieChart },
        { path: '/statistics', label: 'Statistics', icon: BarChart3 },
        { path: '/calendar', label: 'Calendar', icon: Calendar },
        { path: '/community', label: 'Community', icon: Calendar },
        { path: '/notes', label: 'Notes', icon: PieChart },
    ];
    return (_jsxs(_Fragment, { children: [_jsx("nav", { className: "safe-bottom bottom-nav", style: {
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'var(--surface-strong)',
                    borderTop: '1px solid var(--border)',
                    height: 64,
                    display: 'flex',
                    zIndex: 50,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    backdropFilter: 'blur(18px) saturate(145%)',
                }, children: tabs.map(tab => {
                    const active = tab.path === location.pathname;
                    return (_jsxs("button", { onClick: () => (tab.action ? tab.action() : tab.path && navigate(tab.path)), onFocus: () => screenReader.speak(`${tab.label} tab`), onMouseEnter: () => screenReader.speak(`${tab.label} tab`), "data-button-reset": "true", style: {
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: active ? '#4b5fe8' : 'var(--text-3)',
                            position: 'relative',
                            fontSize: 10,
                            fontWeight: active ? 700 : 500,
                        }, type: "button", children: ['icon' in tab && tab.icon ? _jsx(tab.icon, { size: 20 }) : _jsx(MobileMenuButton, { open: showMore }), _jsx("span", { children: tab.label }), active && (_jsx("span", { style: {
                                    position: 'absolute',
                                    bottom: 4,
                                    width: 4,
                                    height: 4,
                                    borderRadius: '50%',
                                    background: '#71e7ff',
                                    boxShadow: '0 0 12px rgba(113,231,255,0.7)',
                                } }))] }, tab.label));
                }) }), _jsx(AnimatePresence, { children: showMore && (_jsxs(_Fragment, { children: [_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, style: { position: 'fixed', inset: 0, background: 'rgba(10,14,28,0.38)', zIndex: 60, backdropFilter: 'blur(10px)' }, onClick: () => startTransition(() => setShowMore(false)) }), _jsxs(motion.div, { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' }, transition: { type: 'spring', damping: 30, stiffness: 300 }, style: {
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'var(--surface-strong)',
                                borderRadius: '20px 20px 0 0',
                                padding: 24,
                                zIndex: 70,
                                borderTop: '1px solid var(--border)',
                                backdropFilter: 'blur(22px) saturate(145%)',
                                boxShadow: 'var(--shadow-lg)',
                            }, children: [_jsx("div", { style: {
                                        width: 32,
                                        height: 4,
                                        background: 'rgba(100,120,255,0.35)',
                                        borderRadius: 2,
                                        margin: '0 auto 20px',
                                    } }), _jsxs("div", { style: {
                                        padding: '12px 14px',
                                        borderRadius: 14,
                                        border: '1px solid var(--border)',
                                        background: 'var(--surface)',
                                        marginBottom: 10,
                                    }, children: [_jsx("div", { style: { fontSize: 12, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }, children: "Live language" }), _jsx(LanguageTranslator, {})] }), _jsxs("div", { style: { display: 'grid', gap: 10 }, children: [moreItems.map(item => (_jsxs("button", { onClick: () => {
                                                navigate(item.path);
                                                startTransition(() => setShowMore(false));
                                            }, onFocus: () => screenReader.speak(`${item.label} page`), onMouseEnter: () => screenReader.speak(`${item.label} page`), style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                padding: '12px 14px',
                                                borderRadius: 12,
                                                border: '1px solid var(--border)',
                                                background: 'var(--surface)',
                                                color: 'var(--text-1)',
                                                fontWeight: 600,
                                                fontSize: 14,
                                                cursor: 'pointer',
                                                backdropFilter: 'blur(14px) saturate(140%)',
                                            }, type: "button", children: [_jsx(item.icon, { size: 18 }), item.label, _jsx("span", { style: { marginLeft: 'auto', color: '#94a3b8' }, children: "\u203A" })] }, item.path))), _jsxs("button", { onClick: () => {
                                                startTransition(() => setShowMore(false));
                                                onRequestLogout();
                                            }, onFocus: () => screenReader.speak('Log out'), onMouseEnter: () => screenReader.speak('Log out'), style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '12px 14px',
                                                borderRadius: 12,
                                                background: 'transparent',
                                                fontWeight: 700,
                                                fontSize: 14,
                                                cursor: 'pointer',
                                            }, className: "logout-button", type: "button", children: [_jsx(LogOut, { size: 18 }), "Logout"] })] })] })] })) })] }));
};
export default BottomNav;
