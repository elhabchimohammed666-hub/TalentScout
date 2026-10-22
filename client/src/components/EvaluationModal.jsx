import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { evaluationAPI } from '../services/api';

export default function EvaluationModal({ isOpen, onClose, player, onSaved, initialData }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    physicalAbilities: { speed: 7, endurance: 7, agility: 7, strength: 7 },
    technicalSkills: { passing: 7, shooting: 7, dribbling: 7, ballControl: 7 },
    tacticalAbilities: { positioning: 7, decisionMaking: 7, gameAwareness: 7 },
    personalDevelopment: { discipline: 7, teamwork: 7, motivation: 7 },
    strengths: '',
    areasForImprovement: '',
    coachObservations: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        date: new Date(initialData.date).toISOString().split('T')[0],
        physicalAbilities: { ...initialData.physicalAbilities },
        technicalSkills: { ...initialData.technicalSkills },
        tacticalAbilities: { ...initialData.tacticalAbilities },
        personalDevelopment: { ...initialData.personalDevelopment },
        strengths: (initialData.strengths || []).join(', '),
        areasForImprovement: (initialData.areasForImprovement || []).join(', '),
        coachObservations: initialData.coachObservations || '',
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        physicalAbilities: { speed: 7, endurance: 7, agility: 7, strength: 7 },
        technicalSkills: { passing: 7, shooting: 7, dribbling: 7, ballControl: 7 },
        tacticalAbilities: { positioning: 7, decisionMaking: 7, gameAwareness: 7 },
        personalDevelopment: { discipline: 7, teamwork: 7, motivation: 7 },
        strengths: '',
        areasForImprovement: '',
        coachObservations: '',
      });
    }
  }, [initialData, isOpen]);

  const handleSliderChange = (category, metric, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [metric]: parseFloat(value),
      },
    }));
  };

  const calculateCurrentAverage = () => {
    const p = formData.physicalAbilities;
    const t = formData.technicalSkills;
    const tac = formData.tacticalAbilities;
    const pd = formData.personalDevelopment;

    const pAvg = (p.speed + p.endurance + p.agility + p.strength) / 4;
    const tAvg = (t.passing + t.shooting + t.dribbling + t.ballControl) / 4;
    const tacAvg = (tac.positioning + tac.decisionMaking + tac.gameAwareness) / 3;
    const pdAvg = (pd.discipline + pd.teamwork + pd.motivation) / 3;

    return ((pAvg + tAvg + tacAvg + pdAvg) / 4).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!player) return;
    setLoading(true);
    setError('');

    try {
      const payload = {
        player: player._id,
        date: formData.date,
        physicalAbilities: formData.physicalAbilities,
        technicalSkills: formData.technicalSkills,
        tacticalAbilities: formData.tacticalAbilities,
        personalDevelopment: formData.personalDevelopment,
        strengths: formData.strengths
          ? formData.strengths.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        areasForImprovement: formData.areasForImprovement
          ? formData.areasForImprovement.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        coachObservations: formData.coachObservations,
      };

      if (initialData?._id) {
        await evaluationAPI.updateEvaluation(initialData._id, payload);
      } else {
        await evaluationAPI.createEvaluation(payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  const renderMetricSlider = (category, metric, label, min = 1, max = 10, step = 0.5) => {
    const val = formData[category][metric];
    const getColorClass = (v) => {
      if (v >= 8) return 'text-emerald-600 bg-emerald-50';
      if (v >= 6) return 'text-amber-600 bg-amber-50';
      return 'text-rose-600 bg-rose-50';
    };

    return (
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">{label}</span>
          <span className={`px-2 py-0.5 rounded font-bold text-xs ${getColorClass(val)}`}>
            {val.toFixed(1)}/10
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={(e) => handleSliderChange(category, metric, e.target.value)}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Evaluation for ${player?.firstName}` : `New Evaluation: ${player?.firstName} ${player?.lastName}`}
      maxWidth="max-w-3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
          <div>
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Evaluation Live Score</p>
            <p className="text-xs text-slate-500 mt-0.5">Calculated across 15 structured metrics</p>
          </div>
          <div className="text-3xl font-black text-emerald-700">
            {calculateCurrentAverage()}
            <span className="text-sm font-medium text-slate-400">/10</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Evaluation Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Physical Abilities */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Physical Abilities</span>
              <span className="text-xs font-medium text-slate-400">4 metrics</span>
            </h4>
            {renderMetricSlider('physicalAbilities', 'speed', 'Speed & Acceleration')}
            {renderMetricSlider('physicalAbilities', 'endurance', 'Aerobic Endurance & Stamina')}
            {renderMetricSlider('physicalAbilities', 'agility', 'Agility & Change of Direction')}
            {renderMetricSlider('physicalAbilities', 'strength', 'Physical Strength & Shielding')}
          </div>

          {/* 2. Technical Skills */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Technical Skills</span>
              <span className="text-xs font-medium text-slate-400">4 metrics</span>
            </h4>
            {renderMetricSlider('technicalSkills', 'passing', 'Passing (Short & Long Accuracy)')}
            {renderMetricSlider('technicalSkills', 'shooting', 'Shooting & Finishing')}
            {renderMetricSlider('technicalSkills', 'dribbling', 'Dribbling & 1v1 Execution')}
            {renderMetricSlider('technicalSkills', 'ballControl', 'First Touch & Ball Control')}
          </div>

          {/* 3. Tactical Abilities */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Tactical Abilities</span>
              <span className="text-xs font-medium text-slate-400">3 metrics</span>
            </h4>
            {renderMetricSlider('tacticalAbilities', 'positioning', 'Tactical Positioning & Shape')}
            {renderMetricSlider('tacticalAbilities', 'decisionMaking', 'Decision Making Under Pressure')}
            {renderMetricSlider('tacticalAbilities', 'gameAwareness', 'Scanning & Game Awareness')}
          </div>

          {/* 4. Personal Development */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>Personal Development</span>
              <span className="text-xs font-medium text-slate-400">3 metrics</span>
            </h4>
            {renderMetricSlider('personalDevelopment', 'discipline', 'Discipline & Coachability')}
            {renderMetricSlider('personalDevelopment', 'teamwork', 'Teamwork & Communication')}
            {renderMetricSlider('personalDevelopment', 'motivation', 'Work Ethic & Motivation')}
          </div>
        </div>

        {/* Coach Observations & Qualitative Feedback */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Coach Observations / Specific Comments (Essential for AI Context)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Adam demonstrated high stamina during transition drills, but struggled with passing composure when pressed by defenders."
              value={formData.coachObservations}
              onChange={(e) => setFormData({ ...formData, coachObservations: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Demonstrated Strengths (comma-separated)
              </label>
              <input
                type="text"
                placeholder="High aerobic stamina, Coachable"
                value={formData.strengths}
                onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Areas for Improvement (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Passing under pressure, Body angle"
                value={formData.areasForImprovement}
                onChange={(e) => setFormData({ ...formData, areasForImprovement: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData ? 'Update Evaluation' : 'Save Evaluation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
