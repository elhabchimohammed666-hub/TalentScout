import React, { useState } from 'react';
import Modal from './Modal';
import { goalAPI } from '../services/api';

export default function GoalModal({ isOpen, onClose, player, onSaved, initialData }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || 'Technical',
    targetMetric: initialData?.targetMetric || 'passing',
    currentValue: initialData?.currentValue || 6.0,
    targetValue: initialData?.targetValue || 7.5,
    unit: initialData?.unit || '/10 rating',
    deadline: initialData?.deadline
      ? new Date(initialData.deadline).toISOString().split('T')[0]
      : new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: initialData?.notes || '',
    status: initialData?.status || 'in_progress',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const metrics = [
    { key: 'passing', name: 'Passing Accuracy', cat: 'Technical' },
    { key: 'shooting', name: 'Shooting & Finishing', cat: 'Technical' },
    { key: 'dribbling', name: 'Dribbling & 1v1', cat: 'Technical' },
    { key: 'ballControl', name: 'First Touch & Control', cat: 'Technical' },
    { key: 'speed', name: 'Sprint Acceleration', cat: 'Physical' },
    { key: 'endurance', name: 'Aerobic Endurance', cat: 'Physical' },
    { key: 'agility', name: 'Lateral Agility', cat: 'Physical' },
    { key: 'strength', name: 'Physical Strength', cat: 'Physical' },
    { key: 'positioning', name: 'Tactical Positioning', cat: 'Tactical' },
    { key: 'decisionMaking', name: 'Decision Making Under Pressure', cat: 'Tactical' },
    { key: 'gameAwareness', name: 'Field Scanning & Awareness', cat: 'Tactical' },
    { key: 'discipline', name: 'Tactical Discipline', cat: 'Personal Development' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!player) return;
    setLoading(true);
    setError('');

    try {
      if (initialData?._id) {
        await goalAPI.updateGoal(initialData._id, formData);
      } else {
        await goalAPI.createGoal({
          ...formData,
          player: player._id,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save development goal');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricSelect = (mKey) => {
    const found = metrics.find((m) => m.key === mKey);
    setFormData((prev) => ({
      ...prev,
      targetMetric: mKey,
      category: found ? found.cat : prev.category,
      title: prev.title || `Improve ${found ? found.name : mKey} to target standard`,
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Update Development Goal' : `Set Goal for ${player?.firstName} ${player?.lastName}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Football Metric</label>
          <select
            value={formData.targetMetric}
            onChange={(e) => handleMetricSelect(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            {metrics.map((m) => (
              <option key={m.key} value={m.key}>
                {m.name} ({m.cat})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Goal Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Elevate Passing Under Pressure Rating to 7.5/10"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Score</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              value={formData.currentValue}
              onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 5 })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Score *</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              required
              value={formData.targetValue}
              onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) || 8 })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Timeframe *</label>
            <input
              type="date"
              required
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="in_progress">In Progress</option>
              <option value="achieved">Achieved</option>
              <option value="pending">Pending</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Action Plan & Notes</label>
          <textarea
            rows={2}
            placeholder="Specific training exercises, repetition targets, or coaching focus..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50"
          >
            {loading ? 'Saving...' : initialData ? 'Update Goal' : 'Save Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
