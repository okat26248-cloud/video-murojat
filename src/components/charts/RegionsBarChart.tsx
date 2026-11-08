import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Map, Trophy, AlertCircle } from 'lucide-react';
import { RegionData } from '../../types';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface RegionsBarChartProps {
  regions: RegionData[];
  onSelectRegion?: (regionId: string) => void;
}

export const RegionsBarChart: React.FC<RegionsBarChartProps> = ({
  regions,
  onSelectRegion,
}) => {
  // Sort regions descending by appeal count
  const sorted = [...regions].sort((a, b) => b.appealCount - a.appealCount);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: RegionData = payload[0].payload;
      const resRate = (data.resolvedCount / data.appealCount) * 100;

      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2">
            <span className="font-bold text-white">{data.name}</span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono">
              {data.code}
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Jami murojaat:</span>
              <span className="font-bold text-white font-mono">{formatNumber(data.appealCount)} ta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Hal etilgan:</span>
              <span className="font-bold text-emerald-400 font-mono">{formatNumber(data.resolvedCount)} ta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ijroda:</span>
              <span className="font-bold text-amber-400 font-mono">{formatNumber(data.inReviewCount)} ta</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800 text-blue-400 font-medium">
              <span>Hal etish:</span>
              <span className="font-bold font-mono">{formatPercent(resRate)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header with Top / Lowest indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Map className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Viloyatlar Kesimida Tahlil</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Barcha 14 ta ma’muriy hudud bo‘yicha video murojaatlar hajmi (gorizontal diagramma)
          </p>
        </div>

        {/* Badges for Top and Lowest */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Eng ko‘p: <strong>{highest.name}</strong> ({formatNumber(highest.appealCount)})</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Eng kam: <strong>{lowest.name}</strong> ({formatNumber(lowest.appealCount)})</span>
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
            <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#cbd5e1"
              fontSize={11}
              tickLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="appealCount"
              radius={[0, 6, 6, 0]}
              animationDuration={1200}
              onClick={(data: any) => onSelectRegion && onSelectRegion(data.id)}
              className="cursor-pointer"
            >
              {sorted.map((entry, index) => {
                const isHighest = index === 0;
                const isLowest = index === sorted.length - 1;
                // Highlighting colors
                let fill = '#3b82f6';
                if (isHighest) fill = '#6366f1'; // Indigo for top
                if (isLowest) fill = '#0284c7';
                return <Cell key={`bar-${index}`} fill={fill} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
