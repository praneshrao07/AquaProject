import type {
  CountdownEvent,
  PestReference,
  QuickAction,
  RoutineTask,
  Tank,
  TankInhabitant,
  WaterParameter,
} from '@/types/aquarium';

function hoursFromNow(hours: number): Date {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  date.setMinutes(date.getMinutes() + Math.floor(Math.random() * 20));
  date.setSeconds(0);
  return date;
}

function minutesFromNow(minutes: number): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + minutes);
  date.setSeconds(0);
  return date;
}

export const mockTank: Tank = {
  id: 'tank-main',
  name: 'Main Tank',
  healthStatus: 'excellent',
  healthScore: 94,
  volumeLiters: 120,
  lastChecked: 'Today · 07:42 AM',
};

export const mockCountdowns: CountdownEvent[] = [
  {
    id: 'feed-next',
    label: 'Next Feed',
    targetAt: minutesFromNow(142),
    icon: 'feed',
  },
  {
    id: 'lights-off',
    label: 'Lights Off',
    targetAt: hoursFromNow(6),
    icon: 'lights',
  },
];

export const initialQuickActions: QuickAction[] = [
  { id: 'filter', label: 'Filter Pump', enabled: true, icon: 'filter' },
  { id: 'heater', label: 'Heater', enabled: true, icon: 'heater' },
  { id: 'co2', label: 'CO₂ Injector', enabled: false, icon: 'co2' },
  { id: 'feeder', label: 'Auto Feeder', enabled: true, icon: 'feeder' },
];

export const initialRoutineTasks: RoutineTask[] = [
  {
    id: 'task-1',
    title: 'Morning feed — flakes & pellets',
    completed: true,
    alarmEnabled: true,
    frequency: 'daily',
    time: '08:00 AM',
  },
  {
    id: 'task-2',
    title: 'Test water parameters',
    completed: false,
    alarmEnabled: true,
    frequency: 'weekly',
    time: '10:00 AM',
    dayOfWeek: 'Sunday',
  },
  {
    id: 'task-3',
    title: '25% partial water change',
    completed: false,
    alarmEnabled: false,
    frequency: 'biweekly',
    time: '06:00 PM',
    dayOfWeek: 'Saturday',
  },
  {
    id: 'task-4',
    title: 'Trim foreground plants',
    completed: false,
    alarmEnabled: true,
    frequency: 'monthly',
    time: '02:00 PM',
    dayOfWeek: 'First Saturday',
  },
  {
    id: 'task-5',
    title: 'Clean filter media rinse',
    completed: false,
    alarmEnabled: true,
    frequency: 'monthly',
    time: '11:00 AM',
    dayOfWeek: 'Third Sunday',
  },
];

export const mockInhabitants: TankInhabitant[] = [
  {
    id: 'fish-1',
    name: 'Neon Tetra',
    species: 'Paracheirodon innesi',
    count: 12,
    temperament: 'peaceful',
    notes: 'Schooling fish — keep in groups of 6+',
  },
  {
    id: 'fish-2',
    name: 'German Blue Ram',
    species: 'Mikrogeophagus ramirezi',
    count: 2,
    temperament: 'semi-aggressive',
    notes: 'Pair bonded; prefers soft acidic water',
  },
  {
    id: 'fish-3',
    name: 'Amano Shrimp',
    species: 'Caridina multidentata',
    count: 8,
    temperament: 'peaceful',
    notes: 'Excellent algae crew; avoid copper meds',
  },
  {
    id: 'fish-4',
    name: 'Otocinclus',
    species: 'Otocinclus vittatus',
    count: 4,
    temperament: 'peaceful',
    notes: 'Supplement with blanched vegetables',
  },
];

export const mockWaterParameters: WaterParameter[] = [
  { id: 'ph', name: 'pH', idealMin: 6.5, idealMax: 7.2, current: 6.8, unit: '' },
  { id: 'temp', name: 'Temperature', idealMin: 24, idealMax: 26, current: 25.4, unit: '°C' },
  { id: 'ammonia', name: 'Ammonia', idealMin: 0, idealMax: 0, current: 0, unit: 'ppm' },
  { id: 'nitrite', name: 'Nitrite', idealMin: 0, idealMax: 0.25, current: 0, unit: 'ppm' },
  { id: 'nitrate', name: 'Nitrate', idealMin: 0, idealMax: 20, current: 12, unit: 'ppm' },
  { id: 'kh', name: 'KH (Carbonate)', idealMin: 3, idealMax: 8, current: 5, unit: 'dKH' },
  { id: 'gh', name: 'GH (General Hardness)', idealMin: 4, idealMax: 10, current: 7, unit: 'dGH' },
];

export const mockPestReferences: PestReference[] = [
  {
    id: 'pest-1',
    name: 'Planaria (Flatworms)',
    threatLevel: 'medium',
    description: 'Tiny white/tan worms on glass and substrate. Harmless to fish but indicate overfeeding.',
    action: 'Reduce feeding, trap with meat bait, consider Panacur (0.1 mg/L) if severe.',
  },
  {
    id: 'pest-2',
    name: 'Hydra',
    threatLevel: 'low',
    description: 'Microscopic stinging polyps on plants and hardscape. Dangerous to fry and shrimplets.',
    action: 'Manual removal, increase water flow, Fenbendazole treatment as last resort.',
  },
  {
    id: 'pest-3',
    name: 'Dragonfly / Damselfly Nymphs',
    threatLevel: 'critical',
    description: 'Predatory aquatic larvae that hunt shrimp and small fish. Often hitchhike on plants.',
    action: 'Remove immediately with tweezers. Quarantine all new plants 2 weeks minimum.',
  },
  {
    id: 'pest-4',
    name: 'Snail Infestation (Bladder/MTS)',
    threatLevel: 'low',
    description: 'Population explosion from overfeeding. Mostly beneficial but unsightly at scale.',
    action: 'Assassin snails, manual removal, reduce food input, lettuce trap overnight.',
  },
  {
    id: 'pest-5',
    name: 'Ich (White Spot Disease)',
    threatLevel: 'high',
    description: 'White salt-grain spots on fins and body. Highly contagious parasitic outbreak.',
    action: 'Raise temp to 28°C, aquarium salt or formalin-based treatment, isolate affected fish.',
  },
];

export function formatSchedule(task: RoutineTask): string {
  const freqLabel =
    task.frequency === 'daily'
      ? 'Daily'
      : task.frequency === 'weekly'
        ? 'Weekly'
        : task.frequency === 'biweekly'
          ? 'Bi-weekly'
          : 'Monthly';

  if (task.frequency === 'daily') {
    return `${freqLabel} · ${task.time}`;
  }
  return `${freqLabel} · ${task.dayOfWeek ?? '—'} · ${task.time}`;
}

export function getHealthLabel(status: Tank['healthStatus']): string {
  switch (status) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'attention':
      return 'Needs Attention';
    case 'critical':
      return 'Critical';
  }
}
