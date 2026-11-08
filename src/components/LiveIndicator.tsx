import React from 'react';
import { Radio, Volume2, VolumeX, Sparkles, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../utils/audio';

interface LiveIndicatorProps {
  isConnected: boolean;
  isConnecting: boolean;
  lastUpdated: string;
  onSimulate: () => void;
  isSimulating?: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({
  isConnected,
  isConnecting,
  lastUpdated,
  onSimulate,
  isSimulating = false,
}) => {
  const [sound, setSound] = React.useState(isSoundEnabled());

  const handleToggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Live Badge */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide shadow-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="flex items-center gap-1">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          LIVE MONITORING
        </span>
      </div>

      {/* Connection Status */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
        {isConnected ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-300">Server: <strong className="text-emerald-400 font-medium">Faol (WebSocket)</strong></span>
          </>
        ) : isConnecting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-amber-300">Qayta ulanmoqda...</span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-rose-300">Oflayn rejim</span>
          </>
        )}
      </div>

      {/* Last Updated Timestamp */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 border border-slate-700/40 px-3 py-1.5 rounded-full">
        <span>Yangilandi:</span>
        <span className="font-mono text-slate-200 font-medium">{lastUpdated || 'Hozir'}</span>
      </div>

      {/* Sound Toggle */}
      <button
        onClick={handleToggleSound}
        title={sound ? "Ovozli signallarni o‘chirish" : "Ovozli signallarni yoqish"}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          sound
            ? 'bg-blue-500/15 border border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
      >
        {sound ? <Volume2 className="w-3.5 h-3.5 text-blue-400" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span className="hidden lg:inline">{sound ? 'Ovoz yoqilgan' : 'Ovoz o‘chiq'}</span>
      </button>

      {/* Instant Test Simulator Button */}
      <button
        onClick={onSimulate}
        disabled={isSimulating}
        title="Yangi video murojaat kelishini simulyatsiya qilib jonli signal va animatsiyalarni ko‘rish"
        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-900/30 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
      >
        <Sparkles className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
        <span>+ Test murojaat</span>
      </button>
    </div>
  );
};
