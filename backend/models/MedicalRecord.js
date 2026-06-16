import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    recordTitle: {
      type: String,
      required: true,
      trim: true,
    },
    recordType: {
      type: String, // e.g. "Lab Report", "Prescription", "Scan", "Other"
      default: 'Lab Report',
    },
    recordFile: {
      type: String, // Path to file/URL
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
export default MedicalRecord;
