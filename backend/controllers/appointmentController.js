import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { notifyUser } from '../services/socketService.js';

// @desc    Book an appointment
// @route   POST /api/appointments
// @access  Private/Patient
export const bookAppointment = async (req, res) => {
  const { doctorId, appointmentDate, appointmentTime, reason } = req.body;

  try {
    // 1. Check if patient profile exists for logged in user
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile details not found. Please complete profile.' });
    }

    // 2. Check if doctor profile exists
    const doctor = await Doctor.findById(doctorId).populate('userId', 'name');
    if (!doctor) {
      return res.status(404).json({ message: 'Selected doctor not found' });
    }

    // 3. Format Date
    const parsedDate = new Date(appointmentDate);
    parsedDate.setHours(0, 0, 0, 0); // Normalize time to midnight for simple equality comparison

    // 4. Check for double booking collision (conflict validation)
    const existing = await Appointment.findOne({
      doctorId,
      appointmentDate: parsedDate,
      appointmentTime,
      status: { $ne: 'Cancelled' }, // Cancelled slots are open again
    });

    if (existing) {
      return res.status(400).json({ message: 'This slot is already booked. Please choose another slot.' });
    }

    // 5. Create appointment
    const appointment = await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      appointmentDate: parsedDate,
      appointmentTime,
      reason,
      status: 'Pending',
    });

    // 6. Notify doctor in real time
    await notifyUser(
      doctor.userId._id,
      'New Appointment Request',
      `Patient ${req.user.name} has requested an appointment on ${appointmentDate} at ${appointmentTime}`
    );

    res.status(201).json({
      message: 'Appointment requested successfully! Pending doctor approval.',
      appointment,
    });
  } catch (error) {
    console.error('Book appointment error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This slot is already booked. Please select a different slot.' });
    }
    res.status(500).json({ message: 'Server error processing booking request' });
  }
};

// @desc    Get appointments matching user role
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) return res.json([]);
      appointments = await Appointment.find({ patientId: patient._id })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name email phone profileImage' },
        })
        .sort({ appointmentDate: 1, appointmentTime: 1 });
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) return res.json([]);
      appointments = await Appointment.find({ doctorId: doctor._id })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name email phone profileImage' },
        })
        .sort({ appointmentDate: 1, appointmentTime: 1 });
    } else if (req.user.role === 'Admin' || req.user.role === 'Super Admin') {
      appointments = await Appointment.find()
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'name profileImage' },
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'name profileImage' },
        })
        .sort({ appointmentDate: -1 });
    }

    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error.message);
    res.status(500).json({ message: 'Server error loading appointments' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({ path: 'doctorId', populate: { path: 'userId' } })
      .populate({ path: 'patientId', populate: { path: 'userId' } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment details not found' });
    }

    // Role verification guards
    if (req.user.role === 'Doctor') {
      // Doctors can Confirm, Complete, or Cancel
      if (appointment.doctorId.userId._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to change this appointment' });
      }
    } else if (req.user.role === 'Patient') {
      // Patients can only Cancel
      if (appointment.patientId.userId._id.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Not authorized to change this appointment' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ message: 'Patients can only cancel appointments' });
      }
    }

    appointment.status = status;
    if (status === 'Confirmed' && !appointment.telemedicineUrl) {
      appointment.telemedicineUrl = `https://meet.jit.si/mediconnect-pro-${appointment._id}`;
    }
    await appointment.save();

    // Send notifications based on new status
    const doctorUser = appointment.doctorId.userId;
    const patientUser = appointment.patientId.userId;

    if (status === 'Confirmed') {
      await notifyUser(
        patientUser._id,
        'Appointment Confirmed!',
        `Dr. ${doctorUser.name} has confirmed your appointment on ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.appointmentTime}`
      );
    } else if (status === 'Cancelled') {
      const canceller = req.user.role;
      const targetUser = canceller === 'Patient' ? doctorUser._id : patientUser._id;
      const targetName = canceller === 'Patient' ? 'Patient ' + req.user.name : 'Dr. ' + doctorUser.name;
      await notifyUser(
        targetUser,
        'Appointment Cancelled',
        `${targetName} has cancelled the appointment scheduled for ${appointment.appointmentDate.toLocaleDateString()} at ${appointment.appointmentTime}`
      );
    } else if (status === 'Completed') {
      await notifyUser(
        patientUser._id,
        'Consultation Completed',
        `Your consultation with Dr. ${doctorUser.name} is complete. Please share your rating feedback!`
      );
    }

    res.json({ message: `Appointment status updated to ${status}`, appointment });
  } catch (error) {
    console.error('Update appointment status error:', error.message);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
};
