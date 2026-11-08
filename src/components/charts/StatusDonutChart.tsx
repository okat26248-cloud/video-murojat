import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { LiveStats } from '../../types';
import { formatNumber, formatPercent } from '../../utils/formatters';

interface StatusDonutChartProps {
  stats: LiveStats;
}

export const StatusDonutChart: React.FC<StatusDonutChartProps> = ({ stats }) => {
  const data = [
    { name: 'Hal etilgan', value: stats.resolvedAppeals, color: '#10b981', desc: 'Ijobiy yechim topgan' },
    { name: 'Ko‘rib chiqilmoqda', value: stats.inReviewAppeals, color: '#f59e0b', desc: 'Mas’ullar o‘rganmoqda' },
    { name: 'Tashkilotga yuborilgan', value: stats.assignedAppeals, color: '#8b5cf6', desc: 'Vazirliklarga yo‘naltirilgan' },
    { name: 'Yangi murojaatlar', value: stats.todayAppeals, color: '#3b82f6', desc: 'Bugun qabul qilingan' },
    { name: 'Rad etilgan', value: stats.rejectedAppeals, color: '#f43f5e', desc: 'Asossiz yoki takroriy' },
  ];

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percent = (item.value / total) * 100;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[170px]">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="font-semibold text-white">{item.name}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Soni:</span>
              <span className="font-bold text-white font-mono">{formatNumber(item.value)} ta</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ulushi:</span>
              <span className="font-bold text-blue-400 font-mono">{formatPercent(percent)}</span>
            </div>
            <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 mt-1">
              {item.desc}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <PieIcon className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Murojaatlar Holati</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">5 ta rasmiy ijro bosqichlari bo‘yicha</p>
        </div>
        <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
          Jami: {formatNumber(total)}
        </span>
      </div>

      {/* Donut Chart with center label */}
      <div className="relative w-full h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1100}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text inside Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 font-medium">Hal etish</span>
          <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
            {formatPercent(stats.resolutionRate)}
          </span>
          <span className="text-[10px] text-slate-500 uppercase tracking-wider">Samaradorlik</span>
        </div>
      </div>

      {/* Custom Clean Grid Legend */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80">
        {data.map((item, idx) => {
          const percent = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={idx} className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-800/40 border border-slate-800">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
              </div>
              <span className="font-mono text-slate-400 font-medium ml-1">{percent}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
