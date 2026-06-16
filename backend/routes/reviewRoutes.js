import express from 'express';
import { createReview, updateReview, deleteReview } from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, restrictTo('Patient'), createReview);
router.put('/:id', protect, restrictTo('Patient'), updateReview);
router.delete('/:id', protect, restrictTo('Patient'), deleteReview);

export default router;
