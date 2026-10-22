import React, { useState, useEffect } from 'react';
import { playerAPI } from '../services/api';
import PlayerModal from '../components/PlayerModal';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  ArrowRight,
  TrendingUp,
  ClipboardCheck,
  ShieldAlert,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PlayersList() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ageCategory, setAgeCategory] = useState('all');
  const [position, setPosition] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const res = await playerAPI.getPlayers({
        search,
        ageCategory,
        position,
      });
      setPlayers(res.data);
    } catch (err) {
      console.error('Failed to load players', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [ageCategory, position]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlayers();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Players Directory</h1>
          <p className="text-sm text-slate-500">
            Manage academy player profiles, technical evaluations, and AI progression dossiers.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingPlayer(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register Player</span>
        </button>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search player name or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={ageCategory}
            onChange={(e) => setAgeCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Ages</option>
            <option value="U-11">U-11</option>
            <option value="U-13">U-13</option>
            <option value="U-15">U-15</option>
            <option value="U-17">U-17</option>
            <option value="U-19">U-19</option>
          </select>

          <select
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Positions</option>
            <option value="Goalkeeper">Goalkeepers</option>
            <option value="Center Back">Center Backs</option>
            <option value="Fullback (LB/RB)">Fullbacks</option>
            <option value="Defensive Midfielder (CDM)">Defensive Midfielders</option>
            <option value="Central Midfielder (CM)">Central Midfielders</option>
            <option value="Attacking Midfielder (CAM)">Attacking Midfielders</option>
            <option value="Winger (LW/RW)">Wingers</option>
            <option value="Striker (ST/CF)">Strikers</option>
          </select>
        </div>
      </div>

      {/* Players Cards Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : players.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No players found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or register a new academy player to begin tracking evaluations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {players.map((player) => (
            <div
              key={player._id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-200 transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header card with Avatar and Category Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {player.photoUrl ? (
                      <img
                        src={player.photoUrl}
                        alt={player.firstName}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold flex items-center justify-center text-sm shadow-sm">
                        {player.firstName[0]}
                        {player.lastName[0]}
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/players/${player._id}`}
                        className="font-black text-base text-slate-900 hover:text-emerald-600 transition"
                      >
                        {player.firstName} {player.lastName}
                      </Link>
                      <p className="text-xs text-slate-500 font-medium">
                        #{player.jerseyNumber || 10} • {player.primaryPosition}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {player.ageCategory}
                  </span>
                </div>

                {/* Metrics Pill summary */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Latest Rating</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-extrabold text-slate-800 text-sm">
                        {player.latestEvaluation?.overallScore ? `${player.latestEvaluation.overallScore}/10` : 'Pending'}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <ClipboardCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-extrabold text-slate-800 text-sm">
                        {player.attendanceRate || 100}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assigned Coach */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Coached by:</span>
                  <span className="font-semibold text-slate-700">
                    {player.assignedCoaches?.map((c) => c.name).join(', ') || 'Academy Staff'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Link
                to={`/players/${player._id}`}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs text-center transition flex items-center justify-center gap-2 group"
              >
                <span>View Complete Profile</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Registration Modal */}
      <PlayerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchPlayers}
        initialData={editingPlayer}
      />
    </div>
  );
}
