import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { GitCompare, Calendar } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

type ComparisonMode = 'month' | 'week' | 'newVsResolved';

interface ComparisonItem {
  period: string;
  current: number;
  previous: number;
  diff?: string;
  label1?: string;
  label2?: string;
}

export const ComparisonAreaChart: React.FC = () => {
  const [mode, setMode] = useState<ComparisonMode>('month');

  // Month comparison data (Day 1 to 30)
  const monthData: ComparisonItem[] = [
    { period: '1-5 kun', current: 580, previous: 490, diff: '+18.3%' },
    { period: '6-10 kun', current: 720, previous: 630, diff: '+14.2%' },
    { period: '11-15 kun', current: 890, previous: 760, diff: '+17.1%' },
    { period: '16-20 kun', current: 810, previous: 710, diff: '+14.0%' },
    { period: '21-25 kun', current: 950, previous: 820, diff: '+15.8%' },
    { period: '26-30 kun', current: 1050, previous: 910, diff: '+15.3%' },
  ];

  // Week comparison data (Mon to Sun)
  const weekData: ComparisonItem[] = [
    { period: 'Dushanba', current: 412, previous: 360, diff: '+14.4%' },
    { period: 'Seshanba', current: 485, previous: 420, diff: '+15.4%' },
    { period: 'Chorshanba', current: 520, previous: 460, diff: '+13.0%' },
    { period: 'Payshanba', current: 495, previous: 435, diff: '+13.7%' },
    { period: 'Juma', current: 560, previous: 480, diff: '+16.6%' },
    { period: 'Shanba', current: 310, previous: 280, diff: '+10.7%' },
    { period: 'Yakshanba', current: 215, previous: 195, diff: '+10.2%' },
  ];

  // New vs Resolved comparative balance
  const balanceData: ComparisonItem[] = [
    { period: 'Dushanba', current: 412, previous: 345, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
    { period: 'Seshanba', current: 485, previous: 390, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
    { period: 'Chorshanba', current: 520, previous: 420, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
    { period: 'Payshanba', current: 495, previous: 410, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
    { period: 'Juma', current: 560, previous: 480, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
    { period: 'Shanba', current: 310, previous: 260, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
    { period: 'Yakshanba', current: 215, previous: 180, label1: 'Yangi murojaat', label2: 'Hal etilgan' },
  ];

  const getModeConfig = () => {
    switch (mode) {
      case 'month':
        return {
          data: monthData,
          labelCurrent: 'Joriy oy',
          labelPrevious: 'Oldingi oy',
          colorCurrent: '#3b82f6',
          colorPrevious: '#64748b',
          title: 'Joriy oy va o‘tgan oyning solishtirma qiyosiy grafigi',
        };
      case 'week':
        return {
          data: weekData,
          labelCurrent: 'Joriy hafta',
          labelPrevious: 'Oldingi hafta',
          colorCurrent: '#8b5cf6',
          colorPrevious: '#64748b',
          title: 'Joriy hafta va o‘tgan haftaning kunbay taqqoslanishi',
        };
      case 'newVsResolved':
        return {
          data: balanceData,
          labelCurrent: 'Yangi kelganlar',
          labelPrevious: 'Hal etilganlar',
          colorCurrent: '#3b82f6',
          colorPrevious: '#10b981',
          title: 'Yangi qabul qilingan va ijrosi hal etilgan murojaatlar nisbati',
        };
    }
  };

  const config = getModeConfig();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const row = payload[0].payload;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs min-w-[190px]">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-2 font-mono">
            {label}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.colorCurrent }} />
                {config.labelCurrent}:
              </span>
              <span className="font-bold text-white font-mono">{formatNumber(row.current)} ta</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.colorPrevious }} />
                {config.labelPrevious}:
              </span>
              <span className="font-bold text-slate-300 font-mono">{formatNumber(row.previous)} ta</span>
            </div>
            {row.diff && (
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-emerald-400 font-semibold">
                <span>O‘sish:</span>
                <span className="font-mono">{row.diff}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <GitCompare className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Murojaatlar Taqqoslanishi</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{config.title}</p>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setMode('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              mode === 'month'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Oy vs Oldingi oy
          </button>
          <button
            onClick={() => setMode('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              mode === 'week'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hafta vs Hafta
          </button>
          <button
            onClick={() => setMode('newVsResolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              mode === 'newVsResolved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yangi vs Hal etilgan
          </button>
        </div>
      </div>

      {/* Animated Area Chart */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={config.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="currentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.colorCurrent} stopOpacity={0.4} />
                <stop offset="95%" stopColor={config.colorCurrent} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="previousGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={config.colorPrevious} stopOpacity={0.25} />
                <stop offset="95%" stopColor={config.colorPrevious} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="period" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(val) => (
                <span className="text-xs text-slate-300 font-medium">
                  {val === 'current' ? config.labelCurrent : config.labelPrevious}
                </span>
              )}
            />
            <Area
              type="monotone"
              dataKey="current"
              name="current"
              stroke={config.colorCurrent}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#currentGrad)"
              animationDuration={1200}
            />
            <Area
              type="monotone"
              dataKey="previous"
              name="previous"
              stroke={config.colorPrevious}
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#previousGrad)"
              animationDuration={1400}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
