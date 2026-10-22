import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { playerAPI, coachAPI } from '../services/api';

export default function PlayerModal({ isOpen, onClose, onSaved, initialData }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2012-01-01',
    gender: 'Male',
    primaryPosition: 'Central Midfielder (CM)',
    secondaryPosition: '',
    jerseyNumber: 10,
    dominantFoot: 'Right',
    ageCategory: 'U-15',
    trainingGroup: 'Group A',
    assignedCoaches: [],
    photoUrl: '',
    heightCm: 165,
    weightKg: 55,
    emergencyContact: { name: '', relation: '', phone: '' },
    notes: '',
  });

  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
          firstName: initialData.firstName || '',
          lastName: initialData.lastName || '',
          dateOfBirth: initialData.dateOfBirth
            ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
            : '2012-01-01',
          gender: initialData.gender || 'Male',
          primaryPosition: initialData.primaryPosition || 'Central Midfielder (CM)',
          secondaryPosition: initialData.secondaryPosition || '',
          jerseyNumber: initialData.jerseyNumber || 10,
          dominantFoot: initialData.dominantFoot || 'Right',
          ageCategory: initialData.ageCategory || 'U-15',
          trainingGroup: initialData.trainingGroup || 'Group A',
          assignedCoaches: initialData.assignedCoaches?.map((c) => (c._id ? c._id : c)) || [],
          photoUrl: initialData.photoUrl || '',
          heightCm: initialData.heightCm || 165,
          weightKg: initialData.weightKg || 55,
          emergencyContact: initialData.emergencyContact || { name: '', relation: '', phone: '' },
          notes: initialData.notes || '',
        });
      } else {
        setFormData({
          firstName: '',
          lastName: '',
          dateOfBirth: '2012-01-01',
          gender: 'Male',
          primaryPosition: 'Central Midfielder (CM)',
          secondaryPosition: '',
          jerseyNumber: 10,
          dominantFoot: 'Right',
          ageCategory: 'U-15',
          trainingGroup: 'Group A',
          assignedCoaches: [],
          photoUrl: '',
          heightCm: 165,
          weightKg: 55,
          emergencyContact: { name: '', relation: '', phone: '' },
          notes: '',
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData?._id) {
        await playerAPI.updatePlayer(initialData._id, formData);
      } else {
        await playerAPI.createPlayer(formData);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save player profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCoachToggle = (coachId) => {
    setFormData((prev) => {
      const exists = prev.assignedCoaches.includes(coachId);
      if (exists) {
        return { ...prev, assignedCoaches: prev.assignedCoaches.filter((id) => id !== coachId) };
      } else {
        return { ...prev, assignedCoaches: [...prev.assignedCoaches, coachId] };
      }
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Player: ${initialData.firstName} ${initialData.lastName}` : 'Register New Academy Player'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Date of Birth *</label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Age Category *</label>
            <select
              value={formData.ageCategory}
              onChange={(e) => setFormData({ ...formData, ageCategory: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="U-11">U-11</option>
              <option value="U-13">U-13</option>
              <option value="U-15">U-15</option>
              <option value="U-17">U-17</option>
              <option value="U-19">U-19</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jersey Number</label>
            <input
              type="number"
              min="1"
              max="99"
              value={formData.jerseyNumber}
              onChange={(e) => setFormData({ ...formData, jerseyNumber: parseInt(e.target.value) || 10 })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Primary Playing Position *</label>
            <select
              value={formData.primaryPosition}
              onChange={(e) => setFormData({ ...formData, primaryPosition: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Center Back">Center Back</option>
              <option value="Fullback (LB/RB)">Fullback (LB/RB)</option>
              <option value="Defensive Midfielder (CDM)">Defensive Midfielder (CDM)</option>
              <option value="Central Midfielder (CM)">Central Midfielder (CM)</option>
              <option value="Attacking Midfielder (CAM)">Attacking Midfielder (CAM)</option>
              <option value="Winger (LW/RW)">Winger (LW/RW)</option>
              <option value="Striker (ST/CF)">Striker (ST/CF)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Dominant Foot</label>
            <select
              value={formData.dominantFoot}
              onChange={(e) => setFormData({ ...formData, dominantFoot: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Right">Right</option>
              <option value="Left">Left</option>
              <option value="Both">Both</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Height (cm)</label>
            <input
              type="number"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: parseInt(e.target.value) || 165 })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Weight (kg)</label>
            <input
              type="number"
              value={formData.weightKg}
              onChange={(e) => setFormData({ ...formData, weightKg: parseInt(e.target.value) || 55 })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Training Group</label>
            <input
              type="text"
              value={formData.trainingGroup}
              onChange={(e) => setFormData({ ...formData, trainingGroup: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Coach(es)</label>
          <div className="flex flex-wrap gap-2">
            {coaches.map((c) => {
              const isAssigned = formData.assignedCoaches.includes(c._id);
              return (
                <button
                  type="button"
                  key={c._id}
                  onClick={() => handleCoachToggle(c._id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isAssigned
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.name} ({c.specialization})
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Photo URL (Optional)</label>
          <input
            type="url"
            placeholder="https://images.unsplash.com/..."
            value={formData.photoUrl}
            onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Emergency Contact */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase">Emergency Contact</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Contact Name"
              value={formData.emergencyContact.name}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, name: e.target.value },
                })
              }
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />
            <input
              type="text"
              placeholder="Relation (e.g. Father)"
              value={formData.emergencyContact.relation}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, relation: e.target.value },
                })
              }
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={formData.emergencyContact.phone}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  emergencyContact: { ...formData.emergencyContact, phone: e.target.value },
                })
              }
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
            />
          </div>
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
            {loading ? 'Saving...' : initialData ? 'Update Profile' : 'Register Player'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
