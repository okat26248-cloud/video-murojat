import React from 'react';
import { motion } from 'motion/react';
import { Video, Clock, CheckCircle2, TrendingUp, AlertCircle, Award } from 'lucide-react';
import { CountUp } from './CountUp';
import { LiveStats } from '../types';

interface StatsCardsProps {
  stats: LiveStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      id: 'total',
      title: 'Jami Video Murojaatlar',
      value: stats.totalAppeals,
      subValue: `Bugun +${stats.todayAppeals}`,
      subTrend: '+14.2%',
      isPositive: true,
      icon: Video,
      color: 'blue',
      gradient: 'from-blue-600/20 via-blue-500/10 to-transparent',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      tooltip: 'Platforma ochilgandan buyon kelib tushgan barcha video murojaatlar',
    },
    {
      id: 'today',
      title: 'Bugungi Yangi Murojaatlar',
      value: stats.todayAppeals,
      subValue: 'Real vaqtda qabul qilinmoqda',
      subTrend: 'LIVE',
      isLive: true,
      icon: Clock,
      color: 'indigo',
      gradient: 'from-indigo-600/20 via-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/30',
      iconColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      tooltip: 'Bugun 00:00 dan to hozirgacha kelgan murojaatlar',
    },
    {
      id: 'inReview',
      title: 'Ko‘rib Chiqilmoqda',
      value: stats.inReviewAppeals,
      subValue: 'Mas’ul tashkilotlar nazoratida',
      subTrend: 'Ijroda',
      icon: AlertCircle,
      color: 'amber',
      gradient: 'from-amber-600/20 via-amber-500/10 to-transparent',
      borderColor: 'border-amber-500/30',
      iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      tooltip: 'Ekspertiza va ijroga yo‘naltirilgan murojaatlar',
    },
    {
      id: 'resolved',
      title: 'Hal Etilgan Murojaatlar',
      value: stats.resolvedAppeals,
      subValue: 'Ijobiy yechim topgan',
      subTrend: '+8.4%',
      isPositive: true,
      icon: CheckCircle2,
      color: 'emerald',
      gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/30',
      iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      tooltip: 'Fuqaro muammosi bartaraf etilib, rasmiy javob berilgan murojaatlar',
    },
    {
      id: 'rate',
      title: 'Hal Etish Samaradorligi',
      value: stats.resolutionRate,
      isPercent: true,
      subValue: 'O‘zbekiston bo‘yicha',
      subTrend: '+2.1%',
      isPositive: true,
      icon: Award,
      color: 'teal',
      gradient: 'from-teal-600/20 via-teal-500/10 to-transparent',
      borderColor: 'border-teal-500/30',
      iconColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      tooltip: 'Jami ko‘rib chiqilgan murojaatlarga nisbatan ijobiy yechim nisbati',
    },
    {
      id: 'avgTime',
      title: 'O‘rtacha Javob Vaqti',
      value: stats.averageResponseDays,
      isDecimal: true,
      suffix: ' kun',
      subValue: 'Reglament: 15 kungacha',
      subTrend: '-0.3 kun',
      isPositive: true,
      icon: TrendingUp,
      color: 'violet',
      gradient: 'from-violet-600/20 via-violet-500/10 to-transparent',
      borderColor: 'border-violet-500/30',
      iconColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
      tooltip: 'Murojaat kelganidan boshlab ijro ta’minlanguncha ketgan o‘rtacha muddat',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className={`relative overflow-hidden rounded-2xl bg-slate-900/80 border ${card.borderColor} p-4 shadow-lg hover:shadow-xl transition-all group`}
            title={card.tooltip}
          >
            {/* Ambient subtle glow background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-40 group-hover:opacity-70 transition-opacity pointer-events-none`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400 line-clamp-1">{card.title}</span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              {/* Metric Value */}
              <div className="text-2xl font-extrabold text-white tracking-tight flex items-baseline gap-1 my-1">
                {card.isPercent ? (
                  <>
                    <CountUp value={Math.round(card.value * 10)} duration={900} formatter={(v) => (v / 10).toFixed(1)} />
                    <span className="text-base font-semibold text-slate-300">%</span>
                  </>
                ) : card.isDecimal ? (
                  <>
                    <span>{card.value.toFixed(1)}</span>
                    <span className="text-sm font-semibold text-slate-400">{card.suffix}</span>
                  </>
                ) : (
                  <CountUp value={card.value as number} duration={800} />
                )}
              </div>

              {/* Sub-label and Trend badge */}
              <div className="flex items-center justify-between text-[11px] mt-2 pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 truncate max-w-[110px]">{card.subValue}</span>
                {card.isLive ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                    LIVE
                  </span>
                ) : (
                  <span className={`font-semibold ${card.isPositive ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {card.subTrend}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
