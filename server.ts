import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANDIJAN_DISTRICTS, ANDIJAN_INITIAL_APPEALS, ANDIJAN_CATEGORIES, ANDIJAN_DEPARTMENTS, AndijonDistrict } from './src/data/andijanData.ts';
import { Appeal, LiveStats, ActivityEvent } from './src/types.ts';
import { telegramBotService } from './src/server/telegramService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(express.json({ limit: '25mb' }));

// In-memory state for Andijan Region appeals
let appeals: Appeal[] = [...ANDIJAN_INITIAL_APPEALS];
let districts: AndijonDistrict[] = [...ANDIJAN_DISTRICTS];

// Connect Telegram Bot service with live websocket broadcasts
telegramBotService.setCallback((appeal, event) => {
  appeals.unshift(appeal);
  activityFeed.unshift(event);
  const stats = computeStats();
  broadcast({
    type: 'NEW_APPEAL',
    appeal,
    stats,
    event,
  });
});

let activityFeed: ActivityEvent[] = [
  {
    id: 'act-1',
    type: 'new_appeal',
    title: 'Transformator podstansiyasidagi uzilishlar bo‘yicha video murojaat',
    region: 'Andijon viloyati',
    district: 'Andijon shahri',
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    appealId: 'VM-AND-0194',
    citizenName: 'Karimov Jasur',
    status: 'jarayonda',
  },
  {
    id: 'act-2',
    type: 'assigned',
    title: 'Oila poliklinikasi laboratoriya uskunasi murojaati boshqarmaga yo‘naltirildi',
    region: 'Andijon viloyati',
    district: 'Asaka tumani',
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    appealId: 'VM-AND-0193',
    citizenName: 'Bekmirzayeva Gulnoza',
    status: 'jarayonda',
  },
  {
    id: 'act-3',
    type: 'resolved',
    title: 'Nayman mahalla maktab yo‘li asfalti va chaqiruvchi svetofor o‘rnatildi',
    region: 'Andijon viloyati',
    district: 'Shahrixon tumani',
    timestamp: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    appealId: 'VM-AND-0192',
    citizenName: 'Xoliqov Bobur',
    status: 'hal_etilgan',
  },
  {
    id: 'act-4',
    type: 'new_appeal',
    title: 'Nasos agregati va toza ichimlik suvi bo‘yicha yangi video murojaat',
    region: 'Andijon viloyati',
    district: 'Baliqchi tumani',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    appealId: 'VM-AND-0189',
    citizenName: 'Oripov Dostonbek',
    status: 'yangi',
  }
];

// Helper to compute live dashboard metrics for Andijan
function computeStats(): LiveStats {
  const baseAppealsCount = 5440; // Total baseline across all 16 districts
  const extraAppeals = appeals.length - ANDIJAN_INITIAL_APPEALS.length;
  const total = baseAppealsCount + extraAppeals;
  
  const todayCount = 86 + extraAppeals;
  const resolved = Math.round(total * 0.824);
  const inReview = Math.round(total * 0.125);
  const rejected = total - resolved - inReview;
  const resolutionRate = parseFloat(((resolved / total) * 100).toFixed(1));

  return {
    totalAppeals: total,
    todayAppeals: todayCount,
    inReviewAppeals: inReview,
    resolvedAppeals: resolved,
    rejectedAppeals: rejected,
    assignedAppeals: inReview + Math.round(total * 0.05),
    resolutionRate,
    averageResponseDays: 2.1,
    todayChangePercent: 12.4,
    topRegionName: 'Andijon shahri',
    lowestRegionName: 'Ulug‘nor tumani',
    lastUpdated: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

// Broadcast to all active WebSocket clients
function broadcast(payload: Record<string, unknown>) {
  const message = JSON.stringify(payload);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (err) {
        console.error('WebSocket send error:', err);
      }
    }
  });
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    stats: computeStats(),
    appealsCount: appeals.length,
    timestamp: new Date().toISOString(),
  }));
});

// REST API Endpoints
app.get('/api/stats', (_req, res) => {
  const stats = computeStats();
  res.json({
    stats,
    districts,
    activityFeed: activityFeed.slice(0, 15),
  });
});

app.get('/api/appeals', (req, res) => {
  let filtered = [...appeals];
  const { status, districtId, category, search } = req.query;

  if (status && status !== 'all') {
    filtered = filtered.filter(a => a.status === status);
  }
  if (districtId && districtId !== 'all') {
    filtered = filtered.filter(a => a.regionId === districtId);
  }
  if (category && category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }
  if (search && typeof search === 'string' && search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(a => 
      a.title.toLowerCase().includes(q) ||
      a.citizenName.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q) ||
      a.districtName.toLowerCase().includes(q) ||
      a.mahallaName.toLowerCase().includes(q)
    );
  }

  // Sort by created date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ appeals: filtered, total: filtered.length });
});

// New Appeal Submission
app.post('/api/appeals/new', (req, res) => {
  const body = req.body;
  if (!body.citizenName || !body.regionId || !body.title) {
    return res.status(400).json({ error: 'Majburiy maydonlar to‘liq kiritilmadi' });
  }

  const districtObj = districts.find(d => d.id === body.regionId);
  const newId = `VM-AND-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const newAppeal: Appeal = {
    id: newId,
    citizenName: body.citizenName,
    phone: body.phone || '+998 90 000 00 00',
    pinfl: body.pinfl || `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
    regionId: body.regionId,
    regionName: 'Andijon viloyati',
    districtName: districtObj ? districtObj.name : body.districtName || 'Andijon shahri',
    mahallaName: body.mahallaName || 'Mustaqillik MFY',
    category: body.category || ANDIJAN_CATEGORIES[0],
    title: body.title,
    description: body.description || 'Andijon viloyati fuqarosining rasmiy video murojaati qabul qilindi.',
    videoDuration: body.videoDuration || '01:30',
    videoUrl: body.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'yangi',
    priority: body.priority || 'yuqori',
    createdAt: new Date().toISOString(),
    isNewHighlight: true,
  };

  appeals.unshift(newAppeal);

  // Update district counts
  if (districtObj) {
    districtObj.appealCount += 1;
    districtObj.inReviewCount += 1;
  }

  // Add to activity feed
  const newEvent: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: 'new_appeal',
    title: newAppeal.title,
    region: 'Andijon viloyati',
    district: newAppeal.districtName,
    timestamp: newAppeal.createdAt,
    appealId: newAppeal.id,
    citizenName: newAppeal.citizenName,
    status: 'yangi',
  };
  activityFeed.unshift(newEvent);

  const stats = computeStats();

  // Real-time broadcast
  broadcast({
    type: 'NEW_APPEAL',
    appeal: newAppeal,
    stats,
    event: newEvent,
  });

  return res.status(201).json({ success: true, appeal: newAppeal, stats });
});

// Telegram Bot Endpoints
app.get('/api/telegram/status', (req, res) => {
  const status = telegramBotService.getStatus();
  const host = req.get('host');
  res.json({
    ...status,
    webhookUrl: `${req.protocol}://${host}/api/telegram/webhook`,
    availableDistrictsCount: districts.length,
  });
});

app.post('/api/telegram/config', (req, res) => {
  const { token } = req.body;
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'Token kiritilmadi' });
  }
  telegramBotService.setToken(token);
  res.json({ success: true, status: telegramBotService.getStatus() });
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await telegramBotService.handleUpdate(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Internal webhook error' });
  }
});

// Telegram Simulator Direct Appeal Submission
app.post('/api/telegram/simulate-appeal', (req, res) => {
  const { citizenName, phone, districtId, mahallaName, title, description, videoUrl, videoDuration, username } = req.body;

  const districtObj = districts.find(d => d.id === districtId) || districts[0];
  const newId = `VM-AND-${Math.floor(1000 + Math.random() * 9000)}`;

  const newAppeal: Appeal = {
    id: newId,
    citizenName: citizenName || 'Telegram Fuqaro',
    phone: phone || '+998 90 123 45 67',
    pinfl: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
    regionId: districtObj.id,
    regionName: 'Andijon viloyati',
    districtName: districtObj.name,
    mahallaName: mahallaName || districtObj.mahallas[0]?.name || 'Mustaqillik MFY',
    category: ANDIJAN_CATEGORIES[0],
    title: title || `${districtObj.name} bo‘yicha Telegram video murojaati`,
    description: description || 'Andijon viloyati fuqarosi tomonidan Telegram bot orqali video murojaat qoldirildi.',
    videoDuration: videoDuration || '01:25',
    videoUrl: videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'yangi',
    priority: 'yuqori',
    createdAt: new Date().toISOString(),
    isNewHighlight: true,
    source: 'telegram',
    telegramUsername: username || '@andijon_fuqaro',
  };

  appeals.unshift(newAppeal);
  districtObj.appealCount += 1;
  districtObj.inReviewCount += 1;

  const newEvent: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: 'new_appeal',
    title: `Telegram bot: ${newAppeal.title}`,
    region: 'Andijon viloyati',
    district: newAppeal.districtName,
    timestamp: newAppeal.createdAt,
    appealId: newAppeal.id,
    citizenName: newAppeal.citizenName,
    status: 'yangi',
  };
  activityFeed.unshift(newEvent);

  const stats = computeStats();

  broadcast({
    type: 'NEW_APPEAL',
    appeal: newAppeal,
    stats,
    event: newEvent,
  });

  res.status(201).json({ success: true, appeal: newAppeal, stats });
});

// Update Status / Assign Department
app.patch('/api/appeals/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, assignedDepartment, responseText } = req.body;

  const target = appeals.find(a => a.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Murojaat topilmadi' });
  }

  if (status) target.status = status;
  if (assignedDepartment) target.assignedDepartment = assignedDepartment;
  if (responseText) {
    target.responseText = responseText;
    target.responseDate = new Date().toISOString();
  }

  const districtObj = districts.find(d => d.id === target.regionId);
  if (districtObj && status === 'hal_etilgan') {
    districtObj.resolvedCount += 1;
    if (districtObj.inReviewCount > 0) districtObj.inReviewCount -= 1;
  }

  const statusEvent: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: status === 'hal_etilgan' ? 'resolved' : 'status_change',
    title: `${target.title.slice(0, 45)}... holati o‘zgardi`,
    region: 'Andijon viloyati',
    district: target.districtName,
    timestamp: new Date().toISOString(),
    appealId: target.id,
    citizenName: target.citizenName,
    status: target.status,
  };
  activityFeed.unshift(statusEvent);

  const stats = computeStats();

  broadcast({
    type: 'STATUS_UPDATED',
    appeal: target,
    stats,
    event: statusEvent,
  });

  res.json({ success: true, appeal: target, stats });
});

// Simulation endpoint for test demo specifically in Andijan Region
app.post('/api/simulate', (_req, res) => {
  const sampleCitizens = [
    { name: 'Xolmatov Shahzodbek Ikromjon o‘g‘li', phone: '+998 90 256 14 78' },
    { name: 'Normurodova Nilufarxon Qobil qizi', phone: '+998 93 412 88 90' },
    { name: 'Azimov Doniyorbek Abdullayevich', phone: '+998 97 714 55 33' },
    { name: 'Qosimova Madinabonu Shuhratovna', phone: '+998 94 332 99 11' },
    { name: 'Rustamov Ilhomjon Toxirovich', phone: '+998 91 605 44 22' },
  ];

  const sampleIssues = [
    {
      category: 'Kommunal xizmatlar va energetika (Elektr, gaz, issiqlik)',
      title: 'Kuz-qish mavsumida gaz bosimi pasayishi va yangi taqsimlagich zarurati',
      desc: 'Mahallamizda sovuq kunlar kelishi bilan tabiiy gaz bosimi keskin tushib ketdi. Isitish tizimi to‘xtab qolmoqda. Mutasaddilardan gaz taqsimlash punktini zudlik bilan sozlashni so‘raymiz.',
    },
    {
      category: 'Yo‘l infratuzilmasi va jamoat transporti',
      title: 'Qishloq markaziy yo‘lini ta’mirlash va yoritkichlar o‘rnatish',
      desc: 'Kuzgi yomg‘ir oqibatida yo‘l qoplamasi yaroqsiz holga keldi. Avtomobillar va piyodalar harakatlanishi qiyinlashgan.',
    },
    {
      category: 'Qishloq xo‘jaligi, irrigatsiya va sug‘orish suvi',
      title: 'Tomorqalarni sug‘orish uchun ichki ariqlarni betonlash masalasida',
      desc: 'Suv yo‘qotilishining oldini olish uchun 600 metr masofadagi ariqni beton novlar bilan qoplashda texnika yordami zarur.',
    },
    {
      category: 'Ta‘lim va maktabgacha ta’lim sharoitlari',
      title: 'Maktab o‘quvchilari uchun qo‘shimcha sinfxonalar binosi qurilishi',
      desc: 'Maktabimizda o‘quvchilar soni koeffitsiyenti 1.8 ga yetgan. Ikkinchi smenada o‘qishni yengillashtirish uchun yangi blok zarur.',
    },
  ];

  const randomCitizen = sampleCitizens[Math.floor(Math.random() * sampleCitizens.length)];
  const randomIssue = sampleIssues[Math.floor(Math.random() * sampleIssues.length)];
  const randomDistrict = districts[Math.floor(Math.random() * districts.length)];
  const randomMahalla = randomDistrict.mahallas[0]?.name || 'Mustaqillik MFY';

  const newId = `VM-AND-${Math.floor(1000 + Math.random() * 9000)}`;
  const simAppeal: Appeal = {
    id: newId,
    citizenName: randomCitizen.name,
    phone: randomCitizen.phone,
    pinfl: `${Math.floor(10000000000000 + Math.random() * 90000000000000)}`,
    regionId: randomDistrict.id,
    regionName: 'Andijon viloyati',
    districtName: randomDistrict.name,
    mahallaName: randomMahalla,
    category: randomIssue.category,
    title: randomIssue.title,
    description: randomIssue.desc,
    videoDuration: '01:52',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    status: 'yangi',
    priority: 'yuqori',
    createdAt: new Date().toISOString(),
    isNewHighlight: true,
  };

  appeals.unshift(simAppeal);
  randomDistrict.appealCount += 1;
  randomDistrict.inReviewCount += 1;

  const simEvent: ActivityEvent = {
    id: `act-${Date.now()}`,
    type: 'new_appeal',
    title: simAppeal.title,
    region: 'Andijon viloyati',
    district: simAppeal.districtName,
    timestamp: simAppeal.createdAt,
    appealId: simAppeal.id,
    citizenName: simAppeal.citizenName,
    status: 'yangi',
  };
  activityFeed.unshift(simEvent);

  const stats = computeStats();

  broadcast({
    type: 'NEW_APPEAL',
    appeal: simAppeal,
    stats,
    event: simEvent,
  });

  res.json({ success: true, appeal: simAppeal, stats });
});

// Vite middleware or static serving
async function startServer() {
  const PORT = 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
