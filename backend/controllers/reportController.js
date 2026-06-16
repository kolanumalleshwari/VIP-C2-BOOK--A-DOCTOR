import MedicalReport from '../models/MedicalReport.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { uploadFile } from '../services/cloudinaryService.js';
import { notifyUser } from '../services/socketService.js';

// @desc    Upload a new medical report
// @route   POST /api/reports/upload
// @access  Private/Patient
export const uploadReport = async (req, res) => {
  const { reportTitle } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No report file attached' });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile details not found' });
    }

    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
    const reportUrl = await uploadFile(req.file.path, serverBaseUrl);

    const report = await MedicalReport.create({
      patientId: patient._id,
      reportTitle: reportTitle || req.file.originalname,
      reportFile: reportUrl,
    });

    res.status(201).json({
      message: 'Medical report uploaded successfully!',
      report,
    });
  } catch (error) {
    console.error('Report upload error:', error.message);
    res.status(500).json({ message: 'Server error processing file upload' });
  }
};

// @desc    Get medical reports
// @route   GET /api/reports
// @access  Private (Patient views own, Doctor views patient's)
export const getReports = async (req, res) => {
  const { patientId } = req.query; // If Doctor is querying a specific patient's reports

  try {
    if (req.user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) return res.json([]);
      const reports = await MedicalReport.find({ patientId: patient._id }).sort({ uploadDate: -1 });
      return res.json(reports);
    }

    if (req.user.role === 'Doctor') {
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required to query patient reports' });
      }

      // Check if doctor has had appointments with this patient (privacy guard)
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(403).json({ message: 'Doctor profile not found' });
      }

      const hasHistory = await Appointment.findOne({
        doctorId: doctor._id,
        patientId,
      });

      if (!hasHistory) {
        return res.status(403).json({ message: 'No appointment history with this patient. Access denied.' });
      }

      const reports = await MedicalReport.find({ patientId }).sort({ uploadDate: -1 });
      return res.json(reports);
    }

    if (req.user.role === 'Admin') {
      const reports = await MedicalReport.find().populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' }
      });
      return res.json(reports);
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Get reports error:', error.message);
    res.status(500).json({ message: 'Server error retrieving reports' });
  }
};

// @desc    Delete medical report
// @route   DELETE /api/reports/:id
// @access  Private/Patient
export const deleteReport = async (req, res) => {
  try {
    const report = await MedicalReport.findById(req.params.id).populate('patientId');
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Verify user owns the report
    if (report.patientId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this report' });
    }

    await report.deleteOne();
    res.json({ message: 'Medical report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error.message);
    res.status(500).json({ message: 'Server error deleting report' });
  }
};
