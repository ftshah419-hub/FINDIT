import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'findit_jwt_secret_token_secure_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, phone } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email already exists',
          errorCode: 'EMAIL_IN_USE',
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone,
        role: 'USER',
        isEmailVerified: true,
        isActive: true,
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profileImage: user.profileImage,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password',
          errorCode: 'MISSING_CREDENTIALS',
        });
      }

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          errorCode: 'INVALID_CREDENTIALS',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          errorCode: 'INVALID_CREDENTIALS',
        });
      }

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Logged in successfully',
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profileImage: user.profileImage,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Current user retrieved',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  async logout(req, res) {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  },
};
