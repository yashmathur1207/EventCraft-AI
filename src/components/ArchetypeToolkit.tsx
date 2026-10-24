import React from 'react';
import { 
  Heart, 
  Cake, 
  Compass, 
  Users, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Gamepad2, 
  Music, 
  Flame, 
  Award, 
  ArrowRight,
  FileCheck,
  TreePine
} from 'lucide-react';
import { PlannerEvent } from '../types/event';

interface ArchetypeToolkitProps {
  event: PlannerEvent;
  onNavigateTab: (tabId: string) => void;
}

export const ArchetypeToolkit: React.FC<ArchetypeToolkitProps> = React.memo(({
  event,
  onNavigateTab
}) => {
  const isWedding = event.type === 'wedding';
  const isBirthday = event.type === 'birthday';
  const isCommunity = event.type === 'community';

  return (
    <div className="glass-panel p-6 border border-white/15 space-y-5 relative overflow-hidden">
      {/* Decorative top accent glow */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-amber-400 to-teal-400" 
        aria-hidden="true" 
      />

      {/* Header with Type Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500/20 via-purple-500/20 to-teal-500/20 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-lg">
            {isWedding && <Heart className="w-5 h-5 text-pink-300 fill-pink-300/30" />}
            {isBirthday && <Cake className="w-5 h-5 text-amber-300" />}
            {isCommunity && <Compass className="w-5 h-5 text-teal-300" />}
            {!isWedding && !isBirthday && !isCommunity && <Sparkles className="w-5 h-5 text-purple-300" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/15">
                {isWedding ? 'Wedding Edition' : isBirthday ? 'Milestone Celebration Edition' : isCommunity ? 'Community Festival Edition' : 'Custom Gathering'}
              </span>
              <span className="text-xs text-slate-400">• Dedicated Logistics Toolkit</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">
              {isWedding && 'Ceremony & Reception Command Center'}
              {isBirthday && 'Milestone Experience & Tribute Coordinator'}
              {isCommunity && 'Community Operations & Municipal Compliance'}
              {!isWedding && !isBirthday && !isCommunity && 'Gathering Operations Hub'}
            </h3>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab(isWedding ? 'guests' : isBirthday ? 'creative' : 'timeline')}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 self-start sm:self-auto cursor-pointer"
        >
          <span>Open Full Module</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* WEDDING ARCHETYPE CONTENT */}
      {isWedding && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Seating Arrangement Chart Card */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Seating Plan</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">
                4 Tables Assigned
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Assigned {event.guests.length} guests across dining tables with dietary flags honored.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Table 1: Family & Parents</span>
                <span className="font-bold text-white">8 / 8 seats</span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Table 2: Bridal Party & Best Man</span>
                <span className="font-bold text-white">10 / 10 seats</span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Table 3: University Friends (2 Vegan)</span>
                <span className="font-bold text-white">8 / 8 seats</span>
              </div>
            </div>
          </div>

          {/* Bridal Party & Ceremony Roles */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Key Roles</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Confirmed
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ceremony leads with assigned cue sheets and microphone checks.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Officiant Mateo</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Vows Script
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Best Man Marcus</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Toast Ready
                </span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Maid of Honor Chiara</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Styling 11am
                </span>
              </div>
            </div>
          </div>

          {/* Golden Hour Photo & Cake Highlights */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Key Moments</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Timeline
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Photography windows and focal celebration cues.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>3:15 PM Couple First Look</span>
                <span className="text-amber-300 font-semibold">Olive Grove</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>5:15 PM Golden Hour Cocktail</span>
                <span className="text-amber-300 font-semibold">Spritz Bar</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>8:45 PM Millefoglie Live Cake</span>
                <span className="text-amber-300 font-semibold">Pastry Chef</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BIRTHDAY ARCHETYPE CONTENT */}
      {isBirthday && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Surprise Moments & Tribute Countdown */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Surprise Cues</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Confidential
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Secret schedule triggers synchronized with the DJ and lighting crew.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>8:15 PM Childhood Montage</span>
                <span className="text-amber-300 font-bold">Rooftop Projector</span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>8:45 PM Pixel Cake Reveal</span>
                <span className="text-amber-300 font-bold">Sparklers Ready</span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>9:30 PM Surprise Guest Arrival</span>
                <span className="text-amber-300 font-bold">College Crew</span>
              </div>
            </div>
          </div>

          {/* Interactive Arcade Tournament Tracker */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-pink-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Arcade Hub</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">
                4 Machines
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Vintage cabinet tournament brackets and high score champions.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Street Fighter II Turbo</span>
                <span className="text-emerald-400 font-bold">Marcus (12W)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Mario Kart 64 Grand Prix</span>
                <span className="text-emerald-400 font-bold">Tanya (Rank #1)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Pac-Man Retro High Score</span>
                <span className="text-amber-300 font-bold">88,400 pts</span>
              </div>
            </div>
          </div>

          {/* Synthwave Beats & Food Truck */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-teal-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Vibe & Eats</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                Neon Stage
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Music playlist curation and midnight snack delivery.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>DJ NeonVibe Set</span>
                <span className="text-teal-300 font-semibold">80s Electro / Synth</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Cake Reveal Track</span>
                <span className="text-teal-300 font-semibold">Kavinsky - Nightcall</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Heavy Metal Burger Co.</span>
                <span className="text-amber-300 font-semibold">Alley Staging 6:30pm</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COMMUNITY FESTIVAL ARCHETYPE CONTENT */}
      {isCommunity && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Municipal Permits & Safety Compliance */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">City Permits</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                100% Cleared
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Municipal licenses, health department approvals, and sound variances.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Park Sound Variance #OAK-26</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 85dB till 9:30pm
                </span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Health Dept 15 Booths</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passed Inspection
                </span>
              </div>
              <div className="flex justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Water Patrol Rescue Detail</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Standby at 7pm
                </span>
              </div>
            </div>
          </div>

          {/* Volunteer Marshals & Green Team */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Volunteer Roster</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                35 Active
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shift scheduling, radio assignments, and crowd hospitality teams.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Shift A: Staging & Vendor Check</span>
                <span className="text-white font-bold">12 Marshals</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Shift B: Lantern Workshops</span>
                <span className="text-white font-bold">15 Marshals</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Shift C: Lake Retrieval & Clean</span>
                <span className="text-white font-bold">8 Green Team</span>
              </div>
            </div>
          </div>

          {/* Sustainability & Zero Waste Tracker */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TreePine className="w-4 h-4 text-amber-300" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Eco Initiative</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                Zero Waste
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sustainable materials and clean energy operations.
            </p>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Biodegradable Rice Lanterns</span>
                <span className="text-amber-300 font-semibold">500 count (100% net retrieved)</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Solar Audio Stage Power</span>
                <span className="text-emerald-400 font-semibold">100% Battery Bank</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/5 text-slate-200">
                <span>Compost & Sorting Hubs</span>
                <span className="text-teal-300 font-semibold">6 Multi-Stream Units</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ArchetypeToolkit.displayName = 'ArchetypeToolkit';
