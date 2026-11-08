import React from 'react';
import { LayoutDashboard, FileText, Video, Moon, Sun, ShieldCheck, Send, Bot } from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';

interface NavbarProps {
  currentTab: 'dashboard' | 'appeals' | 'submit';
  setCurrentTab: (tab: 'dashboard' | 'appeals' | 'submit') => void;
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdated: string;
  onSimulate: () => void;
  isSimulating: boolean;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  onOpenTelegramBot: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isConnected,
  isConnecting,
  lastUpdated,
  onSimulate,
  isSimulating,
  isDarkMode,
  setIsDarkMode,
  onOpenTelegramBot,
  unreadCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-900/90 border-b border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & National Branding */}
          <div className="flex items-center gap-3.5 min-w-0">
            {/* National Emblem SVG */}
            <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/30 to-emerald-600/20 border border-blue-500/30 flex items-center justify-center shadow-inner">
              <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none">
                <circle cx="50" cy="50" r="46" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="3 2" />
                {/* Sun and Rays */}
                <circle cx="50" cy="50" r="14" fill="#fbbf24" />
                <path d="M50 15 L50 24 M50 76 L50 85 M15 50 L24 50 M76 50 L85 50 M25 25 L32 32 M68 68 L75 75 M25 75 L32 68 M68 32 L75 25" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                {/* Bird of happiness / Humo symbol stylization */}
                <path d="M36 58 C 42 46, 58 46, 64 58 C 58 64, 42 64, 36 58 Z" fill="#38bdf8" />
                <circle cx="50" cy="46" r="3" fill="#ffffff" />
                <path d="M22 68 Q 50 82 78 68" stroke="#10b981" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-wider uppercase font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Andijon Viloyati Hokimligi
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  OneID Integratsiya
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate flex items-center gap-2">
                Fuqarolar Video Murojaatlari
                <span className="hidden md:inline-block text-xs font-normal text-slate-400">| Tumanlar Nazorat Markazi</span>
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Boshqaruv Markazi (Live)</span>
            </button>

            <button
              onClick={() => setCurrentTab('appeals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all relative ${
                currentTab === 'appeals'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Murojaatlar Reyestri</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('submit')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'submit'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Video className="w-4 h-4 text-emerald-400" />
              <span>Video Murojaat</span>
            </button>

            <button
              onClick={onOpenTelegramBot}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#182533] text-cyan-300 hover:bg-[#2b5278] hover:text-white border border-cyan-500/30 transition-all cursor-pointer shadow-sm"
              title="Fuqarolar uchun Telegram bot va simulyator"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telegram Bot</span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            </button>
          </nav>

          {/* Right Status Indicator & Controls */}
          <div className="flex items-center gap-3">
            <LiveIndicator
              isConnected={isConnected}
              isConnecting={isConnecting}
              lastUpdated={lastUpdated}
              onSimulate={onSimulate}
              isSimulating={isSimulating}
            />

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? "Yorug‘ rejimga o‘tish" : "Tungi rejimga o‘tish"}
              className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-800">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setCurrentTab('appeals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'appeals' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reyestr</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white text-[9px] rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setCurrentTab('submit')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentTab === 'submit' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            <span>Murojaat</span>
          </button>
          <button
            onClick={onOpenTelegramBot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20"
          >
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Bot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
