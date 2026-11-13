'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarClock, 
  Clock, 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Info,
  CalendarDays
} from 'lucide-react';
import { api } from '@/lib/api';

interface DaySchedule {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface SpecialDateOverride {
  date: string;
  reason: string;
  isClosed: boolean;
  open?: string;
  close?: string;
}

interface ScheduleResponse {
  success: boolean;
  schedule: {
    weekly: DaySchedule[];
    specialDates: SpecialDateOverride[];
    note?: string;
  };
  currentStatus: {
    isOpen: boolean;
    reason?: string;
    dayName: string;
    todayHours?: { open: string; close: string; isClosed: boolean };
  };
}

const DEFAULT_DAYS: DaySchedule[] = [
  { day: 'Monday', open: '08:00', close: '21:00', isClosed: false },
  { day: 'Tuesday', open: '08:00', close: '21:00', isClosed: false },
  { day: 'Wednesday', open: '08:00', close: '21:00', isClosed: false },
  { day: 'Thursday', open: '08:00', close: '21:00', isClosed: false },
  { day: 'Friday', open: '08:00', close: '21:00', isClosed: false },
  { day: 'Saturday', open: '09:00', close: '19:00', isClosed: false },
  { day: 'Sunday', open: '10:00', close: '16:00', isClosed: true },
];

export default function VendorSchedulePage() {
  const [weekly, setWeekly] = useState<DaySchedule[]>(DEFAULT_DAYS);
  const [specialDates, setSpecialDates] = useState<SpecialDateOverride[]>([]);
  const [note, setNote] = useState('');
  const [currentStatus, setCurrentStatus] = useState<ScheduleResponse['currentStatus'] | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New special date form state
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newIsClosed, setNewIsClosed] = useState(true);
  const [newOpen, setNewOpen] = useState('08:00');
  const [newClose, setNewClose] = useState('21:00');

  const fetchSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get<ScheduleResponse>('/api/vendor/schedule');
      if (res.schedule) {
        if (Array.isArray(res.schedule.weekly) && res.schedule.weekly.length > 0) {
          setWeekly(res.schedule.weekly);
        }
        setSpecialDates(res.schedule.specialDates || []);
        setNote(res.schedule.note || '');
      }
      if (res.currentStatus) {
        setCurrentStatus(res.currentStatus);
      }
    } catch (err: any) {
      console.error('Failed to load schedule:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load canteen schedule' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleWeeklyChange = (index: number, field: keyof DaySchedule, value: any) => {
    setWeekly(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleApplyToAllWeekdays = (sourceIndex: number) => {
    const src = weekly[sourceIndex];
    setWeekly(prev => prev.map((d, idx) => {
      // Apply to Monday - Friday (indices 0 to 4 typically)
      if (idx <= 4) {
        return { ...d, open: src.open, close: src.close, isClosed: src.isClosed };
      }
      return d;
    }));
    setFeedback({ type: 'success', message: `Applied ${src.day}'s timing to all weekdays (Mon-Fri)` });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleAddSpecialDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newReason.trim()) {
      alert('Please provide a date and reason.');
      return;
    }

    if (specialDates.some(sd => sd.date === newDate)) {
      alert('An entry for this date already exists.');
      return;
    }

    const newOverride: SpecialDateOverride = {
      date: newDate,
      reason: newReason.trim(),
      isClosed: newIsClosed,
      open: newIsClosed ? undefined : newOpen,
      close: newIsClosed ? undefined : newClose
    };

    setSpecialDates(prev => [...prev, newOverride].sort((a, b) => a.date.localeCompare(b.date)));
    setNewDate('');
    setNewReason('');
    setNewIsClosed(true);
  };

  const handleRemoveSpecialDate = (dateToRemove: string) => {
    setSpecialDates(prev => prev.filter(sd => sd.date !== dateToRemove));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await api.put<ScheduleResponse>('/api/vendor/schedule', {
        weekly,
        specialDates,
        note
      });
      if (res.currentStatus) {
        setCurrentStatus(res.currentStatus);
      }
      setFeedback({ type: 'success', message: 'Canteen timings saved and updated live!' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save schedule.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <p className="text-sm font-semibold text-gray-500">Loading canteen operating schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2.5">
            <CalendarClock className="w-7 h-7 text-orange-500" />
            Canteen Operating Hours & Schedule
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure weekly operating times, toggle off days, and schedule advance holiday closures. Customers can only order ASAP during open hours.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50' 
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Live Status Card */}
      {currentStatus && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
              currentStatus.isOpen 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-2.5 h-2.5 rounded-full ${currentStatus.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Current Live Status
                </span>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                  currentStatus.isOpen 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                }`}>
                  {currentStatus.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                </span>
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">
                {currentStatus.isOpen 
                  ? `Active today (${currentStatus.dayName}): ${currentStatus.todayHours?.open} - ${currentStatus.todayHours?.close}`
                  : (currentStatus.reason || 'Canteen is currently outside operating hours')}
              </h3>
            </div>
          </div>

          <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-2xl border border-gray-100 dark:border-gray-800 max-w-sm">
            <span className="font-bold block text-gray-800 dark:text-gray-200 mb-0.5">Pre-Schedule Notice:</span>
            When closed, students cannot place immediate orders, but they can pre-schedule deliveries during your next open hours!
          </div>
        </div>
      )}

      {/* Weekly Operating Hours Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Regular Weekly Hours
          </h2>
          <p className="text-xs text-gray-500 mt-1">Set the standard opening and closing time for each day of the week.</p>
        </div>

        <div className="space-y-3">
          {weekly.map((item, idx) => (
            <div 
              key={item.day}
              className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                item.isClosed 
                  ? 'bg-gray-50/70 dark:bg-gray-950/40 border-gray-200 dark:border-gray-800 opacity-80' 
                  : 'bg-white dark:bg-gray-900 border-gray-200/80 dark:border-gray-800 shadow-sm'
              }`}
            >
              {/* Day & Open/Closed Toggle */}
              <div className="flex items-center gap-4 min-w-[200px]">
                <span className="font-black text-sm text-gray-900 dark:text-white w-28">
                  {item.day}
                </span>

                <button
                  type="button"
                  onClick={() => handleWeeklyChange(idx, 'isClosed', !item.isClosed)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                    item.isClosed 
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40' 
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
                  }`}
                >
                  {item.isClosed ? 'Closed (Off Day)' : 'Open'}
                </button>
              </div>

              {/* Time Pickers */}
              {!item.isClosed ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Opens:</span>
                    <input
                      type="time"
                      value={item.open}
                      onChange={(e) => handleWeeklyChange(idx, 'open', e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <span className="text-gray-400 font-bold">—</span>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Closes:</span>
                    <input
                      type="time"
                      value={item.close}
                      onChange={(e) => handleWeeklyChange(idx, 'close', e.target.value)}
                      className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">No orders accepted on this day</span>
              )}

              {/* Shortcut: copy Monday timing to all weekdays */}
              {idx === 0 && !item.isClosed && (
                <button
                  type="button"
                  onClick={() => handleApplyToAllWeekdays(0)}
                  className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline text-left md:text-right"
                >
                  Apply to all weekdays (Mon-Fri) ➔
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Advance Holiday & Event Closures Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-orange-500" />
            Advance Holidays & Special Event Closures
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Schedule upcoming holidays, semester breaks, or events in advance. Customers visiting the shop will see these scheduled off-days ahead of time.
          </p>
        </div>

        {/* Add Override Form */}
        <form onSubmit={handleAddSpecialDate} className="bg-gray-50 dark:bg-gray-950/60 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-4">
          <span className="text-xs font-black uppercase text-gray-500 dark:text-gray-400 block tracking-wider">
            Add Upcoming Date Override
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase">Date *</label>
              <input
                type="date"
                required
                value={newDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase">Reason / Occasion *</label>
              <input
                type="text"
                required
                placeholder="e.g. Diwali Holiday, Campus Festival"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase">Status</label>
              <select
                value={newIsClosed ? 'closed' : 'custom'}
                onChange={(e) => setNewIsClosed(e.target.value === 'closed')}
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="closed">All Day Closed (Off)</option>
                <option value="custom">Special Custom Hours</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Date
              </button>
            </div>
          </div>

          {!newIsClosed && (
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-gray-500">Custom Hours for that Day:</span>
              <input
                type="time"
                value={newOpen}
                onChange={(e) => setNewOpen(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono outline-none"
              />
              <span className="text-gray-400 font-bold">—</span>
              <input
                type="time"
                value={newClose}
                onChange={(e) => setNewClose(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-1.5 text-xs font-bold font-mono outline-none"
              />
            </div>
          )}
        </form>

        {/* Existing Overrides List */}
        <div className="space-y-2">
          {specialDates.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400 bg-gray-50/50 dark:bg-gray-950/20 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
              No advance holiday or special event off-days scheduled yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {specialDates.map((sd) => (
                    <tr key={sd.date} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white">
                        {sd.date}
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-700 dark:text-gray-300">
                        {sd.reason}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          sd.isClosed 
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                        }`}>
                          {sd.isClosed ? 'All Day Closed' : `Hours: ${sd.open} - ${sd.close}`}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialDate(sd.date)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Remove override"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
