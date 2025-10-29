import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Container from './UI/Container';
import GlassCard from './UI/GlassCard';

/**
 * ProtectedRoute component for handling authentication and authorization
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} props.allowedRoles - Array of roles allowed to access this route
 * @param {boolean} props.requireMembership - Whether valid membership is required
 * @param {boolean} props.requirePremium - Whether premium membership is required
 * @param {string} props.redirectTo - Where to redirect if not authorized (default: '/login')
 */
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [], 
  requireMembership = false,
  requirePremium = false,
  redirectTo = '/login' 
}) => {
  const { user, loading, isAuthenticated, hasValidMembership, isPremiumMember } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <GlassCard className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </GlassCard>
        </Container>
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <GlassCard className="text-center p-8">
            <div className="text-red-400 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-white/80 mb-6">
              You don't have permission to access this page.
            </p>
            <p className="text-white/60 text-sm">
              Required role: {allowedRoles.join(' or ')} | Your role: {user.role}
            </p>
            <button 
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
            >
              Go Back
            </button>
          </GlassCard>
        </Container>
      </div>
    );
  }

  // Check membership requirements
  if (requireMembership && !hasValidMembership && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <GlassCard className="text-center p-8">
            <div className="text-yellow-400 text-6xl mb-4">💳</div>
            <h2 className="text-2xl font-bold text-white mb-4">Membership Required</h2>
            <p className="text-white/80 mb-6">
              You need an active membership to access this page.
            </p>
            {user.membership ? (
              <p className="text-white/60 text-sm mb-4">
                Your {user.membership.name} membership expired on{' '}
                {new Date(user.membership.valid_until).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-white/60 text-sm mb-4">
                You don't have any active membership.
              </p>
            )}
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/membership'}
                className="px-6 py-2 bg-royal-gold text-white rounded-lg hover:bg-royal-gold/80 transition-colors"
              >
                Get Membership
              </button>
              <button 
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Go Back
              </button>
            </div>
          </GlassCard>
        </Container>
      </div>
    );
  }

  // Check premium membership requirement
  if (requirePremium && !isPremiumMember && user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-bl from-royal-gold via-royal-blue to-royal-blue-light flex items-center justify-center">
        <Container>
          <GlassCard className="text-center p-8">
            <div className="text-purple-400 text-6xl mb-4">👑</div>
            <h2 className="text-2xl font-bold text-white mb-4">Premium Membership Required</h2>
            <p className="text-white/80 mb-6">
              This feature is exclusive to premium members.
            </p>
            {user.membership?.name === 'basic' ? (
              <p className="text-white/60 text-sm mb-4">
                Upgrade your basic membership to premium to access this content.
              </p>
            ) : (
              <p className="text-white/60 text-sm mb-4">
                Get a premium membership to unlock exclusive deals and features.
              </p>
            )}
            <div className="space-x-4">
              <button 
                onClick={() => window.location.href = '/membership'}
                className="px-6 py-2 bg-royal-gold text-white rounded-lg hover:bg-royal-gold/80 transition-colors"
              >
                {user.membership?.name === 'basic' ? 'Upgrade to Premium' : 'Get Premium'}
              </button>
              <button 
                onClick={() => window.history.back()}
                className="px-6 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors"
              >
                Go Back
              </button>
            </div>
          </GlassCard>
        </Container>
      </div>
    );
  }

  // User is authorized, render the protected content
  return children;
};

export default ProtectedRoute;
