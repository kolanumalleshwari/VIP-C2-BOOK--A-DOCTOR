import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, ArrowUpDown, Star, Briefcase, MapPin, DollarSign, Stethoscope } from 'lucide-react';
import { getDoctors } from '../services/doctorService.js';
import SkeletonLoader from '../components/SkeletonLoader.jsx';
import EmptyState from '../components/EmptyState.jsx';

const DoctorDiscovery = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [specialization, setSpecialization] = useState(searchParams.get('specialization') || '');
  const [experience, setExperience] = useState('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [hospital, setHospital] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState('');

  // Sync states when URL search parameters change (e.g. from homepage category clicks)
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSpecialization(searchParams.get('specialization') || '');
  }, [searchParams]);

  useEffect(() => {
    loadDoctorsList();
  }, [searchParams, experience, minFee, maxFee, hospital, rating, sort]);

  const loadDoctorsList = async () => {
    setLoading(true);
    try {
      const filters = {
        search: searchParams.get('search') || '',
        specialization: searchParams.get('specialization') || '',
        experience,
        minFee,
        maxFee,
        hospital,
        rating,
        sort,
        approved: 'true' // Only approved listed
      };
      const data = await getDoctors(filters);
      setDoctors(data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialization) params.append('specialization', specialization);
    navigate(`/doctors?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSpecialization('');
    setExperience('');
    setMinFee('');
    setMaxFee('');
    setHospital('');
    setRating('');
    setSort('');
    navigate('/doctors');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-left">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Find Specialists</h1>
          <p className="text-slate-400 text-xs mt-1">Discover verified doctors, compare consultation fees, and schedule consultations.</p>
        </div>
        <button onClick={handleClearFilters} className="text-xs font-bold text-brand-500 hover:text-brand-600">
          Reset Filters
        </button>
      </div>

      {/* Main Search Panel */}
      <form onSubmit={handleSearchSubmit} className="bg-white dark:bg-darkBg-card p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-darkBg-border grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Doctor name, hospital name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-medium focus:outline-none border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
          />
        </div>
        <div className="md:col-span-4 relative">
          <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            placeholder="Specialty (e.g. Neurologist)"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 pl-11 pr-4 py-3 rounded-xl text-xs font-medium focus:outline-none border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
          />
        </div>
        <div className="md:col-span-3">
          <button type="submit" className="w-full h-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-brand-500/10">
            Search Directory
          </button>
        </div>
      </form>

      {/* Advanced Filters Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-3 bg-white dark:bg-darkBg-card p-6 rounded-2xl border border-slate-100 dark:border-darkBg-border space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-darkBg-border pb-3">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-white">Refine Search</span>
          </div>

          <div className="space-y-4">
            {/* Experience */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Experience (Years)</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ Years</option>
                <option value="5">5+ Years</option>
                <option value="10">10+ Years</option>
                <option value="15">15+ Years</option>
              </select>
            </div>

            {/* Fee Limits */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minFee}
                  onChange={(e) => setMinFee(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Hospital */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Hospital / Clinic</label>
              <input
                type="text"
                placeholder="Hospital name..."
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              />
            </div>

            {/* Rating */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Minimum Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4">4.0+ Stars</option>
                <option value="3">3.0+ Stars</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort By</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-2.5 rounded-xl text-xs font-medium border border-transparent dark:border-darkBg-border text-slate-800 dark:text-white"
              >
                <option value="">Default (Newest)</option>
                <option value="highest-rated">Highest Rated</option>
                <option value="lowest-fee">Lowest Fee</option>
                <option value="highest-fee">Highest Fee</option>
                <option value="most-experienced">Most Experienced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid List */}
        <div className="lg:col-span-9">
          {loading ? (
            <SkeletonLoader type="card" count={3} />
          ) : !Array.isArray(doctors) || doctors.length === 0 ? (
            <EmptyState title="No Doctors Found" message="Try relaxing your filters or searching another medical specialty field." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white dark:bg-darkBg-card rounded-2xl border border-slate-100 dark:border-darkBg-border p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center space-x-4">
                      {doc.userId?.profileImage ? (
                        <img
                          src={doc.userId.profileImage}
                          alt={doc.userId.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-500 flex items-center justify-center font-bold text-xl">
                          {doc.userId?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate max-w-[150px]">
                          Dr. {doc.userId?.name}
                        </h4>
                        <span className="inline-block text-[10px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full mt-1">
                          {doc.specialization}
                        </span>
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Experience</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{doc.experience} Years</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Clinic</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{doc.hospitalName}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Consultation Fee</span>
                        <span className="font-bold text-slate-800 dark:text-white">₹{doc.consultationFee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Rating */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{doc.rating || 'N/A'}</span>
                      <span className="text-[10px] text-slate-400">({doc.totalReviews})</span>
                    </div>
                    <button
                      onClick={() => navigate(`/doctors/${doc._id}`)}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-brand-500/10"
                    >
                      Book Slot
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDiscovery;
