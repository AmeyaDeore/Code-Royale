import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/appError.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');

      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401, 'USER_DELETED'));
      }

      next();
    } catch (error) {
      next(new AppError('Not authorized, token failed', 401, 'INVALID_TOKEN'));
    }
  }

  if (!token) {
    next(new AppError('Not authorized, no token', 401, 'NO_TOKEN'));
  }
};
