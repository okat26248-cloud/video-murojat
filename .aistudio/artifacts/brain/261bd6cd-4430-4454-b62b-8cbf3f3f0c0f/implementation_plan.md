# Andijon Viloyati Fuqarolar Video Murojaatlari — Tumanlar Kesimidagi Situatsion Monitoring Markazi

Ushbu loyiha platformani to‘liq **Andijon viloyati** va uning barcha **16 ta ma’muriy-hududiy birligi** (14 ta tuman va 2 ta shahar) bo‘yicha ixtisoslashtirilgan real-vaqt monitoring va tahliliy boshqaruv markaziga aylantiradi.

### User Review & Critical Decisions

> [!IMPORTANT]
> Foydalanuvchining "faqatgina Andijon viloyati bo‘yicha tayyorlab ber, har bir tuman bo‘yicha qil" talabiga binoan, butun respublika o‘rniga viloyat darajasidagi to‘liq avtonom tizim shakllantiriladi:
> - **16 ta tuman va shahar**: Andijon shahri, Xonobod shahri, Andijon tumani, Asaka, Shahrixon, Xo‘jaobod, Baliqchi, Oltinko‘l, Marhamat, Qo‘rg‘ontepa, Bo‘ston, Buloqboshi, Izboskan, Paxtaobod, Jalaquduq, Ulug‘nor.
> - **Interaktiv SVG xarita**: Andijon viloyatining haqiqiy geografik tuzilishi asosida barcha 16 ta tuman aniq chegaralari, koordinatalari, issiqlik (heatmap) darajasi va nomlari bilan chiziladi.
> - **Ikki bosqichli tahlil**: Xaritada tuman bosilganda butun dashboard ushbu tumanga mos filtrlanadi hamda tumanning MFYlar ro‘yxati, mas’ul idoralari va video murojaatlari ochiladi.

---

### 1. Overview & Core Concept

- **Asosiy vazifasi**: Andijon viloyati hokimligi, viloyat prokuraturasi, Xalq qabulxonalari va mas’ul boshqarmalar uchun video murojaatlarni tumanlar va mahallalar kesimida real vaqt rejimida kuzatish, tahlil qilish va ijrosini nazorat qilish markazi.
- **Maqsadli auditoriya**: Viloyat va tuman hokimlari, soha rahbarlari, fuqarolar bilan ishlash bo‘limi operatorlari hamda video murojaat yo‘llovchi Andijon viloyati aholisi.
- **Asosiy qiymat**: Viloyatdagi har bir tuman va MFYdagi muammolar (elektr, gaz, yo‘l, maktab, tibbiyot, suv) dinamikasini xaritada ko‘rish, qaysi tuman ijroda oqsayotganini aniqlash va real vaqtda tezkor choralar ko‘rish.

---

### 2. User Experience & Visual Design

- **Vizual uslub va estetika**:
  - Davlat situatsion tahlil markazi (Enterprise Government Situational Center).
  - Tungi to‘q ko‘k (Dark Navy `#0B132B`, `#0F172A`) va toza yorug‘ rejim (Clean Light Mode).
  - 60-30-10 rang balansi: 60% qorong‘u fon, 30% strukturali kartalar va nozik chegara chiziqlari, 10% zumrad yashil va ko‘k urg‘ular.
  - Zero-Pill intizomi: toza tipografik matnlar va nozik ajratgichlar (`·`, `/`).
- **Xarita tajribasi (Andijan District Map)**:
  - 16 ta tuman alohida SVG path shaklida, tutash chegaralari bilan.
  - Murojaatlar soniga qarab 5 pog‘onali issiqlik darajasi (och moviydan to‘q ko‘k/indigo ranggacha).
  - Tuman ustiga borganda: tuman nomi, jami murojaat, hal etilgan foiz, eng dolzarb soha.
  - Tumanni bosganda: tuman markaziy paneli ochiladi, MFYlar bo‘yicha foizlar, eng muammoli mahallalar va to‘g‘ridan-to‘g‘ri murojaatlar ro‘yxati.
  - Yangi murojaat kelganda: tegishli tuman ustida yashil yorqin to‘lqin (ping pulse) animatsiyasi.

---

### 3. Key Product Decisions & Trade-Offs

- **16 ta to‘liq tuman qamrovi**:
  - *Yondashuv*: Andijon viloyatining barcha 14 ta tumani + 2 ta respublika/viloyat bo‘ysunuvidagi shaharlari (Andijon sh. va Xonobod sh.) to‘liq kiritiladi.
  - *Sabab*: Fuqarolar murojaatlari faqat yirik tumanlarda emas, balki Ulug‘nor, Bo‘ston, Xonobod kabi chekka hududlarda ham alohida nazoratni talab qiladi.
- **Mahallalar (MFY) darajasidagi chuqurlashuv**:
  - Har bir tuman uchun 3–5 tadan real mahalla (masalan, Asaka tumanida *Avtomobilchilar MFY, Asaka MFY, Qoratepa MFY*; Shahrixonda *Nayman MFY, Cho‘ja MFY*; Andijon shahrida *Bog‘ishamol MFY, Navro‘z MFY*) kiritiladi.
- **Server va WebSocket integratsiyasi**:
  - Serverdagi simulyatsiya va yangi murojaat qabul qilish tizimi faqat Andijon tumanlari va mahallalari ma’lumotlari bilan ishlaydi.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ANDIJON VILOYATI MONITORING                     │
│                                                                        │
│  ┌───────────────────────┐  ┌───────────────────────────────────────┐  │
│  │   Top KPI Cards       │  │ Live Status & WebSocket (Port 3000)   │  │
│  │   3,490 jami murojaat │  │ Real-vaqt aloqasi + Audio chime       │  │
│  └───────────┬───────────┘  └───────────────────┬───────────────────┘  │
│              │                                  │                      │
│              ▼                                  ▼                      │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │        Andijon Viloyati Interaktiv SVG Xaritasi (16 Tuman)       │  │
│  │   [Baliqchi] [Paxtaobod] [Izboskan] [Qo‘rg‘ontepa] [Xonobod]     │  │
│  │   [Oltinko‘l] [Andijon sh] [Andijon t] [Jalaquduq]               │  │
│  │   [Shahrixon] [Asaka] [Buloqboshi] [Xo‘jaobod] [Marhamat]        │  │
│  │   [Bo‘ston]   [Ulug‘nor]                                         │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│             ┌───────────────────────┴───────────────────────┐          │
│             ▼                                               ▼          │
│  ┌─────────────────────────────┐             ┌──────────────────────┐  │
│  │ Tuman MFY Statistikasi      │             │ Tumanlar Reytingi    │  │
│  │ Mahalla kesimidagi muammolar│             │ Gorizontal Bar Chart │  │
│  └─────────────────────────────┘             └──────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Andijon Tumanlari Video Murojaatlar Reyestri va Video Pleyer     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

- **Data Models**:
  - `AndijonDistrict`: `id`, `name`, `type ('shahar' | 'tuman')`, `center`, `population`, `path`, `labelX`, `labelY`, `appealCount`, `inReviewCount`, `resolvedCount`, `rejectedCount`, `mahallas: { name, count, resolved }[]`.
  - `Appeal`: `regionName = 'Andijon viloyati'`, `districtName`, `mahallaName`, `category`, `videoUrl`, `status`.
- **Backend API**:
  - `GET /api/stats`: Andijon viloyati jami ko‘rsatkichlari, tumanlar ro‘yxati, jonli faoliyat oqimi.
  - `GET /api/districts`: 16 ta tuman to‘liq ma’lumotlari.
  - `POST /api/appeals/new`: Yangi video murojaat yuborish (Andijon tumanlari bo‘yicha).
  - `POST /api/simulate`: Andijon tumanlari bo‘yicha avtomatik test murojaati generatsiya qilish.

---

### Key Milestones
1. **Andijon Geografik Ma'lumotlar Bazasi**: 16 ta tuman va shaharlarning to‘liq statistikasi, MFYlari va SVG polygon koordinatalarini yaratish.
2. **Andijon Interaktiv Xaritasi Komponenti**: SVG xarita, tuman hover/click effektlari, issiqlik shkalasi va tuman modalini ishlab chiqish.
3. **Diagrammalar va Statistikalarni Moslashtirish**: Dinamika, holatlar va tumanlar bo‘yicha gorizontal bar chartni Andijon ko‘rsatkichlariga o‘tkazish.
4. **Murojaatlar Bazasini Andijonga Moslash**: Video murojaatlar, fuqarolar arizalari va video pleyer ma’lumotlarini Andijon tumanlariga bog‘lash.
5. **Kompilyatsiya va Sinov**: WebSocket uzatish, audio signal, tuman filtrlash va build tekshiruvini amalga oshirish.
