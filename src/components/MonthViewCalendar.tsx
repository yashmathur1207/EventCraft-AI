import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  DollarSign, 
  PartyPopper, 
  Clock, 
  List, 
  Grid3X3, 
  Flag,
  User,
  Plus,
  X,
  Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlannerEvent, Milestone, BudgetItem } from '../types/event';
import { formatCurrency, formatDate } from '../utils/formatters';

interface MonthViewCalendarProps {
  event: PlannerEvent;
  onUpdateEvent?: (updated: PlannerEvent) => void;
  onNavigateTab?: (tabId: string) => void;
  className?: string;
}

type CalendarViewMode = 'month-grid' | 'agenda-timeline';
type EventFilterType = 'all' | 'milestones' | 'critical' | 'budget';

interface DayEventItem {
  id: string;
  type: 'event-day' | 'milestone' | 'budget';
  title: string;
  date: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
  assignee?: string;
  amount?: number;
  isPaid?: boolean;
  timePhase?: string;
  rawMilestone?: Milestone;
}

export const MonthViewCalendar: React.FC<MonthViewCalendarProps> = ({
  event,
  onUpdateEvent,
  onNavigateTab,
  className = ''
}) => {
  // Parse initial event date to focus the calendar on event month by default
  const initialDate = useMemo(() => {
    if (event.date) {
      const parts = event.date.split('-');
      if (parts.length === 3) {
        return new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      }
    }
    return new Date();
  }, [event.date]);

  const [currentMonth, setCurrentMonth] = useState<Date>(initialDate);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month-grid');
  const [filterType, setFilterType] = useState<EventFilterType>('all');
  const [selectedDayString, setSelectedDayString] = useState<string | null>(event.date || null);
  const [isAddingQuickMilestone, setIsAddingQuickMilestone] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Month navigation helpers
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleJumpToEventMonth = () => {
    if (event.date) {
      const parts = event.date.split('-');
      if (parts.length === 3) {
        setCurrentMonth(new Date(Number(parts[0]), Number(parts[1]) - 1, 1));
        setSelectedDayString(event.date);
      }
    }
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    const pad = (n: number) => n.toString().padStart(2, '0');
    setSelectedDayString(`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`);
  };

  // Compile all key dates into a lookup dictionary
  const itemsByDate = useMemo(() => {
    const map = new Map<string, DayEventItem[]>();

    const addItem = (dateStr: string, item: DayEventItem) => {
      if (!dateStr) return;
      const cleanDate = dateStr.slice(0, 10);
      const list = map.get(cleanDate) || [];
      list.push(item);
      map.set(cleanDate, list);
    };

    // 1. The Main Event Day
    if (event.date) {
      addItem(event.date, {
        id: `main-event-${event.id}`,
        type: 'event-day',
        title: `🎉 ${event.title} (${event.venueName || event.location})`,
        date: event.date,
        category: 'Main Celebration',
        priority: 'high',
        completed: false
      });
    }

    // 2. Milestones
    event.milestones.forEach(m => {
      if (m.dueDate) {
        addItem(m.dueDate, {
          id: m.id,
          type: 'milestone',
          title: m.title,
          date: m.dueDate,
          category: m.category,
          priority: m.priority,
          completed: m.completed,
          assignee: m.assignee,
          timePhase: m.timePhase,
          rawMilestone: m
        });
      }
    });

    // 3. Budget Due Dates
    event.budgetItems.forEach(b => {
      if (b.dueDate) {
        addItem(b.dueDate, {
          id: `budget-${b.id}`,
          type: 'budget',
          title: `Payment: ${b.title}`,
          date: b.dueDate,
          amount: b.actualCost || b.estimatedCost,
          isPaid: b.isPaid,
          category: 'Budget Runway'
        });
      }
    });

    return map;
  }, [event]);

  // Filter items according to active filter
  const filterItem = (item: DayEventItem): boolean => {
    if (filterType === 'milestones') return item.type === 'milestone';
    if (filterType === 'critical') return item.priority === 'high' || item.type === 'event-day';
    if (filterType === 'budget') return item.type === 'budget';
    return true; // 'all'
  };

  // Calculate calendar grid days for currentMonth
  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      dayNumber: number;
      dateString: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isEventDay: boolean;
      items: DayEventItem[];
    }[] = [];

    const pad = (n: number) => n.toString().padStart(2, '0');
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(d)}`;
      const rawItems = itemsByDate.get(dateStr) || [];
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isEventDay: dateStr === event.date,
        items: rawItems.filter(filterItem)
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
      const rawItems = itemsByDate.get(dateStr) || [];
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isEventDay: dateStr === event.date,
        items: rawItems.filter(filterItem)
      });
    }

    // Next month padding days to complete 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingCells; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateStr = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(d)}`;
      const rawItems = itemsByDate.get(dateStr) || [];
      days.push({
        dayNumber: d,
        dateString: dateStr,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isEventDay: dateStr === event.date,
        items: rawItems.filter(filterItem)
      });
    }

    return days;
  }, [currentMonth, itemsByDate, event.date, filterType]);

  // Toggle milestone completion directly from calendar
  const handleToggleMilestone = (milestoneId: string) => {
    if (!onUpdateEvent) return;

    const updated = event.milestones.map(m => {
      if (m.id === milestoneId) {
        const nextState = !m.completed;
        if (nextState) {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        }
        return { ...m, completed: nextState };
      }
      return m;
    });

    onUpdateEvent({
      ...event,
      milestones: updated
    });
  };

  // Add a milestone for the selected day
  const handleAddQuickMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !selectedDayString || !onUpdateEvent) return;

    const newMilestone: Milestone = {
      id: `m-${Date.now()}`,
      timePhase: 'Calendar Milestone',
      title: quickTitle.trim(),
      dueDate: selectedDayString,
      completed: false,
      priority: quickPriority,
      category: 'Planning',
      assignee: 'Lead Planner'
    };

    onUpdateEvent({
      ...event,
      milestones: [...event.milestones, newMilestone]
    });

    setQuickTitle('');
    setIsAddingQuickMilestone(false);
  };

  // Selected day items
  const selectedDayItems = useMemo(() => {
    if (!selectedDayString) return [];
    return (itemsByDate.get(selectedDayString) || []).filter(filterItem);
  }, [selectedDayString, itemsByDate, filterType]);

  // All events across all months for the agenda view
  const allAgendaItems = useMemo(() => {
    const list: DayEventItem[] = [];
    itemsByDate.forEach((items) => {
      items.forEach(item => {
        if (filterItem(item)) list.push(item);
      });
    });
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [itemsByDate, filterType]);

  const monthYearLabel = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={`glass-panel border border-white/15 p-5 sm:p-6 space-y-6 ${className}`}>
      {/* 🧭 Top Calendar Navigation & View Mode Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
              <CalendarIcon className="w-4 h-4 text-indigo-300" />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-300">
              Interactive Month Horizon
            </span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight mt-1">
            {monthYearLabel}
          </h3>
          <p className="text-xs text-slate-400">
            Click any day to inspect deliverables, payment schedules, and main event cues
          </p>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous / Next Month Controls */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15 shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Jump to Event Date Button */}
          {event.date && (
            <button
              onClick={handleJumpToEventMonth}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-pink-500/25 to-purple-500/25 hover:from-pink-500/35 hover:to-purple-500/35 text-white text-xs font-bold rounded-xl border border-pink-400/30 transition-all cursor-pointer shadow-xs"
              title={`Jump to ${formatDate(event.date)}`}
            >
              <PartyPopper className="w-3.5 h-3.5 text-amber-300" />
              <span>Event Date</span>
            </button>
          )}

          {/* Toggle View Mode: Month Grid vs Agenda List */}
          <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/15">
            <button
              onClick={() => setViewMode('month-grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'month-grid'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('agenda-timeline')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'agenda-timeline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🏷️ Filter Categories Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-teal-300" /> Filter:
          </span>
          {(
            [
              { id: 'all', label: 'All Dates' },
              { id: 'milestones', label: 'Milestones Only' },
              { id: 'critical', label: 'Critical / High Priority' },
              { id: 'budget', label: 'Budget Payments' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-white/20 text-white border border-white/25 shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" /> Event Day
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Milestone
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Payment
          </span>
        </div>
      </div>

      {/* 📅 Main View Container: Grid or Agenda */}
      {viewMode === 'month-grid' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid (2 Cols on lg) */}
          <div className="lg:col-span-2 space-y-2">
            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] uppercase tracking-wider text-slate-400 pb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-1">
                  {d}
                </div>
              ))}
            </div>

            {/* 7x5 or 7x6 Calendar Month Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarGrid.map((day, idx) => {
                const isSelected = selectedDayString === day.dateString;
                const hasItems = day.items.length > 0;
                const hasEventDay = day.items.some(i => i.type === 'event-day');
                const hasHighPriority = day.items.some(i => i.priority === 'high');

                return (
                  <div
                    key={`${day.dateString}-${idx}`}
                    onClick={() => setSelectedDayString(day.dateString)}
                    className={`min-h-[72px] sm:min-h-[84px] p-2 rounded-xl transition-all border flex flex-col justify-between cursor-pointer select-none group relative ${
                      day.isCurrentMonth
                        ? 'bg-white/[0.04] hover:bg-white/[0.09]'
                        : 'bg-white/[0.015] opacity-40 hover:opacity-70'
                    } ${
                      isSelected
                        ? 'ring-2 ring-indigo-400 border-indigo-400/80 bg-white/[0.12] shadow-lg'
                        : hasEventDay
                        ? 'border-pink-500/60 bg-pink-500/10'
                        : hasHighPriority
                        ? 'border-amber-400/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Top Row: Date number and indicators */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${
                          hasEventDay
                            ? 'bg-pink-500 text-white shadow-md shadow-pink-500/50'
                            : day.isToday
                            ? 'bg-teal-400 text-slate-900 font-extrabold'
                            : isSelected
                            ? 'bg-white text-slate-900 font-bold'
                            : 'text-slate-300'
                        }`}
                      >
                        {day.dayNumber}
                      </span>

                      {/* Event Day Star / Sparkle badge */}
                      {hasEventDay && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-pink-500/30 text-pink-300 font-extrabold border border-pink-400/40 animate-pulse">
                          DAY 0
                        </span>
                      )}
                    </div>

                    {/* Middle / Bottom Items list */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {day.items.slice(0, 2).map(item => (
                        <div
                          key={item.id}
                          className={`text-[9px] sm:text-[10px] font-semibold truncate px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                            item.type === 'event-day'
                              ? 'bg-gradient-to-r from-pink-500/80 to-purple-600/80 text-white font-bold'
                              : item.type === 'milestone'
                              ? item.completed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : item.priority === 'high'
                                ? 'bg-amber-500/25 text-amber-200 border border-amber-500/40'
                                : 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/30'
                              : 'bg-emerald-600/25 text-teal-200 border border-teal-500/30'
                          }`}
                          title={item.title}
                        >
                          {item.type === 'event-day' ? (
                            <PartyPopper className="w-2.5 h-2.5 shrink-0 text-amber-300" />
                          ) : item.type === 'milestone' ? (
                            item.completed ? (
                              <CheckCircle2 className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                            ) : (
                              <Circle className="w-2.5 h-2.5 shrink-0 text-amber-400" />
                            )
                          ) : (
                            <DollarSign className="w-2.5 h-2.5 shrink-0 text-emerald-400" />
                          )}
                          <span className="truncate">{item.title}</span>
                        </div>
                      ))}

                      {day.items.length > 2 && (
                        <span className="text-[9px] text-slate-400 font-medium block text-right">
                          +{day.items.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🔍 Day Inspector & Details Panel (1 Col on lg) */}
          <div className="glass-panel p-5 border border-white/15 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 block">
                    Day Schedule Inspector
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">
                    {selectedDayString ? formatDate(selectedDayString) : 'Select a date'}
                  </h4>
                </div>

                {selectedDayString === event.date && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-pink-500 text-white shadow-md shadow-pink-500/30 animate-pulse">
                    Main Event
                  </span>
                )}
              </div>

              {/* Items on this day */}
              {selectedDayItems.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center space-y-2">
                  <CalendarIcon className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">
                    No scheduled milestones or payment deadlines on this date.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Use the button below to assign a new deliverable to this day.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectedDayItems.map(item => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        item.type === 'event-day'
                          ? 'bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 border-pink-400/40 shadow-md'
                          : item.type === 'milestone'
                          ? item.completed
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-white/[0.05] border-white/15'
                          : 'bg-teal-500/10 border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {item.type === 'event-day' ? (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-pink-500 text-white">
                                Event Day
                              </span>
                            ) : item.type === 'milestone' ? (
                              <span
                                className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                                  item.priority === 'high'
                                    ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                                    : 'bg-white/10 text-slate-300'
                                }`}
                              >
                                {item.timePhase || item.category || 'Milestone'}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-teal-500/30 text-teal-300 border border-teal-500/40">
                                Payment Due
                              </span>
                            )}

                            {item.priority === 'high' && item.type !== 'event-day' && (
                              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-0.5">
                                <AlertCircle className="w-3 h-3" /> Urgent
                              </span>
                            )}
                          </div>

                          <h5 className="text-xs font-bold text-white leading-snug">
                            {item.title}
                          </h5>

                          {item.assignee && (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <User className="w-3 h-3 text-indigo-300" />
                              Lead: <strong className="text-white">{item.assignee}</strong>
                            </span>
                          )}

                          {item.amount !== undefined && (
                            <span className="text-[11px] font-bold text-teal-300 block">
                              Amount: {formatCurrency(item.amount, event.currency)} {item.isPaid ? '• (Paid)' : '• (Unpaid)'}
                            </span>
                          )}
                        </div>

                        {/* Quick action toggle for milestones */}
                        {item.type === 'milestone' && item.rawMilestone && onUpdateEvent && (
                          <button
                            onClick={() => handleToggleMilestone(item.rawMilestone!.id)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              item.completed
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-white/10 text-slate-300 border-white/15 hover:bg-white/20'
                            }`}
                            title={item.completed ? 'Mark pending' : 'Mark completed'}
                          >
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 hover:text-white" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Actions: Quick Add or Tab Switch */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              {isAddingQuickMilestone ? (
                <form onSubmit={handleAddQuickMilestone} className="space-y-2">
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={e => setQuickTitle(e.target.value)}
                    placeholder="Milestone title..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-indigo-400"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={quickPriority}
                      onChange={e => setQuickPriority(e.target.value as any)}
                      className="px-2 py-1 rounded-lg bg-[#18132b] border border-white/20 text-[11px] text-white"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAddingQuickMilestone(false)}
                        className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!quickTitle.trim()}
                        className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  {onUpdateEvent && selectedDayString && (
                    <button
                      onClick={() => setIsAddingQuickMilestone(true)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-teal-300" />
                      <span>Add Milestone</span>
                    </button>
                  )}
                  {onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('timeline')}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold border border-indigo-500/40 transition-colors cursor-pointer"
                    >
                      <span>Full Timeline</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 📜 Agenda Timeline List View */
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400">
            <span>Showing {allAgendaItems.length} key milestones & target dates in chronological order</span>
            <span>Filter: {filterType}</span>
          </div>

          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {allAgendaItems.map(item => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  item.type === 'event-day'
                    ? 'bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border-pink-500/40 shadow-lg'
                    : item.type === 'milestone'
                    ? item.completed
                      ? 'bg-emerald-500/10 border-emerald-500/25'
                      : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07]'
                    : 'bg-teal-500/10 border-teal-500/25'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                      item.type === 'event-day'
                        ? 'bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-500/30 font-black'
                        : item.completed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/10 text-white border-white/15 font-bold'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold text-slate-300">
                      {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-base font-black leading-none">
                      {new Date(item.date).getDate()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {item.type === 'event-day' ? 'Celebration' : item.timePhase || item.category}
                      </span>
                      {item.priority === 'high' && item.type !== 'event-day' && (
                        <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h5 className="text-sm font-bold text-white">
                      {item.title}
                    </h5>
                    {item.assignee && (
                      <span className="text-xs text-slate-400 block">
                        Assigned to: <strong className="text-white">{item.assignee}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {item.amount !== undefined && (
                    <span className="text-xs font-bold text-teal-300">
                      {formatCurrency(item.amount, event.currency)}
                    </span>
                  )}

                  {item.type === 'milestone' && item.rawMilestone && onUpdateEvent && (
                    <button
                      onClick={() => handleToggleMilestone(item.rawMilestone!.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        item.completed
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/15'
                      }`}
                    >
                      {item.completed ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Completed</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Mark Done</span>
                        </>
                      )}
                    </button>
                  )}

                  {item.type === 'event-day' && onNavigateTab && (
                    <button
                      onClick={() => onNavigateTab('timeline')}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Run of Show →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
