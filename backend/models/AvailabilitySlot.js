import mongoose from 'mongoose';

const availabilitySlotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    date: {
      type: Date, // The specific date, or can represent weekly recurrence
      required: true,
    },
    timeSlot: {
      type: String, // e.g. "09:00", "09:30"
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate slots for the same doctor, date, and time
availabilitySlotSchema.index({ doctorId: 1, date: 1, timeSlot: 1 }, { unique: true });

const AvailabilitySlot = mongoose.model('AvailabilitySlot', availabilitySlotSchema);
export default AvailabilitySlot;
