import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// One review per patient per doctor to prevent review stuffing
reviewSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
