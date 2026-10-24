import React, { useState } from 'react';
import { Sparkles, Palette, GlassWater, Mail, MessageSquare, Gift, Copy, Check, Loader2, Plus } from 'lucide-react';
import { PlannerEvent, CreativePlan } from '../types/event';

interface CreativeSectionProps {
  event: PlannerEvent;
  onUpdateEvent: (updated: PlannerEvent) => void;
}

export const CreativeSection: React.FC<CreativeSectionProps> = React.memo(({ event, onUpdateEvent }) => {
  const [activeTab, setActiveTab] = useState<'palette' | 'cocktails' | 'speeches' | 'invitations' | 'favors'>('palette');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [targetType, setTargetType] = useState<string>('signature_cocktails');
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);

  const creative = event.creative || {
    themeTitle: event.theme,
    vibeDescription: '',
    palette: [],
    decorConcepts: [],
    signatureItems: [],
    invitations: [],
    speeches: [],
    favorsOrActivities: []
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateMore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/gemini/creative-ideate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: event.type,
          theme: event.theme,
          guestCount: event.targetGuestCount,
          vibe: creative.vibeDescription || event.theme,
          target: targetType,
          details: customPrompt
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      if (!res.ok || !data.success || !data.creative) {
        throw new Error(data.error || 'Failed to generate creative concepts');
      }

      const generated = data.creative;

      const updatedCreative: CreativePlan = {
        ...creative,
        themeTitle: generated.themeTitle || creative.themeTitle,
        palette: generated.palette && generated.palette.length > 0 ? generated.palette : creative.palette,
        decorConcepts: generated.decorConcepts && generated.decorConcepts.length > 0
          ? [...creative.decorConcepts, ...generated.decorConcepts]
          : creative.decorConcepts,
        signatureItems: generated.signatureItems && generated.signatureItems.length > 0
          ? [...creative.signatureItems, ...generated.signatureItems]
          : creative.signatureItems,
        invitations: generated.invitations && generated.invitations.length > 0
          ? [...creative.invitations, ...generated.invitations]
          : creative.invitations,
        speeches: generated.speeches && generated.speeches.length > 0
          ? [...creative.speeches, ...generated.speeches]
          : creative.speeches,
        favorsOrActivities: generated.favorsOrActivities && generated.favorsOrActivities.length > 0
          ? [...creative.favorsOrActivities, ...generated.favorsOrActivities]
          : creative.favorsOrActivities
      };

      onUpdateEvent({
        ...event,
        creative: updatedCreative,
        activityFeed: [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            author: 'EventCraft AI',
            role: 'AI Assistant',
            action: `Generated new personalized creative concepts for ${targetType.replace('_', ' ')}.`,
            type: 'creative'
          },
          ...event.activityFeed
        ]
      });

      setCustomPrompt('');
    } catch (err: unknown) {
      const e = err as Error;
      const displayMsg = !e?.message || e.message.includes('Load failed') || e.message.includes('Failed to fetch')
        ? 'Unable to connect to creative ideas service. Please try again.'
        : e.message;
      setError(displayMsg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-rose-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Experiential Artistry</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              AI Creative Studio & Persona Lab
            </h2>
            <p className="text-pink-100/80 text-sm">
              Infuse your event with unforgettable sensory touches: bespoke signature cocktails, emotional toast drafts, palette swatches, and artisanal favors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md text-pink-200 border border-white/10">
              Theme: <strong>{creative.themeTitle || event.theme}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* AI Inspiration Generator Input Bar */}
      <form
        onSubmit={handleGenerateMore}
        className="p-5 bg-white rounded-3xl border border-pink-100 shadow-xs space-y-3"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="w-4 h-4 text-pink-600" />
          <span>Ask Gemini for Custom Creative Touches</span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={targetType}
            onChange={e => setTargetType(e.target.value)}
            className="w-full sm:w-56 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-pink-500"
          >
            <option value="signature_cocktails">Signature Drinks & Bites</option>
            <option value="speeches">Heartfelt Toast / Speech Draft</option>
            <option value="invitations">Invitation Wording & Copy</option>
            <option value="favors_decor">Decor & Favors Concept</option>
            <option value="all">Complete Creative Refresh</option>
          </select>

          <input
            type="text"
            placeholder="e.g. Include rosemary & smokey mezcal, or make speech nostalgic about college trip..."
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="w-full flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-pink-500"
          />

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Dreaming...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-pink-200" />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
      </form>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('palette')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'palette'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Palette className="w-3.5 h-3.5 text-pink-500" />
          <span>Palette & Decor</span>
        </button>

        <button
          onClick={() => setActiveTab('cocktails')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cocktails'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <GlassWater className="w-3.5 h-3.5 text-amber-500" />
          <span>Signature Bar & Bites ({creative.signatureItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('speeches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'speeches'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
          <span>Speeches & Toasts ({creative.speeches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'invitations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Mail className="w-3.5 h-3.5 text-teal-500" />
          <span>Invitation Copy ({creative.invitations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'favors'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Gift className="w-3.5 h-3.5 text-purple-500" />
          <span>Favors & Experiences</span>
        </button>
      </div>

      {/* Tab 1: Palette & Decor Concepts */}
      {activeTab === 'palette' && (
        <div className="space-y-6">
          {/* Palette Swatches */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Color Harmony & Visual Atmosphere
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-2xl">
              {creative.vibeDescription || event.theme}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              {creative.palette.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => copyText(`hex-${idx}`, color.hex)}
                  className="p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group text-center space-y-2"
                >
                  <div
                    className="w-full h-16 rounded-xl shadow-xs group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block truncate">{color.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-pink-600">
                      {copiedId === `hex-${idx}` ? 'Copied!' : color.hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decor Concepts */}
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Atmospheric & Spatial Decor Concepts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {creative.decorConcepts.map((concept, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {concept}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Signature Cocktails & Bites */}
      {activeTab === 'cocktails' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creative.signatureItems.map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs hover:border-amber-200 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider">
                  {item.type}
                </span>
                <span className="text-xs text-slate-400">Custom Crafted</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700">
                <strong>Key Ingredients:</strong> {item.ingredientsOrHighlights}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Speeches & Toasts */}
      {activeTab === 'speeches' && (
        <div className="space-y-6">
          {creative.speeches.map((sp, idx) => (
            <div
              key={sp.id || idx}
              className="p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                    {sp.speakerRole}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{sp.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">
                    ⏱️ ~{sp.estimatedDuration}
                  </span>
                  <button
                    onClick={() => copyText(`speech-${idx}`, sp.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                  >
                    {copiedId === `speech-${idx}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied Draft!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Speech</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-serif-luxury whitespace-pre-line">
                {sp.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Invitations */}
      {activeTab === 'invitations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {creative.invitations.map((inv, idx) => (
            <div
              key={inv.id || idx}
              className="p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                    {inv.style}
                  </span>
                  <button
                    onClick={() => copyText(`inv-${idx}`, `${inv.headline}\n\n${inv.body}\n\n${inv.rsvpCallout}`)}
                    className="p-2 text-slate-400 hover:text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
                    title="Copy full invitation"
                  >
                    {copiedId === `inv-${idx}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 border border-slate-200 text-center space-y-3 font-serif-luxury">
                  <h4 className="text-base font-bold text-slate-900 leading-snug">{inv.headline}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{inv.body}</p>
                  <div className="pt-3 border-t border-slate-200/60 text-[11px] font-sans font-semibold text-teal-800">
                    {inv.rsvpCallout}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Favors & Experiences */}
      {activeTab === 'favors' && (
        <div className="p-6 md:p-8 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Interactive Guest Keepsakes & Memorable Moments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {creative.favorsOrActivities.map((favor, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-2"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-xs">
                  <Gift className="w-4 h-4" />
                </div>
                <p className="text-xs text-purple-950 font-medium leading-relaxed">
                  {favor}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

CreativeSection.displayName = 'CreativeSection';
