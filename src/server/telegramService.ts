import { ANDIJAN_DISTRICTS, ANDIJAN_CATEGORIES, AndijonDistrict } from '../data/andijanData.ts';
import { Appeal, LiveStats, ActivityEvent } from '../types.ts';

interface BotSession {
  chatId: number;
  step: 'waiting_for_video' | 'waiting_for_district' | 'waiting_for_mahalla' | 'waiting_for_details' | 'completed';
  videoUrl?: string;
  videoDuration?: string;
  districtId?: string;
  districtName?: string;
  mahallaName?: string;
  title?: string;
  description?: string;
  citizenName?: string;
  phone?: string;
  username?: string;
}

export class TelegramBotService {
  private token: string = process.env.TELEGRAM_BOT_TOKEN || '';
  private botUsername: string = '@AndijonMurojaat_Bot';
  private isPolling: boolean = false;
  private pollingOffset: number = 0;
  private sessions: Map<number, BotSession> = new Map();
  private onNewAppealCallback?: (appeal: Appeal, event: ActivityEvent) => void;

  constructor() {
    if (this.token) {
      this.initBot();
    }
  }

  public setCallback(cb: (appeal: Appeal, event: ActivityEvent) => void) {
    this.onNewAppealCallback = cb;
  }

  public setToken(token: string) {
    this.token = token.trim();
    if (this.token) {
      this.initBot();
    }
  }

  public getStatus() {
    return {
      configured: !!this.token,
      botUsername: this.botUsername,
      isPolling: this.isPolling,
    };
  }

  private async initBot() {
    try {
      const res = await fetch(`https://api.telegram.org/bot${this.token}/getMe`);
      const data = await res.json();
      if (data.ok) {
        this.botUsername = `@${data.result.username}`;
        console.log(`Telegram bot initialized: ${this.botUsername}`);
        if (!this.isPolling) {
          this.startPolling();
        }
      } else {
        console.warn('Telegram bot token invalid:', data.description);
      }
    } catch (err) {
      console.warn('Telegram API connection error:', err);
    }
  }

  private async startPolling() {
    this.isPolling = true;
    console.log('Telegram bot polling started...');

    const poll = async () => {
      if (!this.isPolling || !this.token) return;
      try {
        const url = `https://api.telegram.org/bot${this.token}/getUpdates?offset=${this.pollingOffset}&timeout=20`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            this.pollingOffset = update.update_id + 1;
            await this.handleUpdate(update);
          }
        }
      } catch (err) {
        // Silently retry polling after short pause
      }

      if (this.isPolling) {
        setTimeout(poll, 1500);
      }
    };

    poll();
  }

  public async handleUpdate(update: any) {
    if (update.message) {
      await this.handleMessage(update.message);
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query);
    }
  }

  private async handleMessage(msg: any) {
    const chatId = msg.chat.id;
    const text = msg.text || '';
    const from = msg.from || {};
    const citizenName = [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Telegram Fuqaro';

    let session = this.sessions.get(chatId);
    if (!session || text === '/start') {
      session = {
        chatId,
        step: 'waiting_for_video',
        citizenName,
        username: from.username ? `@${from.username}` : undefined,
      };
      this.sessions.set(chatId, session);

      await this.sendMessage(
        chatId,
        `🇺🇿 *Andijon Viloyati Hokimligi Fuqarolar Video Murojaatlari Boti*\n\n` +
        `Assalomu alaykum, *${citizenName}*!\n\n` +
        `Ushbu rasmiy bot orqali Andijon viloyatining barcha 16 ta tuman va shaharlari bo‘yicha muammoli holatlar yuzasidan video murojaat yo‘llashingiz mumkin.\n\n` +
        `📹 *1-qadam:* Iltimos, muammoni aks ettiruvchi qisqa *video lavha* (yoki video-xabar / krujok) yuboring.`
      );
      return;
    }

    // Step 1: User sends video
    if (session.step === 'waiting_for_video') {
      let videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
      let duration = '01:30';

      if (msg.video) {
        duration = `00:${Math.min(msg.video.duration || 45, 99).toString().padStart(2, '0')}`;
      } else if (msg.video_note) {
        duration = `00:${Math.min(msg.video_note.duration || 30, 99).toString().padStart(2, '0')}`;
      } else if (!msg.video && !msg.video_note && text !== '/skip_video') {
        await this.sendMessage(
          chatId,
          `⚠️ Iltimos, video fayl yoki video xabar (krujok) yuboring. Yoki videoni keyinroq yuklash uchun /skip_video buyrug‘ini yuboring.`
        );
        return;
      }

      session.videoUrl = videoUrl;
      session.videoDuration = duration;
      session.step = 'waiting_for_district';

      // Send inline keyboard of 16 Andijan districts in 2-column layout
      const keyboard = this.getDistrictsInlineKeyboard();
      await this.sendMessageWithKeyboard(
        chatId,
        `✅ *Video qabul qilindi!*\n\n` +
        `📍 *2-qadam:* Muammo yuz bergan *tuman yoki shaharni* tanlang:`,
        keyboard
      );
      return;
    }

    // Step 3: User writes MFY name if typed as text
    if (session.step === 'waiting_for_mahalla') {
      session.mahallaName = text.trim();
      session.step = 'waiting_for_details';

      await this.sendMessage(
        chatId,
        `🏢 Hudud: *${session.districtName}*, *${session.mahallaName}*\n\n` +
        `✍️ *4-qadam:* Iltimos, muammoning qisqacha tavsifini va bog‘lanish uchun telefon raqamingizni yozib yuboring.\n` +
        `_(Masalan: "Ichimlik suvi nasosi ishlamayapti, 3 kundan beri suv yo‘q. Tel: +998901234567")_`
      );
      return;
    }

    // Step 4: User sends description and phone
    if (session.step === 'waiting_for_details') {
      session.description = text;
      session.title = text.slice(0, 70);
      
      // Extract phone if exists
      const phoneMatch = text.match(/\+?998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/);
      session.phone = phoneMatch ? phoneMatch[0] : '+998 90 000 00 00';

      // Finalize and submit appeal
      const appeal = this.createAppealFromSession(session);
      session.step = 'completed';

      await this.sendMessage(
        chatId,
        `🎉 *Murojaatingiz muvaffaqiyatli qabul qilindi!*\n\n` +
        `🆔 *Murojaat raqami:* \`${appeal.id}\`\n` +
        `📍 *Manzil:* ${appeal.districtName}, ${appeal.mahallaName}\n` +
        `⏱ *Holati:* Yangi (Mutasaddilar nazoratida)\n\n` +
        `✅ Murojaatingiz zudlik bilan *Andijon viloyati hokimligi Situatsion monitoring markazi* portaliga uzatildi va mas’ul tashkilotlar nazoratiga olindi.\n\n` +
        `Ijro holati o‘zgarganda sizga ushbu bot orqali xabar yuboriladi.`
      );
      return;
    }
  }

  private async handleCallbackQuery(query: any) {
    const chatId = query.message.chat.id;
    const data = query.data || '';
    let session = this.sessions.get(chatId);

    // Answer callback
    try {
      if (this.token) {
        await fetch(`https://api.telegram.org/bot${this.token}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: query.id }),
        });
      }
    } catch {}

    if (!session) return;

    // Handle District selection
    if (data.startsWith('dist:')) {
      const distId = data.replace('dist:', '');
      const district = ANDIJAN_DISTRICTS.find((d) => d.id === distId);
      if (district) {
        session.districtId = district.id;
        session.districtName = district.name;
        session.step = 'waiting_for_mahalla';

        // Provide MFY keyboard
        const mfyKeyboard = this.getMfyInlineKeyboard(district);
        await this.sendMessageWithKeyboard(
          chatId,
          `🏢 Tanlangan tuman: *${district.name}*\n\n` +
          `🏘 *3-qadam:* Iltimos, mahallangizni (*MFY*) tanlang yoki nomini yozib yuboring:`,
          mfyKeyboard
        );
      }
      return;
    }

    // Handle MFY selection
    if (data.startsWith('mfy:')) {
      const mfyName = data.replace('mfy:', '');
      session.mahallaName = mfyName;
      session.step = 'waiting_for_details';

      await this.sendMessage(
        chatId,
        `🏢 Hudud: *${session.districtName}*, *${session.mahallaName}*\n\n` +
        `✍️ *4-qadam:* Iltimos, muammoning qisqacha tavsifini va bog‘lanish uchun telefon raqamingizni yozib yuboring.\n` +
        `_(Masalan: "Elektr kuchlanishi 150V ga tushib ketdi, transformator ta’miri lozim. Tel: +998901234567")_`
      );
      return;
    }
  }

  // Create real Appeal object and trigger broadcast to website live dashboard
  public createAppealFromSession(session: BotSession): Appeal {
    const districtObj = ANDIJAN_DISTRICTS.find((d) => d.id === session.districtId) || ANDIJAN_DISTRICTS[0];
    const newId = `VM-AND-${Math.floor(1000 + Math.random() * 9000)}`;

    const appeal: Appeal = {
      id: newId,
      citizenName: session.citizenName || 'Telegram Fuqaro',
      phone: session.phone || '+998 90 123 45 67',
      pinfl: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
      regionId: districtObj.id,
      regionName: 'Andijon viloyati',
      districtName: districtObj.name,
      mahallaName: session.mahallaName || districtObj.mahallas[0]?.name || 'Mustaqillik MFY',
      category: ANDIJAN_CATEGORIES[0],
      title: session.title || 'Telegram orqali kelib tushgan yangi video murojaat',
      description: session.description || 'Andijon viloyati fuqarosi tomonidan Telegram bot orqali video murojaat yo‘llandi.',
      videoDuration: session.videoDuration || '01:30',
      videoUrl: session.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      status: 'yangi',
      priority: 'yuqori',
      createdAt: new Date().toISOString(),
      isNewHighlight: true,
      source: 'telegram',
      telegramUsername: session.username,
    };

    districtObj.appealCount += 1;
    districtObj.inReviewCount += 1;

    const event: ActivityEvent = {
      id: `act-${Date.now()}`,
      type: 'new_appeal',
      title: `Telegram bot: ${appeal.title}`,
      region: 'Andijon viloyati',
      district: appeal.districtName,
      timestamp: appeal.createdAt,
      appealId: appeal.id,
      citizenName: appeal.citizenName,
      status: 'yangi',
    };

    if (this.onNewAppealCallback) {
      this.onNewAppealCallback(appeal, event);
    }

    return appeal;
  }

  private getDistrictsInlineKeyboard() {
    const inline_keyboard: any[][] = [];
    for (let i = 0; i < ANDIJAN_DISTRICTS.length; i += 2) {
      const row: any[] = [];
      const d1 = ANDIJAN_DISTRICTS[i];
      row.push({ text: d1.name, callback_data: `dist:${d1.id}` });
      if (i + 1 < ANDIJAN_DISTRICTS.length) {
        const d2 = ANDIJAN_DISTRICTS[i + 1];
        row.push({ text: d2.name, callback_data: `dist:${d2.id}` });
      }
      inline_keyboard.push(row);
    }
    return { inline_keyboard };
  }

  private getMfyInlineKeyboard(district: AndijonDistrict) {
    const inline_keyboard: any[][] = [];
    const mahallas = district.mahallas.slice(0, 6);
    for (let i = 0; i < mahallas.length; i += 2) {
      const row: any[] = [];
      row.push({ text: mahallas[i].name, callback_data: `mfy:${mahallas[i].name}` });
      if (i + 1 < mahallas.length) {
        row.push({ text: mahallas[i + 1].name, callback_data: `mfy:${mahallas[i + 1].name}` });
      }
      inline_keyboard.push(row);
    }
    return { inline_keyboard };
  }

  private async sendMessage(chatId: number, text: string) {
    if (!this.token) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
        }),
      });
    } catch {}
  }

  private async sendMessageWithKeyboard(chatId: number, text: string, reply_markup: any) {
    if (!this.token) return;
    try {
      await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          reply_markup,
        }),
      });
    } catch {}
  }
}

export const telegramBotService = new TelegramBotService();
