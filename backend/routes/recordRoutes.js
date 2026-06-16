import express from 'express';
import { uploadRecord, getRecords, deleteRecord } from '../controllers/recordController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('reportFile'), uploadRecord);
router.get('/', protect, getRecords);
router.delete('/:id', protect, deleteRecord);

export default router;
