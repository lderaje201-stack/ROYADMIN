import React, { useState } from 'react';
import { Booking, BookingStatus } from '../../types';
import { 
  Calendar as CalendarIcon, 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  GripVertical, 
  Clock, 
  MapPin, 
  User, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  List, 
  Filter,
  Stethoscope,
  Move
} from 'lucide-react';

interface BookingsPageProps {
  bookings: Booking[];
  onUpdateStatus: (bookingId: string, status: BookingStatus) => void;
  onRescheduleBooking?: (bookingId: string, newDate: string, newTime?: string) => void;
  onOpenNewBookingModal: () => void;
  searchQuery: string;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({
  bookings,
  onUpdateStatus,
  onRescheduleBooking,
  onOpenNewBookingModal,
  searchQuery
}) => {
  // View mode: 'month' (default), 'week', or 'list'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  // Current calendar navigation date
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Filters
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('All');

  // Modal & Drag state
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [draggedBookingId, setDraggedBookingId] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null); // e.g. "2026-07-30" or "2026-07-30-10:00 AM"

  // Quick edit inside detail modal
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');

  const statusFilters = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];

  // List of unique doctors for filtering
  const doctorOptions = ['All', ...Array.from(new Set(bookings.map(b => b.doctorName)))];

  // Date Formatting Helpers
  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const normalizeBookingDate = (dateStr: string): string => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const parsed = new Date(dateStr);
    if (isNaN(parsed.getTime())) return dateStr;
    return formatDateKey(parsed);
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = selectedStatusFilter === 'All' || b.status === selectedStatusFilter;
    const matchesDoctor = selectedDoctorFilter === 'All' || b.doctorName === selectedDoctorFilter;
    const q = searchQuery.toLowerCase();
    const matchesQuery = !q || 
      b.patientName.toLowerCase().includes(q) ||
      b.service.toLowerCase().includes(q) ||
      b.doctorName.toLowerCase().includes(q) ||
      b.patientPhone.includes(q) ||
      b.id.toLowerCase().includes(q);
    return matchesStatus && matchesDoctor && matchesQuery;
  });

  // Group filtered bookings by date (YYYY-MM-DD)
  const bookingsByDateMap: Record<string, Booking[]> = {};
  filteredBookings.forEach(b => {
    const dateKey = normalizeBookingDate(b.date);
    if (!bookingsByDateMap[dateKey]) {
      bookingsByDateMap[dateKey] = [];
    }
    bookingsByDateMap[dateKey].push(b);
  });

  // Month Calendar Days Generator
  const getMonthCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];

    // Prev month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      grid.push({
        date: d,
        dateStr: formatDateKey(d),
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // Current month days
    const todayStr = '2026-07-29';
    for (let dNum = 1; dNum <= daysInMonth; dNum++) {
      const d = new Date(year, month, dNum);
      const dateStr = formatDateKey(d);
      grid.push({
        date: d,
        dateStr,
        dayNum: dNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding
    const totalCells = grid.length > 35 ? 42 : 35;
    const remaining = totalCells - grid.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      grid.push({
        date: d,
        dateStr: formatDateKey(d),
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return grid;
  };

  // Week Days Generator
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    const dayOfWeek = curr.getDay(); // 0 = Sun
    const firstDayOfWeek = new Date(curr);
    firstDayOfWeek.setDate(curr.getDate() - dayOfWeek);

    const weekDays = [];
    const todayStr = '2026-07-29';

    for (let i = 0; i < 7; i++) {
      const d = new Date(firstDayOfWeek);
      d.setDate(firstDayOfWeek.getDate() + i);
      const dateStr = formatDateKey(d);
      weekDays.push({
        date: d,
        dateStr,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: dateStr === todayStr,
      });
    }
    return weekDays;
  };

  const weekTimeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
    '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  // Navigation handlers
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() - 7);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'month') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      nextDate.setDate(nextDate.getDate() + 7);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 6, 29)); // July 29, 2026
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, bookingId: string) => {
    e.dataTransfer.setData('text/plain', bookingId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBookingId(bookingId);
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTarget !== targetKey) {
      setDragOverTarget(targetKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTarget(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string, timeSlot?: string) => {
    e.preventDefault();
    const bookingId = e.dataTransfer.getData('text/plain') || draggedBookingId;
    if (bookingId && onRescheduleBooking) {
      onRescheduleBooking(bookingId, targetDateStr, timeSlot);
    }
    setDragOverTarget(null);
    setDraggedBookingId(null);
  };

  // Status Badge Styling Helper
  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Confirmed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>Completed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getBookingCardStyle = (status: BookingStatus) => {
    switch (status) {
      case 'Pending':
        return 'border-l-3 border-amber-500 bg-amber-50/60 hover:bg-amber-100/60 text-slate-900 border border-slate-200/60';
      case 'Confirmed':
        return 'border-l-3 border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100/60 text-slate-900 border border-slate-200/60';
      case 'Cancelled':
        return 'border-l-3 border-rose-400 bg-rose-50/50 hover:bg-rose-100/50 text-slate-500 opacity-70 border border-slate-200/60 line-through';
      case 'Completed':
        return 'border-l-3 border-blue-500 bg-blue-50/60 hover:bg-blue-100/60 text-slate-900 border border-slate-200/60';
      default:
        return 'border-l-3 border-slate-400 bg-slate-50 text-slate-900 border border-slate-200/60';
    }
  };

  const monthGrid = getMonthCalendarGrid();
  const weekDays = getWeekDays();

  const formattedMonthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div id="bookings-page" className="p-6 space-y-6">
      {/* Header Controls, View Switcher & Filters */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200/60 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] space-y-4">
        {/* Top Navigation Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Month / Week Navigators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/60">
              <button
                id="cal-prev-btn"
                onClick={handlePrev}
                className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="cal-today-btn"
                onClick={handleToday}
                className="px-2.5 py-1 hover:bg-white rounded-lg text-xs font-bold text-slate-800 transition-colors cursor-pointer"
              >
                Today
              </button>
              <button
                id="cal-next-btn"
                onClick={handleNext}
                className="p-1.5 hover:bg-white rounded-lg text-slate-700 transition-colors cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-slate-800" />
              <span>{formattedMonthYear}</span>
            </h2>
          </div>

          {/* View Mode Switcher & Add Button */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Selector */}
            <div className="flex items-center bg-neutral-100/80 p-1 rounded-xl border border-neutral-200/60 text-xs font-semibold">
              <button
                id="view-mode-month-btn"
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'month'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Month</span>
              </button>
              <button
                id="view-mode-week-btn"
                onClick={() => setViewMode('week')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'week'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Week</span>
              </button>
              <button
                id="view-mode-list-btn"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-slate-900 text-white shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {/* Add New Booking Button */}
            <button
              id="bookings-add-new-btn"
              onClick={onOpenNewBookingModal}
              className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors shadow-2xs shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Booking</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Status Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {statusFilters.map((tab) => {
              const count = tab === 'All' 
                ? bookings.length 
                : bookings.filter(b => b.status === tab).length;
              const isActive = selectedStatusFilter === tab;

              return (
                <button
                  key={tab}
                  id={`booking-filter-${tab.toLowerCase()}`}
                  onClick={() => setSelectedStatusFilter(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Doctor Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Doctor:
            </span>
            <select
              id="booking-doctor-filter-select"
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {doctorOptions.map(doc => (
                <option key={doc} value={doc}>{doc === 'All' ? 'All Doctors' : doc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Drag & Drop Hint Banner */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800 flex items-center gap-2">
          <Move className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong className="font-semibold">Drag & Drop Rescheduling:</strong> Drag any appointment card onto a date cell or time slot to instantly update its schedule.
          </span>
        </div>
      </div>

      {/* VIEW 1: MONTH CALENDAR */}
      {viewMode === 'month' && (
        <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 bg-neutral-50/80 border-b border-neutral-200/60 text-center font-bold text-xs text-slate-600 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-neutral-200/60 bg-neutral-100/40 min-h-[580px]">
            {monthGrid.map((cell) => {
              const dayBookings = bookingsByDateMap[cell.dateStr] || [];
              const isDragOver = dragOverTarget === cell.dateStr;

              return (
                <div
                  key={cell.dateStr}
                  id={`cal-day-${cell.dateStr}`}
                  onDragOver={(e) => handleDragOver(e, cell.dateStr)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, cell.dateStr)}
                  className={`p-1.5 flex flex-col min-h-[110px] transition-colors relative ${
                    !cell.isCurrentMonth ? 'bg-slate-50/60 text-slate-400' : 'bg-white text-slate-800'
                  } ${
                    isDragOver ? 'bg-blue-50/90 border-2 border-dashed border-blue-500 z-10' : ''
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                        {dayBookings.length} {dayBookings.length === 1 ? 'appt' : 'appts'}
                      </span>
                    )}
                  </div>

                  {/* Booking Cards in Day Cell */}
                  <div className="flex-1 space-y-1 overflow-y-auto max-h-[120px] pr-0.5">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        id={`draggable-booking-${b.id}`}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, b.id)}
                        onClick={() => {
                          setSelectedBookingForDetails(b);
                          setRescheduleDate(b.date);
                          setRescheduleTime(b.time);
                        }}
                        className={`p-1.5 rounded-lg border text-xs shadow-2xs cursor-grab active:cursor-grabbing transition-all transform hover:-translate-y-0.5 ${getBookingCardStyle(
                          b.status
                        )}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="font-bold text-[11px] truncate flex items-center gap-1">
                            <GripVertical className="w-3 h-3 text-slate-400 shrink-0 opacity-60" />
                            <span className="truncate">{b.patientName}</span>
                          </div>
                          <span className="text-[10px] font-semibold shrink-0 bg-white/70 px-1 rounded">
                            {b.time}
                          </span>
                        </div>
                        <div className="text-[10px] opacity-80 truncate pl-4 mt-0.5">
                          {b.service}
                        </div>
                      </div>
                    ))}

                    {/* Drag Over Placeholder Drop Target */}
                    {isDragOver && (
                      <div className="p-2 border-2 border-dashed border-blue-400 rounded-lg bg-blue-100/60 text-blue-700 text-center text-[10px] font-bold animate-pulse">
                        Drop to Reschedule
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK CALENDAR */}
      {viewMode === 'week' && (
        <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Week Days Column Header */}
            <div className="grid grid-cols-8 bg-slate-50 border-b border-slate-200 text-center font-bold text-xs text-slate-700 py-3">
              <div className="text-slate-400 text-[11px]">Time Slot</div>
              {weekDays.map((wd) => (
                <div key={wd.dateStr} className="flex flex-col items-center">
                  <span className="text-slate-500 font-medium uppercase text-[10px]">{wd.dayName}</span>
                  <span
                    className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      wd.isToday ? 'bg-blue-600 text-white' : 'text-slate-900'
                    }`}
                  >
                    {wd.dayNum}
                  </span>
                </div>
              ))}
            </div>

            {/* Week Slots Grid */}
            <div className="divide-y divide-slate-100">
              {weekTimeSlots.map((slot) => (
                <div key={slot} className="grid grid-cols-8 min-h-[64px] divide-x divide-slate-100">
                  {/* Time Slot Label */}
                  <div className="p-2 text-[11px] font-semibold text-slate-500 bg-slate-50/50 flex items-center justify-center border-r border-slate-200">
                    {slot}
                  </div>

                  {/* Day Cells for this Time Slot */}
                  {weekDays.map((wd) => {
                    const cellKey = `${wd.dateStr}-${slot}`;
                    const isDragOver = dragOverTarget === cellKey;
                    const slotBookings = (bookingsByDateMap[wd.dateStr] || []).filter(
                      (b) => b.time === slot || b.time.startsWith(slot.substring(0, 2))
                    );

                    return (
                      <div
                        key={cellKey}
                        id={`cal-week-cell-${cellKey}`}
                        onDragOver={(e) => handleDragOver(e, cellKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, wd.dateStr, slot)}
                        className={`p-1 transition-colors flex flex-col justify-start relative ${
                          wd.isToday ? 'bg-blue-50/20' : 'bg-white'
                        } ${
                          isDragOver ? 'bg-blue-100/80 border-2 border-dashed border-blue-500' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {slotBookings.map((b) => (
                          <div
                            key={b.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, b.id)}
                            onClick={() => {
                              setSelectedBookingForDetails(b);
                              setRescheduleDate(b.date);
                              setRescheduleTime(b.time);
                            }}
                            className={`p-1.5 rounded-md border text-xs shadow-2xs cursor-grab active:cursor-grabbing ${getBookingCardStyle(
                              b.status
                            )}`}
                          >
                            <div className="font-bold text-[11px] truncate flex items-center gap-1">
                              <GripVertical className="w-3 h-3 text-slate-400 shrink-0 opacity-60" />
                              <span className="truncate">{b.patientName}</span>
                            </div>
                            <div className="text-[10px] opacity-80 truncate pl-4">
                              {b.service}
                            </div>
                          </div>
                        ))}

                        {isDragOver && (
                          <div className="p-1 border border-dashed border-blue-500 rounded text-blue-700 text-center text-[10px] font-bold bg-blue-50">
                            Move here
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: STANDARD LIST TABLE */}
      {viewMode === 'list' && (
        <div className="bg-white border border-neutral-200/60 rounded-2xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.07)] overflow-hidden">
          <div className="overflow-x-auto">
            <table id="bookings-table" className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Patient Name & ID</th>
                  <th className="py-3.5 px-4">Service & Suite</th>
                  <th className="py-3.5 px-4">Assigned Doctor</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs">
                      <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      No bookings found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr 
                      key={b.id} 
                      id={`booking-row-${b.id}`}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Patient Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {(b.patientAvatar && b.patientAvatar.trim() !== '') ? (
                            <img
                              src={b.patientAvatar}
                              alt={b.patientName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 font-bold flex items-center justify-center text-slate-700 text-xs">
                              {b.patientName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{b.patientName}</div>
                            <div className="text-[11px] text-slate-500">{b.patientPhone} • <span className="font-mono text-[10px] text-blue-600 font-semibold">{b.id}</span></div>
                          </div>
                        </div>
                      </td>

                      {/* Service & Room */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{b.service}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{b.roomNumber}</span>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{b.doctorName}</div>
                      </td>

                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{b.date}</div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-blue-600" />
                          <span>{b.time}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(b.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'Pending' && (
                            <button
                              id={`confirm-booking-btn-${b.id}`}
                              onClick={() => onUpdateStatus(b.id, 'Confirmed')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1 shadow-2xs"
                              title="Confirm Booking"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm</span>
                            </button>
                          )}

                          {b.status !== 'Cancelled' && (
                            <button
                              id={`cancel-booking-btn-${b.id}`}
                              onClick={() => onUpdateStatus(b.id, 'Cancelled')}
                              className="bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-slate-200 transition-colors flex items-center gap-1"
                              title="Cancel Booking"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}

                          <button
                            id={`view-booking-btn-${b.id}`}
                            onClick={() => {
                              setSelectedBookingForDetails(b);
                              setRescheduleDate(b.date);
                              setRescheduleTime(b.time);
                            }}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-md text-xs font-semibold border border-blue-200 transition-colors"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details & Manual Reschedule Modal */}
      {selectedBookingForDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Appointment Details</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForDetails(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900">{selectedBookingForDetails.patientName}</div>
                  <div className="text-slate-500">{selectedBookingForDetails.patientPhone}</div>
                </div>
                {getStatusBadge(selectedBookingForDetails.status)}
              </div>

              <div className="space-y-2">
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Service Requested:</span>
                  <div className="font-semibold text-slate-900 text-sm">{selectedBookingForDetails.service}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Attending Doctor:</span>
                    <div className="font-semibold text-slate-800">{selectedBookingForDetails.doctorName}</div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Clinic Room:</span>
                    <div className="font-semibold text-slate-800">{selectedBookingForDetails.roomNumber}</div>
                  </div>
                </div>

                {/* Reschedule Section */}
                <div className="pt-3 border-t border-slate-100 space-y-2 bg-blue-50/60 p-3 rounded-lg border border-blue-200">
                  <span className="font-bold text-blue-900 uppercase text-[10px] flex items-center gap-1">
                    <Move className="w-3.5 h-3.5 text-blue-600" /> Reschedule Appointment:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-600 font-medium">New Date</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-medium">New Time</label>
                      <select
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {weekTimeSlots.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onRescheduleBooking && rescheduleDate) {
                        onRescheduleBooking(selectedBookingForDetails.id, rescheduleDate, rescheduleTime);
                        setSelectedBookingForDetails(null);
                      }
                    }}
                    className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 rounded-md text-xs transition-colors shadow-2xs"
                  >
                    Save Rescheduled Slot
                  </button>
                </div>

                {selectedBookingForDetails.notes && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-500 uppercase text-[10px]">Clinical Notes:</span>
                    <p className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-700 mt-1">
                      {selectedBookingForDetails.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">ID: {selectedBookingForDetails.id}</span>
                <button
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
