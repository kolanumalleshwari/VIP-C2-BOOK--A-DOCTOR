import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../layouts/Sidebar.jsx';
import { getAppointments, updateAppointmentStatus } from '../services/appointmentService.js';
import { getDoctorAnalytics } from '../services/analyticsService.js';
import { getReports } from '../services/reportService.js';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { toast } from 'react-toastify';
import { Calendar, Clock, DollarSign, Star, FileText, Check, X, ShieldAlert, Sparkles, User, Settings } from 'lucide-react';

const DoctorDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState('requests');

  // Shared state
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [patientReports, setPatientReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [specialization, setSpecialization] = useState(user?.profileDetails?.specialization || 'General');
  const [qualification, setQualification] = useState(user?.profileDetails?.qualification || 'MBBS');
  const [experience, setExperience] = useState(user?.profileDetails?.experience || 0);
  const [consultationFee, setConsultationFee] = useState(user?.profileDetails?.consultationFee || 500);
  const [hospitalName, setHospitalName] = useState(user?.profileDetails?.hospitalName || '');
  const [clinicAddress, setClinicAddress] = useState(user?.profileDetails?.clinicAddress || '');
  const [profileImage, setProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Scheduler state
  const [availability, setAvailability] = useState(user?.profileDetails?.availability || {});
  const [newDay, setNewDay] = useState('Monday');
  const [newSlot, setNewSlot] = useState('');

  // Search reports state
  const [targetPatientId, setTargetPatientId] = useState('');
  const [reportsLoading, setReportsLoading] = useState(false);

  useEffect(() => {
    loadTabContent();
  }, [currentTab]);

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (currentTab === 'requests') {
        const data = await getAppointments();
        setAppointments(data);
      } else if (currentTab === 'analytics') {
        const data = await getDoctorAnalytics();
        setAnalytics(data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment status updated to ${status}`);
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status } : a));
    } catch (error) {
      toast.error(error || 'Failed to update appointment status');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('phone', phone);
      formData.append('gender', gender);
      
      const doctorDetails = {
        specialization,
        qualification,
        experience,
        consultationFee,
        hospitalName,
        clinicAddress,
        availability, // Injects availability map updates
      };
      formData.append('doctorDetails', JSON.stringify(doctorDetails));

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await updateProfile(formData);
      toast.success('Doctor onboarding parameters updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlot) return toast.warn('Please input a valid slot time (e.g. 09:00)');
    setAvailability(prev => {
      const daySlots = prev[newDay] || [];
      if (daySlots.includes(newSlot)) {
        toast.warn('Slot already exists');
        return prev;
      }
      const updated = { ...prev, [newDay]: [...daySlots, newSlot].sort() };
      return updated;
    });
    setNewSlot('');
  };

  const handleRemoveSlot = (day, slotToRemove) => {
    setAvailability(prev => {
      const daySlots = prev[day] || [];
      const filtered = daySlots.filter(s => s !== slotToRemove);
      const updated = { ...prev };
      if (filtered.length === 0) {
        delete updated[day];
      } else {
        updated[day] = filtered;
      }
      return updated;
    });
  };

  const handleSearchReports = async (e) => {
    e.preventDefault();
    if (!targetPatientId) return toast.warn('Please enter a valid Patient ID');
    
    setReportsLoading(true);
    try {
      const data = await getReports(targetPatientId);
      setPatientReports(data);
    } catch (error) {
      toast.error(error || 'Access denied or patient not found');
    } finally {
      setReportsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} role="Doctor" />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-darkBg text-left">
        {loading && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'reports' ? (
          <SkeletonLoader type="table" count={4} />
        ) : (
          <>
            {/* Onboarding warning if not approved */}
            {!user?.profileDetails?.approved && (
              <div className="mb-6 flex items-center space-x-3 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-100 dark:border-yellow-950/30 text-yellow-700 text-xs">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>
                  <strong>Account Approval Pending</strong>: Your medical profile details are awaiting verification from admin coordinators. You won't appear in public patient directories until approved.
                </span>
              </div>
            )}

            {/* 1. Requests Tab */}
            {currentTab === 'requests' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Consultation Requests</h2>
                {appointments.length === 0 ? (
                  <EmptyState title="No Scheduled Appointments" message="You don't have any appointments booked currently." />
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div key={appt._id} className="bg-white dark:bg-darkBg-card border border-slate-100 dark:border-darkBg-border p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                        {/* Patient info */}
                        <div className="flex items-center space-x-4">
                          {appt.patientId?.userId?.profileImage ? (
                            <img src={appt.patientId.userId.profileImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-500 flex items-center justify-center font-bold text-lg">
                              {appt.patientId?.userId?.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white">{appt.patientId?.userId?.name}</h4>
                              <span className="text-[10px] text-slate-400">({appt.patientId?.userId?._id})</span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1"><strong>Reason:</strong> {appt.reason}</p>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {appt.appointmentTime}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {appt.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleAction(appt._id, 'Confirmed')}
                                className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-xl"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAction(appt._id, 'Cancelled')}
                                className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {appt.status === 'Confirmed' && (
                            <button
                              onClick={() => handleAction(appt._id, 'Completed')}
                              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all"
                            >
                              Complete Consult
                            </button>
                          )}
                          {appt.status !== 'Pending' && appt.status !== 'Confirmed' && (
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              appt.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {appt.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Schedule Config Tab */}
            {currentTab === 'schedule' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Configure Availability</h2>
                
                {/* Form to add slots */}
                <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Day</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Hour (24-Hour Format)</label>
                    <input
                      type="text"
                      placeholder="e.g. 09:30 or 14:00"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                    />
                  </div>
                  <button onClick={handleAddSlot} className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md">
                    Add Time Slot
                  </button>
                </div>

                {/* Display Current Schedule map */}
                <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Active Schedule Configurations</h3>
                  {Object.keys(availability).length === 0 ? (
                    <p className="text-slate-400 text-xs">No hours configured yet. Configure time slots above and click 'Save Doctor Profile' to publish details.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(availability).map((day) => (
                        <div key={day} className="flex justify-between items-start border-b border-slate-50 dark:border-slate-800 pb-3">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{day}</span>
                          <div className="flex flex-wrap gap-2 max-w-lg justify-end">
                            {availability[day].map((slot) => (
                              <span key={slot} className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-500 px-2 py-1 rounded-lg">
                                {slot}
                                <button onClick={() => handleRemoveSlot(day, slot)} className="text-red-500 hover:text-red-600">×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button onClick={handleProfileSubmit} className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md">
                    Save Schedule Updates
                  </button>
                </div>
              </div>
            )}

            {/* 3. Patient Reports Tab */}
            {currentTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Access Patient Records</h2>
                
                <form onSubmit={handleSearchReports} className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Object/User ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Input patient's ID (visible in appointment requests)..."
                      value={targetPatientId}
                      onChange={(e) => setTargetPatientId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  <button type="submit" disabled={reportsLoading} className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl shadow-md">
                    {reportsLoading ? 'Querying...' : 'View Records'}
                  </button>
                </form>

                {/* Patient records list */}
                {patientReports.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-darkBg-card rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    Input a patient ID with active consultation history to safely inspect clinical records.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientReports.map((report) => (
                      <div key={report._id} className="bg-white dark:bg-darkBg-card p-4 rounded-xl border border-slate-100 dark:border-darkBg-border flex justify-between items-center shadow-sm">
                        <div className="flex items-center space-x-3 text-left">
                          <div className="p-3 bg-brand-500/10 text-brand-600 rounded-xl">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800 dark:text-white">{report.reportTitle}</p>
                            <p className="text-[9px] text-slate-400 mt-1">Uploaded: {new Date(report.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a
                          href={report.reportFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-brand-500 hover:bg-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          View File
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Earnings & Reviews Analytics Tab */}
            {currentTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Earnings & Reviews Overview</h2>
                
                {/* Analytics summary tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Consults</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{analytics.summary.totalAppointments}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><Calendar className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Earnings</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">₹{analytics.summary.earnings}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Average Rating</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{analytics.summary.rating || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><Star className="w-5 h-5 text-yellow-400 fill-current" /></div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Reviews</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{analytics.summary.totalReviews}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><FileText className="w-5 h-5" /></div>
                  </div>
                </div>

                {/* Reviews breakdown list */}
                <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Recent Feedback Reviews</h3>
                  {analytics.recentReviews.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-6">No patient feedback reviews submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.recentReviews.map((rev) => (
                        <div key={rev._id} className="border-b border-slate-50 dark:border-slate-850 pb-4 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800 dark:text-white">{rev.patientId?.userId?.name || 'Anonymous'}</span>
                            <div className="flex items-center space-x-0.5">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rev.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Doctor Profile Settings Tab */}
            {currentTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Practitioner Profile Settings</h2>
                
                <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border space-y-6">
                  {/* Photo details */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-darkBg-border">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-brand-500 text-white flex items-center justify-center font-bold text-3xl">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-2 text-center sm:text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Upload Practitioner Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                        className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-500/10 file:text-brand-600"
                      />
                    </div>
                  </div>

                  {/* Core details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialization</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qualification</label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience (Years)</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee (INR)</label>
                      <input
                        type="number"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital / Clinic Name</label>
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Mailing Address</label>
                    <textarea
                      rows="2"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5"
                  >
                    {profileLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Save Onboarding Info</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
