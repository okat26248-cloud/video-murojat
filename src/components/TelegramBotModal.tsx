import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Video,
  CheckCircle2,
  Paperclip,
  Sparkles,
  Bot,
  Settings,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Play,
  MapPin,
  Building,
} from 'lucide-react';
import { ANDIJAN_DISTRICTS, AndijonDistrict } from '../data/andijanData';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAppealCreated?: (appeal: any) => void;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  type?: 'text' | 'video' | 'keyboard_districts' | 'keyboard_mfys' | 'success';
  videoDuration?: string;
  appealId?: string;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
  onAppealCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bot flow session states
  const [step, setStep] = useState<'video' | 'district' | 'mfy' | 'details' | 'done'>('video');
  const [selectedDistrict, setSelectedDistrict] = useState<AndijonDistrict | null>(null);
  const [selectedMfy, setSelectedMfy] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
  const [videoDuration, setVideoDuration] = useState<string>('01:30');

  // Real Bot Configuration state
  const [botToken, setBotToken] = useState('');
  const [botStatus, setBotStatus] = useState<{ configured: boolean; botUsername: string; webhookUrl: string } | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Initialize simulated chat
  useEffect(() => {
    if (isOpen) {
      resetChat();
      fetchBotStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchBotStatus = async () => {
    try {
      const res = await fetch('/api/telegram/status');
      if (res.ok) {
        const data = await res.json();
        setBotStatus(data);
      }
    } catch {}
  };

  const resetChat = () => {
    setStep('video');
    setSelectedDistrict(null);
    setSelectedMfy('');
    setMessages([
      {
        id: 'msg-start',
        sender: 'user',
        text: '/start',
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: '🇺🇿 **Andijon Viloyati Hokimligi Fuqarolar Video Murojaatlari Boti**\n\nAssalomu alaykum!\nUshbu rasmiy bot orqali Andijon viloyatining barcha 16 ta tuman va shaharlari bo‘yicha muammoli holatlar yuzasidan video murojaat yo‘llashingiz mumkin.\n\n📹 **1-qadam:** Iltimos, muammoni aks ettiruvchi qisqa **video lavha** (yoki video-xabar) yuboring.',
        time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
      },
    ]);
  };

  // User sends video in simulated chat
  const handleSendVideo = () => {
    const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [
      ...prev,
      {
        id: `user-vid-${Date.now()}`,
        sender: 'user',
        text: '📹 [Video xabar yuborildi]',
        time: timeNow,
        type: 'video',
        videoDuration: '01:30',
      },
      {
        id: `bot-dist-${Date.now()}`,
        sender: 'bot',
        text: '✅ **Video qabul qilindi!**\n\n📍 **2-qadam:** Iltimos, muammo yuz bergan **tuman yoki shaharni** tanlang:',
        time: timeNow,
        type: 'keyboard_districts',
      },
    ]);
    setStep('district');
  };

  // User chooses district
  const handleSelectDistrict = (dist: AndijonDistrict) => {
    setSelectedDistrict(dist);
    const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-dist-${Date.now()}`,
        sender: 'user',
        text: `📍 ${dist.name}`,
        time: timeNow,
      },
      {
        id: `bot-mfy-${Date.now()}`,
        sender: 'bot',
        text: `🏢 Tanlangan hudud: **${dist.name}**\n\n🏘 **3-qadam:** Iltimos, mahallangizni (**MFY**) tanlang yoki pastdan tanlang:`,
        time: timeNow,
        type: 'keyboard_mfys',
      },
    ]);
    setStep('mfy');
  };

  // User chooses MFY
  const handleSelectMfy = (mfyName: string) => {
    setSelectedMfy(mfyName);
    const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-mfy-${Date.now()}`,
        sender: 'user',
        text: `🏘 ${mfyName}`,
        time: timeNow,
      },
      {
        id: `bot-det-${Date.now()}`,
        sender: 'bot',
        text: `🏢 Hudud: **${selectedDistrict?.name}**, **${mfyName}**\n\n✍️ **4-qadam:** Iltimos, muammoning qisqacha tavsifini va telefon raqamingizni yozib yuboring:\n_(Masalan: "Elektr kuchlanishi past bo‘lyapti, tel: +998901234567")_`,
        time: timeNow,
      },
    ]);
    setStep('details');
  };

  // User sends final description text
  const handleSendDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userText = inputText.trim();
    setInputText('');
    const timeNow = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      {
        id: `user-text-${Date.now()}`,
        sender: 'user',
        text: userText,
        time: timeNow,
      },
    ]);

    setIsSubmitting(true);
    try {
      const payload = {
        citizenName: 'Telegram Fuqaro (Andijon)',
        phone: userText.match(/\+?998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/)?.[0] || '+998 90 234 56 78',
        districtId: selectedDistrict?.id || ANDIJAN_DISTRICTS[0].id,
        mahallaName: selectedMfy || selectedDistrict?.mahallas[0]?.name || 'Mustaqillik MFY',
        title: userText.slice(0, 75),
        description: userText,
        videoUrl,
        videoDuration,
        username: '@andijon_fuqaro',
      };

      const res = await fetch('/api/telegram/simulate-appeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const appeal = data.appeal;
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-confirm-${Date.now()}`,
            sender: 'bot',
            text: `🎉 **Murojaatingiz muvaffaqiyatli qabul qilindi!**\n\n🆔 **Murojaat raqami:** \`${appeal.id}\`\n📍 **Hudud:** ${appeal.districtName}, ${appeal.mahallaName}\n⏱ **Holati:** Yangi (Mutasaddilar nazoratida)\n\n✅ Murojaatingiz zudlik bilan **Andijon viloyati hokimligi Situatsion monitoring markazi** veb-saytiga uzatildi va tegishli tuman bo‘yicha xaritada aks ettirildi.\n\nOperatorlar va mutasaddi tashkilotlar tomonidan ijroga yo‘naltirilganda sizga ushbu bot orqali bildirishnoma keladi.`,
            time: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            type: 'success',
            appealId: appeal.id,
          },
        ]);
        setStep('done');
        if (onAppealCreated) onAppealCreated(appeal);
      }
    } catch (err) {
      console.error('Bot appeal submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBotToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!botToken.trim()) return;

    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: botToken.trim() }),
      });
      if (res.ok) {
        setTokenSaved(true);
        fetchBotStatus();
        setTimeout(() => setTokenSaved(false), 3000);
      }
    } catch {}
  };

  const copyWebhookUrl = () => {
    if (botStatus?.webhookUrl) {
      navigator.clipboard.writeText(botStatus.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full h-[88vh] max-h-[720px] overflow-hidden shadow-2xl relative flex flex-col"
      >
        {/* Telegram Chat Header */}
        <div className="bg-[#17212b] border-b border-[#0e1621] px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Bot Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white shadow-md relative">
              <Bot className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#17212b]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-1">
                  Andijon Murojaat Boti
                  <ShieldCheck className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                </h3>
              </div>
              <p className="text-[11px] text-blue-400 font-mono">
                {botStatus?.botUsername || '@AndijonMurojaat_Bot'} · <span className="text-emerald-400">onlayn</span>
              </p>
            </div>
          </div>

          {/* Mode Switcher (Simulator Chat / Real Token Settings) & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#0e1621] p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'chat' ? 'bg-[#2b5278] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Simulyator
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'settings' ? 'bg-[#2b5278] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Bot Sozlamasi</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: TELEGRAM CHAT SIMULATOR */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col bg-[#0e1621] overflow-hidden">
            
            {/* Chat Messages Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.map((msg) => {
                const isBot = msg.sender === 'bot';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs shadow-md relative ${
                        isBot
                          ? 'bg-[#182533] text-slate-200 border border-[#2b5278]/40 rounded-tl-sm'
                          : 'bg-[#2b5278] text-white rounded-tr-sm'
                      }`}
                    >
                      {/* Markdown rendering simulation */}
                      <div className="whitespace-pre-line leading-relaxed space-y-2">
                        {msg.text}
                      </div>

                      {/* Video Bubble preview */}
                      {msg.type === 'video' && (
                        <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-slate-700/60 flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                            <Play className="w-4 h-4 ml-0.5 fill-blue-400" />
                          </div>
                          <div>
                            <span className="text-[11px] font-semibold text-white block">Fuqaro video xabari</span>
                            <span className="text-[10px] text-slate-400 font-mono">Davomiyligi: {msg.videoDuration}</span>
                          </div>
                        </div>
                      )}

                      {/* Success Banner */}
                      {msg.type === 'success' && (
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                          <span className="text-[11px] font-medium leading-tight">
                            Saytdagi Jonli Dashboard xaritasida yashil to‘lqin paydo bo‘ldi va hisoblagich yangilandi!
                          </span>
                        </div>
                      )}

                      {/* Timestamp */}
                      <span className="text-[9px] text-slate-400 block text-right mt-1 font-mono">
                        {msg.time}
                      </span>
                    </div>

                    {/* Interactive Inline Keyboard: 16 Andijan Districts */}
                    {msg.type === 'keyboard_districts' && step === 'district' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 max-w-[95%] w-full grid grid-cols-2 gap-1.5 p-1 bg-[#182533]/80 rounded-2xl border border-blue-500/30"
                      >
                        {ANDIJAN_DISTRICTS.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => handleSelectDistrict(d)}
                            className="text-left px-2.5 py-2 rounded-xl bg-[#242f3d] hover:bg-blue-600 text-white text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer border border-slate-700/40 hover:border-blue-400"
                          >
                            <span className="truncate">{d.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-100">
                              {d.type === 'shahar' ? 'sh.' : 't.'}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}

                    {/* Interactive Inline Keyboard: MFYs for chosen district */}
                    {msg.type === 'keyboard_mfys' && step === 'mfy' && selectedDistrict && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5 max-w-[95%] w-full grid grid-cols-2 gap-1.5 p-1 bg-[#182533]/80 rounded-2xl border border-blue-500/30"
                      >
                        {selectedDistrict.mahallas.map((m, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectMfy(m.name)}
                            className="text-left px-2.5 py-2 rounded-xl bg-[#242f3d] hover:bg-emerald-600 text-white text-xs font-semibold transition-all flex items-center justify-between group cursor-pointer border border-slate-700/40 hover:border-emerald-400"
                          >
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-100">
                              MFY
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Bottom Chat Bar / Controls */}
            <div className="bg-[#17212b] border-t border-[#0e1621] p-3 flex-shrink-0">
              
              {/* Step 1 Quick Action: Send Video Button */}
              {step === 'video' && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={handleSendVideo}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    <span>📹 Video murojaatni yuborish (Krujok / Fayl)</span>
                  </button>
                </div>
              )}

              {/* Step 4: Text Input for Problem Description and Phone */}
              {step === 'details' && (
                <form onSubmit={handleSendDetails} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Muammo haqida yozing va telefon raqam... (+998...)"
                    className="flex-1 bg-[#242f3d] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !inputText.trim()}
                    className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Step Done: Restart Button */}
              {step === 'done' && (
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={resetChat}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer text-center"
                  >
                    🔄 Boshidan yangi murojaat yo‘llash (/start)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REAL TELEGRAM BOT CONFIGURATION */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 bg-slate-900 text-xs space-y-6">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                Haqiqiy Telegram Botni Ulash Bo‘yicha Yo‘riqnoma
              </h4>
              <p className="text-slate-400 mt-1">
                Andijon viloyati fuqarolari uchun rasmiy Telegram bot yaratib, uni ushbu veb-platformaga integratsiya qilishingiz mumkin.
              </p>
            </div>

            {/* Steps card */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold text-white">Telegramda @BotFather ga kiring</p>
                  <p className="text-slate-400 mt-0.5">Telegram qidiruvidan <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">@BotFather</code> botini toping va <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300">/newbot</code> buyrug‘ini bering.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold text-white">Bot nomi va username kiriting</p>
                  <p className="text-slate-400 mt-0.5">Masalan: <em>"Andijon Viloyat Murojaat Boti"</em> va <em>"AndijonMurojaat_Bot"</em>.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold text-white">Bot API Tokenni oling va pastga kiriting</p>
                  <p className="text-slate-400 mt-0.5">BotFather taqdim etgan tokenni quyidagi maydonga yozing va saqlang.</p>
                </div>
              </div>
            </div>

            {/* Token Input Form */}
            <form onSubmit={handleSaveBotToken} className="space-y-3">
              <label className="block font-semibold text-white">
                Telegram Bot API Token:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="7489234823:AAFsdfjklsdjfkl_sdkfjskldj"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold cursor-pointer shadow-md shadow-blue-600/30"
                >
                  {tokenSaved ? 'Saqlandi!' : 'Ulash'}
                </button>
              </div>
            </form>

            {/* Webhook & Status information */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Bot holati:</span>
                <span className={`font-semibold flex items-center gap-1.5 ${botStatus?.configured ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${botStatus?.configured ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  {botStatus?.configured ? 'Ulangan va faol (Polling/Webhook)' : 'Token kiritilmagan (Simulyator rejimi faol)'}
                </span>
              </div>

              {botStatus?.webhookUrl && (
                <div>
                  <span className="text-slate-400 block mb-1">Webhook URL manzili:</span>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[11px] text-blue-300">
                    <span className="truncate">{botStatus.webhookUrl}</span>
                    <button
                      onClick={copyWebhookUrl}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Nusxalash"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
