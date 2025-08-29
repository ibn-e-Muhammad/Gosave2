// Application-Level Security Middleware for GoSave
// This provides security through application logic instead of RLS

const { supabase } = require('../config/supabase');

// Security middleware for role-based access control
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Security middleware for membership-based access
const requireMembership = (requiredTiers) => {
  return (req, res, next) => {
    const userMembership = req.user?.membership?.name;
    
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: 'Membership required'
      });
    }

    if (!requiredTiers.includes(userMembership)) {
      return res.status(403).json({
        success: false,
        error: 'Premium membership required'
      });
    }

    next();
  };
};

// Security middleware for admin-only access
const requireAdmin = requireRole(['admin']);

// Security middleware for member access (any membership)
const requireMember = requireRole(['admin', 'member']);

// Security middleware for premium membership
const requirePremium = requireMembership(['premium']);

// Data filtering functions for secure data access
const securityFilters = {
  // Filter user data - users can only see their own data
  filterUserData: (data, currentUserId) => {
    if (Array.isArray(data)) {
      return data.filter(item => item.user_id === currentUserId || item.id === currentUserId);
    }
    return data.user_id === currentUserId || data.id === currentUserId ? data : null;
  },

  // Filter deals based on membership
  filterDeals: (deals, userMembership) => {
    if (!Array.isArray(deals)) return deals;
    
    return deals.map(deal => {
      // Basic members can't see premium-only discounts
      if (userMembership !== 'premium' && deal.premium_discount && !deal.basic_discount) {
        return {
          ...deal,
          premium_discount: null,
          discount_text: deal.basic_discount ? `${deal.basic_discount}% off` : 'Member discount available'
        };
      }
      return deal;
    });
  },

  // Filter partners based on approval status
  filterPartners: (partners, userRole) => {
    if (!Array.isArray(partners)) return partners;
    
    // Non-admin users can only see approved partners
    if (userRole !== 'admin') {
      return partners.filter(partner => partner.status === 'approved');
    }
    return partners;
  },

  // Filter payments - users can only see their own payments
  filterPayments: (payments, currentUserId) => {
    if (!Array.isArray(payments)) return payments;
    return payments.filter(payment => payment.user_id === currentUserId);
  }
};

// Secure query builders that include application-level security
const secureQueries = {
  // Get user's own data securely
  getUserData: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        role,
        status,
        membership_id,
        membership_valid_until,
        memberships (
          name,
          price
        )
      `)
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  // Get deals with membership-based filtering
  getDealsForUser: async (userMembership, userRole) => {
    const { data, error } = await supabase
      .from('deals')
      .select(`
        id,
        title,
        description,
        image_url,
        basic_discount,
        premium_discount,
        start_date,
        end_date,
        category,
        partner_id,
        partners (
          name,
          logo_url
        )
      `)
      .gte('end_date', new Date().toISOString())
      .lte('start_date', new Date().toISOString());

    if (error) return { data: null, error };

    // Apply membership-based filtering
    const filteredDeals = securityFilters.filterDeals(data, userMembership);
    return { data: filteredDeals, error: null };
  },

  // Get partners with approval filtering
  getPartnersForUser: async (userRole) => {
    let query = supabase
      .from('partners')
      .select(`
        id,
        name,
        description,
        logo_url,
        website_url,
        status,
        created_at
      `);

    // Non-admin users can only see approved partners
    if (userRole !== 'admin') {
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get user's own payments securely
  getUserPayments: async (userId) => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        payment_method,
        created_at,
        memberships (
          name,
          price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};

// Audit logging for security events
const auditLog = {
  logAccess: (userId, resource, action, success = true) => {
    console.log(`[AUDIT] User ${userId} ${action} ${resource}: ${success ? 'SUCCESS' : 'FAILED'}`);
    // In production, this would write to a secure audit log
  },

  logSecurityEvent: (userId, event, details) => {
    console.log(`[SECURITY] User ${userId} - ${event}: ${details}`);
    // In production, this would trigger security alerts
  }
};

module.exports = {
  requireRole,
  requireMembership,
  requireAdmin,
  requireMember,
  requirePremium,
  securityFilters,
  secureQueries,
  auditLog
};
