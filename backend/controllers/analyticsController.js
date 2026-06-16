import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    // Appointments status breakdown
    const appointmentsStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Specialties breakdown
    const specialtiesBreakdown = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly appointments growth (last 6 months)
    const monthlyAppointments = await Appointment.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 6 },
    ]);

    // Estimated Revenue (sum of Success payments)
    const totalPaymentResult = await Payment.aggregate([
      { $match: { status: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalPaymentResult[0]?.total || 0;

    res.json({
      summary: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
      },
      appointmentsStatus,
      specialtiesBreakdown,
      monthlyAppointments,
    });
  } catch (error) {
    console.error('Get admin analytics error:', error.message);
    res.status(500).json({ message: 'Server error loading admin analytics charts' });
  }
};

// @desc    Get Doctor Dashboard Analytics
// @route   GET /api/analytics/doctor
// @access  Private/Doctor
export const getDoctorAnalytics = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const totalAppts = await Appointment.countDocuments({ doctorId: doctor._id });
    const pendingAppts = await Appointment.countDocuments({ doctorId: doctor._id, status: 'Pending' });
    const completedAppts = await Appointment.countDocuments({ doctorId: doctor._id, status: 'Completed' });
    const cancelledAppts = await Appointment.countDocuments({ doctorId: doctor._id, status: 'Cancelled' });

    // Earnings calculation (payments linked to completed appointments)
    const appointments = await Appointment.find({ doctorId: doctor._id, status: 'Completed' });
    const apptIds = appointments.map((appt) => appt._id);
    const earningsResult = await Payment.aggregate([
      { $match: { appointmentId: { $in: apptIds }, status: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const earnings = earningsResult[0]?.total || 0;

    const recentReviews = await Review.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name profileImage' },
      })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      summary: {
        totalAppointments: totalAppts,
        pendingAppointments: pendingAppts,
        completedAppointments: completedAppts,
        cancelledAppointments: cancelledAppts,
        earnings,
        rating: doctor.rating,
        totalReviews: doctor.totalReviews,
      },
      recentReviews,
    });
  } catch (error) {
    console.error('Get doctor analytics error:', error.message);
    res.status(500).json({ message: 'Server error loading doctor dashboard stats' });
  }
};

// @desc    Get Super Admin Dashboard Analytics
// @route   GET /api/analytics/super-admin
// @access  Private/SuperAdmin
export const getSuperAdminAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ approved: true });
    const totalPayments = await Payment.countDocuments({ status: 'Success' });

    // 1. Monthly Revenue growth
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'Success' } },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // 2. Booking Success Rate vs Cancellations
    const totalAppts = await Appointment.countDocuments();
    const completedAppts = await Appointment.countDocuments({ status: 'Completed' });
    const cancelledAppts = await Appointment.countDocuments({ status: 'Cancelled' });

    const successRate = totalAppts > 0 ? ((completedAppts / totalAppts) * 100).toFixed(1) : 0;
    const cancellationRate = totalAppts > 0 ? ((cancelledAppts / totalAppts) * 100).toFixed(1) : 0;

    // 3. User retention mock metrics (simulating progression)
    const retentionRate = [82, 85, 87, 89, 91, 92]; // last 6 months progression

    res.json({
      summary: {
        totalUsers,
        activeDoctors,
        totalPayments,
        successRate,
        cancellationRate,
      },
      monthlyRevenue,
      retentionRate,
    });
  } catch (error) {
    console.error('Get super admin analytics error:', error.message);
    res.status(500).json({ message: 'Server error loading platform analytics' });
  }
};

// @desc    Get Admin Audit Logs
// @route   GET /api/analytics/audit-logs
// @access  Private/SuperAdmin or Admin
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Get audit logs error:', error.message);
    res.status(500).json({ message: 'Server error loading audit logs' });
  }
};
