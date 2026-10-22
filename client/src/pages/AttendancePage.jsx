import React, { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import StatCard from '../components/StatCard';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AttendancePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await attendanceAPI.getAttendanceStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load attendance stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Analytics & Insights</h1>
        <p className="text-sm text-slate-500">
          Monitor academy training consistency, identify absence patterns, and evaluate player reliability.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Overall Attendance"
          value={`${stats?.globalRate || 100}%`}
          subtitle="Academy-wide presence rate"
          icon={ClipboardCheck}
          color="emerald"
        />
        <StatCard
          title="Present Logs"
          value={stats?.presentRecords || 0}
          subtitle="Confirmed attendance entries"
          icon={CheckCircle2}
          color="blue"
        />
        <StatCard
          title="Excused Leaves"
          value={stats?.excusedRecords || 0}
          subtitle="Authorized academic / medical"
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Unexcused Absences"
          value={stats?.absentRecords || 0}
          subtitle="Missed training sessions"
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Attendance Insights & Absence Patterns (Section 3.3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 text-base">Recurring Absence Patterns (Insights)</h3>
              <p className="text-xs text-slate-500">
                Players with multiple absences that may negatively impact skill progression
              </p>
            </div>
          </div>

          {!stats?.recurringAbsences || stats.recurringAbsences.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              Excellent attendance! No players currently exhibit chronic absence patterns.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recurringAbsences.map((item) => (
                <div
                  key={item._id}
                  className="p-3.5 rounded-2xl border border-amber-200/70 bg-amber-50/40 flex items-center justify-between"
                >
                  <div>
                    <Link
                      to={`/players/${item._id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition"
                    >
                      {item.player.firstName} {item.player.lastName}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {item.player.primaryPosition} • {item.player.ageCategory}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                      {item.count} Absences
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Requires coach check-in</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Training Consistency Principle Info Box */}
        <div className="bg-gradient-to-br from-slate-900 to-emerald-950 rounded-3xl p-6 text-white shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Methodology Principle
            </span>
            <h3 className="text-lg font-black tracking-tight">The Training Consistency Rule</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              TalentScout's AI model weights attendance consistency directly into its performance evaluation. High attendance (&gt;85%) correlates directly with rapid technical mastery of rondos, spatial positioning, and physical endurance stamina.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300">
            <p className="font-bold text-emerald-400 mb-1">Tip for Coaches:</p>
            Marking excused vs unexcused reasons ensures historical analytics remain accurate when generating player reports for parents or scouts.
          </div>
        </div>
      </div>
    </div>
  );
}
