import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Calendar, Clock, BarChart2 } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

type DynamicsTab = 'today' | 'weekly' | 'monthly' | 'yearly' | 'growth';

interface DynamicDataPoint {
  label: string;
  appeals?: number;
  resolved?: number;
  volume?: number;
  rate?: number;
}

export const DynamicsChart: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DynamicsTab>('today');

  // Realistic time-series data for each granularity
  const todayData: DynamicDataPoint[] = [
    { label: '08:00', appeals: 14, resolved: 8 },
    { label: '10:00', appeals: 48, resolved: 22 },
    { label: '12:00', appeals: 72, resolved: 41 },
    { label: '14:00', appeals: 65, resolved: 53 },
    { label: '16:00', appeals: 94, resolved: 68 },
    { label: '18:00', appeals: 82, resolved: 59 },
    { label: '20:00', appeals: 45, resolved: 32 },
    { label: '22:00', appeals: 18, resolved: 12 },
  ];

  const weeklyData: DynamicDataPoint[] = [
    { label: 'Dush', appeals: 412, resolved: 345 },
    { label: 'Sesh', appeals: 485, resolved: 390 },
    { label: 'Chor', appeals: 520, resolved: 420 },
    { label: 'Pay', appeals: 495, resolved: 410 },
    { label: 'Juma', appeals: 560, resolved: 480 },
    { label: 'Shan', appeals: 310, resolved: 260 },
    { label: 'Yak', appeals: 215, resolved: 180 },
  ];

  const monthlyData: DynamicDataPoint[] = [
    { label: '1-hafta', appeals: 2450, resolved: 1980 },
    { label: '2-hafta', appeals: 2890, resolved: 2340 },
    { label: '3-hafta', appeals: 3120, resolved: 2620 },
    { label: '4-hafta', appeals: 3410, resolved: 2890 },
  ];

  const yearlyData: DynamicDataPoint[] = [
    { label: 'Yan', appeals: 2800, resolved: 2200 },
    { label: 'Fev', appeals: 3100, resolved: 2540 },
    { label: 'Mar', appeals: 3450, resolved: 2890 },
    { label: 'Apr', appeals: 3620, resolved: 3010 },
    { label: 'May', appeals: 3900, resolved: 3250 },
    { label: 'Iyun', appeals: 4100, resolved: 3480 },
    { label: 'Iyul', appeals: 4250, resolved: 3620 },
    { label: 'Avg', appeals: 4400, resolved: 3750 },
    { label: 'Sen', appeals: 4850, resolved: 4120 },
    { label: 'Okt', appeals: 5100, resolved: 4320 },
    { label: 'Noy', appeals: 5450, resolved: 4620 },
    { label: 'Dek', appeals: 5800, resolved: 4910 },
  ];

  const growthData: DynamicDataPoint[] = [
    { label: '2025-Q1', rate: 12.4, volume: 8350 },
    { label: '2025-Q2', rate: 16.8, volume: 11450 },
    { label: '2025-Q3', rate: 21.2, volume: 14890 },
    { label: '2025-Q4', rate: 26.5, volume: 19200 },
    { label: '2026-Q1', rate: 31.4, volume: 24650 },
    { label: '2026-Q2', rate: 38.2, volume: 31400 },
    { label: '2026-Hozir', rate: 44.5, volume: 37680 },
  ];

  const getChartConfig = (): { data: DynamicDataPoint[]; title: string } => {
    switch (activeTab) {
      case 'today':
        return { data: todayData, title: 'Bugungi murojaatlar oqimi (soatbay)' };
      case 'weekly':
        return { data: weeklyData, title: 'Haftalik dinamika (kunlar kesimida)' };
      case 'monthly':
        return { data: monthlyData, title: 'Oylik tahlil (haftabay taqsimot)' };
      case 'yearly':
        return { data: yearlyData, title: 'Yillik murojaatlar va ijro balansi' };
      case 'growth':
        return { data: growthData, title: 'Raqamli platformaning choraklik o‘sish sur’ati' };
    }
  };

  const { data, title } = getChartConfig();

  // Custom Dark Navy Glassmorphism Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
          <p className="font-semibold text-slate-200 border-b border-slate-800 pb-1 mb-2 font-mono">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: entry.color || entry.stroke }}
                />
                {entry.name === 'appeals' ? 'Kelgan murojaatlar' : entry.name === 'resolved' ? 'Hal etilgan' : entry.name}
              </span>
              <span className="font-bold text-white font-mono">
                {formatNumber(entry.value)} {entry.name === 'rate' ? '%' : 'ta'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* Header with Switcher Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white tracking-tight">Murojaatlar Dinamikasi</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">{title}</p>
        </div>

        {/* Tab Switchers */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'today'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bugun
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'weekly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Haftalik
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'monthly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Oylik
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'yearly'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yillik
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'growth'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            O‘sish Sur’ati
          </button>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'growth' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="volume"
                name="Jami hajm"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#growthGrad)"
              />
            </AreaChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => (
                  <span className="text-xs text-slate-300 font-medium">
                    {val === 'appeals' ? 'Kelgan video murojaatlar' : 'Hal etilgan murojaatlar'}
                  </span>
                )}
              />
              <Line
                type="monotone"
                dataKey="appeals"
                name="appeals"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#0f172a' }}
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="resolved"
                name="resolved"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#0f172a' }}
                activeDot={{ r: 5 }}
                animationDuration={1200}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
