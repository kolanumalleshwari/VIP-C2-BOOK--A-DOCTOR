import express from 'express';
import { processPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/charge', protect, processPayment);
router.get('/history', protect, getPaymentHistory);

export default router;
