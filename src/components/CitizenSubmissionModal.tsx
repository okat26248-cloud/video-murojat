import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Camera,
  Square,
  RefreshCw,
  Upload,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ANDIJAN_DISTRICTS, ANDIJAN_CATEGORIES } from '../data/andijanData';

interface CitizenSubmissionModalProps {
  onSubmitSuccess: (appeal: any) => void;
  onCancel?: () => void;
}

export const CitizenSubmissionModal: React.FC<CitizenSubmissionModalProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  const [citizenName, setCitizenName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [pinfl, setPinfl] = useState('');
  const [districtId, setDistrictId] = useState(ANDIJAN_DISTRICTS[0].id); // Andijon shahri default
  const [mahallaName, setMahallaName] = useState(ANDIJAN_DISTRICTS[0].mahallas[0]?.name || 'Bog‘ishamol MFY');
  const [category, setCategory] = useState(ANDIJAN_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Selected district
  const selectedDistrict = ANDIJAN_DISTRICTS.find((d) => d.id === districtId) || ANDIJAN_DISTRICTS[0];

  useEffect(() => {
    if (selectedDistrict && selectedDistrict.mahallas.length > 0) {
      setMahallaName(selectedDistrict.mahallas[0].name);
    }
  }, [districtId]);

  // Start live webcam for video appeal
  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('Kamera yoki mikrofonga ruxsat berilmadi yoki mavjud emas. Simulyatsiyalangan video yozuvdan foydalanishingiz mumkin.');
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      // If camera not accessible, simulate recording
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
      return;
    }

    recordedChunksRef.current = [];
    try {
      const recorder = new MediaRecorder(streamRef.current);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulated video recording URL
      setRecordedVideoUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    }
    setIsRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim() || !title.trim() || !description.trim()) {
      alert('Iltimos, barcha majburiy maydonlarni to‘ldiring');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        citizenName,
        phone,
        pinfl: pinfl || '31205948200014',
        regionId: selectedDistrict.id,
        regionName: 'Andijon viloyati',
        districtName: selectedDistrict.name,
        mahallaName,
        category,
        title,
        description,
        videoDuration: recordingSeconds > 0 ? `00:${recordingSeconds.toString().padStart(2, '0')}` : '01:45',
        videoUrl: recordedVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        priority: 'yuqori',
      };

      const res = await fetch('/api/appeals/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        onSubmitSuccess(data.appeal);
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('Yuborishda xatolik yuz berdi. Qayta urinib ko‘ring.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Yangi Fuqaro Video Murojaatini Yuborish
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Muammoni video orqali bayon qiling. Murojaatingiz darhol mutasaddi organlar nazoratiga olinadi.
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          Davlat Kafolati
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Video Recorder Section */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              1. Video Materialni Yozib Olish yoki Yuklash
            </span>
            {isRecording && (
              <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                YOZILMOQDA: {recordingSeconds}s
              </span>
            )}
          </div>

          <div className="relative aspect-video max-h-72 w-full rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
            {recordedVideoUrl ? (
              <video src={recordedVideoUrl} controls className="w-full h-full object-cover" />
            ) : (
              <video ref={videoPreviewRef} muted className="w-full h-full object-cover" />
            )}

            {!streamRef.current && !recordedVideoUrl && (
              <div className="text-center p-4">
                <Video className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 mb-3">Kamera orqali video murojaat yozish uchun ruxsat bering</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Kamerani yoqish
                </button>
              </div>
            )}
          </div>

          {/* Recorder Controls */}
          <div className="flex items-center justify-between mt-3 pt-2">
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer shadow-md shadow-rose-900/30"
                >
                  <Camera className="w-4 h-4" />
                  <span>Yozishni boshlash</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
                >
                  <Square className="w-4 h-4 text-rose-400" />
                  <span>Yozishni to‘xtatish</span>
                </button>
              )}

              {recordedVideoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setRecordedVideoUrl(null);
                    setRecordingSeconds(0);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Qaytadan yozish</span>
                </button>
              )}
            </div>

            <span className="text-[11px] text-slate-500">Maksimal davomiylik: 3 daqiqa</span>
          </div>
        </div>

        {/* Citizen Information Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fuqaroning F.I.Sh. *
            </label>
            <input
              type="text"
              required
              value={citizenName}
              onChange={(e) => setCitizenName(e.target.value)}
              placeholder="Masalan: Abdullayev Otabek"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Telefon raqami *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              JShShIR (PINFL)
            </label>
            <input
              type="text"
              maxLength={14}
              value={pinfl}
              onChange={(e) => setPinfl(e.target.value)}
              placeholder="14 ta raqam"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>
        </div>

        {/* Region & District Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Viloyat
            </label>
            <div className="w-full bg-slate-950/60 border border-slate-700/60 rounded-xl px-3 py-2 text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Andijon viloyati</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Tuman / Shahar *
            </label>
            <select
              value={districtId}
              onChange={(e) => setDistrictId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {ANDIJAN_DISTRICTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} {d.type === 'shahar' ? '(Shahar)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              MFY / Mahalla *
            </label>
            <input
              type="text"
              required
              value={mahallaName}
              onChange={(e) => setMahallaName(e.target.value)}
              placeholder="Masalan: Bog‘ishamol MFY"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Category & Title */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Murojaat Sohasi (Kategoriya) *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {ANDIJAN_CATEGORIES.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Murojaatning Qisqacha Sarlavhasi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Elektr ta’minotidagi tez-tez uzilishlar"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Muammoning Batafsil Bayoni *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Murojaat yuzasidan barcha tafsilotlarni, manzil va qanday choralarni ko‘rish zarurligini yozing..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
            >
              Bekor qilish
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="ml-auto flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Yuborilmoqda...' : 'Murojaatni rasman yuborish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
