import Review from '../models/Review.js';
import Doctor from '../models/Doctor.js';
import Patient from '../models/Patient.js';
import Appointment from '../models/Appointment.js';

// Recalculates average ratings and reviews count on the Doctor document
const updateDoctorRatings = async (doctorId) => {
  try {
    const stats = await Review.aggregate([
      { $match: { doctorId } },
      {
        $group: {
          _id: '$doctorId',
          total: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    if (stats.length > 0) {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: Math.round(stats[0].avgRating * 10) / 10, // Round to 1 decimal place
        totalReviews: stats[0].total,
      });
    } else {
      await Doctor.findByIdAndUpdate(doctorId, {
        rating: 0,
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error('Error updating doctor rating average:', error.message);
  }
};

// @desc    Add review for doctor
// @route   POST /api/reviews
// @access  Private/Patient
export const createReview = async (req, res) => {
  const { doctorId, rating, reviewText } = req.body;

  try {
    // 1. Get patient record
    const patient = await Patient.findOne({ userId: req.user.id });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile details not found' });
    }

    // 2. Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    // 3. Double-review check: Patient can only write one review per doctor
    const reviewExists = await Review.findOne({ patientId: patient._id, doctorId: doctor._id });
    if (reviewExists) {
      return res.status(400).json({ message: 'You have already reviewed this doctor. You may edit your review instead.' });
    }

    // 4. Appointment requirement check: Patient must have completed consultation to review doctor (Verification Badge requirement!)
    const hasConsulted = await Appointment.findOne({
      patientId: patient._id,
      doctorId: doctor._id,
      status: 'Completed',
    });

    if (!hasConsulted) {
      return res.status(400).json({ message: 'You can only review doctors after a completed consultation appointment.' });
    }

    // 5. Create review
    const review = await Review.create({
      patientId: patient._id,
      doctorId: doctor._id,
      rating: Number(rating),
      reviewText,
    });

    // 6. Recalculate ratings
    await updateDoctorRatings(doctor._id);

    res.status(201).json({
      message: 'Review submitted successfully!',
      review,
    });
  } catch (error) {
    console.error('Create review error:', error.message);
    res.status(500).json({ message: 'Server error saving review' });
  }
};

// @desc    Update an existing review
// @route   PUT /api/reviews/:id
// @access  Private/Patient
export const updateReview = async (req, res) => {
  const { rating, reviewText } = req.body;

  try {
    const review = await Review.findById(req.params.id).populate('patientId');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify ownership
    if (review.patientId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to modify this review' });
    }

    review.rating = Number(rating) || review.rating;
    review.reviewText = reviewText || review.reviewText;
    await review.save();

    // Recalculate ratings
    await updateDoctorRatings(review.doctorId);

    res.json({ message: 'Review updated successfully!', review });
  } catch (error) {
    console.error('Update review error:', error.message);
    res.status(500).json({ message: 'Server error updating review' });
  }
};

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Patient
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate('patientId');
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Verify ownership
    if (review.patientId.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const doctorId = review.doctorId;
    await review.deleteOne();

    // Recalculate ratings
    await updateDoctorRatings(doctorId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};
