export type AppealStatus = 
  | 'yangi' 
  | 'jarayonda' 
  | 'yuborilgan' 
  | 'hal_etilgan' 
  | 'rad_etilgan';

export type PriorityLevel = 'yuqori' | 'orta' | 'past';

export interface DistrictStat {
  id: string;
  name: string;
  appealCount: number;
  resolvedCount: number;
  mahallas: { name: string; count: number }[];
}

export interface RegionData {
  id: string;
  code: string;
  name: string;
  center: string;
  population: string;
  path: string;
  labelX: number;
  labelY: number;
  appealCount: number;
  inReviewCount: number;
  resolvedCount: number;
  rejectedCount: number;
  districts: DistrictStat[];
}

export interface Appeal {
  id: string;
  citizenName: string;
  phone: string;
  pinfl: string;
  regionId: string;
  regionName: string;
  districtName: string;
  mahallaName: string;
  category: string;
  title: string;
  description: string;
  videoDuration: string;
  videoThumbnail?: string;
  videoUrl?: string;
  status: AppealStatus;
  priority: PriorityLevel;
  createdAt: string;
  assignedDepartment?: string;
  assignedTo?: string;
  responseText?: string;
  responseDate?: string;
  rating?: number;
  isNewHighlight?: boolean;
  source?: 'web' | 'telegram';
  telegramUsername?: string;
}

export interface ActivityEvent {
  id: string;
  type: 'new_appeal' | 'status_change' | 'assigned' | 'resolved';
  title: string;
  region: string;
  district: string;
  timestamp: string;
  appealId: string;
  citizenName?: string;
  status?: AppealStatus;
}

export interface LiveStats {
  totalAppeals: number;
  todayAppeals: number;
  inReviewAppeals: number;
  resolvedAppeals: number;
  rejectedAppeals: number;
  assignedAppeals: number;
  resolutionRate: number; // percentage
  averageResponseDays: number;
  todayChangePercent: number;
  topRegionName: string;
  lowestRegionName: string;
  lastUpdated: string;
}

export interface DynamicChartPoint {
  label: string;
  appeals: number;
  resolved: number;
  timestamp?: string;
}

export interface ComparisonPoint {
  period: string;
  current: number;
  previous: number;
  difference: number;
}
