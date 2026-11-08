import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Video, Bell, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { Appeal } from '../types';

interface LiveNotificationToastProps {
  notification: Appeal | null;
  onDismiss: () => void;
  onOpen: (appeal: Appeal) => void;
}

export const LiveNotificationToast: React.FC<LiveNotificationToastProps> = ({
  notification,
  onDismiss,
  onOpen,
}) => {
  return (
    <div className="fixed top-24 right-4 sm:right-6 z-50 pointer-events-none max-w-md w-full">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.85, x: 80, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            className="pointer-events-auto bg-slate-950/95 border-2 border-emerald-500/80 shadow-[0_10px_40px_rgba(16,185,129,0.35)] rounded-2xl p-4 backdrop-blur-xl relative overflow-hidden"
          >
            {/* Animated radiant top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-emerald-400 animate-pulse" />

            {/* Glowing corner indicator */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative ${
                  notification.source === 'telegram'
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                    : 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                }`}>
                  <Video className="w-5 h-5 animate-bounce" />
                  <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full animate-ping ${
                    notification.source === 'telegram' ? 'bg-cyan-400' : 'bg-emerald-400'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                      notification.source === 'telegram'
                        ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
                        : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                    }`}>
                      <Sparkles className="w-3 h-3" />
                      {notification.source === 'telegram' ? 'TELEGRAM BOTDAN YANGI MUROJAAT' : 'YANGI VIDEO MUROJAAT'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {notification.id}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1 line-clamp-1">
                    {notification.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={onDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content snippet */}
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span>
                  <strong className="text-slate-200">{notification.regionName}</strong>, {notification.districtName}
                </span>
                <span className="text-[11px] font-medium text-blue-400">
                  {notification.videoDuration} davomiylik
                </span>
              </div>
              <p className="text-slate-300 text-xs line-clamp-2 italic">
                "{notification.description}"
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 mt-3 pt-2">
              <span className="text-[11px] text-slate-400">
                Fuqaro: <strong className="text-white">{notification.citizenName}</strong>
              </span>
              <button
                onClick={() => {
                  onOpen(notification);
                  onDismiss();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-700/40 transition-all cursor-pointer"
              >
                <span>Videoni ko‘rish</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
