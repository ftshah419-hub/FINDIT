const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const adminRoutes = require('./adminRoutes');

// Mount Admin sub-routes
router.use('/admin', adminRoutes);

// Shared Authentication routes (supports Admin Console login and testing)
router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
        errorCode: 'MISSING_CREDENTIALS',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
        errorCode: 'INVALID_CREDENTIALS',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated.',
        errorCode: 'ACCOUNT_DEACTIVATED',
      });
    }

    const secret = process.env.JWT_SECRET || 'findit_jwt_super_secret_key_2026';
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        email: user.email,
      },
      secret,
      { expiresIn: '7d' }
    );

    const userObj = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'Sign-in successful.',
      data: {
        token,
        user: userObj,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/auth/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing.',
        errorCode: 'UNAUTHORIZED',
      });
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'findit_jwt_super_secret_key_2026';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
        errorCode: 'USER_NOT_FOUND',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Session active.',
      data: { user: user.toJSON() },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      errorCode: 'INVALID_TOKEN',
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FINDIT API v1 is healthy and running.',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
