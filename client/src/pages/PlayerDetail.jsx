import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playerAPI, aiAPI, evaluationAPI, goalAPI } from '../services/api';
import RadarSkillChart from '../components/RadarSkillChart';
import ProgressLineChart from '../components/ProgressLineChart';
import EvaluationModal from '../components/EvaluationModal';
import PlayerModal from '../components/PlayerModal';
import GoalModal from '../components/GoalModal';
import ReportDownloadModal from '../components/ReportDownloadModal';
import {
  Sparkles,
  Award,
  Calendar,
  ClipboardCheck,
  TrendingUp,
  Target,
  Edit,
  FileText,
  Plus,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  Dumbbell,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export default function PlayerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'ai' | 'evaluations' | 'charts' | 'attendance' | 'goals'
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Modals
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [editingEval, setEditingEval] = useState(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const res = await playerAPI.getPlayerById(id);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load player details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [id]);

  const handleRequestAIAnalysis = async () => {
    setAiGenerating(true);
    setAiError('');
    try {
      const res = await aiAPI.requestAnalysis(id);
      setData((prev) => ({
        ...prev,
        latestAIAnalysis: res.data,
      }));
      setActiveTab('ai');
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate AI analysis');
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!data?.player) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-500">Player not found</p>
        <Link to="/players" className="text-emerald-600 font-bold mt-2 inline-block">
          Return to Players
        </Link>
      </div>
    );
  }

  const { player, evaluations, attendanceRecords, attendanceStats, goals, latestAIAnalysis } = data;
  const latestEval = evaluations?.[0];
  const previousEval = evaluations?.[1];

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/players"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Players Directory
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" /> PDF Report
          </button>

          <button
            onClick={() => {
              setEditingEval(null);
              setIsEvalModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" /> Record Evaluation
          </button>

          <button
            onClick={handleRequestAIAnalysis}
            disabled={aiGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{aiGenerating ? 'Analyzing Evidence...' : 'Generate AI Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Player Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {player.photoUrl ? (
            <img
              src={player.photoUrl}
              alt={player.firstName}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-emerald-500 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
              {player.firstName[0]}
              {player.lastName[0]}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {player.firstName} {player.lastName}
              </h1>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                #{player.jerseyNumber} • {player.ageCategory}
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {player.primaryPosition} {player.secondaryPosition ? `(Alt: ${player.secondaryPosition})` : ''}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Age: <span className="font-semibold text-slate-700">{player.age || 14}</span> • Dominant Foot:{' '}
              <span className="font-semibold text-slate-700">{player.dominantFoot}</span> • Group:{' '}
              <span className="font-semibold text-slate-700">{player.trainingGroup}</span>
            </p>
          </div>
        </div>

        {/* Quick Highlights Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Overall Score</span>
            <span className="text-xl font-black text-emerald-600">
              {latestEval?.overallScore ? `${latestEval.overallScore}/10` : '—'}
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Attendance</span>
            <span className="text-xl font-black text-blue-600">{attendanceStats?.attendanceRate}%</span>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Evaluations</span>
            <span className="text-xl font-black text-slate-800">{evaluations?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
        {[
          { key: 'overview', label: 'Player Bio & Summary', icon: FileText },
          { key: 'ai', label: 'AI Progress Analysis', icon: Sparkles },
          { key: 'evaluations', label: `Evaluations (${evaluations?.length || 0})`, icon: Award },
          { key: 'charts', label: 'Charts & Evolution', icon: TrendingUp },
          { key: 'attendance', label: `Attendance (${attendanceRecords?.length || 0})`, icon: ClipboardCheck },
          { key: 'goals', label: `Development Goals (${goals?.length || 0})`, icon: Target },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-3 px-4 font-bold text-xs whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Bio */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Athletic & Football Details</h3>
              <button
                onClick={() => setIsPlayerModalOpen(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" /> Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold block">Date of Birth</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {new Date(player.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Height & Weight</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {player.heightCm} cm • {player.weightKg} kg
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Registration Date</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {new Date(player.registrationDate).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Assigned Coaches</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {player.assignedCoaches?.map((c) => c.name).join(', ') || 'None assigned'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Emergency Contact</span>
                <span className="font-semibold text-slate-800 text-sm">
                  {player.emergencyContact?.name} ({player.emergencyContact?.relation}): {player.emergencyContact?.phone}
                </span>
              </div>
            </div>

            {player.notes && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                <span className="font-bold text-slate-900 block">Coach Scouting Notes:</span>
                <p className="leading-relaxed">{player.notes}</p>
              </div>
            )}
          </div>

          {/* Quick Radar Skill Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Attribute Footprint</h3>
            <RadarSkillChart evaluation={latestEval} previousEvaluation={previousEval} />
          </div>
        </div>
      )}

      {/* Tab 2: AI Progress Analysis (Section 3.1.F & 4) */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          {aiError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {aiError}
            </div>
          )}

          {!latestAIAnalysis ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">No AI Analysis Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                TalentScout AI will synthesize the player's evaluations, attendance consistency, and coach observations to identify confirmed strengths, regressions, and evidence-grounded football drills.
              </p>
              <button
                onClick={handleRequestAIAnalysis}
                disabled={aiGenerating}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>{aiGenerating ? 'Running Analysis...' : 'Generate First Analysis'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* AI Header Card */}
              <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">AI Player Progress Synthesis</h2>
                      <p className="text-xs text-slate-400">
                        Model: {latestAIAnalysis.modelUsed} • Generated on{' '}
                        {new Date(latestAIAnalysis.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRequestAIAnalysis}
                    disabled={aiGenerating}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition"
                  >
                    {aiGenerating ? 'Updating...' : 'Re-Run AI Analysis'}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {latestAIAnalysis.summary}
                </div>

                {latestAIAnalysis.dataSufficiencyNotice && (
                  <p className="text-[11px] text-emerald-300 font-medium italic">
                    ℹ️ {latestAIAnalysis.dataSufficiencyNotice}
                  </p>
                )}
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-emerald-700">
                    <CheckCircle className="w-4 h-4" /> Demonstrated Strengths
                  </h3>
                  <ul className="space-y-2">
                    {latestAIAnalysis.demonstratedStrengths?.map((st, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                        <span>{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" /> Areas Requiring Attention
                  </h3>
                  <ul className="space-y-2">
                    {latestAIAnalysis.areasRequiringImprovement?.map((im, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                        <span>{im}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Coach Observations Acknowledged */}
              {latestAIAnalysis.coachObservationsAcknowledged && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
                    Coach Qualitative Input Integrated
                  </span>
                  <p className="text-slate-600 italic">
                    "{latestAIAnalysis.coachObservationsAcknowledged}"
                  </p>
                </div>
              )}

              {/* Evidence-Grounded Actionable Training Recommendations */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Dumbbell className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      Prescribed Age-Appropriate Training Recommendations
                    </h3>
                    <p className="text-xs text-slate-500">
                      Specifically tailored drills citing recorded metric evidence and observations
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestAIAnalysis.trainingRecommendations?.map((rec, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {rec.targetedSkill}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">{rec.suitableAge}</span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm">{rec.exerciseName}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        <span className="font-bold text-slate-800">Objective:</span> {rec.objective}
                      </p>
                      <p className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800">Dosage:</span> {rec.durationOrReps}
                      </p>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 text-[11px] text-slate-500 italic">
                        <span className="font-bold text-emerald-700 not-italic block text-[10px] uppercase">
                          Evaluation Evidence:
                        </span>
                        {rec.evaluationEvidence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Performance Evaluations List */}
      {activeTab === 'evaluations' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Historical Evaluation Records</h3>
            <button
              onClick={() => {
                setEditingEval(null);
                setIsEvalModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Evaluation
            </button>
          </div>

          {evaluations?.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              No performance evaluations recorded yet. Click "Add Evaluation" above.
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations?.map((ev, idx) => (
                <div
                  key={ev._id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-lg flex items-center justify-center border border-emerald-100">
                        {ev.overallScore}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">
                          Evaluation #{evaluations.length - idx} • {new Date(ev.date).toLocaleDateString()}
                        </h4>
                        <p className="text-xs text-slate-500">Conducted by Coach {ev.coach?.name || 'Academy Coach'}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setEditingEval(ev);
                        setIsEvalModalOpen(true);
                      }}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                  </div>

                  {/* 4 Pillars Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Physical Abilities</span>
                      <p className="flex justify-between">Speed: <span className="font-semibold">{ev.physicalAbilities?.speed}</span></p>
                      <p className="flex justify-between">Endurance: <span className="font-semibold">{ev.physicalAbilities?.endurance}</span></p>
                      <p className="flex justify-between">Agility: <span className="font-semibold">{ev.physicalAbilities?.agility}</span></p>
                      <p className="flex justify-between">Strength: <span className="font-semibold">{ev.physicalAbilities?.strength}</span></p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Technical Skills</span>
                      <p className="flex justify-between">Passing: <span className="font-semibold">{ev.technicalSkills?.passing}</span></p>
                      <p className="flex justify-between">Shooting: <span className="font-semibold">{ev.technicalSkills?.shooting}</span></p>
                      <p className="flex justify-between">Dribbling: <span className="font-semibold">{ev.technicalSkills?.dribbling}</span></p>
                      <p className="flex justify-between">Ball Control: <span className="font-semibold">{ev.technicalSkills?.ballControl}</span></p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Tactical Abilities</span>
                      <p className="flex justify-between">Positioning: <span className="font-semibold">{ev.tacticalAbilities?.positioning}</span></p>
                      <p className="flex justify-between">Decision: <span className="font-semibold">{ev.tacticalAbilities?.decisionMaking}</span></p>
                      <p className="flex justify-between">Awareness: <span className="font-semibold">{ev.tacticalAbilities?.gameAwareness}</span></p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                      <span className="font-bold text-slate-700 block">Personal Development</span>
                      <p className="flex justify-between">Discipline: <span className="font-semibold">{ev.personalDevelopment?.discipline}</span></p>
                      <p className="flex justify-between">Teamwork: <span className="font-semibold">{ev.personalDevelopment?.teamwork}</span></p>
                      <p className="flex justify-between">Motivation: <span className="font-semibold">{ev.personalDevelopment?.motivation}</span></p>
                    </div>
                  </div>

                  {ev.coachObservations && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold block text-[10px] uppercase text-amber-800">Coach Qualitative Note</span>
                      "{ev.coachObservations}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Charts & Evolution */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Metric Progression Over Time</h3>
            <p className="text-xs text-slate-500">
              Track multi-date trends and improvement rates across technical and physical attributes.
            </p>
            <ProgressLineChart evaluations={evaluations} />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Radar Skill Comparison</h3>
            <p className="text-xs text-slate-500">
              Comparing latest evaluation (green) against previous baseline (slate dotted).
            </p>
            <RadarSkillChart evaluation={latestEval} previousEvaluation={previousEval} />
          </div>
        </div>
      )}

      {/* Tab 5: Training Attendance History */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Sessions</span>
              <span className="text-xl font-black text-slate-800">{attendanceStats?.totalSessions || 0}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Present</span>
              <span className="text-xl font-black text-emerald-600">{attendanceStats?.presentSessions || 0}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Absent</span>
              <span className="text-xl font-black text-rose-600">{attendanceStats?.absentSessions || 0}</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Excused</span>
              <span className="text-xl font-black text-amber-600">{attendanceStats?.excusedSessions || 0}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Attendance Log</h3>
            {attendanceRecords?.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No attendance records logged.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {attendanceRecords?.map((rec) => (
                  <div key={rec._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{rec.trainingSession?.title || 'Training Session'}</p>
                      <p className="text-slate-500">
                        {new Date(rec.date).toLocaleDateString()} • {rec.trainingSession?.location || 'Pitch'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                          rec.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'excused'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                      {rec.arrivalTime && (
                        <p className="text-[11px] text-slate-400 mt-0.5">Arrived: {rec.arrivalTime}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Development Goals */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">Individual Development Goals</h3>
            <button
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Set New Goal
            </button>
          </div>

          {goals?.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              No development goals set yet. Click "Set New Goal" above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals?.map((g) => (
                <div
                  key={g._id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {g.category}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        g.status === 'achieved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : g.status === 'in_progress'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{g.title}</h4>

                  {/* Progress Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Target: {g.targetValue}</span>
                      <span>Current: {g.currentValue}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (g.currentValue / g.targetValue) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between pt-2 border-t border-slate-100">
                    <span>Deadline: {new Date(g.deadline).toLocaleDateString()}</span>
                    <span>By Coach {g.coach?.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <EvaluationModal
        isOpen={isEvalModalOpen}
        onClose={() => setIsEvalModalOpen(false)}
        player={player}
        onSaved={fetchPlayerData}
        initialData={editingEval}
      />

      <PlayerModal
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onSaved={fetchPlayerData}
        initialData={player}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        player={player}
        onSaved={fetchPlayerData}
        initialData={editingGoal}
      />

      <ReportDownloadModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        player={player}
        latestEvaluation={latestEval}
        aiAnalysis={latestAIAnalysis}
        attendanceStats={attendanceStats}
      />
    </div>
  );
}
