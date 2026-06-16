import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import User from '../models/User.js';
import { compilePrescriptionPdf } from '../services/pdfService.js';

// @desc    Create a new prescription for an appointment
// @route   POST /api/prescriptions
// @access  Private (Doctor only)
export const createPrescription = async (req, res) => {
  const { appointmentId, medicines, advice, notes } = req.body;

  if (!appointmentId || !medicines || !Array.isArray(medicines)) {
    return res.status(400).json({ message: 'Missing appointmentId or medicines list' });
  }

  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate('patientId')
      .populate('doctorId');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Verify doctor matches
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor || doctor._id.toString() !== appointment.doctorId._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to write prescriptions for this appointment' });
    }

    // Get doctor user details and patient user details for PDF name labels
    const docUser = await User.findById(doctor.userId);
    const patUser = await User.findById(appointment.patientId.userId);

    // Create record first to get ID
    const prescription = new Prescription({
      appointmentId,
      doctorId: doctor._id,
      patientId: appointment.patientId._id,
      medicines,
      advice,
      notes,
    });

    // Compile PDF using Puppeteer
    const pdfPath = await compilePrescriptionPdf(
      prescription,
      docUser.name,
      patUser.name,
      appointment.patientId.age
    );

    // Save PDF reference
    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
    prescription.pdfUrl = `${serverBaseUrl}/${pdfPath}`;
    await prescription.save();

    // Set appointment status to Completed
    appointment.status = 'Completed';
    await appointment.save();

    res.status(201).json({
      message: 'Prescription compiled and generated successfully!',
      prescription,
    });
  } catch (error) {
    console.error('Create prescription error:', error.message);
    res.status(500).json({ message: 'Server error compiling prescription' });
  }
};

// @desc    Get prescription details by appointment ID
// @route   GET /api/prescriptions/appointment/:appointmentId
// @access  Private
export const getPrescriptionByAppointment = async (req, res) => {
  try {
    const prescription = await Prescription.findOne({ appointmentId: req.params.appointmentId })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name' } })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } });

    if (!prescription) {
      return res.status(404).json({ message: 'No prescription found for this appointment' });
    }

    res.json(prescription);
  } catch (error) {
    console.error('Get prescription by appointment error:', error.message);
    res.status(500).json({ message: 'Server error loading prescription details' });
  }
};

// @desc    Get prescriptions for the logged-in patient
// @route   GET /api/prescriptions/my-prescriptions
// @access  Private (Patient only)
export const getPatientPrescriptions = async (req, res) => {
  try {
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }

    const prescriptions = await Prescription.find({ patientId: patient._id })
      .populate({ path: 'doctorId', populate: { path: 'userId', select: 'name specialization' } })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get patient prescriptions error:', error.message);
    res.status(500).json({ message: 'Server error loading prescriptions list' });
  }
};

// @desc    Get prescriptions written by the logged-in doctor
// @route   GET /api/prescriptions/doctor-prescriptions
// @access  Private (Doctor only)
export const getDoctorPrescriptions = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user.id });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const prescriptions = await Prescription.find({ doctorId: doctor._id })
      .populate({ path: 'patientId', populate: { path: 'userId', select: 'name' } })
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    console.error('Get doctor prescriptions error:', error.message);
    res.status(500).json({ message: 'Server error loading prescriptions list' });
  }
};
