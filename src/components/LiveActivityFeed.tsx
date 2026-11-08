import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, PlusCircle, CheckCircle, ArrowRight, Building, Radio } from 'lucide-react';
import { ActivityEvent } from '../types';
import { formatRelativeTime } from '../utils/formatters';

interface LiveActivityFeedProps {
  events: ActivityEvent[];
  onOpenAppeal?: (appealId: string) => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ events, onOpenAppeal }) => {
  const getEventBadge = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'new_appeal':
        return {
          icon: PlusCircle,
          color: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
          label: 'Yangi keldi',
        };
      case 'resolved':
        return {
          icon: CheckCircle,
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
          label: 'Hal etildi',
        };
      case 'assigned':
        return {
          icon: Building,
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
          label: 'Yo‘naltirildi',
        };
      default:
        return {
          icon: ArrowRight,
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
          label: 'Holat o‘zgardi',
        };
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-white tracking-tight">Jonli Harakatlar Oqimi</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE FEED
        </div>
      </div>

      {/* Stream list with AnimatePresence */}
      <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
        <AnimatePresence initial={false}>
          {events.map((evt) => {
            const badge = getEventBadge(evt.type);
            const Icon = badge.icon;

            return (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35 }}
                onClick={() => onOpenAppeal && evt.appealId && onOpenAppeal(evt.appealId)}
                className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 hover:bg-slate-800/70 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-xl border ${badge.color} mt-0.5 flex-shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 truncate">
                        <strong className="text-slate-200">{evt.region}</strong> • {evt.district}
                      </span>
                      <span className="text-[10px] text-slate-500 whitespace-nowrap font-mono">
                        {formatRelativeTime(evt.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {evt.title}
                    </p>

                    {evt.citizenName && (
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>Fuqaro: {evt.citizenName}</span>
                        <span className="font-mono text-blue-400/80">{evt.appealId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
