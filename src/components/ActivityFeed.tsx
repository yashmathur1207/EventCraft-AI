import React from 'react';
import { Activity, Clock, CheckCircle2, User, Radio, Sparkles, DollarSign, Calendar } from 'lucide-react';
import { ActivityLog } from '../types/event';

interface ActivityFeedProps {
  activities: ActivityLog[];
}

const TYPE_CONFIG = {
  guest: { icon: User, color: 'text-rose-600', bg: 'bg-rose-100' },
  vendor: { icon: Radio, color: 'text-blue-600', bg: 'bg-blue-100' },
  budget: { icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  timeline: { icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  creative: { icon: Sparkles, color: 'text-pink-600', bg: 'bg-pink-100' },
  ai: { icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-100' }
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  return (
    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Live Collaborative Feed
          </h3>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-Time Sync Active</span>
        </span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {activities.map(act => {
          const conf = TYPE_CONFIG[act.type] || TYPE_CONFIG.ai;
          const Icon = conf.icon;
          return (
            <div
              key={act.id}
              className="flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              <div className={`p-2 rounded-xl shrink-0 ${conf.bg} ${conf.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    {act.author}{' '}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({act.role})
                    </span>
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{act.timestamp}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{act.action}</p>
              </div>
            </div>
          );
        })}

        {activities.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-400">
            No recent activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
};
