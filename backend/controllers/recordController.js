import MedicalRecord from '../models/MedicalRecord.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import { uploadFile } from '../services/cloudinaryService.js';

// @desc    Upload a new medical record
// @route   POST /api/records/upload
// @access  Private/Patient
export const uploadRecord = async (req, res) => {
  const { recordTitle, recordType, description } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file attached' });
    }

    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile details not found' });
    }

    const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = await uploadFile(req.file.path, serverBaseUrl);

    const record = await MedicalRecord.create({
      patientId: patient._id,
      recordTitle: recordTitle || req.file.originalname,
      recordType: recordType || 'Lab Report',
      recordFile: fileUrl,
      description: description || '',
    });

    res.status(201).json({
      message: 'Medical record uploaded successfully!',
      record,
    });
  } catch (error) {
    console.error('Record upload error:', error.message);
    res.status(500).json({ message: 'Server error processing file upload' });
  }
};

// @desc    Get medical records
// @route   GET /api/records
// @access  Private (Patient views own, Doctor views patient's after verified appointment, Admin/Super Admin views all)
export const getRecords = async (req, res) => {
  const { patientId } = req.query; // Doctor passes this

  try {
    if (req.user.role === 'Patient') {
      const patient = await Patient.findOne({ userId: req.user.id });
      if (!patient) return res.json([]);
      const records = await MedicalRecord.find({ patientId: patient._id }).sort({ createdAt: -1 });
      return res.json(records);
    }

    if (req.user.role === 'Doctor') {
      if (!patientId) {
        return res.status(400).json({ message: 'Patient ID is required' });
      }

      // Privacy check: verify doctor has appointments with this patient
      const doctor = await Doctor.findOne({ userId: req.user.id });
      if (!doctor) {
        return res.status(403).json({ message: 'Doctor profile not found' });
      }

      const hasHistory = await Appointment.findOne({
        doctorId: doctor._id,
        patientId,
      });

      if (!hasHistory) {
        return res.status(403).json({ message: 'Access denied: No appointment history with this patient' });
      }

      const records = await MedicalRecord.find({ patientId }).sort({ createdAt: -1 });
      return res.json(records);
    }

    if (req.user.role === 'Admin' || req.user.role === 'Super Admin') {
      const records = await MedicalRecord.find().populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' },
      });
      return res.json(records);
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Get records error:', error.message);
    res.status(500).json({ message: 'Server error retrieving records' });
  }
};

// @desc    Delete medical record
// @route   DELETE /api/records/:id
// @access  Private/Patient
export const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id).populate('patientId');
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Verify ownership
    if (record.patientId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this record' });
    }

    await record.deleteOne();
    res.json({ message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Delete record error:', error.message);
    res.status(500).json({ message: 'Server error deleting record' });
  }
};
