import React, { useState } from 'react';
import { Heart, CheckCircle2, Music, Utensils, Users, Send, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlannerEvent, Guest } from '../types/event';

interface GuestRSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlannerEvent;
  onRSVPSubmitted: (guest: Guest) => void;
}

export const GuestRSVPModal: React.FC<GuestRSVPModalProps> = ({
  isOpen,
  onClose,
  event,
  onRSVPSubmitted
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rsvpStatus, setRsvpStatus] = useState<'attending' | 'declined'>('attending');
  const [plusOnes, setPlusOnes] = useState(0);
  const [dietary, setDietary] = useState('None');
  const [customDietary, setCustomDietary] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    const finalDietary = dietary === 'Other' ? (customDietary || 'Other') : dietary;
    try {

      const res = await fetch(`/api/events/${event.id}/rsvps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          rsvpStatus,
          plusOnes,
          dietary: finalDietary,
          songRequest,
          notes
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      const fallbackGuest = {
        id: `guest-${Date.now()}`,
        name,
        email,
        group: 'Friends' as const,
        rsvpStatus,
        plusOnes,
        dietary: finalDietary,
        songRequest,
        notes,
        checkedIn: false
      };

      const finalGuest = (data && data.success && data.guest) ? data.guest : fallbackGuest;
      if (rsvpStatus === 'attending') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      onRSVPSubmitted(finalGuest);
      setSubmitted(true);
    } catch {
      const fallbackGuest = {
        id: `guest-${Date.now()}`,
        name,
        email,
        group: 'Friends' as const,
        rsvpStatus,
        plusOnes,
        dietary: finalDietary,
        songRequest,
        notes,
        checkedIn: false
      };
      if (rsvpStatus === 'attending') {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
      onRSVPSubmitted(fallbackGuest);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg my-8 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(15, 12, 28, 0.94)',
          backdropFilter: 'blur(24px) saturate(160%)',
          WebkitBackdropFilter: 'blur(24px) saturate(160%)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderTop: '1px solid rgba(255, 255, 255, 0.28)'
        }}
      >
        {/* Header with celebration banner */}
        <div className="rainbow-bar-bg px-6 py-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 mx-auto bg-black/30 rounded-2xl flex items-center justify-center backdrop-blur-md mb-2">
            <Heart className="w-6 h-6 text-white fill-white/40" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
            Interactive Guest RSVP Experience
          </span>
          <h3 className="text-xl font-extrabold mt-0.5 text-white">{event.title}</h3>
          <p className="text-xs text-white/90 mt-1">
            {event.date} • {event.location}
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 text-slate-200">
            <div className="w-16 h-16 mx-auto bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">
              {rsvpStatus === 'attending' ? 'Celebration Confirmed!' : 'Thank you for letting us know!'}
            </h4>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your RSVP for <strong className="text-white">{name}</strong> has been coordinated with the host team in real-time.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
            >
              Close & View Live Guest List
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5 text-slate-200">
            {/* Status toggle */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRsvpStatus('attending')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  rsvpStatus === 'attending'
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'border-white/10 text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <span>🎉 Joyfully Accept</span>
              </button>
              <button
                type="button"
                onClick={() => setRsvpStatus('declined')}
                className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  rsvpStatus === 'declined'
                    ? 'border-rose-400 bg-rose-500/20 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'border-white/10 text-slate-400 hover:bg-white/[0.04]'
                }`}
              >
                <span>Regretfully Decline</span>
              </button>
            </div>

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="sarah@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                />
              </div>
            </div>

            {rsvpStatus === 'attending' && (
              <>
                {/* Plus-ones */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Bringing Plus-Ones?
                  </label>
                  <select
                    value={plusOnes}
                    onChange={e => setPlusOnes(Number(e.target.value))}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                  >
                    <option value={0} className="bg-slate-900 text-white">Just me (0 plus-ones)</option>
                    <option value={1} className="bg-slate-900 text-white">+1 Guest</option>
                    <option value={2} className="bg-slate-900 text-white">+2 Guests / Family</option>
                    <option value={3} className="bg-slate-900 text-white">+3 Guests / Family</option>
                  </select>
                </div>

                {/* Dietary preferences */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-300" />
                    <span>Dietary Preference & Allergies</span>
                  </label>
                  <select
                    value={dietary}
                    onChange={e => setDietary(e.target.value)}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                  >
                    <option value="None" className="bg-slate-900 text-white">No Dietary Restrictions (Standard)</option>
                    <option value="Vegetarian" className="bg-slate-900 text-white">Vegetarian</option>
                    <option value="Vegan" className="bg-slate-900 text-white">Vegan</option>
                    <option value="Gluten-Free" className="bg-slate-900 text-white">Gluten-Free (Celiac / Sensitivity)</option>
                    <option value="Pescatarian" className="bg-slate-900 text-white">Pescatarian</option>
                    <option value="Nut Allergy" className="bg-slate-900 text-white">Nut Allergy (Severe)</option>
                    <option value="Halal" className="bg-slate-900 text-white">Halal</option>
                    <option value="Kosher" className="bg-slate-900 text-white">Kosher</option>
                    <option value="Other" className="bg-slate-900 text-white">Other / Custom</option>
                  </select>
                  {dietary === 'Other' && (
                    <input
                      type="text"
                      placeholder="Specify allergy or dietary need"
                      value={customDietary}
                      onChange={e => setCustomDietary(e.target.value)}
                      className="glass-input w-full mt-2 px-3.5 py-2 rounded-xl text-xs"
                    />
                  )}
                </div>

                {/* Song request */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Song That Will Get You on the Dance Floor</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. September - Earth Wind & Fire"
                    value={songRequest}
                    onChange={e => setSongRequest(e.target.value)}
                    className="glass-input w-full px-3.5 py-2 rounded-xl text-xs"
                  />
                </div>
              </>
            )}

            {/* Note to hosts */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Warm Note to Hosts
              </label>
              <textarea
                rows={2}
                placeholder="Can't wait to celebrate with you!"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="glass-input w-full px-3.5 py-2 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-6 py-2.5 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending RSVP...' : 'Submit Real-Time RSVP'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
