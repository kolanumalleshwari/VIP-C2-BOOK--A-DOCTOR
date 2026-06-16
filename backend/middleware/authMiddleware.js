import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Verify token and append user object to request
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'medconnect_jwt_super_secret_key_123456');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User matching token not found' });
    }
    next();
  } catch (error) {
    console.error('JWT auth error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
  }
};

// Check if user role matches allowed roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role (${req.user?.role || 'Guest'}) does not have permission to access this resource`
      });
    }
    next();
  };
};
