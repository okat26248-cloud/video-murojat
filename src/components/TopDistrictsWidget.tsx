import React from 'react';
import { Trophy } from 'lucide-react';
import { AndijonDistrict } from '../data/andijanData';
import { formatNumber, formatPercent } from '../utils/formatters';

interface TopDistrictsWidgetProps {
  districts: AndijonDistrict[];
  onSelectDistrict?: (districtId: string) => void;
}

export const TopDistrictsWidget: React.FC<TopDistrictsWidgetProps> = ({ districts, onSelectDistrict }) => {
  const top5 = [...districts].sort((a, b) => b.appealCount - a.appealCount).slice(0, 5);
  const maxCount = top5[0]?.appealCount || 1;
  const totalAndijan = districts.reduce((acc, d) => acc + d.appealCount, 0);
  const top5Total = top5.reduce((acc, d) => acc + d.appealCount, 0);

  const rankColors = [
    'from-amber-500 to-amber-600 text-amber-950 font-black',
    'from-slate-300 to-slate-400 text-slate-950 font-black',
    'from-amber-700 to-amber-800 text-amber-100 font-bold',
    'from-blue-600 to-blue-700 text-white font-bold',
    'from-indigo-600 to-indigo-700 text-white font-bold',
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-tight">TOP 5 Yetakchi Tumanlar</h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Andijon viloyati</span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {top5.map((dist, idx) => {
            const widthPct = Math.round((dist.appealCount / maxCount) * 100);
            const resRate = (dist.resolvedCount / dist.appealCount) * 100;

            return (
              <div
                key={dist.id}
                onClick={() => onSelectDistrict && onSelectDistrict(dist.id)}
                className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800/60 hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] bg-gradient-to-br ${rankColors[idx]} shadow-sm flex-shrink-0`}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                      {dist.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 text-xs">
                    <span className="font-mono text-white font-semibold">{formatNumber(dist.appealCount)}</span>
                    <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1 rounded">
                      {formatPercent(resRate)}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span>Viloyatdagi ulushi:</span>
        <span className="font-semibold text-white font-mono">
          {formatPercent((top5Total / (totalAndijan || 1)) * 100)} (TOP 5)
        </span>
      </div>
    </div>
  );
};
