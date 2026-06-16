import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../layouts/Sidebar.jsx';
import { getAppointments, updateAppointmentStatus } from '../services/appointmentService.js';
import { getReports, uploadReport, deleteReport } from '../services/reportService.js';
import { getNotifications, markNotificationsRead } from '../services/notificationService.js';
import { createReview } from '../services/reviewService.js';
import AppointmentTimeline from '../components/AppointmentTimeline.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { toast } from 'react-toastify';
import { Star, FileText, Trash2, Calendar, Clock, Stethoscope, Mail, Shield, User, FilePlus } from 'lucide-react';

const PatientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState('appointments');

  // Shared state
  const [appointments, setAppointments] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile forms state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [age, setAge] = useState(user?.profileDetails?.age || 18);
  const [bloodGroup, setBloodGroup] = useState(user?.profileDetails?.bloodGroup || 'O+');
  const [emergencyContact, setEmergencyContact] = useState(user?.profileDetails?.emergencyContact || '');
  const [address, setAddress] = useState(user?.profileDetails?.address || '');
  const [profileImage, setProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Reports upload form state
  const [reportTitle, setReportTitle] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    loadTabContent();
  }, [currentTab]);

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (currentTab === 'appointments') {
        const data = await getAppointments();
        setAppointments(data);
      } else if (currentTab === 'reports') {
        const data = await getReports();
        setReports(data);
      } else if (currentTab === 'notifications') {
        const data = await getNotifications();
        setNotifications(data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;
    try {
      await updateAppointmentStatus(id, 'Cancelled');
      toast.success('Appointment cancelled successfully');
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
    } catch (error) {
      toast.error(error || 'Failed to cancel appointment');
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
      
      const patientDetails = { age, bloodGroup, emergencyContact, address };
      formData.append('patientDetails', JSON.stringify(patientDetails));

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await updateProfile(formData);
      toast.success('Profile details updated successfully!');
    } catch (error) {
      toast.error(error || 'Failed to update profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleReportUpload = async (e) => {
    e.preventDefault();
    if (!reportFile) return toast.warn('Please select a file to upload');

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('reportTitle', reportTitle);
      formData.append('reportFile', reportFile);

      await uploadReport(formData);
      toast.success('Medical report uploaded successfully');
      setReportTitle('');
      setReportFile(null);
      loadTabContent(); // Reload reports list
    } catch (error) {
      toast.error('Failed to upload report file');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleReportDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical report?')) return;
    try {
      await deleteReport(id);
      toast.success('Report deleted successfully');
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await createReview({
        doctorId: selectedDoctorId,
        rating: reviewRating,
        reviewText,
      });
      toast.success('Review submitted successfully! Thank you for your feedback.');
      setReviewModalOpen(false);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      toast.error(error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} role="Patient" />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-darkBg text-left">
        {loading && currentTab !== 'profile' ? (
          <SkeletonLoader type="table" count={4} />
        ) : (
          <>
            {/* 1. Appointments Tab */}
            {currentTab === 'appointments' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">My Appointments</h2>
                {appointments.length === 0 ? (
                  <EmptyState title="No Scheduled Appointments" message="You don't have any appointments booked yet. Search specialists to book a consult." />
                ) : (
                  <div className="space-y-6">
                    {appointments.map((appt) => (
                      <div key={appt._id} className="bg-white dark:bg-darkBg-card border border-slate-100 dark:border-darkBg-border p-6 rounded-2xl shadow-sm space-y-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          {/* Doctor details */}
                          <div className="flex items-center space-x-4">
                            {appt.doctorId?.userId?.profileImage ? (
                              <img src={appt.doctorId.userId.profileImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-500 flex items-center justify-center font-bold text-lg">
                                {appt.doctorId?.userId?.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Dr. {appt.doctorId?.userId?.name}</h4>
                              <p className="text-xs text-brand-500 font-medium">{appt.doctorId?.specialization}</p>
                            </div>
                          </div>

                          {/* Date and Time */}
                          <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5 text-slate-500"><Calendar className="w-4 h-4" /> {new Date(appt.appointmentDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-4 h-4" /> {appt.appointmentTime}</span>
                          </div>

                          {/* Status and Action */}
                          <div className="flex items-center gap-3">
                            {appt.status === 'Completed' && (
                              <button
                                onClick={() => {
                                  setSelectedDoctorId(appt.doctorId._id);
                                  setReviewModalOpen(true);
                                }}
                                className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all"
                              >
                                Review Doctor
                              </button>
                            )}
                            {appt.status === 'Pending' && (
                              <button
                                onClick={() => handleCancelAppointment(appt._id)}
                                className="text-red-500 hover:bg-red-50 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-red-200"
                              >
                                Cancel
                              </button>
                            )}
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              appt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                              appt.status === 'Confirmed' ? 'bg-indigo-100 text-indigo-700' :
                              appt.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {appt.status}
                            </span>
                          </div>
                        </div>

                        {/* Stage Progress Timeline */}
                        <AppointmentTimeline status={appt.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Medical Reports Tab */}
            {currentTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">Medical Reports</h2>
                </div>

                {/* Upload Form */}
                <form onSubmit={handleReportUpload} className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab Blood Test PDF"
                      value={reportTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Report File (PDF/PNG/JPG)</label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setReportFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-500/10 file:text-brand-600 hover:file:bg-brand-500/20"
                    />
                  </div>
                  <button type="submit" disabled={uploadLoading} className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5">
                    {uploadLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <><FilePlus className="w-4 h-4" /> Upload Report</>
                    )}
                  </button>
                </form>

                {/* Reports List */}
                {reports.length === 0 ? (
                  <EmptyState title="No Medical Reports" message="Upload clinical records, laboratory scans or doctor prescriptions to share them with consulting specialists." />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reports.map((report) => (
                      <div key={report._id} className="bg-white dark:bg-darkBg-card p-4 rounded-xl border border-slate-100 dark:border-darkBg-border flex justify-between items-center shadow-sm">
                        <div className="flex items-center space-x-3 text-left">
                          <div className="p-3 bg-brand-500/10 text-brand-600 rounded-xl">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800 dark:text-white truncate max-w-[180px]">{report.reportTitle}</p>
                            <p className="text-[9px] text-slate-400 mt-1">{new Date(report.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={report.reportFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-darkBg-border"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleReportDelete(report._id)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Notifications Tab */}
            {currentTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">My Notifications Log</h2>
                {notifications.length === 0 ? (
                  <EmptyState title="All Caught Up!" message="You don't have any push alerts or reminders currently." />
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div key={n._id} className="bg-white dark:bg-darkBg-card p-4 rounded-xl border border-slate-100 dark:border-darkBg-border flex justify-between items-start">
                        <div>
                          <p className="font-bold text-xs text-slate-800 dark:text-white">{n.title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 shrink-0">{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Profile Settings Tab */}
            {currentTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Patient Profile Settings</h2>
                
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
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Upload Profile Photo</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                        className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-500/10 file:text-brand-600 hover:file:bg-brand-500/20"
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
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age</label>
                      <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Contact</label>
                      <input
                        type="text"
                        placeholder="Emergency contact phone..."
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Address</label>
                    <textarea
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Home mailing address..."
                      className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center gap-1.5"
                  >
                    {profileLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Save Profile Details</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* 5. Doctor Review Rating Star Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-darkBg-card border border-slate-100 dark:border-darkBg-border max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-darkBg-border pb-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Review Consult Experience</h3>
              <button onClick={() => setReviewModalOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold">Close</button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star selector */}
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Assign Score</label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Feedback Description</label>
                <textarea
                  required
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your clinical consultation visit..."
                  className="w-full bg-slate-50 dark:bg-slate-800 px-4 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/10 flex items-center justify-center space-x-2"
              >
                {reviewLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Submit Review</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
