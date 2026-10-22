import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sessionAPI, attendanceAPI } from '../services/api';
import SessionModal from '../components/SessionModal';
import {
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Edit,
  ArrowLeft,
  Users,
  Flame,
  FileText,
} from 'lucide-react';

export default function SessionDetail() {
  const { id } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [postNotes, setPostNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const res = await sessionAPI.getSessionById(id);
      setSessionData(res.data.session);
      setPostNotes(res.data.session.postSessionNotes || '');

      // Also get attendance records
      const attRes = await attendanceAPI.getSessionAttendance(id);
      setAttendanceSheet(attRes.data.attendance || []);
    } catch (err) {
      console.error('Failed to load session details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  const handleStatusChange = (playerId, status) => {
    setAttendanceSheet((prev) =>
      prev.map((item) => {
        const itemPlayerId = item.player?._id || item.player;
        if (itemPlayerId === playerId) {
          return { ...item, status };
        }
        return item;
      })
    );
  };

  const handleNotesChange = (playerId, notes) => {
    setAttendanceSheet((prev) =>
      prev.map((item) => {
        const itemPlayerId = item.player?._id || item.player;
        if (itemPlayerId === playerId) {
          return { ...item, notes };
        }
        return item;
      })
    );
  };

  const handleSaveAttendanceAndNotes = async () => {
    setSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Save attendance records
      const recordsToSave = attendanceSheet.map((item) => ({
        playerId: item.player?._id || item.player,
        status: item.status === 'unrecorded' ? 'present' : item.status,
        arrivalTime: item.arrivalTime || '',
        notes: item.notes || '',
      }));

      await attendanceAPI.recordAttendance(id, recordsToSave);

      // 2. Save session debrief notes
      await sessionAPI.updateSession(id, {
        postSessionNotes: postNotes,
        status: sessionData.status === 'scheduled' ? 'completed' : sessionData.status,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      fetchSessionDetails();
    } catch (err) {
      console.error('Failed to save attendance and debrief notes', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!sessionData) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Session not found</p>
        <Link to="/sessions" className="text-emerald-600 font-bold mt-2 inline-block">
          Return to Sessions
        </Link>
      </div>
    );
  }

  const presentCount = attendanceSheet.filter((a) => a.status === 'present').length;
  const absentCount = attendanceSheet.filter((a) => a.status === 'absent').length;
  const excusedCount = attendanceSheet.filter((a) => a.status === 'excused').length;

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/sessions"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Sessions List
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 transition"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Session
          </button>

          <button
            onClick={handleSaveAttendanceAndNotes}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance & Debrief'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Attendance records and debrief notes updated successfully!</span>
        </div>
      )}

      {/* Session Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                {sessionData.ageGroup}
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider text-[10px] ${
                  sessionData.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {sessionData.status}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{sessionData.title}</h1>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Head Coach</span>
            <span className="text-sm font-bold text-slate-800">{sessionData.coach?.name}</span>
          </div>
        </div>

        {/* Details row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">
              {new Date(sessionData.date).toLocaleDateString()} ({sessionData.startTime} - {sessionData.endTime})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-800">{sessionData.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-slate-800 capitalize">{sessionData.intensity} Intensity</span>
          </div>
        </div>

        {/* Focus Topics */}
        {sessionData.focusTopics && sessionData.focusTopics.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs font-bold text-slate-400 mr-1 uppercase">Focus:</span>
            {sessionData.focusTopics.map((topic, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 capitalize"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {sessionData.description && (
          <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
            {sessionData.description}
          </p>
        )}
      </div>

      {/* Interactive Attendance Sheet */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Session Attendance Roll Call</h3>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Present: {presentCount}
            </span>
            <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              Absent: {absentCount}
            </span>
            <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
              Excused: {excusedCount}
            </span>
          </div>
        </div>

        {attendanceSheet.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-6 text-center">
            No players assigned to this session. Edit session to select squad members.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {attendanceSheet.map((item) => {
              const p = item.player;
              const playerId = p?._id || p;
              const isPresent = item.status === 'present';
              const isAbsent = item.status === 'absent';
              const isExcused = item.status === 'excused';

              return (
                <div
                  key={playerId}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs border border-slate-200">
                      {p?.firstName?.[0]}
                      {p?.lastName?.[0]}
                    </div>
                    <div>
                      <Link
                        to={`/players/${playerId}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition"
                      >
                        {p?.firstName} {p?.lastName}
                      </Link>
                      <p className="text-xs text-slate-400">
                        #{p?.jerseyNumber} • {p?.primaryPosition}
                      </p>
                    </div>
                  </div>

                  {/* Attendance Selector Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(playerId, 'present')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                        isPresent
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Present
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(playerId, 'absent')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                        isAbsent
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(playerId, 'excused')}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border flex items-center gap-1.5 ${
                        isExcused
                          ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" /> Excused
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Post-Training Debrief Notes Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <FileText className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-base">Coach Post-Training Debrief & Tactical Notes</h3>
        </div>
        <p className="text-xs text-slate-500">
          Document squad engagement, individual player standouts, technical hurdles, and notes for subsequent training.
        </p>
        <textarea
          rows={4}
          placeholder="Record notes on player work rate, exercises executed, tactical breakthroughs..."
          value={postNotes}
          onChange={(e) => setPostNotes(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSaveAttendanceAndNotes}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Debrief Notes'}</span>
          </button>
        </div>
      </div>

      <SessionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSaved={fetchSessionDetails}
        initialData={sessionData}
      />
    </div>
  );
}
