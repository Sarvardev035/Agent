import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute, PublicRoute } from './components/guards/ProtectedRoute';
import { useAuthStore } from './store/auth.store';
import AppShell from './components/Layout/AppShell';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Transfers from './pages/Transfers';
import Debts from './pages/Debts';
import Budget from './pages/Budget';
import Statistics from './pages/Statistics';
import CalendarView from './pages/CalendarView';
import Accounts from './pages/Accounts';
import Categories from './pages/Categories';
import VRMode from './pages/VRMode';
import Community from './pages/Community';
import Notes from './pages/Notes';
import { seedDefaultCategories } from './lib/seedCategories';
import NetworkStatus from './components/ui/NetworkStatus';
import { TokenStorage } from './lib/security';
import { visitTracker } from './lib/visitTracker';
import './index.css';
const SmartRedirect = () => {
    if (TokenStorage.isValid()) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    return _jsx(Navigate, { to: visitTracker.getAuthPage(), replace: true });
};
export default function App() {
    const initAuth = useAuthStore(s => s.initAuth);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    useEffect(() => { void initAuth(); }, [initAuth]);
    useEffect(() => {
        if (isAuthenticated)
            seedDefaultCategories();
    }, [isAuthenticated]);
    return (_jsx(ThemeProvider, { children: _jsxs(BrowserRouter, { children: [_jsxs("div", { className: "liquid-scene", "aria-hidden": "true", children: [_jsx("span", { className: "liquid-scene__blob liquid-scene__blob--1" }), _jsx("span", { className: "liquid-scene__blob liquid-scene__blob--2" }), _jsx("span", { className: "liquid-scene__blob liquid-scene__blob--3" })] }), _jsx(Toaster, { position: "top-right", toastOptions: {
                        style: {
                            borderRadius: 14,
                            background: 'rgba(23, 28, 52, 0.78)',
                            color: '#f8fafc',
                            fontFamily: 'Plus Jakarta Sans, sans-serif',
                            fontSize: 14,
                            boxShadow: '0 18px 48px rgba(18,24,43,0.28)',
                            border: '1px solid rgba(255,255,255,0.16)',
                            backdropFilter: 'blur(20px) saturate(150%)',
                        },
                        success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' }, duration: 3000 },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#ffffff' }, duration: 4000 },
                    } }), _jsx(NetworkStatus, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(SmartRedirect, {}) }), _jsxs(Route, { element: _jsx(PublicRoute, {}), children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) })] }), _jsxs(Route, { element: _jsx(ProtectedRoute, {}), children: [_jsxs(Route, { element: _jsx(AppShell, {}), children: [_jsx(Route, { path: "/dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/expenses", element: _jsx(Expenses, {}) }), _jsx(Route, { path: "/income", element: _jsx(Income, {}) }), _jsx(Route, { path: "/transfers", element: _jsx(Transfers, {}) }), _jsx(Route, { path: "/debts", element: _jsx(Debts, {}) }), _jsx(Route, { path: "/budget", element: _jsx(Budget, {}) }), _jsx(Route, { path: "/statistics", element: _jsx(Statistics, {}) }), _jsx(Route, { path: "/calendar", element: _jsx(CalendarView, {}) }), _jsx(Route, { path: "/accounts", element: _jsx(Accounts, {}) }), _jsx(Route, { path: "/categories", element: _jsx(Categories, {}) }), _jsx(Route, { path: "/community", element: _jsx(Community, {}) }), _jsx(Route, { path: "/notes", element: _jsx(Notes, {}) })] }), _jsx(Route, { path: "/vr", element: _jsx(VRMode, {}) })] }), _jsx(Route, { path: "*", element: _jsx(SmartRedirect, {}) })] })] }) }));
}
