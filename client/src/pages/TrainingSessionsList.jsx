import React, { useState, useEffect } from 'react';
import { sessionAPI } from '../services/api';
import SessionModal from '../components/SessionModal';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  ClipboardCheck,
  Filter,
  CheckCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrainingSessionsList() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await sessionAPI.getSessions({
        status: statusFilter,
        ageGroup: ageFilter,
      });
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load training sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, ageFilter]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Training Sessions</h1>
          <p className="text-sm text-slate-500">
            Plan tactical training sessions, set technical objectives, and manage attendance sheets.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingSession(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Age Groups</option>
            <option value="U-11">U-11</option>
            <option value="U-13">U-13</option>
            <option value="U-15">U-15</option>
            <option value="U-17">U-17</option>
            <option value="U-19">U-19</option>
          </select>
        </div>
        <span className="text-xs font-bold text-slate-400">
          Total: {sessions.length} sessions
        </span>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No training sessions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Schedule Session" above to create an upcoming training drill.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Status & Age Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                      {session.ageGroup}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] ${
                        session.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : session.status === 'scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>

                  {session.intensity && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 capitalize">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {session.intensity} intensity
                    </span>
                  )}
                </div>

                {/* Session Title */}
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  {session.title}
                </h3>

                {/* Date & Time */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(session.date).toLocaleDateString()} • {session.startTime} - {session.endTime}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {session.location}
                  </span>
                </div>

                {/* Focus Topics */}
                {session.focusTopics && session.focusTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {session.focusTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 capitalize"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Coach Name & Attendance notice */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Coach: <span className="font-semibold text-slate-700">{session.coach?.name}</span></span>
                  <span className="font-semibold text-emerald-700">
                    {session.attendeeCount ? `${session.attendeeCount} players present` : 'Attendance pending'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/sessions/${session._id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 group"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Open Attendance Sheet & Notes</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-1" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchSessions}
        initialData={editingSession}
      />
    </div>
  );
}
