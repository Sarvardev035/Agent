import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { TokenStorage } from '../../lib/security'

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
  return <Outlet />
}
