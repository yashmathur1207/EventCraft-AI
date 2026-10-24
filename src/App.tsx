import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  LayoutDashboard, 
  DollarSign, 
  Clock, 
  ShieldCheck, 
  Users, 
  Palette, 
  Radio, 
  CheckCircle2, 
  AlertCircle,
  Share2,
  X,
  PartyPopper
} from 'lucide-react';
import { PlannerEvent, Guest } from './types/event';
import { INITIAL_EVENTS } from './data/mockEvents';
import { Navbar } from './components/Navbar';
import { EventHero } from './components/EventHero';
import { OverviewSection } from './components/OverviewSection';
import { BudgetSection } from './components/BudgetSection';
import { TimelineSection } from './components/TimelineSection';
import { VendorSection } from './components/VendorSection';
import { GuestSection } from './components/GuestSection';
import { CreativeSection } from './components/CreativeSection';
import { AIPlannerModal } from './components/AIPlannerModal';
import { AIBudgetOptimizerModal } from './components/AIBudgetOptimizerModal';
import { AIVendorRFPModal } from './components/AIVendorRFPModal';
import { GuestRSVPModal } from './components/GuestRSVPModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AICoPilot } from './components/AICoPilot';

export default function App() {
  const [events, setEvents] = useState<PlannerEvent[]>(INITIAL_EVENTS);
  const [activeEventId, setActiveEventId] = useState<string>(INITIAL_EVENTS[0].id);
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'creative'>('overview');
  const [currentRole, setCurrentRole] = useState<string>('Lead Planner');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [liveNotification, setLiveNotification] = useState<{ title: string; message: string } | null>(null);

  // Modals
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [showBudgetOptimizer, setShowBudgetOptimizer] = useState(false);
  const [showRFPModal, setShowRFPModal] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);

  // Fetch all events on load with safe fallback
  useEffect(() => {
    let isCancelled = false;

    const loadEvents = async () => {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (isCancelled) return;
        if (data && data.success && Array.isArray(data.events) && data.events.length > 0) {
          fetchActiveEvent(activeEventId);
        }
      } catch {
        // Fallback silently to preloaded mock events in state
      }
    };

    loadEvents();

    return () => {
      isCancelled = true;
    };
  }, []);

  const fetchActiveEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/events/${id}`);
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data && data.success && data.event) {
        setEvents(prev => {
          const exists = prev.find(e => e.id === id);
          if (exists) {
            return prev.map(e => e.id === id ? data.event : e);
          }
          return [data.event, ...prev];
        });
      }
    } catch {
      // Retain existing event in state
    }
  };

  // Setup Server-Sent Events (SSE) for real-time collaborative sync with safe reconnection
  useEffect(() => {
    if (typeof EventSource === 'undefined' || !activeEventId) return;

    let es: EventSource | null = null;
    let isMounted = true;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const initSSE = () => {
      try {
        if (!isMounted) return;
        es = new EventSource(`/api/events/${activeEventId}/stream`);

        es.onopen = () => {
          if (isMounted) setIsConnected(true);
        };

        es.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'CONNECTED') {
              setIsConnected(true);
            } else if (payload.type === 'EVENT_UPDATED' || payload.type === 'GUEST_RSVP_RECEIVED' || payload.type === 'VENDOR_UPDATED') {
              if (payload.event) {
                setEvents(prev => prev.map(e => e.id === payload.event.id ? payload.event : e));
              }
              if (payload.activity) {
                setLiveNotification({
                  title: payload.activity.author || 'Real-Time Update',
                  message: payload.activity.action
                });
                setTimeout(() => setLiveNotification(null), 5000);
              }
            }
          } catch {
            // Heartbeat comments (e.g. : keep-alive) or non-JSON messages safely ignored
          }
        };

        es.onerror = () => {
          if (!isMounted) return;
          setIsConnected(false);
          // Close immediately to prevent aggressive browser auto-retry loops causing "Load failed"
          if (es) {
            es.close();
            es = null;
          }
          // Controlled reconnection after 10s
          reconnectTimer = setTimeout(() => {
            if (isMounted) initSSE();
          }, 10000);
        };
      } catch {
        if (isMounted) setIsConnected(false);
      }
    };

    initSSE();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (es) {
        es.close();
        es = null;
      }
    };
  }, [activeEventId]);

  const activeEvent = events.find(e => e.id === activeEventId) || events[0];

  const handleUpdateEvent = async (updated: PlannerEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    try {
      await fetch(`/api/events/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
    } catch {
      // Optimistic update retained
    }
  };

  const handleEventCreated = (newEvent: PlannerEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setActiveEventId(newEvent.id);
    setActiveTab('overview');
    setLiveNotification({
      title: 'AI Blueprint Assembled',
      message: `"${newEvent.title}" was generated with custom budget and schedule!`
    });
    setTimeout(() => setLiveNotification(null), 5000);
  };

  const handleRSVPSubmitted = (guest: Guest) => {
    setLiveNotification({
      title: 'RSVP Confirmed',
      message: `${guest.name} confirmed attendance with ${guest.plusOnes > 0 ? `+${guest.plusOnes} guest` : 'solo'}!`
    });
    setTimeout(() => setLiveNotification(null), 5000);
  };

  interface NavTabItem {
    id: 'overview' | 'budget' | 'timeline' | 'vendors' | 'guests' | 'creative';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navTabs: NavTabItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'budget', label: 'Budget Dial & Ledger', icon: DollarSign, badge: `$${(activeEvent.totalBudget / 1000).toFixed(0)}k` },
    { id: 'timeline', label: 'Timeline & Run-of-Show', icon: Clock, badge: `${activeEvent.milestones.filter(m => m.completed).length}/${activeEvent.milestones.length}` },
    { id: 'vendors', label: 'Vendors & RFPs', icon: ShieldCheck, badge: `${activeEvent.vendors.length}` },
    { id: 'guests', label: 'Guest Coordination', icon: Users, badge: `${activeEvent.guests.filter(g => g.rsvpStatus === 'attending').length}` },
    { id: 'creative', label: 'Inspirations Studio', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-[#0b0914] text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-pink-500 selection:text-white">
      {/* ♿ Skip to Main Content Link for Keyboard & Screen Reader Accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* 🌈 Dynamic Organic Rainbow Aura Blobs (Hardware Accelerated) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Blob 1: Sunset Pink / Magenta */}
        <div 
          className="absolute -top-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#FF007A]/25 blur-[130px] animate-aura-1 transform-gpu"
        />
        {/* Blob 2: Cyan / Electric Green */}
        <div 
          className="absolute top-1/4 right-[-10%] w-[580px] h-[580px] rounded-full bg-[#00F5D4]/20 blur-[150px] animate-aura-2 transform-gpu"
        />
        {/* Blob 3: Deep Violet / Indigo */}
        <div 
          className="absolute top-1/3 left-1/4 w-[650px] h-[650px] rounded-full bg-[#7B2CBF]/30 blur-[160px] animate-aura-3 transform-gpu"
        />
        {/* Blob 4: Warm Yellow / Coral */}
        <div 
          className="absolute -bottom-24 left-[-5%] w-[520px] h-[520px] rounded-full bg-[#FFD200]/20 blur-[140px] animate-aura-2 transform-gpu"
        />
        {/* Blob 5: Sky Blue / Cyan */}
        <div 
          className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-[#00B8FF]/20 blur-[130px] animate-aura-1 transform-gpu"
        />

        {/* Subtle Organic Grain Texture Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* 🥳 Floating Refractive Bubble Notification with aria-live */}
      {liveNotification && (
        <div 
          role="status" 
          aria-live="polite" 
          className="fixed bottom-24 right-6 z-50 max-w-sm rounded-2xl p-4 glass-panel border border-white/20 shadow-2xl rainbow-glow animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-pink-500/30 to-amber-500/30 border border-white/20 text-white shrink-0">
              <PartyPopper className="w-5 h-5 text-amber-300 animate-bounce" />
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white tracking-wide">
                  {liveNotification.title}
                </span>
                <button
                  onClick={() => setLiveNotification(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                {liveNotification.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        events={events}
        activeEventId={activeEventId}
        onSelectEvent={(id) => {
          setActiveEventId(id);
          fetchActiveEvent(id);
        }}
        onOpenAIPlanner={() => setShowAIPlanner(true)}
        isConnected={isConnected}
      />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 md:py-8 space-y-8 relative z-10 focus:outline-none">
        {/* Hero Banner with countdown & circular rainbow readiness gauge */}
        <EventHero
          event={activeEvent}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onOpenAIPlanner={() => setShowAIPlanner(true)}
          onOpenRSVP={() => setShowRSVPModal(true)}
        />

        {/* Refractive Navigation Tabs Bar with full ARIA support */}
        <div className="glass-panel p-2 overflow-x-auto">
          <nav className="flex items-center gap-1.5 min-w-max" aria-label="Event Sections" role="tablist">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white/15 text-white shadow-lg border border-white/25 backdrop-blur-md'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <span className={isActive ? 'rainbow-text font-extrabold' : ''}>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive 
                        ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-xs' 
                        : 'bg-white/10 text-slate-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Panels wrapped in ErrorBoundary and TabPanel */}
        <ErrorBoundary fallbackTitle="Event Workspace Error">
          <div 
            role="tabpanel" 
            id={`panel-${activeTab}`} 
            aria-labelledby={`tab-${activeTab}`} 
            className="pb-16 outline-none" 
            tabIndex={0}
          >
          {activeTab === 'overview' && (
            <OverviewSection
              event={activeEvent}
              onNavigateTab={(tab) => setActiveTab(tab as typeof activeTab)}
              onOpenAIPlanner={() => setShowAIPlanner(true)}
              onOpenBudgetOptimizer={() => setShowBudgetOptimizer(true)}
              onOpenRFP={() => setShowRFPModal(true)}
              onOpenRSVP={() => setShowRSVPModal(true)}
              onUpdateEvent={handleUpdateEvent}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetSection
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineSection
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
            />
          )}

          {activeTab === 'vendors' && (
            <VendorSection
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
            />
          )}

          {activeTab === 'guests' && (
            <GuestSection
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
            />
          )}

          {activeTab === 'creative' && (
            <CreativeSection
              event={activeEvent}
              onUpdateEvent={handleUpdateEvent}
            />
          )}
          </div>
        </ErrorBoundary>
      </main>

      {/* Floating Crafty AI Co-Pilot Assistant (Prismatic Iridescent Glass Overlay) */}
      <AICoPilot event={activeEvent} />

      {/* Global Modals */}
      <AIPlannerModal
        isOpen={showAIPlanner}
        onClose={() => setShowAIPlanner(false)}
        onEventCreated={handleEventCreated}
      />

      <AIBudgetOptimizerModal
        isOpen={showBudgetOptimizer}
        onClose={() => setShowBudgetOptimizer(false)}
        event={activeEvent}
      />

      <AIVendorRFPModal
        isOpen={showRFPModal}
        onClose={() => setShowRFPModal(false)}
        event={activeEvent}
      />

      <GuestRSVPModal
        isOpen={showRSVPModal}
        onClose={() => setShowRSVPModal(false)}
        event={activeEvent}
        onRSVPSubmitted={handleRSVPSubmitted}
      />
    </div>
  );
}
