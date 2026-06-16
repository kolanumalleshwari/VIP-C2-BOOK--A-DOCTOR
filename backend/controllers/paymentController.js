import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';
import crypto from 'crypto';

// @desc    Simulate charging payment
// @route   POST /api/payments/charge
// @access  Private
export const processPayment = async (req, res) => {
  const { appointmentId, amount, paymentMethod } = req.body;

  if (!appointmentId || !amount || !paymentMethod) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Generate simulated Transaction ID
    const transactionId = 'TXN_' + crypto.randomBytes(8).toString('hex').toUpperCase();

    // Simulate Payment Gateway Response
    let paymentStatus = 'Success';
    let errorMessage = '';

    if (paymentMethod === 'Stripe' || paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      // Simulate credit card validations
      if (amount <= 0) {
        paymentStatus = 'Failed';
        errorMessage = 'Invalid payment amount';
      }
    } else if (paymentMethod === 'Wallet') {
      // Simulate wallet check
      const simulatedUserBalance = 10000; // default initial balance
      if (amount > simulatedUserBalance) {
        paymentStatus = 'Failed';
        errorMessage = 'Insufficient balance in wallet';
      }
    }

    if (paymentStatus === 'Failed') {
      return res.status(400).json({ message: errorMessage });
    }

    // Create Payment Record
    const payment = await Payment.create({
      transactionId,
      userId: req.user.id,
      appointmentId,
      amount,
      paymentMethod,
      status: paymentStatus,
    });

    // Link payment reference to Appointment and update status
    appointment.paymentRef = payment._id;
    appointment.status = 'Confirmed'; 
    appointment.telemedicineUrl = `https://meet.jit.si/mediconnect-pro-${appointment._id}`;
    await appointment.save();

    res.status(201).json({
      message: 'Payment simulated successfully!',
      payment,
    });
  } catch (error) {
    console.error('Payment simulation error:', error.message);
    res.status(500).json({ message: 'Server error processing simulated payment' });
  }
};

// @desc    Get user payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate({
        path: 'appointmentId',
        populate: { path: 'doctorId', populate: { path: 'userId', select: 'name' } },
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error('Get payment history error:', error.message);
    res.status(500).json({ message: 'Server error loading payment history' });
  }
};
