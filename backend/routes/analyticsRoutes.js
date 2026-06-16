import express from 'express';
import { getAdminAnalytics, getDoctorAnalytics } from '../controllers/analyticsController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/admin', protect, restrictTo('Admin'), getAdminAnalytics);
router.get('/doctor', protect, restrictTo('Doctor'), getDoctorAnalytics);

export default router;
