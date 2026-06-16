import express from 'express';
import {
  bookAppointment,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/appointmentController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('Patient'), bookAppointment);
router.get('/', protect, getAppointments);
router.put('/:id', protect, updateAppointmentStatus);

export default router;
