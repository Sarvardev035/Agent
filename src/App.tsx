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
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
          duration: 3000,
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
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
