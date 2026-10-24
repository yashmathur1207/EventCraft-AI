import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  ArrowRight, 
  Heart, 
  Radio, 
  GlassWater, 
  Palette, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Users, 
  Play, 
  Info,
  Calendar,
  Layers,
  FileDown,
  Check,
  Printer
} from 'lucide-react';
import { PlannerEvent } from '../types/event';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ActivityFeed } from './ActivityFeed';
import { exportEventSummaryPDF } from '../utils/pdfExport';
import { MilestoneRadialChart } from './MilestoneRadialChart';
import { MonthViewCalendar } from './MonthViewCalendar';

interface OverviewSectionProps {
  event: PlannerEvent;
  onNavigateTab: (tabId: string) => void;
  onOpenAIPlanner: () => void;
  onOpenBudgetOptimizer: () => void;
  onOpenRFP: () => void;
  onOpenRSVP: () => void;
  onUpdateEvent?: (updated: PlannerEvent) => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  event,
  onNavigateTab,
  onOpenBudgetOptimizer,
  onOpenRFP,
  onOpenRSVP,
  onUpdateEvent
}) => {
  const totalActual = event.budgetItems.reduce((sum, b) => sum + (b.actualCost || 0), 0);
  const remaining = event.totalBudget - totalActual;
  const attendingGuests = event.guests.filter(g => g.rsvpStatus === 'attending');
  const attendingHeadcount = attendingGuests.reduce((sum, g) => sum + 1 + (g.plusOnes || 0), 0);

  const completedMilestones = event.milestones.filter(m => m.completed).length;
  const pendingMilestones = event.milestones.filter(m => !m.completed);
  const nextMilestone = pendingMilestones[0];

  const budgetPct = Math.min(100, Math.round((totalActual / (event.totalBudget || 1)) * 100));
  const guestPct = Math.min(100, Math.round((attendingHeadcount / (event.targetGuestCount || 1)) * 100));

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleDownloadPDF = () => {
    try {
      setIsExporting(true);
      // Short delay to ensure browser paints loading state before jsPDF synchronous generation
      setTimeout(() => {
        try {
          exportEventSummaryPDF(event);
          setIsExporting(false);
          setExportSuccess(true);
          setTimeout(() => setExportSuccess(false), 3500);
        } catch (err) {
          console.error('Failed to generate PDF summary:', err);
          setIsExporting(false);
        }
      }, 50);
    } catch (err) {
      console.error('PDF generation error:', err);
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* 📥 Top Overview Action Bar with Download Event Summary */}
      <div className="glass-panel p-4 sm:p-5 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-300 bg-teal-500/15 border border-teal-400/20 px-2.5 py-0.5 rounded-full">
              Executive Brief
            </span>
            <span className="text-xs text-slate-400">• Complete Event Plan</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white mt-1">
            Real-Time Planning Status & Operations
          </h3>
          <p className="text-xs text-slate-300">
            Export a comprehensive printable PDF report covering milestones, day-of cues, budgets, and vendors.
          </p>
        </div>

        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-95 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 border border-white/20 transition-all cursor-pointer shrink-0 disabled:opacity-60"
          title="Download printable PDF report of timeline, budget summary, and vendor list"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : exportSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Summary Downloaded!</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 text-white" />
              <span>Download Event Summary</span>
            </>
          )}
        </button>
      </div>

      {/* 🌟 Next Critical Milestone Glass Banner */}
      {nextMilestone && (
        <div className="glass-panel p-5 border border-white/15 rainbow-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-500/30 via-amber-500/30 to-purple-500/30 border border-white/20 text-white flex items-center justify-center shrink-0 shadow-lg">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block">
                Next Strategic Priority • {nextMilestone.timePhase}
              </span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                {nextMilestone.title}
              </h4>
              <span className="text-xs text-slate-300">
                Target date: {formatDate(nextMilestone.dueDate)} • Assigned to <strong className="text-white">{nextMilestone.assignee}</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('timeline')}
            className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 shadow-md transition-all self-start sm:self-auto cursor-pointer backdrop-blur-md"
          >
            <span>View Timeline</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
          </button>
        </div>
      )}

      {/* 🌈 Prismatic Blueprint & Budget Dials Grid (Inspired by Reference Design) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: AI Event Blueprint & Progress Trackers (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-7 border border-white/15 space-y-6">
            {/* Header with New pill */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  AI Event Blueprint
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>New</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 text-xs text-slate-200 hover:text-white font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/15 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                  title="Download printable PDF report"
                >
                  <FileDown className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden sm:inline">Export PDF</span>
                </button>
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white font-medium bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 transition-colors"
                >
                  <Info className="w-3.5 h-3.5 text-amber-300" />
                  <span>Roadmap Details</span>
                </button>
              </div>
            </div>

            {/* 🎯 D3-based Circular Progress Radial Chart */}
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-300 block">
                    Execution Velocity
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    Milestone Progress Radial
                  </h4>
                </div>
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="text-xs text-amber-300 hover:text-amber-200 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>View Full Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
                {/* D3 Circular Radial Progress Gauge */}
                <div className="shrink-0 flex justify-center w-full sm:w-auto">
                  <MilestoneRadialChart
                    completedCount={completedMilestones}
                    totalCount={event.milestones.length}
                    size={176}
                    strokeWidth={14}
                  />
                </div>

                {/* Milestone Details & Current Planning Horizon */}
                <div className="flex-1 w-full space-y-3.5 sm:border-l sm:border-white/10 sm:pl-6">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Active Planning Phase
                    </span>
                    <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/15 inline-block">
                      {nextMilestone?.timePhase || 'Final Polish & Show Ready'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                      Immediate Priority Deliverable
                    </span>
                    <p className="text-xs font-semibold text-white leading-snug line-clamp-2">
                      {nextMilestone?.title || 'All strategic milestones completed! Ready for show.'}
                    </p>
                    {nextMilestone && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Assigned to: <strong className="text-amber-300">{nextMilestone.assignee}</strong> • Target: {formatDate(nextMilestone.dueDate)}
                      </span>
                    )}
                  </div>

                  {/* Execution rate bar summary */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Total Completion</span>
                      <span className="text-white font-bold">{completedMilestones} of {event.milestones.length} milestones ({Math.round((completedMilestones / (event.milestones.length || 1)) * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full rainbow-bar-bg transition-all duration-1000"
                        style={{ width: `${Math.round((completedMilestones / (event.milestones.length || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Card 1: Live Event Concept */}
            <div className="glass-card-interactive p-5 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-300">
                    <Sparkles className="w-4 h-4 text-pink-300" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Event Experience & Vibe</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider rainbow-live-badge animate-pulse-slow">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {event.tagline || event.theme}
              </p>
              {/* Interactive pill chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => onNavigateTab('timeline')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer"
                >
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Run of Show</span>
                </button>
                <button
                  onClick={() => onNavigateTab('creative')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  <span>🎨 Color Palette</span>
                </button>
                <button
                  onClick={() => onNavigateTab('vendors')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                >
                  <span>🤝 {event.vendors.length} Partners</span>
                </button>
              </div>
            </div>

            {/* Event Card 2: Event Context & People */}
            <div className="glass-card-interactive p-5 rounded-2xl border border-white/15 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <Users className="w-4 h-4 text-indigo-300" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Guest Coordination & Hospitality</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider rainbow-live-badge">
                  Live
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {attendingHeadcount} confirmed attendees out of {event.targetGuestCount} target capacity across {event.guests.length} parties.
              </p>
              {/* Attendee Avatar Cluster & Mini Tracker */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center -space-x-2">
                  {event.guests.slice(0, 5).map((g, i) => (
                    <div 
                      key={g.id || i}
                      className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-teal-400 border-2 border-[#0e0a1f] flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                      title={g.name}
                    >
                      {g.name.slice(0, 1)}
                    </div>
                  ))}
                  {event.guests.length > 5 && (
                    <div className="w-7 h-7 rounded-full bg-white/15 border-2 border-[#0e0a1f] flex items-center justify-center text-[10px] font-bold text-slate-200">
                      +{event.guests.length - 5}
                    </div>
                  )}
                </div>
                <div className="text-xs font-bold text-white">
                  Headcount Ratio: <span className="rainbow-text">{attendingHeadcount}/{event.targetGuestCount}</span>
                </div>
              </div>
              {/* Mini Rainbow Bar */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div 
                  className="h-full rounded-full rainbow-bar-bg"
                  style={{ width: `${Math.min(100, (attendingHeadcount / (event.targetGuestCount || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Refractive Rainbow Budget Dials (1 Col) */}
        <div className="space-y-6">
          {/* Dial Card 1: Budget Dial */}
          <div className="glass-panel p-6 border border-white/15 space-y-5 text-center flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-white/10 text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-300" />
                <span>Budget Dial</span>
              </h4>
              <span className="text-[11px] text-teal-300 font-bold">
                {budgetPct}% Used
              </span>
            </div>

            {/* Glowing Semicircular Rainbow Gauge */}
            <div className="relative w-44 h-44 flex items-center justify-center my-2">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="rainbowBudgetArc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00F5D4" />
                    <stop offset="35%" stopColor="#FFD200" />
                    <stop offset="70%" stopColor="#FF5E3A" />
                    <stop offset="100%" stopColor="#FF007A" />
                  </linearGradient>
                </defs>
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke="url(#rainbowBudgetArc)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * budgetPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Committed</span>
                <span className="text-2xl font-black text-white tracking-tight">
                  {formatCurrency(totalActual, event.currency)}
                </span>
                <span className="text-[11px] text-teal-300 font-semibold mt-0.5">
                  of {formatCurrency(event.totalBudget, event.currency)}
                </span>
              </div>
            </div>

            {/* Legend row with colored indicator dots */}
            <div className="w-full space-y-2 pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F5D4]" />
                  <span>Venue & Production</span>
                </div>
                <strong className="text-white">{formatCurrency(event.budgetCategories[0]?.actual || event.budgetCategories[0]?.allocated || 0, event.currency)}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5E3A]" />
                  <span>Catering & Drinks</span>
                </div>
                <strong className="text-white">{formatCurrency(event.budgetCategories[1]?.actual || event.budgetCategories[1]?.allocated || 0, event.currency)}</strong>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF007A]" />
                  <span>Remaining Runway</span>
                </div>
                <strong className={remaining >= 0 ? 'text-teal-300' : 'text-rose-400'}>
                  {formatCurrency(remaining, event.currency)}
                </strong>
              </div>
            </div>
          </div>

          {/* Dial Card 2: Headcount Capacity Dial */}
          <div className="glass-panel p-6 border border-white/15 space-y-4 text-center flex flex-col items-center">
            <div className="w-full flex items-center justify-between pb-2 border-b border-white/10 text-left">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-300" />
                <span>Attendance Dial</span>
              </h4>
              <span className="text-[11px] text-pink-300 font-bold">
                {guestPct}% of Target
              </span>
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center my-1">
              <svg className="w-full h-full transform -rotate-90">
                <defs>
                  <linearGradient id="rainbowGuestArc" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7B2CBF" />
                    <stop offset="50%" stopColor="#00F5D4" />
                    <stop offset="100%" stopColor="#FF007A" />
                  </linearGradient>
                </defs>
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="10"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="56"
                  stroke="url(#rainbowGuestArc)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="352"
                  strokeDashoffset={352 - (352 * guestPct) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-white">{attendingHeadcount}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">Attending</span>
              </div>
            </div>

            <div className="w-full flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-white/10">
              <span>Target: <strong className="text-white">{event.targetGuestCount}</strong></span>
              <span>Pending: <strong className="text-amber-300">{event.guests.filter(g => g.rsvpStatus === 'pending').length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Launchers in Translucent Glass */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <button
          onClick={handleDownloadPDF}
          disabled={isExporting}
          className="p-5 rounded-2xl glass-card-interactive text-left space-y-2 group cursor-pointer border border-white/15"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <FileDown className="w-5 h-5 text-indigo-300" />
          </div>
          <span className="text-xs font-bold text-white block">Download Summary</span>
          <span className="text-[11px] text-slate-400 block leading-snug">Generate printable PDF report of timeline & budget</span>
        </button>

        <button
          onClick={onOpenBudgetOptimizer}
          className="p-5 rounded-2xl glass-card-interactive text-left space-y-2 group cursor-pointer border border-white/15"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <span className="text-xs font-bold text-white block">AI Budget Optimizer</span>
          <span className="text-[11px] text-slate-400 block leading-snug">Audit line items and discover smart swaps</span>
        </button>

        <button
          onClick={onOpenRFP}
          className="p-5 rounded-2xl glass-card-interactive text-left space-y-2 group cursor-pointer border border-white/15"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-blue-400/30 text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Radio className="w-5 h-5 text-blue-300" />
          </div>
          <span className="text-xs font-bold text-white block">Draft Vendor RFP</span>
          <span className="text-[11px] text-slate-400 block leading-snug">Generate high-converting email inquiries</span>
        </button>

        <button
          onClick={onOpenRSVP}
          className="p-5 rounded-2xl glass-card-interactive text-left space-y-2 group cursor-pointer border border-white/15"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-pink-500/20 border border-rose-400/30 text-pink-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Heart className="w-5 h-5 text-pink-300" />
          </div>
          <span className="text-xs font-bold text-white block">Simulate Guest RSVP</span>
          <span className="text-[11px] text-slate-400 block leading-snug">Interactive guest portal with meal preferences</span>
        </button>

        <button
          onClick={() => onNavigateTab('creative')}
          className="p-5 rounded-2xl glass-card-interactive text-left space-y-2 group cursor-pointer border border-white/15"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-violet-500/20 border border-purple-400/30 text-purple-300 flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
            <Palette className="w-5 h-5 text-purple-300" />
          </div>
          <span className="text-xs font-bold text-white block">Creative Studio</span>
          <span className="text-[11px] text-slate-400 block leading-snug">Cocktails, toasts, and palette swatches</span>
        </button>
      </div>

      {/* 📅 Interactive Month Horizon Calendar */}
      <MonthViewCalendar
        event={event}
        onUpdateEvent={onUpdateEvent}
        onNavigateTab={onNavigateTab}
      />

      {/* Collaborative Live Feed & Highlights in Glass */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityFeed activities={event.activityFeed} />

          {/* Run of show highlights */}
          <div className="glass-panel p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Day-of Run of Show Highlights
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('timeline')}
                className="text-xs font-bold text-teal-300 hover:text-teal-200"
              >
                Full Schedule ({event.dayOfSchedule.length}) →
              </button>
            </div>

            <div className="space-y-3">
              {event.dayOfSchedule.slice(0, 4).map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-white/10 border border-white/15 text-white rounded-xl text-xs font-extrabold shrink-0">
                      {item.time}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <span className="text-[11px] text-slate-400">📍 {item.location} • Lead: {item.responsible}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                    {item.durationMin}m
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side glance panels */}
        <div className="space-y-6">
          {/* Creative Mood & Signature Drink */}
          {event.creative && (
            <div className="glass-panel p-6 border border-white/15 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GlassWater className="w-4 h-4 text-amber-300" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Signature Touch
                  </h3>
                </div>
                <button
                  onClick={() => onNavigateTab('creative')}
                  className="text-xs text-amber-300 font-bold hover:underline"
                >
                  Explore →
                </button>
              </div>

              {event.creative.signatureItems && event.creative.signatureItems[0] && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-pink-500/10 border border-amber-400/20 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                    {event.creative.signatureItems[0].type}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {event.creative.signatureItems[0].name}
                  </h4>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    {event.creative.signatureItems[0].description}
                  </p>
                </div>
              )}

              {/* Color swatch row */}
              {event.creative.palette && event.creative.palette.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400 block">Theme Palette</span>
                  <div className="flex items-center gap-2">
                    {event.creative.palette.map((col, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-xl shadow-lg border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                        style={{ backgroundColor: col.hex }}
                        title={`${col.name} (${col.hex})`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vendor Quick Status in Glass */}
          <div className="glass-panel p-6 border border-white/15 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Key Vendor Partners
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('vendors')}
                className="text-xs text-blue-300 font-bold hover:underline"
              >
                All ({event.vendors.length}) →
              </button>
            </div>

            <div className="space-y-2.5">
              {event.vendors.slice(0, 3).map(vendor => (
                <div
                  key={vendor.id}
                  className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-xs"
                >
                  <div>
                    <h5 className="font-bold text-white">{vendor.name}</h5>
                    <span className="text-slate-400 text-[11px]">{vendor.category}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15">
                    {vendor.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
