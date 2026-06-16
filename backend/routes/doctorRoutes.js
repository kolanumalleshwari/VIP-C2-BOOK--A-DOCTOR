import express from 'express';
import { getDoctors, getDoctorById, approveDoctor } from '../controllers/doctorController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getDoctors);
router.get('/:id', getDoctorById);
router.put('/:id/approve', protect, restrictTo('Admin'), approveDoctor);

export default router;
