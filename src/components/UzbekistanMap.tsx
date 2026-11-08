import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, ChevronRight, BarChart3, Users, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { RegionData } from '../types';
import { formatNumber, formatPercent } from '../utils/formatters';

interface UzbekistanMapProps {
  regions: RegionData[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  latestAppealRegionId?: string | null;
  onFilterAppealsByRegion?: (regionId: string) => void;
}

export const UzbekistanMap: React.FC<UzbekistanMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  latestAppealRegionId,
  onFilterAppealsByRegion,
}) => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeModalRegion, setActiveModalRegion] = useState<RegionData | null>(null);

  // Compute maximum appeals for color intensity scaling
  const maxAppeals = Math.max(...regions.map((r) => r.appealCount), 1);

  // Return heatmap color based on appeal volume
  const getRegionFillColor = (count: number, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#3b82f6'; // Bright royal blue
    if (isHovered) return '#60a5fa'; // Light sky blue

    const ratio = count / maxAppeals;
    if (ratio > 0.75) return '#1e40af'; // Very high - deep indigo
    if (ratio > 0.5) return '#2563eb'; // High - medium blue
    if (ratio > 0.3) return '#3b82f6'; // Moderate - blue
    if (ratio > 0.15) return '#0284c7'; // Light moderate - cyan
    return '#0369a1'; // Base dark cyan
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleRegionClick = (region: RegionData) => {
    onSelectRegion(region.id === selectedRegionId ? null : region.id);
    setActiveModalRegion(region);
  };

  const selectedRegion = regions.find((r) => r.id === selectedRegionId);

  return (
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl overflow-hidden">
      {/* Header with live statistics overlay */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <MapPin className="w-4 h-4" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              O‘zbekiston Respublikasi Interaktiv Xaritasi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Hududlar kesimida video murojaatlar zichligi (issiqlik xaritasi) va tumanlar tahlili
          </p>
        </div>

        {/* Map Live Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Hududlar:</span>
            <span className="font-semibold text-emerald-400">14/14 Faol</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Eng ko‘p:</span>
            <span className="font-semibold text-blue-400">Toshkent sh.</span>
          </div>
          {selectedRegion && (
            <button
              onClick={() => onSelectRegion(null)}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700"
            >
              <span>Filtrni tozalash</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[1000/560] max-h-[500px] flex items-center justify-center select-none">
        <svg
          viewBox="0 0 1000 580"
          className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredRegion(null)}
        >
          <defs>
            <radialGradient id="regionGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
            <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Region Paths */}
          {regions.map((region) => {
            const isSelected = selectedRegionId === region.id;
            const isHovered = hoveredRegion?.id === region.id;
            const isLatest = latestAppealRegionId === region.id;
            const fillColor = getRegionFillColor(region.appealCount, isSelected, isHovered);

            return (
              <g key={region.id} className="cursor-pointer transition-all duration-200">
                <path
                  d={region.path}
                  fill={fillColor}
                  stroke={isSelected ? '#60a5fa' : isHovered ? '#93c5fd' : '#1e293b'}
                  strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.2}
                  className="transition-colors duration-200"
                  onMouseEnter={() => setHoveredRegion(region)}
                  onClick={() => handleRegionClick(region)}
                />

                {/* Region Label Text */}
                <text
                  x={region.labelX}
                  y={region.labelY}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize={region.id === 'UZ-TK' ? '10' : '11'}
                  fontWeight="600"
                  className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-wider"
                >
                  {region.code}
                </text>

                {/* Region Appeal Count pill badge */}
                <rect
                  x={region.labelX - 18}
                  y={region.labelY + 4}
                  width="36"
                  height="14"
                  rx="7"
                  fill="rgba(15, 23, 42, 0.85)"
                  stroke={isSelected ? '#60a5fa' : 'rgba(255,255,255,0.15)'}
                  strokeWidth="0.8"
                  className="pointer-events-none"
                />
                <text
                  x={region.labelX}
                  y={region.labelY + 14}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9"
                  fontWeight="700"
                  className="pointer-events-none font-mono"
                >
                  {region.appealCount > 999 ? `${(region.appealCount / 1000).toFixed(1)}k` : region.appealCount}
                </text>

                {/* Latest Incoming Appeal Radiant Ping */}
                {isLatest && (
                  <g className="pointer-events-none">
                    <circle
                      cx={region.labelX}
                      cy={region.labelY - 5}
                      r="16"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      className="animate-ping"
                    />
                    <circle
                      cx={region.labelX}
                      cy={region.labelY - 5}
                      r="5"
                      fill="#10b981"
                      className="shadow-lg"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Floating Card */}
        {hoveredRegion && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 bg-slate-950/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-3 shadow-2xl min-w-[200px]"
            style={{
              left: `${Math.min(Math.max(mousePos.x, 120), 880)}px`,
              top: `${Math.max(mousePos.y - 10, 80)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-xs font-bold text-white truncate">{hoveredRegion.name}</span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                {hoveredRegion.code}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Jami murojaatlar:</span>
                <span className="font-semibold text-white font-mono">{formatNumber(hoveredRegion.appealCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ko‘rib chiqilmoqda:</span>
                <span className="font-semibold text-amber-400 font-mono">{formatNumber(hoveredRegion.inReviewCount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hal etilgan:</span>
                <span className="font-semibold text-emerald-400 font-mono">{formatNumber(hoveredRegion.resolvedCount)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Samaradorlik:</span>
                <span className="font-bold text-blue-400 font-mono">
                  {formatPercent((hoveredRegion.resolvedCount / hoveredRegion.appealCount) * 100)}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-center text-blue-300/80 bg-blue-500/10 py-1 rounded">
              Batafsil tumanlar tahlili uchun bosing
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Murojaat zichligi:</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-[#0369a1]" title="< 1 000" />
            <span className="text-[11px]">Kam</span>
            <span className="w-3.5 h-3.5 rounded bg-[#0284c7]" title="1 000 - 2 000" />
            <span className="w-3.5 h-3.5 rounded bg-[#3b82f6]" title="2 000 - 3 500" />
            <span className="w-3.5 h-3.5 rounded bg-[#2563eb]" title="3 500 - 5 000" />
            <span className="w-3.5 h-3.5 rounded bg-[#1e40af]" title="> 5 000" />
            <span className="text-[11px]">Yuqori</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Yashil to‘lqin: So‘nggi yangi murojaat hududi
          </span>
        </div>
      </div>

      {/* District & Mahalla Detailed Modal / Drawer */}
      <AnimatePresence>
        {activeModalRegion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModalRegion(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-7 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Close Button */}
              <button
                onClick={() => setActiveModalRegion(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      {activeModalRegion.code}
                    </span>
                    <span className="text-xs text-slate-400">Markaz: {activeModalRegion.center}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{activeModalRegion.name}</h3>
                  <p className="text-xs text-slate-400">Aholisi: {activeModalRegion.population} nafar</p>
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <span className="text-xs text-slate-400">Jami murojaat</span>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono">
                    {formatNumber(activeModalRegion.appealCount)}
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <span className="text-xs text-amber-400">Ko‘rib chiqilmoqda</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono">
                    {formatNumber(activeModalRegion.inReviewCount)}
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <span className="text-xs text-emerald-400">Hal etilgan</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                    {formatNumber(activeModalRegion.resolvedCount)}
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <span className="text-xs text-blue-400">Samaradorlik</span>
                  <div className="text-lg font-bold text-blue-400 mt-0.5 font-mono">
                    {formatPercent((activeModalRegion.resolvedCount / activeModalRegion.appealCount) * 100)}
                  </div>
                </div>
              </div>

              {/* District (Tuman) and MFY Breakdown Table */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                  <span>Tumanlar va shaharlar kesimida murojaatlar</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {activeModalRegion.districts.length} ta hududiy birlik
                  </span>
                </h4>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activeModalRegion.districts.map((d) => {
                    const percent = Math.round((d.resolvedCount / d.appealCount) * 100);
                    return (
                      <div
                        key={d.id}
                        className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-white">{d.name}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-mono">{d.appealCount} ta</span>
                            <span className="text-emerald-400 font-medium font-mono">({percent}%)</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {/* Top Mahallas */}
                        {d.mahallas && d.mahallas.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            <span className="text-[10px] text-slate-400">Faol MFY:</span>
                            {d.mahallas.map((m, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-slate-700/50 text-slate-300 px-1.5 py-0.5 rounded"
                              >
                                {m.name} ({m.count})
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setActiveModalRegion(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Yopish
                </button>
                {onFilterAppealsByRegion && (
                  <button
                    onClick={() => {
                      onFilterAppealsByRegion(activeModalRegion.id);
                      setActiveModalRegion(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30"
                  >
                    <span>Ushbu viloyat murojaatlarini ko‘rish</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
