import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isManager } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur px-4 sm:px-8">
      {/* Left side: Logo or Mobile toggle */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" fill="none" />
              <polygon points="12,7 15.5,9.5 14,14 10,14 8.5,9.5" fill="white" />
            </svg>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              Talent<span className="text-emerald-600">Scout</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              MERN
            </span>
          </div>
        </Link>
      </div>

      {/* Right side: User Profile info & Logout */}
      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800 leading-tight">{user.name}</span>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {isManager ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                    <Shield className="w-3 h-3" /> Academy Manager
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Award className="w-3 h-3" /> Coach
                  </span>
                )}
              </div>
            </div>

            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center border border-emerald-200 shadow-sm">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            )}

            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition ml-1"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
