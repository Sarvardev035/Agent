import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute, PublicRoute } from './components/guards/ProtectedRoute'
import { useAuthStore } from './store/auth.store'
import AppShell from './components/Layout/AppShell'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Income from './pages/Income'
import Transfers from './pages/Transfers'
import Debts from './pages/Debts'
import Budget from './pages/Budget'
import Statistics from './pages/Statistics'
import CalendarView from './pages/CalendarView'
import Accounts from './pages/Accounts'
import Categories from './pages/Categories'
import VRMode from './pages/VRMode'
import Community from './pages/Community'
import Notes from './pages/Notes'
import { seedDefaultCategories } from './lib/seedCategories'
import NetworkStatus from './components/ui/NetworkStatus'
import './index.css'

export default function App() {
  const initAuth = useAuthStore(s => s.initAuth)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  useEffect(() => { void initAuth() }, [initAuth])
  useEffect(() => {
    if (isAuthenticated) seedDefaultCategories()
  }, [isAuthenticated])

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="liquid-scene" aria-hidden="true">
          <span className="liquid-scene__blob liquid-scene__blob--1" />
          <span className="liquid-scene__blob liquid-scene__blob--2" />
          <span className="liquid-scene__blob liquid-scene__blob--3" />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
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
            error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' }, duration: 4000 },
          }}
        />
        <NetworkStatus />
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route path="/expenses"   element={<Expenses />} />
                <Route path="/income"     element={<Income />} />
                <Route path="/transfers"  element={<Transfers />} />
                <Route path="/debts"      element={<Debts />} />
                <Route path="/budget"     element={<Budget />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/calendar"   element={<CalendarView />} />
                <Route path="/accounts"   element={<Accounts />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/community" element={<Community />} />
                <Route path="/notes" element={<Notes />} />
              </Route>
              <Route path="/vr" element={<VRMode />} />
            </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
