import express from 'express';
import {
  login,
  logout,
  getMe
} from '../controllers/adminAuthController.js';
import {
  getAdminResources,
  getAdminResourceById,
  createResource,
  updateResource,
  deleteResource,
  togglePublishResource,
  getDashboardStats,
  getReports,
  updateReportStatus
} from '../controllers/adminResourceController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { adminLoginSchema } from '../validators/authValidator.js';
import { createResourceSchema, updateResourceSchema } from '../validators/resourceValidator.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public auth endpoints
router.post('/login', loginRateLimiter, validate(adminLoginSchema, 'body'), login);
router.post('/logout', logout);

// Protected routes
router.use(requireAdminAuth);

router.get('/me', getMe);
router.get('/stats', getDashboardStats);
router.get('/resources', getAdminResources);
router.get('/resources/:id', getAdminResourceById);
router.post('/resources', validate(createResourceSchema, 'body'), createResource);
router.patch('/resources/:id', validate(updateResourceSchema, 'body'), updateResource);
router.delete('/resources/:id', deleteResource);
router.patch('/resources/:id/publish', togglePublishResource);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

export default router;
