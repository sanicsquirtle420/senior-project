import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
};

export function AdminRoute({ children }) {
    const { user } = useAuth() ;
    if(!user) return <Navigate to="/login" replace /> ;
    if (user.role !== "admin") return <Navigate to="/dashboard" replace /> ;
    return children ;
}