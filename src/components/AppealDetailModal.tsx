import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  MapPin,
  Calendar,
  Building,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sparkles,
} from 'lucide-react';
import { Appeal, AppealStatus } from '../types';
import { getStatusConfig, formatRelativeTime } from '../utils/formatters';
import { ANDIJAN_DEPARTMENTS } from '../data/andijanData';

interface AppealDetailModalProps {
  appeal: Appeal | null;
  onClose: () => void;
  onUpdateStatus: (
    appealId: string,
    status: AppealStatus,
    assignedDept?: string,
    responseText?: string
  ) => void;
}

export const AppealDetailModal: React.FC<AppealDetailModalProps> = ({
  appeal,
  onClose,
  onUpdateStatus,
}) => {
  if (!appeal) return null;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<AppealStatus>(appeal.status);
  const [department, setDepartment] = useState<string>(appeal.assignedDepartment || ANDIJAN_DEPARTMENTS[0]);
  const [responseText, setResponseText] = useState<string>(appeal.responseText || '');
  const [isSaving, setIsSaving] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const statusCfg = getStatusConfig(status);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(appeal.id, status, department, responseText);
      setIsSaving(false);
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col"
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              {appeal.id}
            </span>
            {appeal.source === 'telegram' && (
              <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                <span>Telegram Bot orqali</span>
              </span>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${statusCfg.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Main Video Player Container */}
          <div className="relative w-full aspect-video rounded-2xl bg-black border border-slate-800 overflow-hidden shadow-2xl group">
            {appeal.videoUrl ? (
              <video
                src={appeal.videoUrl}
                className="w-full h-full object-cover"
                controls
                autoPlay={false}
                muted={isMuted}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
                  <Play className="w-8 h-8 ml-1" />
                </div>
                <p className="text-sm font-semibold text-white">Video oqim yozuvi saqlangan</p>
                <p className="text-xs text-slate-500 mt-1">Davomiyligi: {appeal.videoDuration}</p>
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {appeal.category}
              </span>
              <span className="text-xs text-slate-400">
                Topshirildi: {new Date(appeal.createdAt).toLocaleString('uz-UZ')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{appeal.title}</h2>
            <div className="mt-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed">
              {appeal.description}
            </div>
          </div>

          {/* Citizen Verification & Location Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Citizen Identity */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Fuqaroning Tasdiqlangan Ma’lumotlari (OneID)</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">F.I.Sh:</span>
                  <span className="font-semibold text-white">{appeal.citizenName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">JShShIR:</span>
                  <span className="font-mono text-slate-300">{appeal.pinfl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telefon:</span>
                  <span className="font-mono text-blue-400">{appeal.phone}</span>
                </div>
              </div>
            </div>

            {/* Geographical Location */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-white border-b border-slate-800 pb-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Murojaat Manzili</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Viloyat:</span>
                  <span className="font-semibold text-white">{appeal.regionName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tuman / Shahar:</span>
                  <span className="font-semibold text-white">{appeal.districtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MFY / Mahalla:</span>
                  <span className="font-semibold text-slate-300">{appeal.mahallaName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Operator Action Panel */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-blue-500/30 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Operator va Mas’ul Ijrochi Nazorat Paneli</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Murojaat Holati
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AppealStatus)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="yangi">Yangi murojaat</option>
                  <option value="jarayonda">Ko‘rib chiqilmoqda (Ekspertiza)</option>
                  <option value="yuborilgan">Mas’ul tashkilotga yuborilgan</option>
                  <option value="hal_etilgan">Hal etilgan (Ijobiy yechim)</option>
                  <option value="rad_etilgan">Rad etilgan</option>
                </select>
              </div>

              {/* Department Assign */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mas’ul Vazirlik / Hokimlik
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {ANDIJAN_DEPARTMENTS.map((dept, i) => (
                    <option key={i} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Official Response Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fuqaroga Rasmiy Javob va Yechim Bayoni
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Amalga oshirilgan ishlar, o‘rnatilgan texnik uskunalar yoki rasmiy xulosa matnini kiriting..."
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Saqlanmoqda...' : 'Holatni yangilash va yuborish'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
