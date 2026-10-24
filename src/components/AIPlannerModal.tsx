import React, { useState } from 'react';
import { Sparkles, Calendar, Users, DollarSign, MapPin, X, Loader2, Heart, Cake, Users2, Compass } from 'lucide-react';
import { EventType, PlannerEvent } from '../types/event';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: PlannerEvent) => void;
}

const EVENT_PRESETS = [
  {
    type: 'wedding' as EventType,
    label: 'Wedding Celebration',
    icon: Heart,
    color: 'from-rose-500 to-amber-500',
    defaultTitle: 'Golden Sunset Vineyard Wedding',
    defaultLocation: 'Sonoma Valley Estate, CA',
    defaultGuests: 110,
    defaultBudget: 38000,
    defaultTheme: 'Warm Tuscan Rustic, Twinkling Fairy Lights & Olive Foliage'
  },
  {
    type: 'birthday' as EventType,
    label: 'Milestone Birthday',
    icon: Cake,
    color: 'from-violet-500 to-fuchsia-500',
    defaultTitle: '40th Bohemian Desert Lounge & Stargazing',
    defaultLocation: 'Joshua Tree Open Air Villa, CA',
    defaultGuests: 45,
    defaultBudget: 7500,
    defaultTheme: 'Mid-century Desert Boho, Mezcal Tastings & Live Vinyl DJ'
  },
  {
    type: 'community' as EventType,
    label: 'Community Gathering',
    icon: Users2,
    color: 'from-emerald-500 to-teal-500',
    defaultTitle: 'Riverside Harvest & Arts Community Block Party',
    defaultLocation: 'Riverside Waterfront Park',
    defaultGuests: 300,
    defaultBudget: 12000,
    defaultTheme: 'Autumn Harvest, Local Makers Market, Eco-friendly Family Picnic'
  },
  {
    type: 'custom' as EventType,
    label: 'Custom Special Event',
    icon: Compass,
    color: 'from-blue-500 to-indigo-500',
    defaultTitle: 'Creative Studio Launch & Art Gala',
    defaultLocation: 'Downtown Loft Gallery',
    defaultGuests: 80,
    defaultBudget: 9000,
    defaultTheme: 'Minimalist Monochromatic, Champagne & Ambient Electronic'
  }
];

const PRIORITY_TAGS = [
  'Gourmet Food & Wine Pairing',
  'Epic Photography & Drone Cinema',
  'Signature Cocktails & Mixology',
  'High-Energy Live Band & Dance Floor',
  'Botanical Florals & Ambient Lighting',
  'Family-Friendly Interactive Zones',
  'Strict Budget Maximization'
];

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  onEventCreated
}) => {
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState('Golden Sunset Vineyard Wedding');
  const [location, setLocation] = useState('Sonoma Valley Estate, CA');
  const [guestCount, setGuestCount] = useState(110);
  const [budget, setBudget] = useState(38000);
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  });
  const [theme, setTheme] = useState('Warm Tuscan Rustic, Twinkling Fairy Lights & Olive Foliage');
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    'Gourmet Food & Wine Pairing',
    'Botanical Florals & Ambient Lighting'
  ]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof EVENT_PRESETS[0]) => {
    setEventType(preset.type);
    setTitle(preset.defaultTitle);
    setLocation(preset.defaultLocation);
    setGuestCount(preset.defaultGuests);
    setBudget(preset.defaultBudget);
    setTheme(preset.defaultTheme);
  };

  const togglePriority = (tag: string) => {
    if (selectedPriorities.includes(tag)) {
      setSelectedPriorities(selectedPriorities.filter(t => t !== tag));
    } else {
      setSelectedPriorities([...selectedPriorities, tag]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    const steps = [
      'Architecting smart department budgets...',
      'Drafting milestone timeline & run of show...',
      'Curating vetted vendor RFP specs...',
      'Synthesizing theme design & guest touches...'
    ];
    let stepIdx = 0;
    setGenerationStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setGenerationStep(steps[stepIdx]);
    }, 1800);

    try {
      const res = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType,
          title,
          guestCount: Number(guestCount),
          budget: Number(budget),
          date,
          location,
          theme,
          priorities: selectedPriorities,
          specialRequests: specialNotes
        })
      });

      clearInterval(stepInterval);

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}). Please try again.`);
      }

      if (!res.ok || !data.success || !data.plan) {
        throw new Error(data.error || 'Failed to generate event plan.');
      }

      const plan = data.plan;

      const newEvent: PlannerEvent = {
        id: `ev-${Date.now()}`,
        title,
        type: eventType,
        tagline: theme || 'Curated celebration plan',
        date,
        time: '16:00',
        location,
        venueName: location.split(',')[0] || 'Celebration Venue',
        targetGuestCount: Number(guestCount),
        totalBudget: Number(budget),
        currency: 'USD',
        theme,
        priorityFocus: selectedPriorities.join(', ') || 'Memorable hospitality & flawless flow',
        milestones: plan.milestones || [],
        dayOfSchedule: plan.dayOfSchedule || [],
        budgetCategories: plan.budgetCategories || [],
        budgetItems: plan.budgetItems || [],
        vendors: plan.vendors || [],
        guests: [
          {
            id: `g-${Date.now()}-1`,
            name: 'Lead Organizer (You)',
            email: 'organizer@eventcraft.ai',
            group: 'VIP',
            rsvpStatus: 'attending',
            plusOnes: 1,
            dietary: 'None',
            checkedIn: true,
            notes: 'Host'
          }
        ],
        creative: plan.creative || {
          themeTitle: theme,
          vibeDescription: '',
          palette: [],
          decorConcepts: [],
          signatureItems: [],
          invitations: [],
          speeches: [],
          favorsOrActivities: []
        },
        activityFeed: [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            author: 'EventCraft AI',
            role: 'AI Assistant',
            action: `Generated complete ${eventType} blueprint with custom budget, schedule, and vendor RFPs.`,
            type: 'ai'
          }
        ],
        updatedAt: new Date().toISOString()
      };

      // Optimistically persist to backend if available
      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent)
        });
      } catch {
        // Backend sync failure will not block local event creation
      }

      onEventCreated(newEvent);
      onClose();
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const error = err as Error;
      console.warn('AI Planner issue:', error?.message);
      const displayMsg = !error?.message || error.message.includes('Load failed') || error.message.includes('Failed to fetch')
        ? 'Unable to connect to AI Planner service. Please check connection and try again.'
        : error.message;
      setError(displayMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl my-8 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(15, 12, 28, 0.94)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderTop: '1px solid rgba(255, 255, 255, 0.28)'
        }}
      >
        {/* Header */}
        <div className="rainbow-bar-bg px-6 py-6 text-white relative">
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-black/30 rounded-2xl backdrop-blur-md">
              <Sparkles className="w-7 h-7 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">Plan a New Event with GenAI</h2>
              <p className="text-white/90 text-sm mt-0.5">
                Gemini will architect your custom budget, minute-by-minute timeline, vendor checklists, and creative touches.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleGenerate} className="p-6 md:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-sm">
              {error}
            </div>
          )}

          {/* Event Type selector cards */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              1. Choose Event Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {EVENT_PRESETS.map(preset => {
                const Icon = preset.icon;
                const isSelected = eventType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex flex-col items-center text-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400/60 bg-white/[0.12] shadow-lg shadow-cyan-500/10 text-white'
                        : 'border-white/10 hover:border-white/20 bg-white/[0.04] text-slate-300'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl text-white mb-2 bg-gradient-to-br ${preset.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Basic Info: Title & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Event Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Elena & Julian's Coastal Wedding"
                className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                City / Venue / Setting
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g. Sonoma Valley Estate, CA"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Numbers: Guests, Budget, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Guests
              </label>
              <div className="relative">
                <Users className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="number"
                  min={5}
                  max={5000}
                  required
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Total Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="number"
                  min={500}
                  max={1000000}
                  step={500}
                  required
                  value={budget}
                  onChange={e => setBudget(Number(e.target.value))}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Event Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          {/* Theme & Vibe */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Theme, Aesthetic & Mood
            </label>
            <input
              type="text"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="e.g. Modern Minimalist, Mediterranean Warmth, 80s Retro Arcade, Harvest Autumn"
              className="glass-input w-full px-4 py-2.5 rounded-xl text-sm"
            />
          </div>

          {/* Key Priorities Chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Key Priorities (Select What Matters Most)
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_TAGS.map(tag => {
                const active = selectedPriorities.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePriority(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      active
                        ? 'rainbow-bar-bg text-white shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/15'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Special Requirements */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Special Requests or Dietary / Cultural Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={e => setSpecialNotes(e.target.value)}
              placeholder="e.g. Need gluten-free options, outdoor sunset ceremony, acoustic strings during vows, zero-waste focus"
              className="glass-input w-full px-4 py-2 rounded-xl text-sm resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{generationStep || 'Generating Plan with AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Full Event Plan with AI</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
