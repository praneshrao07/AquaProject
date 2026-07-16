export type HealthStatus = 'excellent' | 'good' | 'attention' | 'critical';

export type Tank = {
  id: string;
  name: string;
  healthStatus: HealthStatus;
  healthScore: number;
  volumeLiters: number;
  lastChecked: string;
  isPlanted?: boolean;
};

export type CountdownEvent = {
  id: string;
  label: string;
  targetAt: Date;
  icon: 'feed' | 'lights';
};

export type QuickAction = {
  id: string;
  label: string;
  enabled: boolean;
  icon: 'filter' | 'heater' | 'co2' | 'feeder';
};

export type ScheduleFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom-days' | 'interval';

export type RoutineTask = {
  id: string;
  title: string;
  completed: boolean;
  alarmEnabled: boolean;
  frequency: ScheduleFrequency;
  time: string;
  dayOfWeek?: string;
  intervalDays?: number;
  customDays?: string[];
};

export type TankInhabitant = {
  id: string;
  name: string;
  species: string;
  count: number;
  temperament: 'peaceful' | 'semi-aggressive' | 'aggressive';
  notes: string;
};

export type WaterParameter = {
  id: string;
  name: string;
  idealMin: number;
  idealMax: number;
  current: number;
  unit: string;
};

export type PestReference = {
  id: string;
  name: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  action: string;
};
