import express from 'express';
import { uploadReport, getReports, deleteReport } from '../controllers/reportController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, restrictTo('Patient'), upload.single('reportFile'), uploadReport);
router.get('/', protect, getReports);
router.delete('/:id', protect, restrictTo('Patient'), deleteReport);

export default router;
