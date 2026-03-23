import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { TokenStorage } from '../../lib/security'
import { visitTracker } from '../../lib/visitTracker'

export const ProtectedRoute = () => {
  const location = useLocation()
  if (!TokenStorage.isValid()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return <Outlet />
}

export const PublicRoute = () => {
  if (TokenStorage.isValid()) {
    return <Navigate to="/dashboard" replace />
  }
  visitTracker.markVisited()
  return <Outlet />
}
