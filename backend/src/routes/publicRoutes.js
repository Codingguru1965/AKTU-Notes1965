import express from 'express';
import {
  getHealth,
  getResources,
  getResourceById,
  getFilters,
  getSubjects,
  reportResource
} from '../controllers/publicController.js';
import { validate } from '../middleware/validate.js';
import { resourceQuerySchema } from '../validators/resourceValidator.js';
import { createReportSchema } from '../validators/reportValidator.js';
import { publicRateLimiter, reportRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(publicRateLimiter);

router.get('/health', getHealth);
router.get('/resources', validate(resourceQuerySchema, 'query'), getResources);
router.get('/resources/:id', getResourceById);
router.get('/filters', getFilters);
router.get('/subjects', getSubjects);
router.post('/reports', reportRateLimiter, validate(createReportSchema, 'body'), reportResource);

export default router;
