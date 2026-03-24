import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { TokenStorage } from '../../lib/security';
import { visitTracker } from '../../lib/visitTracker';
export const ProtectedRoute = () => {
    const location = useLocation();
    if (!TokenStorage.isValid()) {
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    return _jsx(Outlet, {});
};
export const PublicRoute = () => {
    if (TokenStorage.isValid()) {
        return _jsx(Navigate, { to: "/dashboard", replace: true });
    }
    visitTracker.markVisited();
    return _jsx(Outlet, {});
};
