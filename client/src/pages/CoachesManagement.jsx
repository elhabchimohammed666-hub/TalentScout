import React, { useState, useEffect } from 'react';
import { coachAPI } from '../services/api';
import Modal from '../components/Modal';
import {
  UserCheck,
  UserPlus,
  Mail,
  Phone,
  Award,
  Users,
  CalendarDays,
  Edit,
  Trash2,
  CheckCircle,
} from 'lucide-react';

export default function CoachesManagement() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Youth Tactical Development',
    assignedAgeGroups: ['U-15'],
    phone: '',
    bio: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const res = await coachAPI.getCoaches();
      setCoaches(res.data);
    } catch (err) {
      console.error('Failed to load coaches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const openCreateModal = () => {
    setEditingCoach(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      specialization: 'Youth Tactical Development',
      assignedAgeGroups: ['U-15'],
      phone: '',
      bio: '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCoach(c);
    setFormData({
      name: c.name,
      email: c.email,
      password: '',
      specialization: c.specialization || '',
      assignedAgeGroups: c.assignedAgeGroups || ['U-15'],
      phone: c.phone || '',
      bio: c.bio || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (editingCoach) {
        await coachAPI.updateCoach(editingCoach._id, formData);
      } else {
        await coachAPI.createCoach(formData);
      }
      setIsModalOpen(false);
      fetchCoaches();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coach profile');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this coach account?')) return;
    try {
      await coachAPI.deleteCoach(id);
      fetchCoaches();
    } catch (err) {
      console.error('Failed to deactivate coach', err);
    }
  };

  const toggleAgeGroup = (ag) => {
    setFormData((prev) => {
      const exists = prev.assignedAgeGroups.includes(ag);
      if (exists) {
        return { ...prev, assignedAgeGroups: prev.assignedAgeGroups.filter((g) => g !== ag) };
      } else {
        return { ...prev, assignedAgeGroups: [...prev.assignedAgeGroups, ag] };
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Coaching Staff Management</h1>
          <p className="text-sm text-slate-500">
            Create and oversee academy coach credentials, assign age categories, and monitor technical leadership.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Coach Account</span>
        </button>
      </div>

      {/* Coaches Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent" />
        </div>
      ) : coaches.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 mt-2">No coaches found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coaches.map((coach) => (
            <div
              key={coach._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {coach.avatar ? (
                      <img
                        src={coach.avatar}
                        alt={coach.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-purple-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200">
                        {coach.name?.[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-base text-slate-900">{coach.name}</h3>
                      <p className="text-xs font-semibold text-purple-700">{coach.specialization}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      coach.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {coach.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{coach.email}</span>
                  </p>
                  {coach.phone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{coach.phone}</span>
                    </p>
                  )}
                </div>

                {/* Assigned Age Groups */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Assigned Age Groups:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {coach.assignedAgeGroups?.map((ag, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {ag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Active load counters */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Assigned Squad</span>
                    <span className="font-black text-slate-800">{coach.assignedPlayersCount || 0} players</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 text-center">
                    <span className="text-[10px] font-bold text-slate-400 block">Active Sessions</span>
                    <span className="font-black text-purple-700">{coach.activeSessionsCount || 0} scheduled</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(coach)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDeactivate(coach._id)}
                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                  title="Deactivate account"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCoach ? `Edit Coach: ${editingCoach.name}` : 'Create Coach Account'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password {editingCoach ? '(Leave blank to retain existing)' : '*'}
            </label>
            <input
              type="password"
              required={!editingCoach}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingCoach ? '••••••••' : 'Min 6 characters'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Coaching Specialization</label>
            <input
              type="text"
              placeholder="e.g. Midfield Tactical & Positional Play"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
              Assigned Age Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {['U-11', 'U-13', 'U-15', 'U-17', 'U-19'].map((ag) => {
                const active = formData.assignedAgeGroups.includes(ag);
                return (
                  <button
                    type="button"
                    key={ag}
                    onClick={() => toggleAgeGroup(ag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      active
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {ag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-300 font-semibold text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingCoach ? 'Update Coach' : 'Create Coach'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
