import { supabase } from './supabase';

// Authentication helper functions

/**
 * Login with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Logout current user
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get current session
 * @returns {Promise<{session: any, user: any}>}
 */
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      return { session: null, user: null };
    }

    return { session, user: session?.user || null };
  } catch (error) {
    console.error('Session check error:', error);
    return { session: null, user: null };
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  const { session } = await getCurrentSession();
  return !!session;
};

/**
 * Get user profile from backend API
 * @param {string} accessToken 
 * @returns {Promise<{success: boolean, data?: any, error?: string}>}
 */
export const getUserProfile = async (accessToken) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Check if user has a specific role
 * @param {object} user 
 * @param {string} role 
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  return user?.role === role;
};

/**
 * Check if user is admin
 * @param {object} user 
 * @returns {boolean}
 */
export const isAdmin = (user) => {
  return hasRole(user, 'admin');
};

/**
 * Check if user is member
 * @param {object} user 
 * @returns {boolean}
 */
export const isMember = (user) => {
  return hasRole(user, 'member');
};

/**
 * Check if user has valid membership
 * @param {object} user 
 * @returns {boolean}
 */
export const hasValidMembership = (user) => {
  if (!user?.membership) return false;
  
  const today = new Date();
  const validUntil = new Date(user.membership.valid_until);
  
  return validUntil > today;
};

/**
 * Check if user has premium membership
 * @param {object} user 
 * @returns {boolean}
 */
export const isPremiumMember = (user) => {
  return user?.membership?.name === 'premium' && hasValidMembership(user);
};

/**
 * Check if user has basic membership
 * @param {object} user 
 * @returns {boolean}
 */
export const isBasicMember = (user) => {
  return user?.membership?.name === 'basic' && hasValidMembership(user);
};

/**
 * Get membership status text
 * @param {object} user 
 * @returns {string}
 */
export const getMembershipStatus = (user) => {
  if (!user) return 'Not logged in';
  if (isAdmin(user)) return 'Admin';
  if (!user.membership) return 'No membership';
  if (!hasValidMembership(user)) return 'Membership expired';
  
  return `${user.membership.name.charAt(0).toUpperCase() + user.membership.name.slice(1)} Member`;
};

/**
 * Format membership expiry date
 * @param {object} user 
 * @returns {string}
 */
export const formatMembershipExpiry = (user) => {
  if (!user?.membership?.valid_until) return 'N/A';
  
  const date = new Date(user.membership.valid_until);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if membership expires soon (within 30 days)
 * @param {object} user 
 * @returns {boolean}
 */
export const membershipExpiresSoon = (user) => {
  if (!user?.membership?.valid_until) return false;
  
  const today = new Date();
  const validUntil = new Date(user.membership.valid_until);
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  return validUntil <= thirtyDaysFromNow && validUntil > today;
};
