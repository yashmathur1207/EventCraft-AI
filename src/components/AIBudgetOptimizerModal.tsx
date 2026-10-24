import React, { useState } from 'react';
import { Sparkles, DollarSign, ArrowRight, ShieldAlert, CheckCircle2, X, Loader2, Lightbulb, TrendingDown } from 'lucide-react';
import { PlannerEvent, BudgetCategory, BudgetItem } from '../types/event';
import { formatCurrency } from '../utils/formatters';

interface AIBudgetOptimizerModalProps {
  isOpen?: boolean;
  event: PlannerEvent;
  onClose: () => void;
  onApplyOptimizations?: (updatedCategories: BudgetCategory[], updatedItems: BudgetItem[]) => void;
}

interface BudgetOptimizationResult {
  summary: string;
  smartSwaps: Array<{
    traditional: string;
    aiAlternative: string;
    estimatedSavings: number;
    impactDescription: string;
  }>;
  safetyBuffer: number;
  recommendations: Array<{
    category: string;
    action: 'increase' | 'decrease' | 'reallocate' | 'keep';
    amount: number;
    recommendation: string;
    impact: 'High' | 'Medium' | 'Low';
  }>;
  negotiationTips: string[];
}

export const AIBudgetOptimizerModal: React.FC<AIBudgetOptimizerModalProps> = ({
  isOpen = true,
  event,
  onClose,
  onApplyOptimizations
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BudgetOptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isOpen === false) return null;

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gemini/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalBudget: event.totalBudget,
          targetGuestCount: event.targetGuestCount,
          currency: event.currency,
          categories: event.budgetCategories,
          items: event.budgetItems,
          eventType: event.type
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      if (!res.ok || !data.success || !data.analysis) {
        throw new Error(data.error || 'Failed to analyze budget');
      }
      setAnalysis(data.analysis);
    } catch (err: unknown) {
      const e = err as Error;
      const displayMsg = !e?.message || e.message.includes('Load failed') || e.message.includes('Failed to fetch')
        ? 'Unable to connect to AI Budget service. Please check connection and try again.'
        : e.message;
      setError(displayMsg);
    } finally {
      setLoading(false);
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
              <h3 className="text-xl font-extrabold text-white">AI Budget Optimizer & Value Architect</h3>
              <p className="text-xs text-white/90">
                Analyzes spend ratio, recommends cost swaps, and stress-tests your safety reserve
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
          {!analysis && !loading && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl border border-white/15 flex items-center justify-center text-cyan-300">
                <DollarSign className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-lg font-bold text-white">
                  Ready to audit ${event.totalBudget.toLocaleString()} across {event.budgetCategories.length} categories
                </h4>
                <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                  Gemini will review your {event.budgetItems.length} expenses, guest count ({event.targetGuestCount} guests), and priority trade-offs to find savings and ensure peace of mind.
                </p>
              </div>
              <button
                onClick={runAnalysis}
                className="px-6 py-3 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-sm font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Run AI Financial Audit</span>
              </button>
            </div>
          )}

          {loading && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
              <p className="text-sm font-bold text-white">Gemini is evaluating your event line items...</p>
              <p className="text-xs text-slate-400">Comparing industry vendor rates and calculating smart swaps</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200 text-sm">
              {error}
            </div>
          )}

          {analysis && (
            <div className="space-y-6">
              {/* Executive Summary & Safety Buffer */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 bg-white/[0.04] rounded-2xl border border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    AI Executive Diagnosis
                  </span>
                  <p className="text-sm text-white leading-relaxed font-medium">
                    {analysis.summary}
                  </p>
                </div>
                <div className="p-4 bg-emerald-500/15 rounded-2xl border border-emerald-400/30 flex flex-col justify-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-1">
                    Safety Reserve Buffer
                  </span>
                  <div className="text-2xl font-bold text-emerald-300">
                    {formatCurrency(analysis.safetyBuffer || event.totalBudget * 0.08, event.currency)}
                  </div>
                  <span className="text-[11px] text-emerald-400 mt-0.5">
                    Recommended 8-10% contingency
                  </span>
                </div>
              </div>

              {/* Smart Swaps */}
              {analysis.smartSwaps && analysis.smartSwaps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-amber-300" />
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                      Smart High-Impact Swaps (Keep the Vibe, Save Money)
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {analysis.smartSwaps.map((swap, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs text-slate-400 line-through">
                            <span>{swap.traditional}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-white">
                            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{swap.aiAlternative}</span>
                          </div>
                        </div>
                        <div className="shrink-0 bg-white/10 px-3 py-1.5 rounded-xl border border-amber-300/40 text-xs font-bold text-amber-300 self-start sm:self-auto">
                          Save ~{formatCurrency(swap.estimatedSavings, event.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations list */}
              {analysis.recommendations && analysis.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                    Tactical Category Actions
                  </h4>
                  <div className="space-y-2.5">
                    {analysis.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.07] shadow-xs flex items-start gap-3"
                      >
                        <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-200">
                              {rec.category}
                            </span>
                            <span className={`text-[11px] font-bold uppercase ${
                              rec.impact === 'High' ? 'text-amber-300' : 'text-slate-400'
                            }`}>
                              {rec.impact} Impact
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1">{rec.recommendation}</p>
                        </div>
                        {rec.amount > 0 && (
                          <div className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
                            ±{formatCurrency(rec.amount, event.currency)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vendor Negotiation Tips */}
              {analysis.negotiationTips && analysis.negotiationTips.length > 0 && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-white">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block mb-2">
                    🎯 Pro Vendor Negotiation Strategies
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {analysis.negotiationTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex justify-between items-center border-t border-white/10">
                <button
                  onClick={runAnalysis}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Re-run Audit
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rainbow-bar-bg hover:brightness-110 active:scale-95 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Apply & Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
