import React, { useEffect, useState, useMemo } from 'react';
import { Booking, Patient, Review } from '../../types';
import { getAllReviews, isSupabaseConfigured, supabase } from '../../lib/supabase';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Star, 
  Activity, 
  BarChart2, 
  Filter, 
  RefreshCw, 
  MessageSquare,
  AlertCircle,
  Award,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

interface AnalyticsPageProps {
  bookings: Booking[];
  patients: Patient[];
  onNavigateTab?: (tab: any) => void;
}

const BAR_COLORS = ['#2563eb', '#3b82f6', '#0284c7', '#0d9488', '#059669', '#d97706'];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  bookings: initialBookings,
  patients: initialPatients,
  onNavigateTab
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<30 | 14 | 7>(30);

  // Load live data from Supabase if configured
  const loadData = async () => {
    setLoading(true);
    try {
      const fetchedReviews = await getAllReviews();
      setReviews(fetchedReviews);

      if (isSupabaseConfigured) {
        // Fetch real bookings from Supabase if available
        const { data: bData } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: true });
        if (bData && bData.length > 0) {
          const mappedBookings: Booking[] = bData.map((b: any) => ({
            id: b.id,
            patientId: b.patient_id || b.user_id || 'PT-100',
            patientName: b.patient_name || b.user_name || 'Patient',
            patientPhone: b.patient_phone || '',
            service: b.service_type || b.service || 'General Dental',
            doctorName: b.doctor_name || 'Doctor',
            date: b.date || (b.created_at ? b.created_at.split('T')[0] : '2026-07-29'),
            time: b.time || '10:00 AM',
            roomNumber: b.room_number || 'Room 1',
            status: b.status || 'Confirmed',
            createdAt: b.created_at || new Date().toISOString()
          }));
          setBookings(mappedBookings);
        }

        // Fetch real profiles/patients from Supabase if available
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        if (pData && pData.length > 0) {
          const mappedPatients: Patient[] = pData.map((p: any) => ({
            id: p.id,
            name: p.full_name || p.name || 'Patient',
            email: p.email || '',
            phone: p.phone || '',
            registeredDate: p.created_at ? p.created_at.split('T')[0] : '2026-07-01',
            gender: p.gender || 'Other',
            age: p.age || 30,
            lastVisit: p.last_visit || '2026-07-28',
            totalVisits: p.total_visits || 1,
            assignedDoctor: p.assigned_doctor || 'Dr. Faisal Al-Sabah',
            status: 'Active',
            balance: 0
          }));
          setPatients(mappedPatients);
        }
      }
    } catch (e) {
      console.warn('Analytics data fetch exception:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [initialBookings, initialPatients]);

  // A. Group Bookings per day over last 30/14/7 days
  const bookingsOverTimeData = useMemo(() => {
    const today = new Date();
    const result: { date: string; displayDate: string; bookingsCount: number }[] = [];
    
    // Map of counts by date string YYYY-MM-DD
    const countsByDate: Record<string, number> = {};

    bookings.forEach(b => {
      // Determine booking date (prefer createdAt date or booking date)
      let rawDate = b.createdAt;
      if (!rawDate || rawDate.includes('Just now') || rawDate.length < 8) {
        rawDate = b.date;
      }
      
      let dateKey = '';
      if (rawDate && rawDate.includes('T')) {
        dateKey = rawDate.split('T')[0];
      } else if (rawDate && /^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        dateKey = rawDate;
      } else {
        dateKey = new Date().toISOString().split('T')[0];
      }

      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
    });

    // Generate array for last N days
    for (let i = dateRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      result.push({
        date: dateKey,
        displayDate,
        bookingsCount: countsByDate[dateKey] || 0
      });
    }

    return result;
  }, [bookings, dateRange]);

  const totalBookingsInRange = useMemo(() => {
    return bookingsOverTimeData.reduce((acc, curr) => acc + curr.bookingsCount, 0);
  }, [bookingsOverTimeData]);

  // B. Group Bookings by service_type / service
  const serviceTypeData = useMemo(() => {
    const serviceMap: Record<string, number> = {};

    bookings.forEach(b => {
      const s = b.service || 'General Dental';
      // Clean up service names for chart labels
      const shortName = s.split('&')[0].trim();
      serviceMap[shortName] = (serviceMap[shortName] || 0) + 1;
    });

    const list = Object.keys(serviceMap).map(service => ({
      service,
      count: serviceMap[service]
    })).sort((a, b) => b.count - a.count);

    return list;
  }, [bookings]);

  // C. New patient signups over time (grouped by date/month)
  const patientSignupsData = useMemo(() => {
    const signupsMap: Record<string, number> = {};

    patients.forEach(p => {
      let dateKey = p.registeredDate || '2026-07-01';
      if (dateKey.includes('T')) dateKey = dateKey.split('T')[0];
      
      signupsMap[dateKey] = (signupsMap[dateKey] || 0) + 1;
    });

    // Sort by date key
    const sortedDates = Object.keys(signupsMap).sort();
    
    // Accumulate or daily chart data
    let cumulative = 0;
    return sortedDates.map(dateKey => {
      const count = signupsMap[dateKey];
      cumulative += count;
      const d = new Date(dateKey);
      const displayDate = isNaN(d.getTime()) ? dateKey : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        dateKey,
        displayDate,
        newPatients: count,
        totalPatients: cumulative
      };
    });
  }, [patients]);

  // D. Stat Card: Average review rating and total reviews
  const reviewStats = useMemo(() => {
    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        average: '0.0',
        fiveStarPercentage: '0%',
        ratingBreakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    const avg = (sum / total).toFixed(1);
    
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let fiveStarCount = 0;
    reviews.forEach(r => {
      const rNum = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      breakdown[rNum as keyof typeof breakdown] = (breakdown[rNum as keyof typeof breakdown] || 0) + 1;
      if (rNum === 5) fiveStarCount++;
    });

    const fiveStarPct = Math.round((fiveStarCount / total) * 100) + '%';

    return {
      total,
      average: avg,
      fiveStarPercentage: fiveStarPct,
      ratingBreakdown: breakdown
    };
  }, [reviews]);

  return (
    <div id="admin-analytics-page" className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Clinic Performance Analytics & Business Intelligence</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time charts powered by Supabase & database queries tracking bookings, service popularity, and patient signups
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[30, 14, 7].map((days) => (
              <button
                key={days}
                onClick={() => setDateRange(days as any)}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  dateRange === days
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 4 Stat Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat Card 1: Total Bookings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bookings (Last {dateRange} Days)</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalBookingsInRange}</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              +{bookings.length} Total
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">From active appointments database</p>
        </div>

        {/* Stat Card 2: Total Registered Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Patient Directory</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{patients.length}</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              Active Profiles
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified patient records</p>
        </div>

        {/* Stat Card 3: Service Types Tracked */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dental Specialties</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{serviceTypeData.length}</span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
              Categories
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Invisalign, Implants, Laser & Checkups</p>
        </div>

        {/* Stat Card 4 (Requirement 2d): Average Review Rating Stat Card */}
        <div 
          id="stat-card-average-rating"
          className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 rounded-xl border border-amber-200 shadow-xs relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>Clinic Satisfaction Score</span>
            </span>
            {onNavigateTab && (
              <button 
                onClick={() => onNavigateTab('reviews')}
                className="text-[10px] text-amber-700 font-bold hover:underline"
              >
                Manage →
              </button>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-950">{reviewStats.average}</span>
            <span className="text-xs font-bold text-amber-800">/ 5.0</span>
            <span className="ml-auto text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
              {reviewStats.fiveStarPercentage} 5-Star
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-amber-800 font-medium">
            <span>Based on {reviewStats.total} patient reviews</span>
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3 h-3 ${
                    s <= Math.round(Number(reviewStats.average))
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-amber-200 fill-amber-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Chart A (Bookings per Day) + Chart B (Services Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Bookings per day over last 30 days */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                <span>Appointment Bookings Trend (Last {dateRange} Days)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Daily volume of patient bookings created in system
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Grouped by Date
            </span>
          </div>

          <div className="h-72 w-full">
            {bookingsOverTimeData.length === 0 || totalBookingsInRange === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 p-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Not enough data yet to display trends</p>
                <p className="text-[11px] text-slate-400 text-center mt-1">
                  Bookings recorded over the past {dateRange} days will automatically plot on this trend chart.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingsOverTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '8px', 
                      border: 'none', 
                      color: '#fff', 
                      fontSize: '12px' 
                    }}
                    itemStyle={{ color: '#60a5fa' }}
                    formatter={(value: any) => [`${value} Bookings`, 'Daily Bookings']}
                    labelFormatter={(label: any) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bookingsCount" 
                    name="Daily Bookings"
                    stroke="#2563eb" 
                    strokeWidth={2.5}
                    dot={{ fill: '#2563eb', r: 3.5, strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Most Requested Services (Grouped by service_type) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Bookings by Specialty Service</span>
              </h3>
              <p className="text-xs text-slate-500">
                Most requested treatment categories
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {serviceTypeData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 p-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Not enough data yet to display trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceTypeData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                  <YAxis 
                    type="category" 
                    dataKey="service" 
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} 
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '8px', 
                      border: 'none', 
                      color: '#fff', 
                      fontSize: '12px' 
                    }}
                    formatter={(val: any) => [`${val} Bookings`, 'Total Bookings']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                    {serviceTypeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Grid Row 2: Chart C (New Patient Signups Over Time) + Detailed Review Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart C: New Patient Signups Over Time */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>New Patient Registrations & Cumulative Directory Growth</span>
              </h3>
              <p className="text-xs text-slate-500">
                Patient profiles registered over time (from profiles table created_at)
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Cumulative Total: {patients.length} Patients
            </span>
          </div>

          <div className="h-64 w-full">
            {patientSignupsData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200 p-6">
                <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">Not enough data yet to display trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={patientSignupsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderRadius: '8px', 
                      border: 'none', 
                      color: '#fff', 
                      fontSize: '12px' 
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="newPatients" 
                    name="New Registrations on Date"
                    stroke="#059669" 
                    strokeWidth={2}
                    dot={{ fill: '#059669', r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalPatients" 
                    name="Cumulative Total Patients"
                    stroke="#2563eb" 
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Review Breakdown Box */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Rating Breakdown</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                {reviewStats.total} Total
              </span>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="space-y-2.5 my-4">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviewStats.ratingBreakdown[stars as keyof typeof reviewStats.ratingBreakdown] || 0;
                const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;

                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1 w-12 font-semibold text-slate-700">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="w-10 text-right font-mono text-[11px] text-slate-500">
                      {count} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 bg-slate-50/70 p-3 rounded-lg flex items-center justify-between">
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-900">{reviews.filter(r => r.is_featured).length} Reviews</span> published live on website
            </div>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('reviews')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-md transition-colors shadow-2xs"
              >
                Manage
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
