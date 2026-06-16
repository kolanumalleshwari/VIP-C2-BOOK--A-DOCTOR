import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../layouts/Sidebar.jsx';
import { getDoctors, approveDoctor } from '../services/doctorService.js';
import { getAdminAnalytics } from '../services/analyticsService.js';
import { getReports } from '../services/reportService.js';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import { toast } from 'react-toastify';
import { ShieldCheck, Users, FileText, BarChart3, Settings, Calendar, DollarSign, Stethoscope, UserCheck, X } from 'lucide-react';
import Chart from 'chart.js/auto';

const AdminDashboard = () => {
  const [currentTab, setCurrentTab] = useState('approvals');

  // Shared state
  const [doctors, setDoctors] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const chartRef1 = useRef(null);
  const chartRef2 = useRef(null);
  const chartInstance1 = useRef(null);
  const chartInstance2 = useRef(null);

  useEffect(() => {
    loadTabContent();
  }, [currentTab]);

  useEffect(() => {
    if (currentTab === 'analytics' && analytics) {
      renderCharts();
    }
    return () => {
      if (chartInstance1.current) chartInstance1.current.destroy();
      if (chartInstance2.current) chartInstance2.current.destroy();
    };
  }, [currentTab, analytics]);

  const loadTabContent = async () => {
    setLoading(true);
    try {
      if (currentTab === 'approvals') {
        const data = await getDoctors({ approved: 'false' });
        const data2 = await getDoctors({ approved: 'true' });
        setDoctors([...data, ...data2]);
      } else if (currentTab === 'reports') {
        const data = await getReports();
        setReports(data);
      } else if (currentTab === 'analytics') {
        const data = await getAdminAnalytics();
        setAnalytics(data);
      }
    } catch (error) {
      toast.error('Failed to load admin logs data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveToggle = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await approveDoctor(id, nextStatus);
      toast.success(`Practitioner status updated successfully! Approved: ${nextStatus}`);
      setDoctors(prev => prev.map(d => d._id === id ? { ...d, approved: nextStatus } : d));
    } catch (error) {
      toast.error('Failed to update doctor verification status');
    }
  };

  const renderCharts = () => {
    if (!chartRef1.current || !chartRef2.current) return;

    if (chartInstance1.current) chartInstance1.current.destroy();
    if (chartInstance2.current) chartInstance2.current.destroy();

    // Chart 1: Status Breakdown
    const statusLabels = analytics.appointmentsStatus.map(s => s._id);
    const statusCounts = analytics.appointmentsStatus.map(s => s.count);

    chartInstance1.current = new Chart(chartRef1.current, {
      type: 'doughnut',
      data: {
        labels: statusLabels,
        datasets: [{
          data: statusCounts,
          backgroundColor: ['#14b8a6', '#6366f1', '#e11d48', '#f59e0b'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
        }
      }
    });

    // Chart 2: Specialties Breakdown
    const specLabels = analytics.specialtiesBreakdown.map(s => s._id);
    const specCounts = analytics.specialtiesBreakdown.map(s => s.count);

    chartInstance2.current = new Chart(chartRef2.current, {
      type: 'bar',
      data: {
        labels: specLabels,
        datasets: [{
          label: 'Doctors',
          data: specCounts,
          backgroundColor: '#14b8a6',
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} role="Admin" />

      {/* Main Panel */}
      <div className="flex-1 p-6 md:p-8 bg-slate-50 dark:bg-darkBg text-left">
        {loading && currentTab !== 'profile' ? (
          <SkeletonLoader type="table" count={4} />
        ) : (
          <>
            {/* 1. Onboarding Verification Approvals Tab */}
            {currentTab === 'approvals' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Doctor Registration Verifications</h2>
                {doctors.length === 0 ? (
                  <EmptyState title="All Verifications Cleared" message="There are no onboarding profiles pending reviews currently." />
                ) : (
                  <div className="bg-white dark:bg-darkBg-card rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-darkBg-border">
                          <th className="px-6 py-4 font-bold text-slate-500">Name & specialty</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Hospital Details</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Qualification</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Verification Status</th>
                          <th className="px-6 py-4 font-bold text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {doctors.map((doc) => (
                          <tr key={doc._id}>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                {doc.userId?.profileImage ? (
                                  <img src={doc.userId.profileImage} alt="" className="w-9 h-9 rounded-lg object-cover" />
                                ) : (
                                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold">
                                    {doc.userId?.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="font-bold text-slate-800 dark:text-white">Dr. {doc.userId?.name}</p>
                                  <span className="text-[10px] text-brand-500 font-bold">{doc.specialization}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-700 dark:text-slate-300">{doc.hospitalName}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{doc.clinicAddress}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{doc.qualification} ({doc.experience} Yrs)</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                doc.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {doc.approved ? 'Approved' : 'Pending Verification'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleApproveToggle(doc._id, doc.approved)}
                                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                                  doc.approved
                                    ? 'border-red-200 text-red-500 hover:bg-red-50'
                                    : 'border-brand-500 text-brand-500 hover:bg-brand-500/10'
                                }`}
                              >
                                {doc.approved ? 'Deactivate' : 'Approve Verify'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. System Reports Log Tab */}
            {currentTab === 'reports' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Platform Records Logs</h2>
                {reports.length === 0 ? (
                  <EmptyState title="No Files Logged" message="There are no medical documents currently uploaded to the system." />
                ) : (
                  <div className="bg-white dark:bg-darkBg-card rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-darkBg-border">
                          <th className="px-6 py-4 font-bold text-slate-500">Document Title</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Patient Owner</th>
                          <th className="px-6 py-4 font-bold text-slate-500">Uploaded Time</th>
                          <th className="px-6 py-4 font-bold text-slate-500 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                        {reports.map((report) => (
                          <tr key={report._id}>
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                              <FileText className="w-4 h-4 text-brand-500" /> {report.reportTitle}
                            </td>
                            <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                              {report.patientId?.userId?.name || 'Unknown Patient'}
                            </td>
                            <td className="px-6 py-4 text-slate-400">{new Date(report.uploadDate).toLocaleString()}</td>
                            <td className="px-6 py-4 text-right">
                              <a
                                href={report.reportFile}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold px-3 py-1.5 rounded-lg border border-slate-200 dark:border-darkBg-border text-[10px]"
                              >
                                Download Link
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 3. Analytics Graphs Tab */}
            {currentTab === 'analytics' && analytics && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Platform Analytics</h2>
                
                {/* Analytics summary tiles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Patients</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{analytics.summary.totalPatients}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><Users className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Total Doctors</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{analytics.summary.totalDoctors}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><Stethoscope className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Appointments Booked</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{analytics.summary.totalAppointments}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><Calendar className="w-5 h-5" /></div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Revenue</span>
                      <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">₹{analytics.summary.totalRevenue}</p>
                    </div>
                    <div className="p-3 bg-brand-500/10 text-brand-500 rounded-xl"><DollarSign className="w-5 h-5" /></div>
                  </div>
                </div>

                {/* Graphs Canvas grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Consultations Status breakdown</h3>
                    <div className="relative w-64 h-64 mx-auto">
                      <canvas ref={chartRef1} />
                    </div>
                  </div>
                  <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border shadow-sm space-y-4">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Registered Specialties counts</h3>
                    <div className="relative h-64">
                      <canvas ref={chartRef2} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Global Settings */}
            {currentTab === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white border-b pb-3">Administrator Global Settings</h2>
                <div className="bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border text-slate-500 text-xs">
                  Global system administration settings panels, security audit variables log levels, database configurations, and mail integrations overrides details.
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
