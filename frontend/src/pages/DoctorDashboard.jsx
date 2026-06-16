import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Sidebar from '../layouts/Sidebar.jsx';
import api from '../services/api.js';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { toast } from 'react-toastify';
import {
  Calendar,
  Clock,
  DollarSign,
  Star,
  FileText,
  Check,
  X,
  ShieldAlert,
  Plus,
  Trash2,
  Download,
  User,
  Video
} from 'lucide-react';

const DoctorDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [currentTab, setCurrentTab] = useState('requests');

  // Shared state
  const [appointments, setAppointments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [doctorPrescriptions, setDoctorPrescriptions] = useState([]);
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

  // Search records state
  const [targetPatientId, setTargetPatientId] = useState('');
  const [recordsLoading, setRecordsLoading] = useState(false);

  // Prescription writer state
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [advice, setAdvice] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  useEffect(() => {
    loadTabContent();
  }, [currentTab]);

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (currentTab === 'requests' || currentTab === 'calendar') {
        const res = await api.get('/api/appointments');
        setAppointments(res.data);
      } else if (currentTab === 'analytics') {
        const res = await api.get('/api/analytics/doctor');
        setAnalytics(res.data);
      } else if (currentTab === 'prescriptions') {
        const res = await api.get('/api/prescriptions/doctor-prescriptions');
        setDoctorPrescriptions(res.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    try {
      await api.put(`/api/appointments/${id}`, { status });
      toast.success(`Appointment status updated to ${status}`);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
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
        availability,
      };
      formData.append('doctorDetails', JSON.stringify(doctorDetails));

      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      await updateProfile(formData);
      toast.success('Practitioner profile updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile details');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlot) return toast.warn('Please input a valid slot time (e.g. 09:30)');
    setAvailability((prev) => {
      const daySlots = prev[newDay] || [];
      if (daySlots.includes(newSlot)) {
        toast.warn('Time slot already exists');
        return prev;
      }
      return { ...prev, [newDay]: [...daySlots, newSlot].sort() };
    });
    setNewSlot('');
  };

  const handleRemoveSlot = (day, slotToRemove) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      const filtered = daySlots.filter((s) => s !== slotToRemove);
      const updated = { ...prev };
      if (filtered.length === 0) {
        delete updated[day];
      } else {
        updated[day] = filtered;
      }
      return updated;
    });
  };

  const handleSearchRecords = async (e) => {
    e.preventDefault();
    if (!targetPatientId) return toast.warn('Please enter a valid Patient ID');

    setRecordsLoading(true);
    try {
      const res = await api.get(`/api/records?patientId=${targetPatientId}`);
      setPatientRecords(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Access denied or records not found');
    } finally {
      setRecordsLoading(false);
    }
  };

  // Prescription Widget Actions
  const handleOpenPrescriptionModal = (appt) => {
    setSelectedAppt(appt);
    setMedicines([{ name: '', dosage: '', frequency: '', duration: '' }]);
    setAdvice('');
    setNotes('');
    setPrescriptionModalOpen(true);
  };

  const handleAddMed = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMed = (index) => {
    setMedicines(medicines.filter((_, idx) => idx !== index));
  };

  const handleMedChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setPrescriptionLoading(true);
    try {
      await api.post('/api/prescriptions', {
        appointmentId: selectedAppt._id,
        medicines,
        advice,
        notes,
      });

      toast.success('Prescription generated successfully! Invoice compiled.');
      setPrescriptionModalOpen(false);
      loadTabContent(); // Refresh appointments feed
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save prescription');
    } finally {
      setPrescriptionLoading(false);
    }
  };

  // Convert appointments to FullCalendar format
  const calendarEvents = appointments
    .filter((a) => a.status === 'Confirmed')
    .map((a) => {
      // Parse dates and times
      const cleanDate = a.appointmentDate.split('T')[0];
      const timeStr = a.appointmentTime; // e.g. "09:00"
      return {
        id: a._id,
        title: `Patient ${a.patientId?.userId?.name || 'Appointment'}`,
        start: `${cleanDate}T${timeStr}:00`,
        backgroundColor: '#4338CA',
        borderColor: '#4338CA',
      };
    });

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch min-h-[calc(100vh-4rem)]">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} role="Doctor" />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 bg-[#F8FAFC] text-left">
        {/* Onboarding Alert */}
        {!user?.profileDetails?.approved && (
          <div className="mb-6 flex items-center space-x-3 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>
              <strong>Practitioner Approval Pending</strong>: Your medical license details are being reviewed by platform operations coordinators. You won't appear in directories until pre-approved.
            </span>
          </div>
        )}

        {loading && currentTab !== 'profile' && currentTab !== 'schedule' && currentTab !== 'reports' && (
          <SkeletonLoader type="table" count={4} />
        )}

        {!loading && (
          <>
            {/* Tab 1: Requests & Actions */}
            {currentTab === 'requests' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Consultation Bookings
                </h2>
                {appointments.length === 0 ? (
                  <EmptyState title="No Bookings Today" message="You don't have any appointments scheduled yet." />
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appt) => (
                      <div
                        key={appt._id}
                        className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition"
                      >
                        {/* Patient info */}
                        <div className="flex items-center space-x-4">
                          {appt.patientId?.userId?.profileImage ? (
                            <img
                              src={appt.patientId.userId.profileImage}
                              alt=""
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-lg">
                              {appt.patientId?.userId?.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-sm text-[#1E293B]">
                              {appt.patientId?.userId?.name}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase">ID: {appt.patientId?._id}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              <strong>Symptoms:</strong> {appt.reason}
                            </p>
                          </div>
                        </div>

                        {/* Date and Time */}
                        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-[#2563EB]" />{' '}
                            {new Date(appt.appointmentDate).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#2563EB]" /> {appt.appointmentTime}
                          </span>
                        </div>

                        {/* Telemedicine call link */}
                        {appt.status === 'Confirmed' && appt.telemedicineUrl && (
                          <a
                            href={appt.telemedicineUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-fit flex items-center gap-1.5 px-4 py-2 bg-[#14B8A6] hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-teal-500/10"
                          >
                            <Video className="w-4 h-4" /> Start Video
                          </a>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {appt.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleAction(appt._id, 'Confirmed')}
                                className="bg-[#2563EB] hover:bg-blue-600 text-white p-2.5 rounded-xl transition shadow-md"
                              >
                                <Check className="w-4.5 h-4.5" />
                              </button>
                              <button
                                onClick={() => handleAction(appt._id, 'Cancelled')}
                                className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-xl transition shadow-md"
                              >
                                <X className="w-4.5 h-4.5" />
                              </button>
                            </>
                          )}

                          {appt.status === 'Confirmed' && (
                            <button
                              onClick={() => handleOpenPrescriptionModal(appt)}
                              className="bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-md"
                            >
                              Prescribe & Complete
                            </button>
                          )}

                          {appt.status !== 'Pending' && appt.status !== 'Confirmed' && (
                            <span
                              className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${
                                appt.status === 'Completed'
                                  ? 'bg-emerald-50 text-[#10B981]'
                                  : 'bg-rose-50 text-[#EF4444]'
                              }`}
                            >
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

            {/* Tab 2: Scheduler Calendar display */}
            {currentTab === 'calendar' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  My Appointment Calendar
                </h2>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    events={calendarEvents}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    allDaySlot={false}
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Prescriptions list */}
            {currentTab === 'prescriptions' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Written Prescriptions
                </h2>
                {doctorPrescriptions.length === 0 ? (
                  <EmptyState title="No Prescriptions Written" message="Prescriptions compiled for patients will show up here." />
                ) : (
                  <div className="space-y-4">
                    {doctorPrescriptions.map((rx) => (
                      <div key={rx._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <h4 className="font-bold text-slate-800">Patient: {rx.patientId?.userId?.name}</h4>
                            <p className="text-[10px] text-slate-400">ID: {rx.patientId?._id}</p>
                          </div>
                          <a
                            href={rx.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-4 py-2 bg-[#2563EB] hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/10"
                          >
                            <Download className="w-3.5 h-3.5" /> View PDF
                          </a>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medicines</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            {rx.medicines.map((med, idx) => (
                              <div key={idx} className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-100">
                                <p className="font-bold text-[#1E293B]">{med.name}</p>
                                <p className="text-slate-500 mt-1">Dose: {med.dosage} | Frequency: {med.frequency}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Availability Config */}
            {currentTab === 'schedule' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Configure Availability Slots
                </h2>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end shadow-sm">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Day</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
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
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time (24-Hour Format)</label>
                    <input
                      type="text"
                      placeholder="e.g. 10:30"
                      value={newSlot}
                      onChange={(e) => setNewSlot(e.target.value)}
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                    />
                  </div>
                  <button
                    onClick={handleAddSlot}
                    className="py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition"
                  >
                    Add Slot
                  </button>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Weekly Schedule</h3>
                  {Object.keys(availability).length === 0 ? (
                    <p className="text-slate-400 text-xs">No slots configured yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {Object.keys(availability).map((day) => (
                        <div key={day} className="flex justify-between items-start border-b border-slate-50 pb-3">
                          <span className="text-xs font-bold text-slate-700">{day}</span>
                          <div className="flex flex-wrap gap-2 max-w-lg justify-end">
                            {availability[day].map((slot) => (
                              <span
                                key={slot}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-[#2563EB]/10 text-[#2563EB] px-2 py-1 rounded-lg"
                              >
                                {slot}
                                <button onClick={() => handleRemoveSlot(day, slot)} className="text-rose-500 hover:text-rose-600 font-extrabold text-xs">
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProfileSubmit}
                    className="px-6 py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Save Availability Updates
                  </button>
                </div>
              </div>
            )}

            {/* Tab 5: Patient Records Locker */}
            {currentTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Inspect Patient Records Locker
                </h2>

                <form
                  onSubmit={handleSearchRecords}
                  className="bg-white p-6 rounded-3xl border border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end shadow-sm"
                >
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Object/User ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Input patient's specific ID to lookup..."
                      value={targetPatientId}
                      onChange={(e) => setTargetPatientId(e.target.value)}
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB] text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recordsLoading}
                    className="w-full py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {recordsLoading ? 'Verifying...' : 'Unlock Locker'}
                  </button>
                </form>

                {patientRecords.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
                    Input a patient ID with verified appointment history to inspect shared medical scans or files.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patientRecords.map((rec) => (
                      <div
                        key={rec._id}
                        className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm"
                      >
                        <div className="flex items-center space-x-3 text-left">
                          <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] rounded-xl">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-slate-800">{rec.recordTitle}</p>
                            <p className="text-[9px] text-[#14B8A6] font-semibold">{rec.recordType}</p>
                            <p className="text-[9px] text-slate-400 mt-1">
                              Uploaded: {new Date(rec.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <a
                          href={rec.recordFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#2563EB] hover:bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                        >
                          Open Locker File
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 6: Analytics */}
            {currentTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Earnings Analytics & Reviews
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Bookings</span>
                      <p className="text-2xl font-bold text-slate-850 mt-1">{analytics.summary.totalAppointments}</p>
                    </div>
                    <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] rounded-xl">
                      <Calendar className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Verified Earnings</span>
                      <p className="text-2xl font-bold text-slate-850 mt-1">${analytics.summary.earnings}</p>
                    </div>
                    <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] rounded-xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Star Rating</span>
                      <p className="text-2xl font-bold text-slate-850 mt-1">{analytics.summary.rating || 'N/A'}</p>
                    </div>
                    <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Reviews</span>
                      <p className="text-2xl font-bold text-slate-850 mt-1">{analytics.summary.totalReviews}</p>
                    </div>
                    <div className="p-3 bg-[#2563EB]/10 text-[#2563EB] rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-4 shadow-sm">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">Recent Patient Feedback</h3>
                  {analytics.recentReviews.length === 0 ? (
                    <p className="text-slate-400 text-xs text-center py-6">No patient feedback reviews submitted yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {analytics.recentReviews.map((rev) => (
                        <div key={rev._id} className="border-b border-slate-100 pb-4 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{rev.patientId?.userId?.name || 'Anonymous'}</span>
                            <div className="flex items-center space-x-0.5">
                              {Array(5).fill(0).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">{rev.reviewText}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 7: Profile settings */}
            {currentTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[#4338CA] border-b border-slate-200/60 pb-3">
                  Practitioner Profile Settings
                </h2>

                <form
                  onSubmit={handleProfileSubmit}
                  className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="" className="w-20 h-20 rounded-2xl object-cover border border-slate-100" />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-3xl shadow-sm">
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
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialization</label>
                      <input
                        type="text"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Qualification</label>
                      <input
                        type="text"
                        value={qualification}
                        onChange={(e) => setQualification(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience (Years)</label>
                      <input
                        type="number"
                        value={experience}
                        onChange={(e) => setExperience(Number(e.target.value))}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee ($)</label>
                      <input
                        type="number"
                        value={consultationFee}
                        onChange={(e) => setConsultationFee(Number(e.target.value))}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital Clinic Name</label>
                      <input
                        type="text"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Clinic Address</label>
                    <textarea
                      rows="2"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                      className="w-full bg-[#F8FAFC] px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-[#2563EB]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-3 bg-[#2563EB] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    {profileLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span>Save Onboarding Details</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </>
        )}
      </div>

      {/* 7. Prescription Composer Modal */}
      {prescriptionModalOpen && selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 max-w-xl w-full p-6 rounded-3xl shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Rx Prescription Creator</h3>
              <button
                onClick={() => setPrescriptionModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePrescriptionSubmit} className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
                <p>
                  <strong>Patient Name:</strong> {selectedAppt.patientId.userId.name}
                </p>
                <p>
                  <strong>Patient Age:</strong> {selectedAppt.patientId.age} Years
                </p>
              </div>

              {/* Dynamic Medicine Rows */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Medicines</label>
                  <button
                    type="button"
                    onClick={handleAddMed}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB]/10 text-[#2563EB] hover:bg-[#2563EB]/20 rounded-xl text-[10px] font-bold transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Medicine
                  </button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="col-span-4 space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="Medicine Name"
                          value={med.name}
                          onChange={(e) => handleMedChange(index, 'name', e.target.value)}
                          className="w-full bg-white px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="Dose"
                          value={med.dosage}
                          onChange={(e) => handleMedChange(index, 'dosage', e.target.value)}
                          className="w-full bg-white px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="Frequency"
                          value={med.frequency}
                          onChange={(e) => handleMedChange(index, 'frequency', e.target.value)}
                          className="w-full bg-white px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <input
                          type="text"
                          required
                          placeholder="Duration"
                          value={med.duration}
                          onChange={(e) => handleMedChange(index, 'duration', e.target.value)}
                          className="w-full bg-white px-2 py-1.5 border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div className="col-span-1 text-center">
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMed(index)}
                            className="text-rose-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diet / General Advice</label>
                <textarea
                  rows="2"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  placeholder="e.g. Rest for 2 days, drink fluids..."
                  className="w-full bg-[#F8FAFC] px-4 py-2 border border-slate-200 focus:border-[#2563EB] rounded-xl text-xs"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Internal Consultation Notes</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Diagnostic details..."
                  className="w-full bg-[#F8FAFC] px-4 py-2 border border-slate-200 focus:border-[#2563EB] rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={prescriptionLoading}
                className="w-full py-3 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2"
              >
                {prescriptionLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>Compile & Generate PDF Prescription</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
