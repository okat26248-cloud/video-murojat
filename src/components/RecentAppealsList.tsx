import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Video, Search, Filter, ShieldCheck, MapPin, Calendar, Clock, ChevronRight, Send } from 'lucide-react';
import { Appeal, AppealStatus } from '../types';
import { getStatusConfig, formatRelativeTime } from '../utils/formatters';

interface RecentAppealsListProps {
  appeals: Appeal[];
  onOpenAppeal: (appeal: Appeal) => void;
  selectedRegionId?: string | null;
  onClearRegionFilter?: () => void;
}

export const RecentAppealsList: React.FC<RecentAppealsListProps> = ({
  appeals,
  onOpenAppeal,
  selectedRegionId,
  onClearRegionFilter,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter appeals
  const filtered = appeals.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (selectedRegionId && a.regionId !== selectedRegionId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        a.title.toLowerCase().includes(q) ||
        a.citizenName.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.districtName.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Video className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">So‘nggi Video Murojaatlar</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fuqarolardan kelib tushgan video materiallar va tasdiqlangan hujjatlar oqimi
          </p>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search bar */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Qidirish (ism, tuman, ID)..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hammasi ({appeals.length})
            </button>
            <button
              onClick={() => setStatusFilter('yangi')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'yangi' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yangi
            </button>
            <button
              onClick={() => setStatusFilter('jarayonda')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'jarayonda' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Ko‘rib chiqilmoqda
            </button>
            <button
              onClick={() => setStatusFilter('hal_etilgan')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                statusFilter === 'hal_etilgan' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hal etilgan
            </button>
          </div>
        </div>
      </div>

      {/* Region active filter banner */}
      {selectedRegionId && (
        <div className="flex items-center justify-between p-2.5 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <span>Faqat tanlangan hudud bo‘yicha filtr faol ({filtered.length} ta murojaat)</span>
          </span>
          {onClearRegionFilter && (
            <button
              onClick={onClearRegionFilter}
              className="font-semibold underline hover:text-white"
            >
              Filtrni bekor qilish
            </button>
          )}
        </div>
      )}

      {/* Appeals Card Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
          <Video className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-400">Hech qanday video murojaat topilmadi</p>
          <p className="text-xs text-slate-500 mt-1">Qidiruv parametrlarini o‘zgartiring</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((appeal) => {
              const statusCfg = getStatusConfig(appeal.status);
              const isHighlight = appeal.isNewHighlight;

              return (
                <motion.div
                  key={appeal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => onOpenAppeal(appeal)}
                  className={`group relative rounded-2xl bg-slate-950/70 border overflow-hidden p-4 flex flex-col justify-between transition-all cursor-pointer ${
                    isHighlight
                      ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.35)] ring-1 ring-emerald-400 animate-pulse'
                      : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850/80'
                  }`}
                >
                  {/* Top Header: ID & Status Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {appeal.id}
                        </span>
                        {appeal.source === 'telegram' && (
                          <span className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Send className="w-2.5 h-2.5 text-cyan-400" />
                            <span>Telegram</span>
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${statusCfg.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Video Mock Player Preview */}
                    <div className="relative w-full aspect-video rounded-xl bg-slate-900 border border-slate-800 overflow-hidden mb-3 group-hover:border-slate-700 transition-colors flex items-center justify-center">
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />

                      {/* Video graphic background */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <div className="w-24 h-24 rounded-full border border-blue-500/40" />
                        <div className="w-12 h-12 rounded-full border border-blue-400/50 absolute" />
                      </div>

                      {/* Play Button Icon */}
                      <div className="relative z-10 w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-blue-500 transition-all">
                        <Play className="w-4 h-4 ml-0.5 fill-white" />
                      </div>

                      {/* Duration Tag */}
                      <span className="absolute bottom-2 right-2 z-10 text-[10px] font-mono bg-black/80 text-slate-200 px-1.5 py-0.5 rounded">
                        {appeal.videoDuration}
                      </span>

                      {/* Category tag */}
                      <span className="absolute top-2 left-2 z-10 text-[10px] font-medium bg-slate-900/80 text-blue-300 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-700/50 line-clamp-1 max-w-[80%]">
                        {appeal.category}
                      </span>
                    </div>

                    {/* Appeal Title */}
                    <h4 className="text-sm font-bold text-white line-clamp-2 group-hover:text-blue-300 transition-colors mb-2">
                      {appeal.title}
                    </h4>

                    {/* Citizen & Location metadata */}
                    <div className="space-y-1 text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300 font-medium truncate">{appeal.citizenName}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{appeal.regionName}, {appeal.districtName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer: Date and Action */}
                  <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {formatRelativeTime(appeal.createdAt)}
                    </span>
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-medium text-xs">
                      Ko‘rish <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
