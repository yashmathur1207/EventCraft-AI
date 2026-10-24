import React from 'react';
import { Calendar, MapPin, Users, DollarSign, Clock, Sparkles, UserCheck, Heart } from 'lucide-react';
import { PlannerEvent } from '../types/event';
import { formatCurrency, formatDate, getDaysRemaining, calculateReadinessScore } from '../utils/formatters';

interface EventHeroProps {
  event: PlannerEvent;
  currentRole: string;
  onRoleChange: (role: string) => void;
  onOpenAIPlanner: () => void;
  onOpenRSVP: () => void;
}

export const EventHero: React.FC<EventHeroProps> = ({
  event,
  currentRole,
  onRoleChange,
  onOpenAIPlanner,
  onOpenRSVP
}) => {
  const countdown = getDaysRemaining(event.date);
  const readiness = calculateReadinessScore(event);

  const attendingCount = event.guests.filter(g => g.rsvpStatus === 'attending').length;
  const totalAttending = event.guests
    .filter(g => g.rsvpStatus === 'attending')
    .reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

  const totalSpent = event.budgetItems.reduce((sum, b) => sum + (b.actualCost || 0), 0);

  return (
    <div className="glass-panel overflow-hidden border border-white/12 shadow-2xl relative">
      {/* Cover image & prismatic dark gradient overlay */}
      <div className="relative h-64 md:h-84 w-full overflow-hidden bg-[#0c0919]">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-45 scale-105 filter blur-[0.6px] transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a1f] via-[#0e0a1f]/60 to-transparent" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#0b0914]/40 to-[#0b0914]/80 pointer-events-none" />

        {/* Top Floating Badges */}
        <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/20 shadow-md">
              {event.type}
            </span>
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>{countdown.text}</span>
            </span>
          </div>

          {/* Refractive Persona Switcher Pill */}
          <div className="flex items-center gap-2.5 bg-[#120d29]/80 backdrop-blur-xl px-4 py-1.5 rounded-2xl border border-white/15 text-xs text-white shadow-lg">
            <UserCheck className="w-3.5 h-3.5 text-amber-300" />
            <span className="text-slate-400 text-[11px] font-semibold hidden sm:inline">Active Persona:</span>
            <select
              value={currentRole}
              onChange={e => onRoleChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              aria-label="Select collaborator persona"
            >
              <option value="Lead Planner" className="bg-[#120e24] text-white">Lead Planner (Admin)</option>
              <option value="Host" className="bg-[#120e24] text-white">Event Host / Couple</option>
              <option value="Vendor Lead" className="bg-[#120e24] text-white">Vendor Lead</option>
              <option value="Guest" className="bg-[#120e24] text-white">Guest View</option>
            </select>
          </div>
        </div>

        {/* Hero Title & Tagline + Circular Rainbow Dial */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-6 z-10">
          <div className="space-y-2 max-w-2xl text-white">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg text-white">
              {event.title}
            </h1>
            <p className="text-slate-200 text-xs md:text-sm drop-shadow-md font-medium leading-relaxed max-w-xl">
              {event.tagline || event.theme}
            </p>
          </div>

          {/* Circular Rainbow Readiness / Progress Dial */}
          <div className="flex items-center gap-4 bg-white/5 backdrop-blur-xl p-3.5 px-4 rounded-2xl border border-white/20 self-start md:self-auto shadow-2xl">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="rainbowHeroDial" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FF007A" />
                    <stop offset="25%" stopColor="#FF5E3A" />
                    <stop offset="50%" stopColor="#FFD200" />
                    <stop offset="75%" stopColor="#00F5D4" />
                    <stop offset="100%" stopColor="#7B2CBF" />
                  </linearGradient>
                </defs>
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="26"
                  stroke="url(#rainbowHeroDial)"
                  strokeWidth="5"
                  fill="transparent"
                  strokeDasharray="163"
                  strokeDashoffset={163 - (163 * readiness) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-xs font-black text-white">
                {readiness}%
              </span>
            </div>
            <div className="text-white text-left">
              <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>Readiness Score</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-[11px] text-teal-300 font-semibold leading-tight mt-1">
                {readiness > 70 ? 'On Track for Perfection' : 'Milestones In Progress'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Stats Glass Tiles */}
      <div className="p-5 md:p-6 bg-[#130f28]/70 backdrop-blur-xl border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 text-xs flex-1">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
              <span className="font-extrabold text-white">{formatDate(event.date)} at {event.time}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Venue & City</span>
              <span className="font-extrabold text-white truncate max-w-[120px] block">{event.venueName || event.location}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-300">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Headcount</span>
              <span className="font-extrabold text-white">{totalAttending} / {event.targetGuestCount} Guests</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget Committed</span>
              <span className="font-extrabold text-white">{formatCurrency(totalSpent, event.currency)} of {formatCurrency(event.totalBudget, event.currency)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenRSVP}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-2xl border border-white/15 transition-all cursor-pointer backdrop-blur-md"
          >
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            <span>Guest Portal</span>
          </button>
          <button
            onClick={onOpenAIPlanner}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>✨ Plan New Event</span>
          </button>
        </div>
      </div>
    </div>
  );
};
