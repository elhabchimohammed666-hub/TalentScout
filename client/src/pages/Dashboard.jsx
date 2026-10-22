import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { statsAPI, sessionAPI } from '../services/api';
import StatCard from '../components/StatCard';
import {
  Users,
  UserCheck,
  CalendarDays,
  ClipboardCheck,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, isManager } = useAuth();
  const [managerStats, setManagerStats] = useState(null);
  const [coachStats, setCoachStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (isManager) {
          const res = await statsAPI.getOverview();
          setManagerStats(res.data);
        } else {
          const res = await statsAPI.getCoachOverview();
          setCoachStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [isManager]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>TalentScout Academy Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              {isManager
                ? 'Central Academy Performance Overview: monitor player progression, manage coaches, and oversee training operations.'
                : 'Coach Portal: organize training drills, track attendance, record evaluations, and generate AI development insights.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/players"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>View Players</span>
            </Link>
            <Link
              to="/sessions"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs backdrop-blur border border-white/10 transition flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Training Sessions</span>
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* Manager Dashboard Content */}
      {isManager && managerStats && (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Active Players"
              value={managerStats.metrics?.activePlayersCount || 0}
              subtitle="Registered academy youth"
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="Coaching Staff"
              value={managerStats.metrics?.activeCoachesCount || 0}
              subtitle="Active technical coaches"
              icon={UserCheck}
              color="purple"
            />
            <StatCard
              title="Upcoming Sessions"
              value={managerStats.metrics?.upcomingSessionsCount || 0}
              subtitle={`${managerStats.metrics?.completedSessionsCount || 0} sessions completed`}
              icon={CalendarDays}
              color="blue"
            />
            <StatCard
              title="Attendance Rate"
              value={`${managerStats.metrics?.attendanceRate || 100}%`}
              subtitle="Across all academy squads"
              icon={ClipboardCheck}
              color="amber"
            />
          </div>

          {/* Section: Players Needing Evaluation Attention (Section 3.2.D) */}
          {managerStats.playersNeedingUpdate && managerStats.playersNeedingUpdate.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Evaluation Review Alerts ({managerStats.playersNeedingUpdate.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Players with no evaluation recorded or last evaluated over 30 days ago
                    </p>
                  </div>
                </div>
                <Link
                  to="/players"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  All Players <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {managerStats.playersNeedingUpdate.map((item, idx) => (
                  <Link
                    key={idx}
                    to={`/players/${item.player._id}`}
                    className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                        {item.player.firstName?.[0]}
                        {item.player.lastName?.[0]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 truncate">
                          {item.player.firstName} {item.player.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.player.primaryPosition} • {item.player.ageCategory}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Status:</span>
                      <span className="font-semibold text-amber-600">{item.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Evaluations and Academy Squad Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Evaluations list */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <span>Recent Player Evaluations</span>
                </h3>
                <Link
                  to="/evaluations"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {managerStats.recentEvaluations?.map((ev) => (
                  <div key={ev._id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-sm border border-emerald-100">
                        {ev.overallScore}
                      </div>
                      <div>
                        <Link
                          to={`/players/${ev.player?._id}`}
                          className="font-bold text-sm text-slate-900 hover:text-emerald-600 transition"
                        >
                          {ev.player?.firstName} {ev.player?.lastName}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {ev.player?.primaryPosition} • Evaluated by Coach {ev.coach?.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/players/${ev.player?._id}`}
                        className="text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Demo Showcase Card: Adam Belkacem */}
            <div className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg space-y-4 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>PDF Scenario Benchmark</span>
                </div>
                <h4 className="text-lg font-black tracking-tight">Adam Belkacem (14 yo)</h4>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Central Midfielder • U-15 Group
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Demonstrates high stamina (8.9/10), verified progress in passing accuracy under pressure (5.4 ➔ 6.9/10), and complete AI development dossier.
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <Link
                  to="/players"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs text-center block transition shadow-md"
                >
                  Explore Adam's AI Profile
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Coach Dashboard Content */}
      {!isManager && coachStats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Assigned Players"
              value={coachStats.assignedPlayersCount || 0}
              subtitle="Active players in your groups"
              icon={Users}
              color="emerald"
            />
            <StatCard
              title="Upcoming Sessions"
              value={coachStats.upcomingSessions?.length || 0}
              subtitle="Scheduled trainings"
              icon={CalendarDays}
              color="blue"
            />
            <StatCard
              title="Total Sessions Conducted"
              value={coachStats.totalSessionsCount || 0}
              subtitle="Academy sessions"
              icon={ClipboardCheck}
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Training Sessions with Direct Attendance Shortcut */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-emerald-600" />
                  <span>Upcoming Training Sessions</span>
                </h3>
                <Link
                  to="/sessions"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  All Sessions <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {coachStats.upcomingSessions?.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No upcoming sessions scheduled.</p>
              ) : (
                <div className="space-y-3">
                  {coachStats.upcomingSessions?.map((s) => (
                    <div
                      key={s._id}
                      className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 hover:bg-white hover:border-emerald-200 transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {s.ageGroup}
                        </span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(s.date).toLocaleDateString()} at {s.startTime}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{s.title}</h4>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-500">{s.location}</span>
                        <Link
                          to={`/sessions/${s._id}`}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                        >
                          Attendance Sheet
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coach's Assigned Squad */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <span>My Assigned Squad</span>
                </h3>
                <Link
                  to="/players"
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Manage Squad <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coachStats.assignedPlayers?.map((p) => (
                  <Link
                    key={p._id}
                    to={`/players/${p._id}`}
                    className="p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-200 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                      {p.firstName?.[0]}
                      {p.lastName?.[0]}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        #{p.jerseyNumber} • {p.primaryPosition}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
