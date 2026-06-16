import express from 'express';
import {
  createPrescription,
  getPrescriptionByAppointment,
  getPatientPrescriptions,
  getDoctorPrescriptions,
} from '../controllers/prescriptionController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('Doctor'), createPrescription);
router.get('/appointment/:appointmentId', protect, getPrescriptionByAppointment);
router.get('/my-prescriptions', protect, restrictTo('Patient'), getPatientPrescriptions);
router.get('/doctor-prescriptions', protect, restrictTo('Doctor'), getDoctorPrescriptions);

export default router;
