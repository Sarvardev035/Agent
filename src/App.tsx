import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
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
import './index.css'

export default function App() {
  const initAuth = useAuthStore(s => s.initAuth)
  useEffect(() => { initAuth() }, [initAuth])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: 12,
            background: '#0f172a',
            color: '#f8fafc',
            fontFamily: 'Plus Jakarta Sans, sans-serif',
            fontSize: 14,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' }, duration: 3000 },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#ffffff' }, duration: 4000 },
        }}
      />
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
            </Route>
          </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
