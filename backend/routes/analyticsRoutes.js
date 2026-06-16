import express from 'express';
import {
  getAdminAnalytics,
  getDoctorAnalytics,
  getSuperAdminAnalytics,
  getAuditLogs,
} from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, restrictTo('Admin', 'Super Admin'), getAdminAnalytics);
router.get('/doctor', protect, restrictTo('Doctor'), getDoctorAnalytics);
router.get('/super-admin', protect, restrictTo('Super Admin'), getSuperAdminAnalytics);
router.get('/audit-logs', protect, restrictTo('Admin', 'Super Admin'), getAuditLogs);

export default router;
