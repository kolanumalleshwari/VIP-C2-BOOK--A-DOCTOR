import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../layouts/Sidebar.jsx';
import api from '../services/api.js';
import AppointmentTimeline from '../components/AppointmentTimeline.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { toast } from 'react-toastify';
import {
  Star,
  FileText,
  Trash2,
  Calendar,
  Clock,
  Video,
  CreditCard,
  Download,
  Plus,
  ShieldCheck,
  User,
  Activity,
  DollarSign
} from 'lucide-react';

const PatientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState('appointments');

  // Shared state
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savedDoctors, setSavedDoctors] = useState([]);
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

  // Records upload form state
  const [recordTitle, setRecordTitle] = useState('');
  const [recordType, setRecordType] = useState('Lab Report');
  const [description, setDescription] = useState('');
  const [recordFile, setRecordFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Payment simulated modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [payMethod, setPayMethod] = useState('Stripe');
  const [payLoading, setPayLoading] = useState(false);

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
        const res = await api.get('/api/appointments');
        setAppointments(res.data);
      } else if (currentTab === 'records') {
        const res = await api.get('/api/records');
        setRecords(res.data);
      } else if (currentTab === 'prescriptions') {
        const res = await api.get('/api/prescriptions/my-prescriptions');
        setPrescriptions(res.data);
      } else if (currentTab === 'payments') {
        const res = await api.get('/api/payments/history');
        setPayments(res.data);
      } else if (currentTab === 'notifications') {
        const res = await api.get('/api/notifications');
        setNotifications(res.data);
      } else if (currentTab === 'saved') {
        // Load saved doctors list (simulate list from profile)
        const res = await api.get('/api/doctors?approved=true');
        // slice first 3 as saved doctors demo bookmarks
        setSavedDoctors(res.data.slice(0, 3));
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment slot?')) return;
    try {
      await api.put(`/api/appointments/${id}`, { status: 'Cancelled' });
      toast.success('Appointment cancelled successfully');
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status: 'Cancelled' } : a))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
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
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleRecordUpload = async (e) => {
    e.preventDefault();
    if (!recordFile) return toast.warn('Please select a file to upload');

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append('recordTitle', recordTitle);
      formData.append('recordType', recordType);
      formData.append('description', description);
      formData.append('reportFile', recordFile); // Match controller upload multer key

      await api.post('/api/records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Medical record uploaded successfully');
      setRecordTitle('');
      setDescription('');
      setRecordFile(null);
      loadTabContent(); // Reload records list
    } catch (error) {
      toast.error('Failed to upload file record');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRecordDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await api.delete(`/api/records/${id}`);
      toast.success('Record deleted successfully');
      setRecords((prev) => prev.filter((r) => r._id !== id));
    } catch (error) {
      toast.error('Failed to delete record');
    }
  };

  const handleOpenPaymentModal = (appt) => {
    setSelectedAppt(appt);
    setPayModalOpen(true);
  };

  const handleProcessSimulatedPayment = async (e) => {
    e.preventDefault();
    setPayLoading(true);
    try {
      const amount = selectedAppt.doctorId.consultationFee;
      const res = await api.post('/api/payments/charge', {
        appointmentId: selectedAppt._id,
        amount,
        paymentMethod: payMethod,
      });

      toast.success(`Payment verified successfully! Trans ID: ${res.data.payment.transactionId}`);
      setPayModalOpen(false);
      loadTabContent(); // Refresh appointments feed
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment simulation failed');
    } finally {
      setPayLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      await api.post('/api/reviews', {
        doctorId: selectedDoctorId,
        rating: reviewRating,
        reviewText,
      });
      toast.success('Feedback review posted successfully!');
      setReviewModalOpen(false);
      setReviewText('');
      setReviewRating(5);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch min-h-[calc(100vh-4rem)]">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} role="Patient" />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 bg-[#F8FAFC] text-left">
        {loading && currentTab !== 'profile' ? (
          <SkeletonLoader type="table" count={4} />
        ) : (
          <>
            {/* 1. Appointments Portal */}
            {currentTab === 'appointments' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  My Consultations
                </h2>
                {appointments.length === 0 ? (
                  <EmptyState
                    title="No Bookings Scheduled"
                    message="Find specialized medical practitioners and book clinic or video consultations online."
                  />
                ) : (
                  <div className="space-y-6">
                    {appointments.map((appt) => (
                      <div
                        key={appt._id}
                        className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 relative overflow-hidden"
                      >
                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                          {/* Doctor */}
                          <div className="flex items-center space-x-4">
                            {appt.doctorId?.userId?.profileImage ? (
                              <img
                                src={appt.doctorId.userId.profileImage}
                                alt=""
                                className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-lg">
                                {appt.doctorId?.userId?.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="font-bold text-sm text-[#1E293B]">
                                Dr. {appt.doctorId?.userId?.name}
                              </h4>
                              <p className="text-xs text-[#14B8A6] font-semibold">
                                {appt.doctorId?.specialization}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#2563EB]" />{' '}
                              {new Date(appt.appointmentDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-[#2563EB]" /> {appt.appointmentTime}
                            </span>
                          </div>

                          {/* Telemedicine click-to-join link */}
                          {appt.status === 'Confirmed' && appt.telemedicineUrl && (
                            <a
                              href={appt.telemedicineUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-fit flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 transition"
                            >
                              <Video className="w-4 h-4" /> Join Video Call
                            </a>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            {appt.status === 'Completed' && (
                              <button
                                onClick={() => {
                                  setSelectedDoctorId(appt.doctorId._id);
                                  setReviewModalOpen(true);
                                }}
                                className="bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl shadow-sm transition"
                              >
                                Review Doctor
                              </button>
                            )}

                            {appt.status === 'Pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleOpenPaymentModal(appt)}
                                  className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
                                >
                                  <CreditCard className="w-3.5 h-3.5" /> Pay Now
                                </button>
                                <button
                                  onClick={() => handleCancelAppointment(appt._id)}
                                  className="text-red-500 hover:bg-red-50 text-[10px] font-bold px-3.5 py-1.5 rounded-xl border border-red-200"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}

                            <span
                              className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                                appt.status === 'Completed'
                                  ? 'bg-emerald-50 text-[#10B981]'
                                  : appt.status === 'Confirmed'
                                  ? 'bg-indigo-50 text-[#4338CA]'
                                  : appt.status === 'Cancelled'
                                  ? 'bg-rose-50 text-[#EF4444]'
                                  : 'bg-amber-50 text-[#F59E0B]'
                              }`}
                            >
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

            {/* 2. Medical Records Locker */}
            {currentTab === 'records' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Medical Locker
                </h2>

                {/* Upload Form */}
                <form
                  onSubmit={handleRecordUpload}
                  className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-sm"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Record Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lab Report March"
                      value={recordTitle}
                      onChange={(e) => setReportTitle(e.target.value)}
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB] text-slate-800"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Record Type</label>
                    <select
                      value={recordType}
                      onChange={(e) => setRecordType(e.target.value)}
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB] text-slate-800"
                    >
                      <option value="Lab Report">Lab Report</option>
                      <option value="Prescription">Prescription</option>
                      <option value="Scan">Clinical Scan</option>
                      <option value="Other">Other Document</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">File (PDF/PNG/JPG)</label>
                    <input
                      type="file"
                      required
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setRecordFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2563EB]/10 file:text-[#2563EB] hover:file:bg-[#2563EB]/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition flex items-center justify-center gap-1.5"
                  >
                    {uploadLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>Upload Record</>
                    )}
                  </button>
                </form>

                {/* Records List */}
                {records.length === 0 ? (
                  <EmptyState
                    title="No Records Archived"
                    message="Securely store and share lab blood reports, prescriptions, or clinical files."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {records.map((rec) => (
                      <div
                        key={rec._id}
                        className="bg-white p-5 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm"
                      >
                        <div className="flex items-center space-x-3 text-left">
                          <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] rounded-2xl">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#1E293B] truncate max-w-[180px]">
                              {rec.recordTitle}
                            </p>
                            <p className="text-[10px] text-[#14B8A6] font-semibold">{rec.recordType}</p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              Uploaded: {new Date(rec.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <a
                            href={rec.recordFile}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#F8FAFC] hover:bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-2 rounded-xl border border-slate-200"
                          >
                            View
                          </a>
                          <button
                            onClick={() => handleRecordDelete(rec._id)}
                            className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl"
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

            {/* 3. Prescriptions Locker */}
            {currentTab === 'prescriptions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  My Prescriptions
                </h2>
                {prescriptions.length === 0 ? (
                  <EmptyState
                    title="No Active Prescriptions"
                    message="Any medical prescriptions written by consulting doctors will show up here for your records."
                  />
                ) : (
                  <div className="space-y-4">
                    {prescriptions.map((rx) => (
                      <div
                        key={rx._id}
                        className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 text-left"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="font-bold text-[#1E293B]">Dr. {rx.doctorId?.userId?.name}</h4>
                            <p className="text-xs text-[#14B8A6] font-semibold">
                              {rx.doctorId?.userId?.specialization || 'Clinical Practitioner'}
                            </p>
                          </div>
                          <a
                            href={rx.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-fit flex items-center gap-1.5 px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10"
                          >
                            <Download className="w-4 h-4" /> Download PDF Prescription
                          </a>
                        </div>

                        {/* Medicines List */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prescribed Medicines</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {rx.medicines.map((med, idx) => (
                              <div key={idx} className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100 text-xs">
                                <p className="font-bold text-[#1E293B]">{med.name}</p>
                                <p className="text-slate-500 mt-1">Dosage: {med.dosage} | Frequency: {med.frequency}</p>
                                <p className="text-slate-400 mt-0.5">Duration: {med.duration}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {rx.advice && (
                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-xs">
                            <p className="font-bold text-amber-800">Advice / Instructions:</p>
                            <p className="text-amber-700 mt-1">{rx.advice}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. Payment Billing History */}
            {currentTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Billing & Payment History
                </h2>
                {payments.length === 0 ? (
                  <EmptyState
                    title="No Payment Records"
                    message="All transactions details from appointment bookings checkout will be listed here."
                  />
                ) : (
                  <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase">
                            <th className="p-4">Transaction ID</th>
                            <th className="p-4">Doctor</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Payment Method</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((p) => (
                            <tr key={p._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition text-xs">
                              <td className="p-4 font-mono font-bold text-[#4338CA]">{p.transactionId}</td>
                              <td className="p-4 font-semibold text-slate-800">
                                Dr. {p.appointmentId?.doctorId?.userId?.name || 'MediConnect Doctor'}
                              </td>
                              <td className="p-4 font-bold text-slate-800">${p.amount}</td>
                              <td className="p-4 text-slate-600 font-semibold">{p.paymentMethod}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                                  p.status === 'Success' ? 'bg-emerald-50 text-[#10B981]' : 'bg-rose-50 text-[#EF4444]'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4 text-right text-slate-500">
                                {new Date(p.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5. Bookmarked/Saved Doctors */}
            {currentTab === 'saved' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Saved Practitioner Profiles
                </h2>
                {savedDoctors.length === 0 ? (
                  <EmptyState
                    title="No Saved Profiles"
                    message="Bookmark doctor details for fast scheduling convenience."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {savedDoctors.map((doc) => (
                      <div
                        key={doc._id}
                        className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm space-y-4 text-center hover:shadow-md transition"
                      >
                        {doc.userId?.profileImage ? (
                          <img
                            src={doc.userId.profileImage}
                            alt=""
                            className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-slate-100"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-2xl mx-auto">
                            {doc.userId?.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-[#1E293B]">Dr. {doc.userId?.name}</h4>
                          <p className="text-xs text-[#14B8A6] font-semibold">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{doc.hospitalName}</p>
                        </div>
                        <button
                          onClick={() => (window.location.href = `/doctors/${doc._id}`)}
                          className="w-full py-2 bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/10"
                        >
                          Book Consult
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 6. Notifications Log */}
            {currentTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Notifications Log
                </h2>
                {notifications.length === 0 ? (
                  <EmptyState title="All Caught Up!" message="No push notifications received today." />
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n) => (
                      <div
                        key={n._id}
                        className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-start shadow-sm"
                      >
                        <div>
                          <p className="font-bold text-xs text-[#1E293B]">{n.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 font-semibold select-none">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 7. Profile Settings */}
            {currentTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  My Profile Details
                </h2>

                <form
                  onSubmit={handleProfileSubmit}
                  className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-3xl shadow-md shadow-blue-500/10">
                        {user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="space-y-2 text-center sm:text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Upload Profile Photo
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProfileImage(e.target.files[0])}
                        className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#2563EB]/10 file:text-[#2563EB] hover:file:bg-[#2563EB]/20"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
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
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Blood Group</label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
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
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
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
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold border border-transparent focus:border-[#2563EB] text-slate-800 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition"
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

      {/* 8. Payments Checkout Modal */}
      {payModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-1.5">
                <CreditCard className="w-4.5 h-4.5 text-[#2563EB]" /> Simulated Checkout
              </h3>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleProcessSimulatedPayment} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
                <p>
                  <strong>Doctor:</strong> Dr. {selectedAppt.doctorId.userId.name}
                </p>
                <p>
                  <strong>Specialty:</strong> {selectedAppt.doctorId.specialization}
                </p>
                <p className="text-[#2563EB] font-extrabold text-sm">
                  <strong>Consultation Fee:</strong> ${selectedAppt.doctorId.consultationFee}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Gateway</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Stripe', 'UPI', 'Wallet'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPayMethod(m)}
                      className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                        payMethod === m
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-md shadow-blue-500/10'
                          : 'bg-[#F8FAFC] border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {payMethod === 'Stripe' && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[10px] text-blue-600">
                  Simulates Stripe Checkout session routing to record success cards verification.
                </div>
              )}
              {payMethod === 'Wallet' && (
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-[10px] text-teal-600 flex justify-between">
                  <span>Simulated Balance: $10,000</span>
                  <strong>Charge: ${selectedAppt.doctorId.consultationFee}</strong>
                </div>
              )}
              {payMethod === 'UPI' && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-600">
                  Generates simulated UPI Intent QR code payment link context.
                </div>
              )}

              <button
                type="submit"
                disabled={payLoading}
                className="w-full bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center space-x-2"
              >
                {payLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Simulate successful charge of ${selectedAppt.doctorId.consultationFee}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. Star Reviews Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 max-w-md w-full p-6 rounded-3xl shadow-2xl space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Consult Feedback</h3>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-1.5 text-center">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Satisfaction Score
                </label>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= reviewRating ? 'text-yellow-400 fill-current' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Review Comments</label>
                <textarea
                  required
                  rows="4"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your clinical consultation visit..."
                  className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] border border-transparent text-slate-800"
                />
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2"
              >
                {reviewLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Submit Feedback Review</span>
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
