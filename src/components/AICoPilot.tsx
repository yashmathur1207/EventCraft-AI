import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageCircle, X, Send, Bot, User, Loader2, Minus, Maximize2, Lightbulb, Zap, HelpCircle } from 'lucide-react';
import { PlannerEvent } from '../types/event';

interface AICoPilotProps {
  event: PlannerEvent;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_CHIPS = [
  { label: 'Highlight Savings', query: 'What are the top 3 budget savings or risk areas in this event?', color: 'from-[#FF007A] to-[#FF5E3A]' },
  { label: 'Day-Of Timeline', query: 'Help me review the day-of timeline flow for bottlenecks.', color: 'from-[#7B2CBF] to-[#00B8FF]' },
  { label: 'Dietary Matrix', query: 'What catering accommodations should I double-check for my guests?', color: 'from-[#FFD200] to-[#FF5E3A]' },
  { label: 'Vendor Follow-Up', query: 'Draft a polite follow-up for pending vendor inquiries.', color: 'from-[#00F5D4] to-[#00B8FF]' },
];

export const AICoPilot: React.FC<AICoPilotProps> = ({ event }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Hello! I'm Crafty, your AI Master Event Producer. I have your blueprint for "${event.title}" loaded ($${event.totalBudget.toLocaleString()} budget, ${event.targetGuestCount} guests).\n\nHow can I help elevate your event today? You can ask about timeline adjustments, vendor negotiations, budget allocation, or guest hospitality.`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          eventContext: event,
          history: historyPayload
        })
      });

      let data: any;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(`Server returned unexpected format (${res.status}).`);
      }

      if (!res.ok || !data.success || !data.reply) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: unknown) {
      const e = err as Error;
      const cleanMsg = !e?.message || e.message.includes('Load failed') || e.message.includes('Failed to fetch')
        ? 'Network connection temporarily unavailable. Please try again!'
        : e.message;
      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: `Apologies, I encountered an issue: ${cleanMsg}`,
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3 rounded-full text-white cursor-pointer group shadow-2xl transition-all transform hover:scale-105 active:scale-95"
          style={{
            background: 'rgba(18, 14, 34, 0.85)',
            backdropFilter: 'blur(20px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 12px 40px 0 rgba(167, 139, 250, 0.35), 0 0 20px 0 rgba(255, 0, 122, 0.2)'
          }}
          aria-label="Open Crafty AI Co-Pilot assistant"
        >
          {/* Animated gradient ring aura */}
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full rainbow-bar-bg p-[1.5px]">
            <div className="w-full h-full bg-[#0b0914] rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
          </div>
          <div className="text-left pr-1">
            <div className="text-xs font-bold leading-none rainbow-text">Crafty AI Co-Pilot</div>
            <div className="text-[10px] text-slate-300 leading-none mt-1">Ask questions or request ideas</div>
          </div>
        </button>
      )}

      {/* Floating Glass Chat Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-full sm:w-[420px] max-w-[calc(100vw-1.5rem)] rounded-3xl overflow-hidden flex flex-col shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-6`}
          style={{
            background: 'rgba(15, 12, 28, 0.88)',
            backdropFilter: 'blur(24px) saturate(170%)',
            WebkitBackdropFilter: 'blur(24px) saturate(170%)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderTop: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 20px 60px 0 rgba(0, 0, 0, 0.6), 0 0 30px 0 rgba(167, 139, 250, 0.25)',
            height: isMinimized ? 'auto' : '620px',
            maxHeight: '86vh'
          }}
        >
          {/* Top Bar Header */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-xl rainbow-bar-bg p-[1.5px] flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#120e22] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="rainbow-text">Crafty AI Co-Pilot</span>
                  <span className="rainbow-live-badge text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-white">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-300 truncate max-w-[200px]">
                  {event.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
                aria-label={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close"
                aria-label="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-slate-200">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl rainbow-bar-bg p-[1px] shrink-0 mt-0.5 shadow-sm">
                        <div className="w-full h-full bg-[#120e22] rounded-[10px] flex items-center justify-center">
                          <Bot className="w-3.5 h-3.5 text-cyan-300" />
                        </div>
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600/90 to-indigo-600/90 text-white rounded-br-xs border border-white/20 shadow-lg'
                          : 'bg-white/[0.07] text-white border border-white/15 rounded-bl-xs shadow-md backdrop-blur-md'
                      }`}
                    >
                      {msg.content}
                      <span
                        className={`block text-[9px] mt-1.5 font-medium ${
                          msg.role === 'user' ? 'text-violet-200 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-xs text-slate-300 max-w-[80%]">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Crafty is composing personalized ideas...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Floating User-Response Chips */}
              <div className="px-3 py-2 border-t border-white/10 bg-white/[0.02] flex items-center gap-2 overflow-x-auto scrollbar-none">
                {QUICK_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(chip.query)}
                    disabled={loading}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white bg-gradient-to-r ${chip.color} hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50`}
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Glass Input Form */}
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 border-t border-white/10 bg-black/20 flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ask Crafty about budget, guests, timeline..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading}
                    className="w-full pl-4 pr-3 py-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.12] focus:bg-white/[0.15] border border-white/15 focus:border-violet-400 text-white placeholder-slate-400 text-xs focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-2xl text-white rainbow-bar-bg hover:brightness-110 active:scale-95 disabled:opacity-40 transition-all cursor-pointer shadow-lg flex items-center justify-center shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
