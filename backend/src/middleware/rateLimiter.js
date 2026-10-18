import rateLimit from 'express-rate-limit';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const publicRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    error: 'Rate limit exceeded. Please slow down your requests.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const reportRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Too many reports submitted. Please wait before submitting another report.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
