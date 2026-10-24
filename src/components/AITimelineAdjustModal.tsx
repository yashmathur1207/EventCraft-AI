import React, { useState } from 'react';
import { Sparkles, Clock, AlertTriangle, ArrowRight, X, Loader2, Check } from 'lucide-react';
import { DayOfScheduleItem, PlannerEvent } from '../types/event';

interface AITimelineAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlannerEvent;
  onScheduleUpdated: (newSchedule: DayOfScheduleItem[]) => void;
}

export const AITimelineAdjustModal: React.FC<AITimelineAdjustModalProps> = ({
  isOpen,
  onClose,
  event,
  onScheduleUpdated
}) => {
  const [changeRequest, setChangeRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposedSchedule, setProposedSchedule] = useState<DayOfScheduleItem[] | null>(null);

  if (!isOpen) return null;

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeRequest.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/timeline-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSchedule: event.dayOfSchedule,
          changeRequest,
          eventType: event.type
        })
      });
      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      if (!res.ok || !data.success || !data.adjustedSchedule) {
        throw new Error(data.error || 'Failed to adjust timeline');
      }
      setProposedSchedule(data.adjustedSchedule);
    } catch (err: unknown) {
      const e = err as Error;
      const displayMsg = !e?.message || e.message.includes('Load failed') || e.message.includes('Failed to fetch')
        ? 'Unable to connect to AI Timeline service. Please try again.'
        : e.message;
      setError(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (proposedSchedule) {
      onScheduleUpdated(proposedSchedule);
      onClose();
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
        <div className="rainbow-bar-bg px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-black/30 rounded-xl backdrop-blur-md">
              <Sparkles className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">AI Stage Manager & Schedule Rebalancer</h3>
              <p className="text-xs text-white/90">
                Shift times, add unexpected items, or handle delays without creating awkward gaps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 text-slate-200">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-sm">
              {error}
            </div>
          )}

          {!proposedSchedule ? (
            <form onSubmit={handleAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Describe the Schedule Change or Delay
                </label>
                <textarea
                  rows={3}
                  required
                  value={changeRequest}
                  onChange={e => setChangeRequest(e.target.value)}
                  placeholder="e.g. Sunset golden hour portraits will take 45 mins longer. Move dinner start time to 7:00 PM and push speeches & cake cutting smoothly so guests aren't rushed."
                  className="glass-input w-full px-4 py-3 rounded-2xl text-sm resize-none"
                />
              </div>

              {/* Quick suggestion prompt chips */}
              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold block">Quick presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setChangeRequest('Ceremony is delayed by 30 minutes due to guest traffic. Push the rest of the schedule without cutting dance party time.')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs text-left cursor-pointer"
                  >
                    ⏱️ Ceremony delayed 30m
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangeRequest('Add a surprise 15-minute acoustic song performance right before the dessert / cake cutting.')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs text-left cursor-pointer"
                  >
                    🎸 Add surprise performance
                  </button>
                  <button
                    type="button"
                    onClick={() => setChangeRequest('Shorten cocktail hour by 20 minutes to give the dinner speeches more breathing room.')}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs text-left cursor-pointer"
                  >
                    🍷 Shorten cocktail hour
                  </button>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Rebalancing Day-of Flow...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Rebalance Schedule with AI</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 bg-cyan-500/15 border border-cyan-400/30 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-200 text-xs font-semibold">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>AI has generated an optimized schedule flow based on your request.</span>
                </div>
                <button
                  onClick={() => setProposedSchedule(null)}
                  className="text-xs text-cyan-300 hover:underline font-bold cursor-pointer"
                >
                  Edit Request
                </button>
              </div>

              {/* Proposed Schedule preview */}
              <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-2">
                {proposedSchedule.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-white/10 border border-white/15">
                        {item.time}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">{item.title}</h4>
                        <span className="text-[11px] text-slate-400">
                          {item.location} • {item.responsible}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
                      {item.durationMin}m
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-white/10">
                <button
                  onClick={() => setProposedSchedule(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Discard & Try Again
                </button>
                <button
                  onClick={handleApply}
                  className="px-6 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  Apply Rebalanced Schedule
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
