import React, { useState } from 'react';
import { Mail, Sparkles, Copy, Check, X, Loader2, AlertTriangle, HelpCircle } from 'lucide-react';
import { PlannerEvent, Vendor } from '../types/event';

interface AIVendorRFPModalProps {
  isOpen?: boolean;
  event: PlannerEvent;
  vendor?: Vendor;
  onClose: () => void;
  onSaveToVendor?: (draft: string) => void;
}

interface RFPResult {
  subjectLine: string;
  emailBody: string;
  essentialQuestionsToAsk: string[];
  redFlagsToWatchOutFor: string[];
}

export const AIVendorRFPModal: React.FC<AIVendorRFPModalProps> = ({
  isOpen = true,
  event,
  vendor,
  onClose,
  onSaveToVendor
}) => {
  const [selectedVendor] = useState<Vendor | undefined>(vendor);
  const [vendorCategory, setVendorCategory] = useState(vendor?.category || 'Catering & Bar Service');
  const [estimatedBudget, setEstimatedBudget] = useState(vendor?.quotedPrice || 4500);
  const [customRequests, setCustomRequests] = useState('');
  const [loading, setLoading] = useState(false);
  const [rfp, setRfp] = useState<RFPResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (isOpen === false) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/generate-rfp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          eventTitle: event.title,
          eventDate: event.date,
          eventLocation: event.location,
          guestCount: event.targetGuestCount,
          vendorCategory,
          vendorName: selectedVendor?.name || undefined,
          estimatedBudget: Number(estimatedBudget),
          currency: event.currency,
          customRequests
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      if (!res.ok || !data.success || !data.rfp) {
        throw new Error(data.error || 'Failed to generate vendor RFP');
      }
      setRfp(data.rfp);
    } catch (err: unknown) {
      const e = err as Error;
      const displayMsg = !e?.message || e.message.includes('Load failed') || e.message.includes('Failed to fetch')
        ? 'Unable to connect to AI Vendor RFP service. Please try again.'
        : e.message;
      setError(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!rfp) return;
    const textToCopy = `Subject: ${rfp.subjectLine}\n\n${rfp.emailBody}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              <Mail className="w-6 h-6 text-cyan-200" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">AI Vendor RFP & Inquiry Drafter</h3>
              <p className="text-xs text-white/90">
                Generate high-converting, professional vendor outreach emails with key contract guardrails
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

          {!rfp ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Vendor Service Category
                  </label>
                  <select
                    value={vendorCategory}
                    onChange={e => setVendorCategory(e.target.value)}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  >
                    <option value="Catering & Bar Service" className="bg-slate-900 text-white">Catering & Bar Service</option>
                    <option value="Photography & Cinematography" className="bg-slate-900 text-white">Photography & Cinematography</option>
                    <option value="Floral Design & Decor" className="bg-slate-900 text-white">Floral Design & Decor</option>
                    <option value="DJ & Live Music Entertainment" className="bg-slate-900 text-white">DJ & Live Music Entertainment</option>
                    <option value="Venue & Event Space" className="bg-slate-900 text-white">Venue & Event Space</option>
                    <option value="Lighting & Sound Rigging" className="bg-slate-900 text-white">Lighting & Sound Rigging</option>
                    <option value="Bakery & Custom Cake" className="bg-slate-900 text-white">Bakery & Custom Cake</option>
                    <option value="Rentals & Furniture" className="bg-slate-900 text-white">Rentals & Furniture</option>
                    <option value="Stationery & Calligraphy" className="bg-slate-900 text-white">Stationery & Calligraphy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Target Budget Allocation ($)
                  </label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={estimatedBudget}
                    onChange={e => setEstimatedBudget(Number(e.target.value))}
                    className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Specific Requests, Must-Haves, or Dietary Constraints
                </label>
                <textarea
                  rows={3}
                  value={customRequests}
                  onChange={e => setCustomRequests(e.target.value)}
                  placeholder="e.g. Need vegan & gluten free options for 15 guests, prefer farm-to-table seasonal dishes, require 2 wireless microphones for toasts"
                  className="glass-input w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
                />
              </div>

              <div className="p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 text-xs text-slate-300 flex items-center justify-between">
                <span>Event: <strong className="text-white">{event.title}</strong> on <strong className="text-white">{event.date}</strong> ({event.targetGuestCount} guests)</span>
                <span className="text-cyan-300 font-semibold">{event.location}</span>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
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
                      <span>Drafting Custom RFP...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate RFP with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Subject Line */}
              <div className="p-3.5 bg-white/[0.04] rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Recommended Subject Line
                  </span>
                  <p className="text-sm font-bold text-white mt-0.5">{rfp.subjectLine}</p>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Email Body */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Complete RFP Inquiry Body
                </span>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 whitespace-pre-line font-mono leading-relaxed max-h-64 overflow-y-auto">
                  {rfp.emailBody}
                </div>
              </div>

              {/* Essential Questions & Red Flags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4 text-cyan-400" />
                    <span>Essential Questions to Ask</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {rfp.essentialQuestionsToAsk?.map((q, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Contract Red Flags</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {rfp.redFlagsToWatchOutFor?.map((flag, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-white/10">
                <button
                  onClick={() => setRfp(null)}
                  className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer"
                >
                  Generate Another
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied Full Email' : 'Copy Full Email'}</span>
                  </button>
                  {selectedVendor && onSaveToVendor && (
                    <button
                      onClick={() => {
                        onSaveToVendor(`${rfp.subjectLine}\n\n${rfp.emailBody}`);
                        onClose();
                      }}
                      className="px-5 py-2 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Attach to {selectedVendor.name}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
