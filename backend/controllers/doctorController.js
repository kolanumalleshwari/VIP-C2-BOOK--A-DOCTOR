import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all doctors (with advanced search, filters, and sorting)
// @route   GET /api/doctors
// @access  Public
export const getDoctors = async (req, res) => {
  const {
    specialization,
    experience,
    minFee,
    maxFee,
    hospital,
    rating,
    search,
    sort,
    approved,
  } = req.query;

  try {
    let query = {};

    // Filter by approval status (Defaults to approved only for public user discovery)
    if (approved !== undefined) {
      query.approved = approved === 'true';
    } else {
      query.approved = true;
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (experience) {
      query.experience = { $gte: Number(experience) };
    }

    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = Number(minFee);
      if (maxFee) query.consultationFee.$lte = Number(maxFee);
    }

    if (hospital) {
      query.hospitalName = { $regex: hospital, $options: 'i' };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    let doctorIds = [];
    if (search) {
      // Find users matching search keyword (Name/Email) and get their doctor IDs
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
        role: 'Doctor',
      }).select('_id');

      const userIds = matchingUsers.map((u) => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { specialization: { $regex: search, $options: 'i' } },
        { hospitalName: { $regex: search, $options: 'i' } },
      ];
    }

    let dbQuery = Doctor.find(query).populate('userId', 'name email phone gender profileImage');

    // Sorting options
    if (sort) {
      if (sort === 'highest-rated') {
        dbQuery = dbQuery.sort({ rating: -1 });
      } else if (sort === 'lowest-fee') {
        dbQuery = dbQuery.sort({ consultationFee: 1 });
      } else if (sort === 'highest-fee') {
        dbQuery = dbQuery.sort({ consultationFee: -1 });
      } else if (sort === 'most-experienced') {
        dbQuery = dbQuery.sort({ experience: -1 });
      }
    } else {
      dbQuery = dbQuery.sort({ createdAt: -1 });
    }

    const doctors = await dbQuery;
    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error.message);
    res.status(500).json({ message: 'Server error loading doctors lists' });
  }
};

// @desc    Get doctor details by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('userId', 'name email phone gender profileImage');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // Load reviews
    const reviews = await Review.find({ doctorId: doctor._id })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name profileImage' },
      });

    res.json({ doctor, reviews });
  } catch (error) {
    console.error('Get doctor details error:', error.message);
    res.status(500).json({ message: 'Server error retrieving doctor details' });
  }
};

// @desc    Admin Onboarding Doctor Approval Toggle
// @route   PUT /api/doctors/:id/approve
// @access  Private/Admin
export const approveDoctor = async (req, res) => {
  const { approved } = req.body;

  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    doctor.approved = approved;
    await doctor.save();

    // Log the approval action
    await AuditLog.create({
      userId: req.user.id,
      action: approved ? 'APPROVED_DOCTOR' : 'REJECTED_DOCTOR',
      details: `Doctor ID: ${doctor._id}. Doctor User ID: ${doctor.userId}. Status set to: ${approved}`,
      ipAddress: req.ip || '',
    });

    res.json({ message: `Doctor status updated successfully. Onboard Approved: ${approved}`, doctor });
  } catch (error) {
    console.error('Approve doctor error:', error.message);
    res.status(500).json({ message: 'Server error processing doctor approval' });
  }
};
