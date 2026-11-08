import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, ArrowUpRight, Building2, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { AndijonDistrict } from '../data/andijanData';
import { formatNumber, formatPercent } from '../utils/formatters';

interface AndijanMapProps {
  districts: AndijonDistrict[];
  selectedDistrictId: string | null;
  onSelectDistrict: (districtId: string | null) => void;
  latestAppealDistrictId?: string | null;
  onFilterAppealsByDistrict?: (districtId: string) => void;
}

export const AndijanMap: React.FC<AndijanMapProps> = ({
  districts,
  selectedDistrictId,
  onSelectDistrict,
  latestAppealDistrictId,
  onFilterAppealsByDistrict,
}) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<AndijonDistrict | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeModalDistrict, setActiveModalDistrict] = useState<AndijonDistrict | null>(null);

  const maxAppeals = Math.max(...districts.map((d) => d.appealCount), 1);
  const totalAndijanAppeals = districts.reduce((acc, d) => acc + d.appealCount, 0);

  // Return heatmap color based on appeal volume
  const getDistrictFillColor = (count: number, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#3b82f6'; // Bright blue
    if (isHovered) return '#60a5fa'; // Light sky blue

    const ratio = count / maxAppeals;
    if (ratio > 0.7) return '#1e40af'; // Very high - deep indigo
    if (ratio > 0.45) return '#2563eb'; // High - medium blue
    if (ratio > 0.25) return '#3b82f6'; // Moderate - royal blue
    if (ratio > 0.12) return '#0284c7'; // Light moderate - cyan
    return '#0369a1'; // Base dark cyan
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleDistrictClick = (district: AndijonDistrict) => {
    onSelectDistrict(district.id === selectedDistrictId ? null : district.id);
    setActiveModalDistrict(district);
  };

  const selectedDistrict = districts.find((d) => d.id === selectedDistrictId);

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
              Andijon Viloyatining Tumanlar Kesimidagi Interaktiv Xaritasi
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Barcha 16 ta tuman va shahar bo‘yicha video murojaatlar zichligi (issiqlik xaritasi) va MFYlar tahlili
          </p>
        </div>

        {/* Map Live Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Hududlar:</span>
            <span className="font-semibold text-emerald-400">16/16 Faol</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700/60 text-xs">
            <span className="text-slate-400">Eng ko‘p:</span>
            <span className="font-semibold text-blue-400">Andijon sh. (940)</span>
          </div>
          {selectedDistrict && (
            <button
              onClick={() => onSelectDistrict(null)}
              className="flex items-center gap-1 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 hover:bg-slate-700 cursor-pointer"
            >
              <span>{selectedDistrict.name} filtrini tozalash</span>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative w-full aspect-[940/600] max-h-[520px] flex items-center justify-center select-none">
        <svg
          viewBox="0 0 940 600"
          className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredDistrict(null)}
        >
          <defs>
            <radialGradient id="andijanGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* District Geometries */}
          {districts.map((district) => {
            const isSelected = selectedDistrictId === district.id;
            const isHovered = hoveredDistrict?.id === district.id;
            const isLatest = latestAppealDistrictId === district.id;
            const fillColor = getDistrictFillColor(district.appealCount, isSelected, isHovered);

            return (
              <g key={district.id} className="cursor-pointer transition-all duration-200">
                <path
                  d={district.path}
                  fill={fillColor}
                  stroke={isSelected ? '#93c5fd' : isHovered ? '#60a5fa' : '#0f172a'}
                  strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.2}
                  className="transition-colors duration-200"
                  onMouseEnter={() => setHoveredDistrict(district)}
                  onClick={() => handleDistrictClick(district)}
                />

                {/* District Name Label */}
                <text
                  x={district.labelX}
                  y={district.labelY - 2}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize={district.id === 'ad-shahar' ? '11' : '10'}
                  fontWeight="700"
                  className="pointer-events-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] tracking-wide"
                >
                  {district.name}
                </text>

                {/* Appeal Count Pill */}
                <rect
                  x={district.labelX - 18}
                  y={district.labelY + 4}
                  width="36"
                  height="14"
                  rx="7"
                  fill="rgba(15, 23, 42, 0.88)"
                  stroke={isSelected ? '#60a5fa' : 'rgba(255,255,255,0.2)'}
                  strokeWidth="0.8"
                  className="pointer-events-none"
                />
                <text
                  x={district.labelX}
                  y={district.labelY + 14}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="9"
                  fontWeight="700"
                  className="pointer-events-none font-mono"
                >
                  {district.appealCount}
                </text>

                {/* Latest Incoming Appeal Radiant Ping */}
                {isLatest && (
                  <g className="pointer-events-none">
                    <circle
                      cx={district.labelX}
                      cy={district.labelY - 4}
                      r="18"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      className="animate-ping"
                    />
                    <circle
                      cx={district.labelX}
                      cy={district.labelY - 4}
                      r="5.5"
                      fill="#10b981"
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Floating Card */}
        {hoveredDistrict && (
          <div
            className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full -mt-3 bg-slate-950/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-3 shadow-2xl min-w-[210px]"
            style={{
              left: `${Math.min(Math.max(mousePos.x, 130), 810)}px`,
              top: `${Math.max(mousePos.y - 10, 80)}px`,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
              <span className="text-xs font-bold text-white truncate">{hoveredDistrict.name}</span>
              <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">
                {hoveredDistrict.type === 'shahar' ? 'Shahar' : 'Tuman'}
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Jami murojaatlar:</span>
                <span className="font-semibold text-white font-mono">{formatNumber(hoveredDistrict.appealCount)} ta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ko‘rib chiqilmoqda:</span>
                <span className="font-semibold text-amber-400 font-mono">{formatNumber(hoveredDistrict.inReviewCount)} ta</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hal etilgan:</span>
                <span className="font-semibold text-emerald-400 font-mono">{formatNumber(hoveredDistrict.resolvedCount)} ta</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Hal etish ko‘rsatkichi:</span>
                <span className="font-bold text-blue-400 font-mono">
                  {formatPercent((hoveredDistrict.resolvedCount / hoveredDistrict.appealCount) * 100)}
                </span>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-center text-blue-300/80 bg-blue-500/10 py-1 rounded">
              MFYlar va batafsil ma’lumot uchun bosing
            </div>
          </div>
        )}
      </div>

      {/* Heatmap Scale Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Murojaat zichligi:</span>
          <div className="flex items-center gap-1">
            <span className="w-3.5 h-3.5 rounded bg-[#0369a1]" title="< 200" />
            <span className="text-[11px]">Kam</span>
            <span className="w-3.5 h-3.5 rounded bg-[#0284c7]" title="200 - 300" />
            <span className="w-3.5 h-3.5 rounded bg-[#3b82f6]" title="300 - 450" />
            <span className="w-3.5 h-3.5 rounded bg-[#2563eb]" title="450 - 600" />
            <span className="w-3.5 h-3.5 rounded bg-[#1e40af]" title="> 600" />
            <span className="text-[11px]">Yuqori</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Yashil to‘lqin: So‘nggi kelgan video murojaat tumani
          </span>
        </div>
      </div>

      {/* District & Mahalla Detailed Modal / Drawer */}
      <AnimatePresence>
        {activeModalDistrict && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveModalDistrict(null)}
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
                onClick={() => setActiveModalDistrict(null)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start gap-4 mb-6 pb-4 border-b border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                      {activeModalDistrict.code}
                    </span>
                    <span className="text-xs text-slate-400">Markaz: {activeModalDistrict.center}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">{activeModalDistrict.name}</h3>
                  <p className="text-xs text-slate-400">Aholisi: {activeModalDistrict.population} nafar</p>
                </div>
              </div>

              {/* Statistics Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3">
                  <span className="text-xs text-slate-400">Jami murojaat</span>
                  <div className="text-lg font-bold text-white mt-0.5 font-mono">
                    {formatNumber(activeModalDistrict.appealCount)}
                  </div>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                  <span className="text-xs text-amber-400">Ko‘rib chiqilmoqda</span>
                  <div className="text-lg font-bold text-amber-400 mt-0.5 font-mono">
                    {formatNumber(activeModalDistrict.inReviewCount)}
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <span className="text-xs text-emerald-400">Hal etilgan</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5 font-mono">
                    {formatNumber(activeModalDistrict.resolvedCount)}
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                  <span className="text-xs text-blue-400">Samaradorlik</span>
                  <div className="text-lg font-bold text-blue-400 mt-0.5 font-mono">
                    {formatPercent((activeModalDistrict.resolvedCount / activeModalDistrict.appealCount) * 100)}
                  </div>
                </div>
              </div>

              {/* Mahalla Fuqarolar Yig'inlari (MFY) Breakdown */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
                  <span>Mahalla fuqarolar yig‘inlari (MFY) bo‘yicha taqsimot</span>
                  <span className="text-xs text-slate-400 font-normal">
                    {activeModalDistrict.mahallas.length} ta asosiy MFY
                  </span>
                </h4>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {activeModalDistrict.mahallas.map((m, idx) => {
                    const percent = Math.round((m.resolved / m.count) * 100);
                    return (
                      <div
                        key={idx}
                        className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-white">{m.name}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400 font-mono">{m.count} ta murojaat</span>
                            <span className="text-emerald-400 font-medium font-mono">({percent}% ijro)</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setActiveModalDistrict(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Yopish
                </button>
                {onFilterAppealsByDistrict && (
                  <button
                    onClick={() => {
                      onFilterAppealsByDistrict(activeModalDistrict.id);
                      setActiveModalDistrict(null);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    <span>Faqat {activeModalDistrict.name} murojaatlarini ko‘rish</span>
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
