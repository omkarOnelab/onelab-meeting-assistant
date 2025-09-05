import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  redirectTo = '/non-auth/login' 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const location = useLocation();
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    // Check authentication status only once when component mounts
    // Use ref to prevent multiple calls
    if (!isAuthenticated && !isLoading && !hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuth();
    }
  }, [isAuthenticated, isLoading]); // Removed checkAuth from dependencies

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required and user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If authentication is NOT required and user IS authenticated (e.g., login page)
  if (!requireAuth && isAuthenticated) {
    // Redirect to meetings page
    return <Navigate to="/auth/meetings" replace />;
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
};

export default ProtectedRoute;
