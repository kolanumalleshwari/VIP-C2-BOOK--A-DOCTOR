import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String, // e.g. "500mg" or "1 tablet"
    required: true,
  },
  frequency: {
    type: String, // e.g. "Once daily", "Twice daily", "Before meals"
    required: true,
  },
  duration: {
    type: String, // e.g. "5 days", "1 week"
    required: true,
  },
});

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    medicines: [medicineSchema],
    notes: {
      type: String,
      default: '',
    },
    advice: {
      type: String,
      default: '',
    },
    pdfUrl: {
      type: String, // Path to generated PDF file
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
