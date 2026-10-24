import React, { useState, useMemo } from 'react';
import { Clock, Calendar, CheckCircle2, Circle, AlertCircle, Sparkles, Plus, Printer, User, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlannerEvent, Milestone, DayOfScheduleItem } from '../types/event';
import { formatDate } from '../utils/formatters';
import { exportEventSummaryPDF } from '../utils/pdfExport';
import { AITimelineAdjustModal } from './AITimelineAdjustModal';
import { MonthViewCalendar } from './MonthViewCalendar';

interface TimelineSectionProps {
  event: PlannerEvent;
  onUpdateEvent: (updated: PlannerEvent) => void;
}

export const TimelineSection: React.FC<TimelineSectionProps> = React.memo(({ event, onUpdateEvent }) => {
  const [viewMode, setViewMode] = useState<'milestones' | 'calendar' | 'dayOf'>('milestones');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // New milestone form state
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [mTitle, setMTitle] = useState('');
  const [mPhase, setMPhase] = useState('3 Months Before');
  const [mDueDate, setMDueDate] = useState('');
  const [mCategory, setMCategory] = useState('General');
  const [mAssignee, setMAssignee] = useState('Lead Planner');
  const [mPriority, setMPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // New day-of item form state
  const [isAddingDayOf, setIsAddingDayOf] = useState(false);
  const [dTime, setDTime] = useState('14:00');
  const [dTitle, setDTitle] = useState('');
  const [dDuration, setDDuration] = useState(30);
  const [dLocation, setDLocation] = useState('');
  const [dResponsible, setDResponsible] = useState('');
  const [dNotes, setDNotes] = useState('');

  const toggleMilestone = (milestoneId: string) => {
    const updated = event.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        if (nextState) {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        return { ...m, completed: nextState };
      }
      return m;
    });

    const toggled = event.milestones.find(m => m.id === milestoneId);
    onUpdateEvent({
      ...event,
      milestones: updated,
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `${toggled?.completed ? 'Reopened' : 'Completed'} milestone "${toggled?.title}"`,
          type: 'timeline'
        },
        ...event.activityFeed
      ]
    });
  };

  const toggleDayOfItem = (itemId: string) => {
    const updated = event.dayOfSchedule.map(s => {
      if (s.id === itemId) return { ...s, completed: !s.completed };
      return s;
    });
    onUpdateEvent({
      ...event,
      dayOfSchedule: updated
    });
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle) return;

    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      timePhase: mPhase,
      title: mTitle,
      dueDate: mDueDate,
      completed: false,
      priority: mPriority,
      category: mCategory,
      assignee: mAssignee
    };

    onUpdateEvent({
      ...event,
      milestones: [...event.milestones, newMilestone],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `Added milestone "${mTitle}" (${mPhase})`,
          type: 'timeline'
        },
        ...event.activityFeed
      ]
    });

    setMTitle('');
    setIsAddingMilestone(false);
  };

  const handleAddDayOfItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dTitle) return;

    const newItem: DayOfScheduleItem = {
      id: `sch-${Date.now()}`,
      time: dTime,
      title: dTitle,
      durationMin: Number(dDuration) || 30,
      location: dLocation || 'Main Area',
      responsible: dResponsible || 'Host',
      notes: dNotes,
      completed: false
    };

    onUpdateEvent({
      ...event,
      dayOfSchedule: [...event.dayOfSchedule, newItem],
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'Lead Planner',
          role: 'Lead Planner',
          action: `Added day-of schedule slot: ${dTime} - ${dTitle}`,
          type: 'timeline'
        },
        ...event.activityFeed
      ]
    });

    setDTitle('');
    setDLocation('');
    setDResponsible('');
    setDNotes('');
    setIsAddingDayOf(false);
  };

  const handleApplyAISchedule = (newSchedule: DayOfScheduleItem[]) => {
    onUpdateEvent({
      ...event,
      dayOfSchedule: newSchedule,
      activityFeed: [
        {
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          author: 'EventCraft AI',
          role: 'AI Assistant',
          action: 'Rebalanced day-of timeline flow & updated vendor alert cues.',
          type: 'ai'
        },
        ...event.activityFeed
      ]
    });
  };

  // Group milestones by timePhase memoized
  const groupedMilestones = useMemo(() => {
    return event.milestones.reduce((acc, m) => {
      const key = m.timePhase || 'Upcoming';
      if (!acc[key]) acc[key] = [];
      acc[key].push(m);
      return acc;
    }, {} as Record<string, Milestone[]>);
  }, [event.milestones]);

  const { completedCount, progressPercent } = useMemo(() => {
    const completed = event.milestones.filter(m => m.completed).length;
    const pct = event.milestones.length > 0 ? Math.round((completed / event.milestones.length) * 100) : 0;
    return { completedCount: completed, progressPercent: pct };
  }, [event.milestones]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -left-20 -top-20 w-72 h-72 rounded-full bg-gradient-to-br from-[#FF007A]/20 via-[#FF5E3A]/20 to-[#7B2CBF]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Flawless Chronology</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Timeline & <span className="rainbow-text">Run of Show</span>
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Track the strategic multi-month milestone countdown and orchestrate the minute-by-minute day-of execution without missing a beat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {viewMode === 'dayOf' && (
              <button
                onClick={() => setShowAdjustModal(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs uppercase tracking-wider rainbow-bar-bg hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>AI Schedule Adjuster</span>
              </button>
            )}

            <button
              onClick={() => exportEventSummaryPDF(event).catch(console.error)}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl backdrop-blur-md transition-all cursor-pointer"
              title="Download printable PDF of timeline and schedule"
            >
              <Printer className="w-4 h-4" />
              <span>Export Run-of-Show PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1.5 glass-panel rounded-2xl border border-white/15">
          <button
            onClick={() => setViewMode('milestones')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'milestones'
                ? 'rainbow-bar-bg text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            🗓️ Strategic Milestones ({completedCount}/{event.milestones.length})
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'rainbow-bar-bg text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            📅 Month Calendar View
          </button>
          <button
            onClick={() => setViewMode('dayOf')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'dayOf'
                ? 'rainbow-bar-bg text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            ⏱️ Day-Of Run of Show ({event.dayOfSchedule.length} cues)
          </button>
        </div>

        <div>
          {viewMode === 'milestones' ? (
            <button
              onClick={() => setIsAddingMilestone(!isAddingMilestone)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Strategic Milestone</span>
            </button>
          ) : viewMode === 'dayOf' ? (
            <button
              onClick={() => setIsAddingDayOf(!isAddingDayOf)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Day-Of Cue</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* View 0: Month Calendar View */}
      {viewMode === 'calendar' && (
        <MonthViewCalendar
          event={event}
          onUpdateEvent={onUpdateEvent}
        />
      )}

      {/* View 1: Milestones Roadmap */}
      {viewMode === 'milestones' && (
        <div className="space-y-6">
          {/* Progress bar */}
          <div className="glass-panel p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Strategic Readiness Progress</span>
                <span className="font-extrabold rainbow-text">{progressPercent}% Completed</span>
              </div>
              <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rainbow-bar-bg rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right pl-4 border-l border-white/10 shrink-0">
              <div className="text-lg font-bold text-white">{completedCount} / {event.milestones.length}</div>
              <div className="text-[11px] text-slate-400">Milestones Done</div>
            </div>
          </div>

          {/* Add Milestone Form */}
          {isAddingMilestone && (
            <form onSubmit={handleAddMilestone} className="glass-panel p-5 rounded-2xl border border-indigo-400/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Add New Strategic Milestone</h4>
                <button type="button" onClick={() => setIsAddingMilestone(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Milestone title (e.g. Taste & Approve Wedding Cake)"
                    value={mTitle}
                    onChange={e => setMTitle(e.target.value)}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <select
                    value={mPhase}
                    onChange={e => setMPhase(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  >
                    <option value="6 Months Before" className="bg-slate-900 text-white">6 Months Before</option>
                    <option value="4 Months Before" className="bg-slate-900 text-white">4 Months Before</option>
                    <option value="3 Months Before" className="bg-slate-900 text-white">3 Months Before</option>
                    <option value="2 Months Before" className="bg-slate-900 text-white">2 Months Before</option>
                    <option value="1 Month Before" className="bg-slate-900 text-white">1 Month Before</option>
                    <option value="2 Weeks Before" className="bg-slate-900 text-white">2 Weeks Before</option>
                    <option value="Event Week" className="bg-slate-900 text-white">Event Week</option>
                    <option value="Day After" className="bg-slate-900 text-white">Day After</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="date"
                    value={mDueDate}
                    onChange={e => setMDueDate(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Assignee (e.g. Elena, Marcus, Coordinator)"
                    value={mAssignee}
                    onChange={e => setMAssignee(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="w-full sm:w-auto px-5 py-2 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer">
                    Save Milestone
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Grouped Milestones list */}
          <div className="space-y-6">
            {Object.entries(groupedMilestones).map(([phase, items]) => (
              <div key={phase} className="glass-panel p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full rainbow-bar-bg" />
                    <span>{phase}</span>
                  </h3>
                  <span className="text-xs font-semibold text-slate-400">
                    {items.filter(i => i.completed).length} / {items.length} completed
                  </span>
                </div>

                <div className="space-y-2.5">
                  {items.map(item => (
                    <div
                      key={item.id}
                      onClick={() => toggleMilestone(item.id)}
                      className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer ${
                        item.completed
                          ? 'border-emerald-500/30 bg-emerald-500/10'
                          : 'border-white/10 hover:border-white/25 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 hover:text-white transition-colors"
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className={`text-sm font-semibold ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                            {item.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                              item.priority === 'high' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                              item.priority === 'medium' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-slate-500/20 text-slate-300 border border-slate-400/30'
                            }`}>
                              {item.priority}
                            </span>
                            <span className="text-xs text-slate-400">
                              Due: {formatDate(item.dueDate)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{item.assignee || 'Unassigned'}</span>
                          </span>
                          <span>•</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 2: Day-Of Schedule (Run of Show) */}
      {viewMode === 'dayOf' && (
        <div className="space-y-6">
          {/* Add Day-of Item Form */}
          {isAddingDayOf && (
            <form onSubmit={handleAddDayOfItem} className="glass-panel p-5 rounded-2xl border border-indigo-400/40 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white">Add Day-Of Schedule Cue</h4>
                <button type="button" onClick={() => setIsAddingDayOf(false)} className="text-xs text-slate-400 hover:text-white">Cancel</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Time (e.g. 04:30 PM)"
                    value={dTime}
                    onChange={e => setDTime(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    placeholder="Activity title (e.g. First Dance & Champagne Toast)"
                    value={dTitle}
                    onChange={e => setDTitle(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Duration (min)"
                    value={dDuration}
                    onChange={e => setDDuration(Number(e.target.value))}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Location / Area"
                    value={dLocation}
                    onChange={e => setDLocation(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Responsible Lead"
                    value={dResponsible}
                    onChange={e => setDResponsible(e.target.value)}
                    className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="w-full sm:w-auto px-5 py-2 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer">
                    Save Cue
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Timeline list */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl">
            <div className="relative border-l-2 border-white/20 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8">
              {event.dayOfSchedule.map(item => (
                <div key={item.id} className="relative group">
                  {/* Dot on the timeline */}
                  <div
                    onClick={() => toggleDayOfItem(item.id)}
                    className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 border-white/40 shadow-xs cursor-pointer flex items-center justify-center transition-all ${
                      item.completed ? 'bg-emerald-500 text-white' : 'rainbow-bar-bg text-white hover:scale-110'
                    }`}
                  >
                    {item.completed && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>

                  <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    item.completed ? 'bg-white/[0.02] border-white/5 opacity-60' : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.07]'
                  }`}>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-xl text-xs font-extrabold text-white bg-white/10 border border-white/15">
                          {item.time}
                        </span>
                        <h4 className={`text-base font-bold ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                        {item.durationMin} mins
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 my-2">
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300">{item.location}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-medium">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Lead: <strong className="text-white">{item.responsible}</strong></span>
                      </span>
                    </div>

                    {item.notes && (
                      <p className="text-xs text-slate-300 bg-white/[0.04] p-2.5 rounded-xl border border-white/10 mt-2">
                        💡 {item.notes}
                      </p>
                    )}

                    {item.vendorAlert && (
                      <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-400/30 px-3 py-1.5 rounded-xl">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Vendor Attention: {item.vendorAlert}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Schedule Adjuster Modal */}
      <AITimelineAdjustModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        event={event}
        onScheduleUpdated={handleApplyAISchedule}
      />
    </div>
  );
});

TimelineSection.displayName = 'TimelineSection';
