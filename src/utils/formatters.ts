import { AppealStatus } from '../types';

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('uz-UZ').format(num);
};

export const formatPercent = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const formatRelativeTime = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 10) return 'Hozirgina';
    if (diffSec < 60) return `${diffSec} soniya oldin`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} daqiqa oldin`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} soat oldin`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Kecha';
    if (diffDays < 7) return `${diffDays} kun oldin`;
    return date.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return isoString;
  }
};

export const formatTimeOnly = (date: Date = new Date()): string => {
  return date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export const getStatusConfig = (status: AppealStatus) => {
  switch (status) {
    case 'yangi':
      return {
        label: 'Yangi',
        bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        badgeColor: '#3b82f6',
        dot: 'bg-blue-500 animate-pulse',
      };
    case 'jarayonda':
      return {
        label: 'Ko‘rib chiqilmoqda',
        bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        badgeColor: '#f59e0b',
        dot: 'bg-amber-500',
      };
    case 'yuborilgan':
      return {
        label: 'Tashkilotga yuborilgan',
        bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
        badgeColor: '#8b5cf6',
        dot: 'bg-purple-500',
      };
    case 'hal_etilgan':
      return {
        label: 'Hal etilgan',
        bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        badgeColor: '#10b981',
        dot: 'bg-emerald-500',
      };
    case 'rad_etilgan':
      return {
        label: 'Rad etilgan',
        bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        badgeColor: '#f43f5e',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: 'Noma\'lum',
        bg: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        badgeColor: '#64748b',
        dot: 'bg-slate-500',
      };
  }
};
