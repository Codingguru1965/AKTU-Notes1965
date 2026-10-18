import jwt from 'jsonwebtoken';
import { JWT_SECRET, COOKIE_NAME } from '../config/env.js';
import { Admin } from '../models/Admin.js';

export const requireAdminAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in as an administrator.'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please log in again.'
      });
    }

    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Admin account not found or is inactive.'
      });
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
};
