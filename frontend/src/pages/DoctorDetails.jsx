import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Briefcase, Calendar, Clock, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { getDoctorById } from '../services/doctorService.js';
import { bookAppointment } from '../services/appointmentService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { toast } from 'react-toastify';
import SkeletonLoader from '../components/SkeletonLoader.jsx';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadDoctorData();
  }, [id]);

  const loadDoctorData = async () => {
    setLoading(true);
    try {
      const data = await getDoctorById(id);
      setDoctor(data.doctor);
      setReviews(data.reviews);

      // Select first available day by default if any exists
      if (data.doctor.availability) {
        const keys = Object.keys(data.doctor.availability);
        if (keys.length > 0) {
          setSelectedDay(keys[0]);
        }
      }
    } catch (error) {
      toast.error('Failed to load doctor profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warn('Please log in to book an appointment');
      return navigate('/login', { state: { from: `/doctors/${id}` } });
    }
    if (user.role !== 'Patient') {
      return toast.warn('Only patients can schedule appointment bookings');
    }
    if (!selectedDay || !selectedTime) {
      return toast.warn('Please select a valid day and slot time');
    }

    setBookingLoading(true);
    try {
      // Create date matching day of week relative to current date (simple mock helper)
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDayIndex = daysOfWeek.indexOf(selectedDay);
      const currentDate = new Date();
      const currentDayIndex = currentDate.getDay();
      let diff = targetDayIndex - currentDayIndex;
      if (diff <= 0) diff += 7; // Book next week's day if current day passed
      
      const apptDate = new Date(currentDate);
      apptDate.setDate(currentDate.getDate() + diff);

      await bookAppointment({
        doctorId: doctor._id,
        appointmentDate: apptDate.toISOString().split('T')[0],
        appointmentTime: selectedTime,
        reason,
      });

      toast.success('Appointment requested! Pending doctor confirmation.');
      setBookingModalOpen(false);
      navigate('/patient-dashboard');
    } catch (error) {
      toast.error(error || 'Failed to book slot');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20"><SkeletonLoader type="card" count={1} /></div>;
  if (!doctor) return <div className="text-center py-20">Doctor profile not found.</div>;

  const availableDays = doctor.availability ? Object.keys(doctor.availability) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 text-left">
      {/* 1. Doctor Profile Header Banner */}
      <div className="bg-white dark:bg-darkBg-card border border-slate-100 dark:border-darkBg-border p-6 md:p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
        {doctor.userId?.profileImage ? (
          <img
            src={doctor.userId.profileImage}
            alt={doctor.userId.name}
            className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-2 border-slate-100 dark:border-slate-800"
          />
        ) : (
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-brand-500/10 text-brand-600 dark:text-brand-500 flex items-center justify-center font-bold text-5xl">
            {doctor.userId?.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="flex-1 space-y-4 text-center md:text-left">
          <div>
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Dr. {doctor.userId?.name}</h1>
              {doctor.approved && (
                <span className="w-fit inline-flex items-center text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full mx-auto md:mx-0">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Practitioner
                </span>
              )}
            </div>
            <p className="text-brand-500 font-medium text-sm mt-1">{doctor.qualification} - {doctor.specialization}</p>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Highly qualified medical practitioner offering clinic and telemedicine services. Specializes in advanced {doctor.specialization.toLowerCase()} diagnoses and patient healthcare management.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Briefcase className="w-4 h-4 text-brand-500" />
              <span>{doctor.experience} Years Experience</span>
            </div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>{doctor.hospitalName} ({doctor.clinicAddress})</span>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
            <div className="flex items-center space-x-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Consultation Fee</span>
                <p className="text-xl font-bold text-slate-800 dark:text-white">₹{doctor.consultationFee}</p>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 h-8"></div>
              <div className="flex items-center space-x-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-sm text-slate-800 dark:text-white">{doctor.rating || 'N/A'}</span>
                <span className="text-xs text-slate-400">({doctor.totalReviews} Reviews)</span>
              </div>
            </div>

            <button
              onClick={() => setBookingModalOpen(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-8 py-3 rounded-2xl transition-all shadow-lg shadow-brand-500/20"
            >
              Book Consult
            </button>
          </div>
        </div>
      </div>

      {/* 2. Public Reviews Grid & Available Slots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Availability Calendar Card */}
        <div className="lg:col-span-4 bg-white dark:bg-darkBg-card p-6 rounded-3xl border border-slate-100 dark:border-darkBg-border space-y-6">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-500" /> Weekly Availability</h3>
          
          {availableDays.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-4">No hours set for this week.</p>
          ) : (
            <div className="space-y-4">
              {availableDays.map((day) => (
                <div key={day} className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{day}</span>
                  <div className="flex flex-wrap gap-1 max-w-[150px] justify-end">
                    {doctor.availability[day]?.map((slot) => (
                      <span key={slot} className="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reviews List */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-brand-500" /> Patient Feedback</h3>
          
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 dark:bg-darkBg-card/30 rounded-2xl border border-slate-100 dark:border-darkBg-border/60 text-slate-400 text-xs">
              No patient feedback reviews submitted yet.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white dark:bg-darkBg-card p-5 rounded-2xl border border-slate-100 dark:border-darkBg-border space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      {rev.patientId?.userId?.profileImage ? (
                        <img src={rev.patientId.userId.profileImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs">
                          {rev.patientId?.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-slate-800 dark:text-white">{rev.patientId?.userId?.name}</span>
                          <span className="inline-flex items-center text-[8px] font-bold text-brand-500 bg-brand-500/10 px-1.5 py-0.2 rounded-full">
                            Verified Patient
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-0.5">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left pl-11">
                    {rev.reviewText}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. Slot Booking Modal Dialog */}
      {bookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-darkBg-card border border-slate-100 dark:border-darkBg-border max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-darkBg-border pb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5"><Calendar className="w-4.5 h-4.5 text-brand-500" /> Book Consultation</h3>
              <button onClick={() => setBookingModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Close</button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Day selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Day</label>
                <select
                  value={selectedDay}
                  onChange={(e) => {
                    setSelectedDay(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                >
                  <option value="">Choose Day</option>
                  {availableDays.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              {/* Time slots */}
              {selectedDay && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Available Hour</label>
                  <div className="grid grid-cols-3 gap-2">
                    {doctor.availability[selectedDay]?.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 text-[10px] font-bold rounded-xl transition-all border ${
                          selectedTime === slot
                            ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/10'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-darkBg-border text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reason for Appointment */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason for Visit</label>
                <textarea
                  required
                  rows="3"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe symptoms briefly (e.g. routine dental checkup)..."
                  className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center space-x-2"
              >
                {bookingLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Request Booking Slot</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDetails;
