const express = require('express');
const router = express.Router();

// Import route modules
const dealsRoutes = require('./deals');
const partnersRoutes = require('./partners');
const authRoutes = require('./auth');
const adminUsersRoutes = require('./admin/users');

// Use route modules
router.use('/deals', dealsRoutes);
router.use('/partners', partnersRoutes);
router.use('/auth', authRoutes);
router.use('/admin/users', adminUsersRoutes);

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'GoSave API v1',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      deals: '/deals',
      partners: '/partners',
      auth: '/auth',
      admin: {
        users: '/admin/users'
      }
    }
  });
});

module.exports = router;
