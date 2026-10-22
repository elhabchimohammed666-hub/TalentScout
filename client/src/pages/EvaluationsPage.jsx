import React, { useState, useEffect } from 'react';
import { evaluationAPI, playerAPI } from '../services/api';
import {
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Scale,
  Calendar,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comparison State
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerEvals, setPlayerEvals] = useState([]);
  const [eval1Id, setEval1Id] = useState('');
  const [eval2Id, setEval2Id] = useState('');
  const [comparisonResult, setComparisonResult] = useState(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [evalsRes, playersRes] = await Promise.all([
          evaluationAPI.getEvaluations(),
          playerAPI.getPlayers({ status: 'all' }),
        ]);
        setEvaluations(evalsRes.data);
        setPlayers(playersRes.data);

        // Pre-select first player with at least 2 evaluations (e.g., Adam Belkacem)
        if (playersRes.data.length > 0) {
          const adam = playersRes.data.find((p) => p.firstName === 'Adam') || playersRes.data[0];
          setSelectedPlayerId(adam._id);
        }
      } catch (err) {
        console.error('Failed to load evaluations data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // When selectedPlayerId changes, load their evaluations and auto-compare
  useEffect(() => {
    if (!selectedPlayerId) return;
    const evalsForPlayer = evaluations.filter(
      (e) => (e.player?._id || e.player) === selectedPlayerId
    );
    setPlayerEvals(evalsForPlayer);

    if (evalsForPlayer.length >= 2) {
      // Sort ascending to compare earlier vs later
      const sorted = [...evalsForPlayer].sort((a, b) => new Date(a.date) - new Date(b.date));
      const e1 = sorted[0]._id;
      const e2 = sorted[sorted.length - 1]._id;
      setEval1Id(e1);
      setEval2Id(e2);
      triggerComparison(e1, e2);
    } else {
      setComparisonResult(null);
    }
  }, [selectedPlayerId, evaluations]);

  const triggerComparison = async (e1, e2) => {
    if (!e1 || !e2) return;
    try {
      setComparing(true);
      const res = await evaluationAPI.compareEvaluations({
        evaluationId1: e1,
        evaluationId2: e2,
      });
      setComparisonResult(res.data);
    } catch (err) {
      console.error('Failed to compare evaluations', err);
    } finally {
      setComparing(false);
    }
  };

  const handleManualCompare = (e) => {
    e.preventDefault();
    triggerComparison(eval1Id, eval2Id);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Evaluations & Performance Trends</h1>
        <p className="text-sm text-slate-500">
          Structured football performance evaluations, historical progress comparisons, and skill delta audits.
        </p>
      </div>

      {/* Comparison Engine (Section 3.2.B) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Historical Evaluation Comparison Engine
            </h2>
            <p className="text-xs text-slate-500">
              Select two evaluations for a player to examine verified improvements, regressions, and stable metrics.
            </p>
          </div>
        </div>

        {/* Player and Session Selectors */}
        <form onSubmit={handleManualCompare} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Select Player</label>
            <select
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {players.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.primaryPosition} • {p.ageCategory})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Baseline Evaluation (Earlier)</label>
            <select
              value={eval1Id}
              onChange={(e) => setEval1Id(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {playerEvals.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {new Date(ev.date).toLocaleDateString()} (Score: {ev.overallScore}/10)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Follow-up Evaluation (Later)</label>
            <select
              value={eval2Id}
              onChange={(e) => setEval2Id(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {playerEvals.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {new Date(ev.date).toLocaleDateString()} (Score: {ev.overallScore}/10)
                </option>
              ))}
            </select>
          </div>
        </form>

        {/* Comparison Output Display */}
        {playerEvals.length < 2 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-1">
            <AlertCircle className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="font-bold text-slate-700">Insufficient Evaluations for Comparison</p>
            <p>This player only has {playerEvals.length} evaluation. At least 2 recorded evaluations are required to analyze trends.</p>
          </div>
        ) : comparisonResult ? (
          <div className="space-y-6 pt-2">
            {/* Top Score Delta Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Overall Progression</span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-black">{comparisonResult.eval1?.overallScore}/10</span>
                  <ArrowRight className="w-5 h-5 text-emerald-400" />
                  <span className="text-2xl font-black text-emerald-400">{comparisonResult.eval2?.overallScore}/10</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Interval: <span className="font-semibold text-white">{comparisonResult.daysBetween} days</span> between sessions
                </p>
              </div>

              {/* Status summary tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" /> {comparisonResult.improved?.length || 0} Improved
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-xs flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4" /> {comparisonResult.declined?.length || 0} Declined
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1">
                  <Minus className="w-4 h-4" /> {comparisonResult.stable?.length || 0} Stable
                </span>
              </div>
            </div>

            {/* Side-by-side Metric Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Metric & Pillar</th>
                    <th className="py-3 px-4">Baseline ({new Date(comparisonResult.eval1?.date).toLocaleDateString()})</th>
                    <th className="py-3 px-4">Follow-up ({new Date(comparisonResult.eval2?.date).toLocaleDateString()})</th>
                    <th className="py-3 px-4">Delta</th>
                    <th className="py-3 px-4">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {comparisonResult.comparisons?.map((c) => (
                    <tr key={c.key} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.name} <span className="text-[10px] font-normal text-slate-400">({c.category})</span>
                      </td>
                      <td className="py-3 px-4">{c.eval1Value}/10</td>
                      <td className="py-3 px-4 font-semibold">{c.eval2Value}/10</td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-black ${
                            c.delta > 0 ? 'text-emerald-600' : c.delta < 0 ? 'text-rose-600' : 'text-slate-400'
                          }`}
                        >
                          {c.delta > 0 ? `+${c.delta}` : c.delta}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            c.status === 'improved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : c.status === 'declined'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.status === 'improved' && <ArrowUpRight className="w-3 h-3" />}
                          {c.status === 'declined' && <ArrowDownRight className="w-3 h-3" />}
                          {c.status === 'stable' && <Minus className="w-3 h-3" />}
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Qualitative Notes Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700 block uppercase text-[10px]">Baseline Coach Note</span>
                <p className="text-slate-600 italic">"{comparisonResult.eval1?.coachObservations || 'None'}"</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1">
                <span className="font-bold text-emerald-800 block uppercase text-[10px]">Follow-up Coach Note</span>
                <p className="text-slate-700 italic">"{comparisonResult.eval2?.coachObservations || 'None'}"</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* All Academy Evaluations Feed */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base">Complete Academy Evaluations Log</h3>
        <div className="divide-y divide-slate-100">
          {evaluations.map((ev) => (
            <div key={ev._id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center border border-emerald-100">
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
                    {ev.player?.primaryPosition} ({ev.player?.ageCategory}) • Coach {ev.coach?.name}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 font-medium block">
                  {new Date(ev.date).toLocaleDateString()}
                </span>
                <Link
                  to={`/players/${ev.player?._id}`}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  View Dossier
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
