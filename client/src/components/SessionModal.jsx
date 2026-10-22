import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { sessionAPI, coachAPI } from '../services/api';

export default function SessionModal({ isOpen, onClose, onSaved, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '16:30',
    endTime: '18:30',
    location: 'Pitch 1 (Full Turf)',
    ageGroup: 'U-15',
    focusTopics: ['passing', 'ball control'],
    intensity: 'medium',
    description: '',
    coach: '',
    postSessionNotes: '',
  });

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const focusOptions = [
    'passing',
    'ball control',
    'endurance',
    'tactical awareness',
    'shooting',
    'dribbling',
    'speed',
    'defensive positioning',
    'pressing',
    'transition play',
  ];

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const res = await coachAPI.getCoaches();
        setCoaches(res.data);
      } catch (err) {
        console.error('Failed to load coaches', err);
      }
    };
    if (isOpen) {
      fetchCoaches();
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          startTime: initialData.startTime || '16:30',
          endTime: initialData.endTime || '18:30',
          location: initialData.location || 'Pitch 1',
          ageGroup: initialData.ageGroup || 'U-15',
          focusTopics: initialData.focusTopics || ['passing'],
          intensity: initialData.intensity || 'medium',
          description: initialData.description || '',
          coach: initialData.coach?._id || initialData.coach || '',
          postSessionNotes: initialData.postSessionNotes || '',
        });
      } else {
        setFormData({
          title: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '16:30',
          endTime: '18:30',
          location: 'Pitch 1 (Full Turf)',
          ageGroup: 'U-15',
          focusTopics: ['passing', 'tactical awareness'],
          intensity: 'medium',
          description: '',
          coach: '',
          postSessionNotes: '',
        });
      }
    }
  }, [isOpen, initialData]);

  const toggleTopic = (topic) => {
    setFormData((prev) => {
      const exists = prev.focusTopics.includes(topic);
      if (exists) {
        return { ...prev, focusTopics: prev.focusTopics.filter((t) => t !== topic) };
      } else {
        return { ...prev, focusTopics: [...prev.focusTopics, topic] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData?._id) {
        await sessionAPI.updateSession(initialData._id, formData);
      } else {
        await sessionAPI.createSession(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save training session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Training Session` : `Schedule New Training Session`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. U-15 Passing Under Pressure & High Transition"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Start Time *</label>
            <input
              type="time"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">End Time *</label>
            <input
              type="time"
              required
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age Category *</label>
            <select
              value={formData.ageGroup}
              onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="U-11">U-11</option>
              <option value="U-13">U-13</option>
              <option value="U-15">U-15</option>
              <option value="U-17">U-17</option>
              <option value="U-19">U-19</option>
              <option value="All Academy">All Academy</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Intensity</label>
            <select
              value={formData.intensity}
              onChange={(e) => setFormData({ ...formData, intensity: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="low">Low (Recovery / Light Technical)</option>
              <option value="medium">Medium (Standard Tactical)</option>
              <option value="high">High (Match Simulation / Conditioning)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lead Coach</label>
          <select
            value={formData.coach}
            onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">Current User (Default)</option>
            {coaches.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.specialization})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Focus Objectives & Drills
          </label>
          <div className="flex flex-wrap gap-2">
            {focusOptions.map((topic) => {
              const active = formData.focusTopics.includes(topic);
              return (
                <button
                  type="button"
                  key={topic}
                  onClick={() => toggleTopic(topic)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize border transition ${
                    active
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Session Plan Description</label>
          <textarea
            rows={2}
            placeholder="Session breakdown, specific drill layout, field dimensions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {initialData && (
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Post-Training Debrief Notes
            </label>
            <textarea
              rows={2}
              placeholder="Summary of how players responded, intensity levels, tactical observations..."
              value={formData.postSessionNotes}
              onChange={(e) => setFormData({ ...formData, postSessionNotes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        )}

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
            {loading ? 'Saving...' : initialData ? 'Update Session' : 'Create Session'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
