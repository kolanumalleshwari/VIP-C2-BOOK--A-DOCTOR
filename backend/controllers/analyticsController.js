import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';
import Review from '../models/Review.js';

// @desc    Get Admin Dashboard Analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Total registrations counts
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();

    // 2. Appointments status breakdown
    const appointmentsStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // 3. Specialties breakdown
    const specialtiesBreakdown = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
          count: { $sum: 1 },
        },
      },
    ]);

    // 4. Monthly appointments growth (last 6 months)
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

    // 5. Estimated Revenue (sum of consultationFee for completed appointments)
    const completedAppointments = await Appointment.find({ status: 'Completed' }).populate('doctorId');
    const totalRevenue = completedAppointments.reduce((acc, appt) => {
      return acc + (appt.doctorId?.consultationFee || 0);
    }, 0);

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

    // 1. Appointments summary for this doctor
    const totalAppts = await Appointment.countDocuments({ doctorId: doctor._id });
    const pendingAppts = await Appointment.countDocuments({ doctorId: doctor._id, status: 'Pending' });
    const completedAppts = await Appointment.countDocuments({ doctorId: doctor._id, status: 'Completed' });
    const cancelledAppts = await Appointment.countDocuments({ doctorId: doctor._id, status: 'Cancelled' });

    // 2. Earnings calculation (Completed appointments * consultationFee)
    const earnings = completedAppts * doctor.consultationFee;

    // 3. Recent 5 reviews
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
