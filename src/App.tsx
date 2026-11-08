import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navbar } from './components/Navbar';
import { StatsCards } from './components/StatsCards';
import { AndijanMap } from './components/AndijanMap';
import { DynamicsChart } from './components/charts/DynamicsChart';
import { StatusDonutChart } from './components/charts/StatusDonutChart';
import { DistrictsBarChart } from './components/charts/DistrictsBarChart';
import { ComparisonAreaChart } from './components/charts/ComparisonAreaChart';
import { LiveActivityFeed } from './components/LiveActivityFeed';
import { TopDistrictsWidget } from './components/TopDistrictsWidget';
import { RecentAppealsList } from './components/RecentAppealsList';
import { AppealDetailModal } from './components/AppealDetailModal';
import { CitizenSubmissionModal } from './components/CitizenSubmissionModal';
import { TelegramBotModal } from './components/TelegramBotModal';
import { LiveNotificationToast } from './components/LiveNotificationToast';
import { playNewAppealChime } from './utils/audio';
import { ANDIJAN_DISTRICTS, ANDIJAN_INITIAL_APPEALS, AndijonDistrict } from './data/andijanData';
import { Appeal, LiveStats, ActivityEvent, AppealStatus } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'appeals' | 'submit'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Core Data States for Andijan Region
  const [stats, setStats] = useState<LiveStats>({
    totalAppeals: 5440,
    todayAppeals: 86,
    inReviewAppeals: 685,
    resolvedAppeals: 4480,
    rejectedAppeals: 275,
    assignedAppeals: 890,
    resolutionRate: 82.4,
    averageResponseDays: 2.1,
    todayChangePercent: 12.4,
    topRegionName: 'Andijon shahri',
    lowestRegionName: 'Ulug‘nor tumani',
    lastUpdated: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  const [districts, setDistricts] = useState<AndijonDistrict[]>(ANDIJAN_DISTRICTS);
  const [appeals, setAppeals] = useState<Appeal[]>(ANDIJAN_INITIAL_APPEALS);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([
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
  ]);

  // Selected district for filter
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);
  const [latestAppealDistrictId, setLatestAppealDistrictId] = useState<string | null>(null);

  // Active Appeal Detail Modal
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);

  // Toast notification for incoming appeal
  const [liveToast, setLiveToast] = useState<Appeal | null>(null);

  // Telegram Bot Modal state
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  // WebSocket Connection States
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Fetch initial REST data from server
  const fetchData = async () => {
    try {
      const [statsRes, appealsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/appeals'),
      ]);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.stats) setStats(statsData.stats);
        if (statsData.districts) setDistricts(statsData.districts);
        if (statsData.activityFeed) setActivityEvents(statsData.activityFeed);
      }
      if (appealsRes.ok) {
        const appealsData = await appealsRes.json();
        if (appealsData.appeals) setAppeals(appealsData.appeals);
      }
    } catch (err) {
      console.warn('Initial fetch error (fallback to local state):', err);
    }
  };

  // WebSocket initialization with auto-reconnection
  const connectWebSocket = () => {
    if (typeof window === 'undefined') return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    setIsConnecting(true);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleRealtimeMessage(data);
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        // Retry connection after 3 seconds
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
        ws.close();
      };
    } catch {
      setIsConnected(false);
      setIsConnecting(false);
    }
  };

  // Real-time Event Dispatcher
  const handleRealtimeMessage = (data: any) => {
    if (data.type === 'NEW_APPEAL') {
      const newAppeal: Appeal = data.appeal;

      // 1. Play synthesized chime sound
      playNewAppealChime();

      // 2. Set Toast notification
      setLiveToast(newAppeal);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = window.setTimeout(() => {
        setLiveToast(null);
      }, 6000);

      // 3. Mark latest district for radiant ping
      setLatestAppealDistrictId(newAppeal.regionId);

      // 4. Update stats with animated count-up
      if (data.stats) {
        setStats(data.stats);
      } else {
        setStats((prev) => ({
          ...prev,
          totalAppeals: prev.totalAppeals + 1,
          todayAppeals: prev.todayAppeals + 1,
          inReviewAppeals: prev.inReviewAppeals + 1,
          lastUpdated: new Date().toLocaleTimeString('uz-UZ'),
        }));
      }

      // 5. Prepend to appeals list with 5-second highlight
      setAppeals((prev) => {
        const withoutOld = prev.filter((a) => a.id !== newAppeal.id);
        return [{ ...newAppeal, isNewHighlight: true }, ...withoutOld];
      });

      // Clear highlight flag after 5 seconds
      window.setTimeout(() => {
        setAppeals((prev) =>
          prev.map((a) => (a.id === newAppeal.id ? { ...a, isNewHighlight: false } : a))
        );
      }, 5000);

      // 6. Prepend to activity feed
      if (data.event) {
        setActivityEvents((prev) => [data.event, ...prev.slice(0, 14)]);
      }

      // 7. Update district appeal count
      setDistricts((prev) =>
        prev.map((d) =>
          d.id === newAppeal.regionId
            ? { ...d, appealCount: d.appealCount + 1, inReviewCount: d.inReviewCount + 1 }
            : d
        )
      );
    } else if (data.type === 'STATUS_UPDATED') {
      const updated: Appeal = data.appeal;
      setAppeals((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      if (data.stats) setStats(data.stats);
      if (data.event) setActivityEvents((prev) => [data.event, ...prev.slice(0, 14)]);
    } else if (data.type === 'CONNECTED') {
      if (data.stats) setStats(data.stats);
    }
  };

  useEffect(() => {
    fetchData();
    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Quick Simulation Test Trigger (Andijan specific)
  const handleSimulateNewAppeal = async () => {
    setIsSimulating(true);
    try {
      const res = await fetch('/api/simulate', { method: 'POST' });
      if (!res.ok) throw new Error('Simulation failed');
      const data = await res.json();
      if (!isConnected) {
        handleRealtimeMessage({
          type: 'NEW_APPEAL',
          appeal: data.appeal,
          stats: data.stats,
          event: {
            id: `act-${Date.now()}`,
            type: 'new_appeal',
            title: data.appeal.title,
            region: 'Andijon viloyati',
            district: data.appeal.districtName,
            timestamp: data.appeal.createdAt,
            appealId: data.appeal.id,
            citizenName: data.appeal.citizenName,
            status: 'yangi',
          },
        });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Update Appeal Status via Operator
  const handleUpdateStatus = async (
    appealId: string,
    status: AppealStatus,
    assignedDept?: string,
    responseText?: string
  ) => {
    try {
      const res = await fetch(`/api/appeals/${appealId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedDepartment: assignedDept, responseText }),
      });
      if (res.ok) {
        const data = await res.json();
        setAppeals((prev) => prev.map((a) => (a.id === appealId ? data.appeal : a)));
        if (selectedAppeal && selectedAppeal.id === appealId) {
          setSelectedAppeal(data.appeal);
        }
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  // Open Appeal details
  const handleOpenAppeal = (appeal: Appeal) => {
    setAppeals((prev) =>
      prev.map((a) => (a.id === appeal.id ? { ...a, isNewHighlight: false } : a))
    );
    setSelectedAppeal(appeal);
  };

  const handleOpenAppealById = (appealId: string) => {
    const target = appeals.find((a) => a.id === appealId);
    if (target) handleOpenAppeal(target);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white ${isDarkMode ? 'dark' : ''}`}>
      {/* Top Government Navigation Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isConnected={isConnected}
        isConnecting={isConnecting}
        lastUpdated={stats.lastUpdated}
        onSimulate={handleSimulateNewAppeal}
        isSimulating={isSimulating}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onOpenTelegramBot={() => setIsTelegramModalOpen(true)}
        unreadCount={appeals.filter((a) => a.status === 'yangi').length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* VIEW 1: LIVE DASHBOARD */}
        {currentTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Top 6 Metric Stat Cards with Count-Up */}
            <StatsCards stats={stats} />

            {/* Grid 1: Interactive Andijan Map (16 districts) + Live Feeds */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Andijan Map (8 cols) */}
              <div className="lg:col-span-8">
                <AndijanMap
                  districts={districts}
                  selectedDistrictId={selectedDistrictId}
                  onSelectDistrict={setSelectedDistrictId}
                  latestAppealDistrictId={latestAppealDistrictId}
                  onFilterAppealsByDistrict={(distId) => {
                    setSelectedDistrictId(distId);
                  }}
                />
              </div>

              {/* Live Feeds (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <LiveActivityFeed
                  events={activityEvents}
                  onOpenAppeal={handleOpenAppealById}
                />
                <TopDistrictsWidget
                  districts={districts}
                  onSelectDistrict={(distId) => setSelectedDistrictId(distId)}
                />
              </div>
            </div>

            {/* Grid 2: Live Dynamics Line Chart & Status Donut Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7">
                <DynamicsChart />
              </div>
              <div className="lg:col-span-5">
                <StatusDonutChart stats={stats} />
              </div>
            </div>

            {/* Grid 3: Andijan Districts Bar Chart & Period Comparison Area Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6">
                <DistrictsBarChart
                  districts={districts}
                  onSelectDistrict={(distId) => setSelectedDistrictId(distId)}
                />
              </div>
              <div className="lg:col-span-6">
                <ComparisonAreaChart />
              </div>
            </div>

            {/* Bottom: Recent Appeals with Video Preview & Search */}
            <RecentAppealsList
              appeals={appeals}
              onOpenAppeal={handleOpenAppeal}
              selectedRegionId={selectedDistrictId}
              onClearRegionFilter={() => setSelectedDistrictId(null)}
            />
          </motion.div>
        )}

        {/* VIEW 2: APPEALS REGISTRY */}
        {currentTab === 'appeals' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <RecentAppealsList
              appeals={appeals}
              onOpenAppeal={handleOpenAppeal}
              selectedRegionId={selectedDistrictId}
              onClearRegionFilter={() => setSelectedDistrictId(null)}
            />
          </motion.div>
        )}

        {/* VIEW 3: CITIZEN VIDEO APPEAL SUBMISSION */}
        {currentTab === 'submit' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CitizenSubmissionModal
              onSubmitSuccess={(newAppeal) => {
                setCurrentTab('dashboard');
                handleRealtimeMessage({
                  type: 'NEW_APPEAL',
                  appeal: newAppeal,
                });
              }}
              onCancel={() => setCurrentTab('dashboard')}
            />
          </motion.div>
        )}
      </main>

      {/* Floating Top-Right Slide-in Live Notification Toast */}
      <LiveNotificationToast
        notification={liveToast}
        onDismiss={() => setLiveToast(null)}
        onOpen={(app) => {
          setSelectedAppeal(app);
          setLiveToast(null);
        }}
      />

      {/* Full Detail & Video Playback Modal with Operator Controls */}
      <AppealDetailModal
        appeal={selectedAppeal}
        onClose={() => setSelectedAppeal(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Telegram Bot Simulation & Configuration Modal */}
      <TelegramBotModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onAppealCreated={(newApp) => {
          handleRealtimeMessage({
            type: 'NEW_APPEAL',
            appeal: newApp,
          });
        }}
      />

      {/* Government Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Andijon viloyati hokimligi — Yagona fuqarolar video murojaatlari situatsion monitoring markazi</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>16 ta tuman va shahar nazorati</span>
            <span>•</span>
            <span>Reglament: 15 ish kuni</span>
            <span>•</span>
            <span>Versiya: v2.5 (Andijan Live)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
