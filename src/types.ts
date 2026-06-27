export type CrystalTheme = 'sapphire' | 'emerald' | 'amber' | 'quartz' | 'obsidian';

export interface OptimizerSettings {
  autoOptimize: boolean;
  notifyOnThreshold: boolean;
  thresholdGb: number;
  deepScanEnabled: boolean;
  crystalTheme: CrystalTheme;
  glowIntensity: 'low' | 'medium' | 'high';
  rotationSpeed: 'slow' | 'normal' | 'fast';
  processMemoryLimit: number; // in MB
  whitelistedCookies: string[];
  preserveHistoryDays: number;
}

export interface CacheFile {
  id: string;
  name: string;
  path: string;
  sizeMb: number;
  checked: boolean;
  type: 'log' | 'cache' | 'thumb' | 'temp' | 'process';
}

export interface CacheCategory {
  id: string;
  name: string;
  description: string;
  files: CacheFile[];
  expanded: boolean;
  icon: string;
}

export interface PerformancePoint {
  time: string;
  ramUsagePercent: number;
  cpuUsagePercent: number;
  cacheSizeMb: number;
}

export type ScanState = 'idle' | 'scanning' | 'scanned' | 'cleaning' | 'cleaned';

export interface SecurityShield {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: 'safe' | 'warning' | 'danger';
  icon: string;
}

export interface LicenseUser {
  id: string;
  name: string;
  email: string;
  keyEncrypted: string;
  activatedAt: string;
  devices: string;
  plan: string;
  country: string;
}

export interface InstallerPackage {
  id: string;
  name: string;
  platform: 'windows' | 'macos' | 'android' | 'ios';
  version: string;
  size: string;
  downloadCount: string;
  url: string;
}

export type ActiveView = 'optimizer' | 'security' | 'pricing' | 'licensing' | 'installers' | 'tests';

