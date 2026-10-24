import React from 'react';
import { Sparkles, ChevronDown, Bell, Search, Radio, Wine, Cake, Users2, Compass } from 'lucide-react';
import { PlannerEvent } from '../types/event';

interface NavbarProps {
  events: PlannerEvent[];
  activeEventId: string;
  onSelectEvent: (eventId: string) => void;
  onOpenAIPlanner: () => void;
  isConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  events,
  activeEventId,
  onSelectEvent,
  onOpenAIPlanner,
  isConnected
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0e0a1f]/65 backdrop-blur-2xl border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo with Rainbow Refractive Text */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF007A] via-[#FF5E3A] to-[#7B2CBF] p-0.5 shadow-lg shadow-pink-500/20 group cursor-pointer">
            <div className="w-full h-full bg-[#120e24] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight rainbow-text">
                EventCraft<span className="text-white font-medium"> AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                Prismatic Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Weddings • Birthdays • Community Festivals
            </p>
          </div>
        </div>

        {/* Center: Frosted Search & Event Selector */}
        <div className="flex items-center gap-3 flex-1 max-w-md justify-center">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <select
              value={activeEventId}
              onChange={e => onSelectEvent(e.target.value)}
              aria-label="Select active event plan"
              className="w-full appearance-none bg-white/5 hover:bg-white/10 text-white font-bold text-xs sm:text-sm pl-9 pr-9 py-2 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer truncate backdrop-blur-md transition-colors"
            >
              {events.map(evt => (
                <option key={evt.id} value={evt.id} className="bg-[#120e24] text-white">
                  {evt.type === 'wedding' ? '💍 ' : evt.type === 'birthday' ? '🎂 ' : evt.type === 'community' ? '🏮 ' : '✨ '}
                  {evt.title}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>

          {/* SSE Live Status Beacon */}
          <div
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-2xl border text-[11px] font-semibold backdrop-blur-md ${
              isConnected
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
            }`}
            title="Real-time multi-collaborator synchronization status"
          >
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{isConnected ? 'Live Sync' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Right Section: Notifications, Profile, & Primary Action */}
        <div className="flex items-center gap-3">
          {/* Notification Bell Badge */}
          <button 
            type="button"
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF007A] ring-2 ring-[#0e0a1f]" />
          </button>

          {/* Avatar Persona Chip */}
          <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
              YP
            </div>
            <span className="text-xs font-semibold text-slate-200">Producer</span>
          </div>

          {/* Primary Action Button with Iridescent Glow */}
          <button
            onClick={onOpenAIPlanner}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF007A] via-[#FF5E3A] to-[#7B2CBF] hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="hidden sm:inline">Plan with AI</span>
            <span className="sm:hidden">Plan</span>
          </button>
        </div>
      </div>
    </header>
  );
};
