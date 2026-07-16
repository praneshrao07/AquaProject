import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { useAuth } from './AuthContext';
import {
  initialQuickActions,
  initialRoutineTasks,
  mockCountdowns,
  mockInhabitants,
  mockTank,
  mockWaterParameters,
} from '@/data/mockAquariumData';
import type {
  CountdownEvent,
  QuickAction,
  RoutineTask,
  Tank,
  TankInhabitant,
  WaterParameter,
} from '@/types/aquarium';

function parseTimeString(timeStr: string): { hour: number; minute: number } {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return { hour: 9, minute: 0 };
  let hour = parseInt(match[1]);
  const minute = parseInt(match[2]);
  const ampm = match[3];

  if (ampm) {
    if (ampm.toUpperCase() === 'PM' && hour < 12) {
      hour += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour === 12) {
      hour = 0;
    }
  }
  return { hour, minute };
}

function getWeekdayNumber(dayName: string): number {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const idx = days.indexOf(dayName.toLowerCase());
  return idx !== -1 ? idx + 1 : 1;
}

function calculateNextExecution(task: RoutineTask): Date {
  const { hour, minute } = parseTimeString(task.time);
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);

  if (task.frequency === 'daily') {
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  } else if (task.frequency === 'weekly' || task.frequency === 'biweekly') {
    const targetWeekday = getWeekdayNumber(task.dayOfWeek || 'Sunday');
    const currentWeekday = now.getDay() + 1;
    let diff = targetWeekday - currentWeekday;
    if (diff < 0 || (diff === 0 && next <= now)) {
      diff += task.frequency === 'biweekly' ? 14 : 7;
    }
    next.setDate(next.getDate() + diff);
  } else if (task.frequency === 'monthly') {
    if (next <= now) {
      next.setMonth(next.getMonth() + 1);
    }
  } else if (task.frequency === 'interval') {
    const days = task.intervalDays || 3;
    next.setDate(next.getDate() + days);
  } else if (task.frequency === 'custom-days' && task.customDays && task.customDays.length > 0) {
    const dayMap: Record<string, number> = { Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7 };
    let minNext = new Date(now.getTime() + 100 * 24 * 3600 * 1000);
    for (const d of task.customDays) {
      const targetWeekday = dayMap[d] || 1;
      const currentWeekday = now.getDay() + 1;
      let diff = targetWeekday - currentWeekday;
      if (diff < 0 || (diff === 0 && next <= now)) {
        diff += 7;
      }
      const potential = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
      potential.setDate(potential.getDate() + diff);
      if (potential < minNext) {
        minNext = potential;
      }
    }
    next = minNext;
  }
  return next;
}

async function scheduleTaskNotification(task: RoutineTask) {
  try {
    await Notifications.cancelScheduledNotificationAsync(task.id);
    for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']) {
      await Notifications.cancelScheduledNotificationAsync(`${task.id}-${day}`);
    }
  } catch (e) {}

  if (task.completed) return;

  const { hour, minute } = parseTimeString(task.time);

  const baseContent = {
    title: 'Routine Reminder!',
    body: task.title,
    sound: true,
    vibrate: [0, 1000, 500, 1000, 500, 1000, 500, 1000],
    priority: 'max',
    sticky: true,
    ongoing: true,
    autoDismiss: false,
    categoryIdentifier: 'timer-alarm',
    android: {
      sticky: true,
      ongoing: true,
    },
    data: { taskId: task.id, type: 'routine-task' },
  };

  if (task.frequency === 'daily') {
    await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: baseContent as any,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: 'alarm-vibration-channel-v3',
      },
    });
  } else if (task.frequency === 'weekly') {
    const weekday = getWeekdayNumber(task.dayOfWeek || 'Sunday');
    await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: baseContent as any,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: 'alarm-vibration-channel-v3',
      },
    });
  } else if (task.frequency === 'biweekly') {
    const weekday = getWeekdayNumber(task.dayOfWeek || 'Sunday');
    await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: baseContent as any,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
        channelId: 'alarm-vibration-channel-v3',
      },
    });
  } else if (task.frequency === 'monthly') {
    await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: baseContent as any,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
        day: 1,
        hour,
        minute,
        channelId: 'alarm-vibration-channel-v3',
      },
    });
  } else if (task.frequency === 'interval') {
    const days = task.intervalDays || 3;
    await Notifications.scheduleNotificationAsync({
      identifier: task.id,
      content: baseContent as any,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: days * 24 * 3600,
        repeats: true,
        channelId: 'alarm-vibration-channel-v3',
      },
    });
  } else if (task.frequency === 'custom-days' && task.customDays) {
    const dayMap: Record<string, string> = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
      Sun: 'Sunday',
    };
    for (const day of task.customDays) {
      const fullDayName = dayMap[day] || 'Sunday';
      const weekday = getWeekdayNumber(fullDayName);
      await Notifications.scheduleNotificationAsync({
        identifier: `${task.id}-${day}`,
        content: baseContent as any,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          channelId: 'alarm-vibration-channel-v3',
        },
      });
    }
  }
}

let globalContextHandlers: {
  updateCountdown: (id: string, targetAt: Date) => Promise<void>;
  updateRoutineTaskCompleteAndSchedule: (taskId: string) => Promise<void>;
} | null = null;

Notifications.addNotificationResponseReceivedListener(async (response) => {
  if (response.actionIdentifier === 'dismiss-alarm') {
    const id = response.notification.request.identifier;
    try {
      await Notifications.dismissNotificationAsync(id);
    } catch (e) {
      console.error('Failed to dismiss notification:', e);
    }

    try {
      Vibration.cancel();
    } catch (e) {
      console.error('Failed to cancel vibration:', e);
    }

    const data = response.notification.request.content.data;
    if (data) {
      if (globalContextHandlers) {
        if (data.eventId) {
          const eventId = data.eventId as string;
          const target = new Date();
          if (eventId === 'feed-next') {
            target.setMinutes(target.getMinutes() + 240); // 4 hours
          } else {
            target.setMinutes(target.getMinutes() + 360); // 6 hours
          }
          await globalContextHandlers.updateCountdown(eventId, target);
        } else if (data.taskId) {
          await globalContextHandlers.updateRoutineTaskCompleteAndSchedule(data.taskId as string);
        }
      } else {
        try {
          const sessionStr = await AsyncStorage.getItem('@aqua_project_user_session');
          if (sessionStr) {
            const sessionUser = JSON.parse(sessionStr);
            const userId = sessionUser.id;
            const key = `@aqua_data_user_${userId}`;
            const dataStr = await AsyncStorage.getItem(key);
            if (dataStr) {
              const parsedData = JSON.parse(dataStr);
              if (data.eventId) {
                const eventId = data.eventId as string;
                const target = new Date();
                if (eventId === 'feed-next') {
                  target.setMinutes(target.getMinutes() + 240); // 4 hours
                } else {
                  target.setMinutes(target.getMinutes() + 360); // 6 hours
                }
                if (parsedData.countdowns) {
                  parsedData.countdowns = parsedData.countdowns.map((c: any) =>
                    c.id === eventId ? { ...c, targetAt: target.toISOString() } : c
                  );
                }
                await AsyncStorage.setItem(key, JSON.stringify(parsedData));
              } else if (data.taskId) {
                const taskId = data.taskId as string;
                if (parsedData.routineTasks) {
                  const taskIndex = parsedData.routineTasks.findIndex((t: any) => t.id === taskId);
                  if (taskIndex !== -1) {
                    const task = parsedData.routineTasks[taskIndex];
                    const nextExec = calculateNextExecution(task);
                    await Notifications.scheduleNotificationAsync({
                      identifier: task.id,
                      content: {
                        title: 'Routine Reminder!',
                        body: task.title,
                        sound: true,
                        vibrate: [0, 1000, 500, 1000, 500, 1000, 500, 1000],
                        priority: 'max',
                        sticky: true,
                        ongoing: true,
                        autoDismiss: false,
                        categoryIdentifier: 'timer-alarm',
                        android: {
                          sticky: true,
                          ongoing: true,
                        },
                        data: { taskId: task.id, type: 'routine-task' },
                      } as any,
                      trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DATE,
                        date: nextExec,
                        channelId: 'alarm-vibration-channel-v3',
                        enableInForeground: true,
                      } as any,
                    });
                    if (task.completed) {
                      task.completed = false;
                    }
                    await AsyncStorage.setItem(key, JSON.stringify(parsedData));
                  }
                }
              }
            }
          }
        } catch (storageErr) {
          console.error('Error handling background action in storage:', storageErr);
        }
      }
    }
  }
});

function calculateParameterScore(p: WaterParameter): number {
  if (p.current >= p.idealMin && p.current <= p.idealMax) {
    return 100;
  }
  
  const id = p.id.toLowerCase();
  
  // Specific toxic parameters: Ammonia and Nitrite
  if (id === 'ammonia') {
    // idealMax is 0. Any value > 0 is penalized heavily.
    // E.g., 0.25 ppm drops score by 100% (to 0)
    return Math.max(0, 100 - Math.round(p.current * 400));
  }
  
  if (id === 'nitrite') {
    // idealMax is 0.25. Any value > 0.25 is penalized heavily.
    // E.g., 0.25 ppm above idealMax (i.e. current = 0.5) drops score by 100%
    const deviation = p.current - p.idealMax;
    return Math.max(0, 100 - Math.round(deviation * 400));
  }

  // Other parameters (pH, Temperature, Nitrate, KH, GH)
  if (p.current < p.idealMin) {
    const boundary = p.idealMin;
    const diff = boundary - p.current;
    const range = boundary || 1;
    const deviation = diff / range;
    return Math.max(0, 100 - Math.round(deviation * 100));
  } else {
    const boundary = p.idealMax;
    const diff = p.current - boundary;
    const range = boundary || 1;
    const deviation = diff / range;
    return Math.max(0, 100 - Math.round(deviation * 100));
  }
}

export function calculateOverallHealth(parameters: WaterParameter[]): { score: number; status: Tank['healthStatus'] } {
  if (!parameters || parameters.length === 0) {
    return { score: 100, status: 'excellent' };
  }

  let totalScore = 0;
  parameters.forEach(p => {
    totalScore += calculateParameterScore(p);
  });

  const averageScore = Math.round(totalScore / parameters.length);
  const finalScore = Math.max(10, Math.min(100, averageScore));

  let status: Tank['healthStatus'] = 'excellent';
  if (finalScore < 60) {
    status = 'critical';
  } else if (finalScore < 80) {
    status = 'attention';
  } else if (finalScore < 90) {
    status = 'good';
  }

  return { score: finalScore, status };
}

type AquariumDataContextValue = {
  tank: Tank;
  countdowns: CountdownEvent[];
  quickActions: QuickAction[];
  routineTasks: RoutineTask[];
  inhabitants: TankInhabitant[];
  waterParameters: WaterParameter[];
  isLoading: boolean;
  updateTank: (updated: Partial<Tank>) => Promise<void>;
  updateCountdown: (id: string, targetAt: Date) => Promise<void>;
  toggleQuickAction: (id: string) => Promise<void>;
  addRoutineTask: (
    title: string,
    time?: string,
    frequency?: RoutineTask['frequency'],
    dayOfWeek?: string,
    intervalDays?: number,
    customDays?: string[]
  ) => Promise<void>;
  toggleRoutineTaskComplete: (id: string) => Promise<void>;
  toggleRoutineTaskAlarm: (id: string) => Promise<void>;
  removeRoutineTask: (id: string) => Promise<void>;
  addInhabitant: (
    name: string,
    species: string,
    count: number,
    temperament: TankInhabitant['temperament'],
    notes: string
  ) => Promise<void>;
  updateInhabitant: (id: string, updated: Partial<TankInhabitant>) => Promise<void>;
  removeInhabitant: (id: string) => Promise<void>;
  updateWaterParameter: (id: string, current: number) => Promise<void>;
  resetAllData: () => Promise<void>;
};

const AquariumDataContext = createContext<AquariumDataContextValue | null>(null);

function getStorageKey(userId: string) {
  return `@aqua_data_user_${userId}`;
}

export function AquariumDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [tank, setTank] = useState<Tank>(mockTank);
  const [countdowns, setCountdowns] = useState<CountdownEvent[]>(mockCountdowns);
  const [quickActions, setQuickActions] = useState<QuickAction[]>(initialQuickActions);
  const [routineTasks, setRoutineTasks] = useState<RoutineTask[]>(initialRoutineTasks);
  const [inhabitants, setInhabitants] = useState<TankInhabitant[]>(mockInhabitants);
  const [waterParameters, setWaterParameters] = useState<WaterParameter[]>(mockWaterParameters);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data when user changes
  useEffect(() => {
    async function loadUserData() {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const key = getStorageKey(user.id);
        const dataStr = await AsyncStorage.getItem(key);
        if (dataStr) {
          const parsed = JSON.parse(dataStr);
          if (parsed.tank) setTank(parsed.tank);
          if (parsed.countdowns) {
            // Map ISO target strings back to Date objects
            const loadedCountdowns = parsed.countdowns.map((c: any) => ({
              ...c,
              targetAt: new Date(c.targetAt),
            }));
            setCountdowns(loadedCountdowns);
          }
          if (parsed.quickActions) setQuickActions(parsed.quickActions);
          if (parsed.routineTasks) setRoutineTasks(parsed.routineTasks);
          if (parsed.inhabitants) setInhabitants(parsed.inhabitants);
          if (parsed.waterParameters) setWaterParameters(parsed.waterParameters);
        } else {
          // Initialize user storage with mock defaults
          const defaultData = {
            tank: mockTank,
            countdowns: mockCountdowns.map(c => ({ ...c, targetAt: c.targetAt.toISOString() })),
            quickActions: initialQuickActions,
            routineTasks: initialRoutineTasks,
            inhabitants: mockInhabitants,
            waterParameters: mockWaterParameters,
          };
          await AsyncStorage.setItem(key, JSON.stringify(defaultData));
          setTank(mockTank);
          setCountdowns(mockCountdowns);
          setQuickActions(initialQuickActions);
          setRoutineTasks(initialRoutineTasks);
          setInhabitants(mockInhabitants);
          setWaterParameters(mockWaterParameters);
        }
      } catch (e) {
        console.error('Failed to load aquarium data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserData();
  }, [user]);


  const saveState = useCallback(
    async (
      updatedTank: Tank,
      updatedCountdowns: CountdownEvent[],
      updatedActions: QuickAction[],
      updatedTasks: RoutineTask[],
      updatedInhabitants: TankInhabitant[],
      updatedParameters: WaterParameter[]
    ) => {
      if (!user) return;
      try {
        const key = getStorageKey(user.id);
        const dataToSave = {
          tank: updatedTank,
          countdowns: updatedCountdowns.map(c => ({
            ...c,
            targetAt: c.targetAt.toISOString(),
          })),
          quickActions: updatedActions,
          routineTasks: updatedTasks,
          inhabitants: updatedInhabitants,
          waterParameters: updatedParameters,
        };
        await AsyncStorage.setItem(key, JSON.stringify(dataToSave));
      } catch (e) {
        console.error('Failed to save aquarium data:', e);
      }
    },
    [user]
  );

  const updateTank = useCallback(
    async (updated: Partial<Tank>) => {
      const { score, status } = calculateOverallHealth(waterParameters);
      const nextTank = {
        ...tank,
        ...updated,
        healthScore: score,
        healthStatus: status,
      };
      setTank(nextTank);
      await saveState(nextTank, countdowns, quickActions, routineTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const updateCountdown = useCallback(
    async (id: string, targetAt: Date) => {
      const nextCountdowns = countdowns.map(c => (c.id === id ? { ...c, targetAt } : c));
      setCountdowns(nextCountdowns);
      await saveState(tank, nextCountdowns, quickActions, routineTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const toggleQuickAction = useCallback(
    async (id: string) => {
      const nextActions = quickActions.map(a => (a.id === id ? { ...a, enabled: !a.enabled } : a));
      setQuickActions(nextActions);
      await saveState(tank, countdowns, nextActions, routineTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const addRoutineTask = useCallback(
    async (
      title: string,
      time = '09:00 AM',
      frequency: RoutineTask['frequency'] = 'daily',
      dayOfWeek?: string,
      intervalDays?: number,
      customDays?: string[]
    ) => {
      const newTask: RoutineTask = {
        id: `task-${Date.now()}`,
        title,
        completed: false,
        alarmEnabled: true,
        frequency,
        time,
        dayOfWeek,
        intervalDays,
        customDays,
      };
      const nextTasks = [newTask, ...routineTasks];
      setRoutineTasks(nextTasks);
      await saveState(tank, countdowns, quickActions, nextTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const toggleRoutineTaskComplete = useCallback(
    async (id: string) => {
      const nextTasks = routineTasks.map(t => (t.id === id ? { ...t, completed: !t.completed } : t));
      setRoutineTasks(nextTasks);
      await saveState(tank, countdowns, quickActions, nextTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const toggleRoutineTaskAlarm = useCallback(
    async (id: string) => {
      const nextTasks = routineTasks.map(t => (t.id === id ? { ...t, alarmEnabled: !t.alarmEnabled } : t));
      setRoutineTasks(nextTasks);
      await saveState(tank, countdowns, quickActions, nextTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const removeRoutineTask = useCallback(
    async (id: string) => {
      const nextTasks = routineTasks.filter(t => t.id !== id);
      setRoutineTasks(nextTasks);
      await saveState(tank, countdowns, quickActions, nextTasks, inhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const addInhabitant = useCallback(
    async (
      name: string,
      species: string,
      count: number,
      temperament: TankInhabitant['temperament'],
      notes: string
    ) => {
      const newInhabitant: TankInhabitant = {
        id: `inhabitant-${Date.now()}`,
        name,
        species,
        count,
        temperament,
        notes,
      };
      const nextInhabitants = [newInhabitant, ...inhabitants];
      setInhabitants(nextInhabitants);
      await saveState(tank, countdowns, quickActions, routineTasks, nextInhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const updateInhabitant = useCallback(
    async (id: string, updated: Partial<TankInhabitant>) => {
      const nextInhabitants = inhabitants.map(i => (i.id === id ? { ...i, ...updated } : i));
      setInhabitants(nextInhabitants);
      await saveState(tank, countdowns, quickActions, routineTasks, nextInhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const removeInhabitant = useCallback(
    async (id: string) => {
      const nextInhabitants = inhabitants.filter(i => i.id !== id);
      setInhabitants(nextInhabitants);
      await saveState(tank, countdowns, quickActions, routineTasks, nextInhabitants, waterParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const updateWaterParameter = useCallback(
    async (id: string, current: number) => {
      const nextParameters = waterParameters.map(p => (p.id === id ? { ...p, current } : p));
      setWaterParameters(nextParameters);
      
      const { score, status } = calculateOverallHealth(nextParameters);
      
      const nextTank = {
        ...tank,
        healthScore: score,
        healthStatus: status,
        lastChecked: 'Just Now',
      };
      
      setTank(nextTank);
      await saveState(nextTank, countdowns, quickActions, routineTasks, inhabitants, nextParameters);
    },
    [tank, countdowns, quickActions, routineTasks, inhabitants, waterParameters, saveState]
  );

  const resetAllData = useCallback(async () => {
    if (!user) return;
    try {
      const key = getStorageKey(user.id);
      await AsyncStorage.removeItem(key);
      setTank(mockTank);
      setCountdowns(mockCountdowns);
      setQuickActions(initialQuickActions);
      setRoutineTasks(initialRoutineTasks);
      setInhabitants(mockInhabitants);
      setWaterParameters(mockWaterParameters);
    } catch (e) {
      console.error('Failed to reset data:', e);
    }
  }, [user]);

  // Sync scheduled notifications when countdowns change
  useEffect(() => {
    if (isLoading || !user) return;

    async function syncNotifications() {
      try {
        // Cancel all currently scheduled notifications for this app
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule new ones for active countdowns
        for (const event of countdowns) {
          const isLightCycle = event.id === 'lights-off';
          if (isLightCycle) {
            const isPlanted = tank.isPlanted;
            if (isPlanted) {
              const timeRemaining = event.targetAt.getTime() - Date.now();
              if (timeRemaining > 0) {
                await Notifications.scheduleNotificationAsync({
                  identifier: event.id,
                  content: {
                    title: 'Aquarium Alert!',
                    body: `Timer for "${event.label}" has reached zero!`,
                    sound: true,
                    vibrate: [0, 1000, 500, 1000, 500, 1000, 500, 1000],
                    priority: 'max',
                    sticky: true,
                    ongoing: true,
                    autoDismiss: false,
                    categoryIdentifier: 'timer-alarm',
                    android: {
                      sticky: true,
                      ongoing: true,
                    },
                    data: { eventId: event.id, type: 'countdown' },
                  } as any,
                  trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: event.targetAt,
                    channelId: 'alarm-vibration-channel-v3',
                    enableInForeground: true,
                  } as any,
                });
              }
            } else {
              await Notifications.cancelScheduledNotificationAsync(event.id);
            }
          } else {
            const timeRemaining = event.targetAt.getTime() - Date.now();
            if (timeRemaining > 0) {
              await Notifications.scheduleNotificationAsync({
                identifier: event.id,
                content: {
                  title: 'Aquarium Alert!',
                  body: `Timer for "${event.label}" has reached zero!`,
                  sound: true,
                  vibrate: [0, 1000, 500, 1000, 500, 1000, 500, 1000],
                  priority: 'max',
                  sticky: true,
                  ongoing: true,
                  autoDismiss: false,
                  categoryIdentifier: 'timer-alarm',
                  android: {
                    sticky: true,
                    ongoing: true,
                  },
                  data: { eventId: event.id, type: 'countdown' },
                } as any,
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.DATE,
                  date: event.targetAt,
                  channelId: 'alarm-vibration-channel-v3',
                  enableInForeground: true,
                } as any,
              });
            }
          }
        }
      } catch (e) {
        console.error('Failed to sync scheduled notifications:', e);
      }
    }

    syncNotifications();
  }, [countdowns, isLoading, user, tank.isPlanted]);

  // Sync scheduled notifications for routine tasks
  useEffect(() => {
    if (isLoading || !user) return;

    async function syncRoutineNotifications() {
      try {
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of scheduled) {
          const data = notification.content.data;
          if (data && (data.type === 'routine-task' || data.taskId)) {
            await Notifications.cancelScheduledNotificationAsync(notification.identifier);
          }
        }
      } catch (e) {
        console.error('Failed to sync scheduled task notifications:', e);
      }

      for (const task of routineTasks) {
        if (task.alarmEnabled && !task.completed) {
          await scheduleTaskNotification(task);
        }
      }
    }

    syncRoutineNotifications();
  }, [routineTasks, isLoading, user]);

  // Register active context handlers for global notification action listener
  useEffect(() => {
    if (isLoading || !user) return;

    globalContextHandlers = {
      updateCountdown,
      updateRoutineTaskCompleteAndSchedule: async (taskId) => {
        const task = routineTasks.find(t => t.id === taskId);
        if (task) {
          const nextExec = calculateNextExecution(task);
          await Notifications.scheduleNotificationAsync({
            identifier: task.id,
            content: {
              title: 'Routine Reminder!',
              body: task.title,
              sound: true,
              vibrate: [0, 1000, 500, 1000, 500, 1000, 500, 1000],
              priority: 'max',
              sticky: true,
              ongoing: true,
              autoDismiss: false,
              categoryIdentifier: 'timer-alarm',
              android: {
                sticky: true,
                ongoing: true,
              },
              data: { taskId: task.id, type: 'routine-task' },
            } as any,
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: nextExec,
              channelId: 'alarm-vibration-channel-v3',
              enableInForeground: true,
            } as any,
          });
          if (task.completed) {
            await toggleRoutineTaskComplete(task.id);
          }
        }
      },
    };

    return () => {
      globalContextHandlers = null;
    };
  }, [isLoading, user, updateCountdown, routineTasks, toggleRoutineTaskComplete]);

  const computedTank = useMemo(() => {
    const { score, status } = calculateOverallHealth(waterParameters);
    return {
      ...tank,
      healthScore: score,
      healthStatus: status,
    };
  }, [tank, waterParameters]);

  const value = useMemo(
    () => ({
      tank: computedTank,
      countdowns,
      quickActions,
      routineTasks,
      inhabitants,
      waterParameters,
      isLoading,
      updateTank,
      updateCountdown,
      toggleQuickAction,
      addRoutineTask,
      toggleRoutineTaskComplete,
      toggleRoutineTaskAlarm,
      removeRoutineTask,
      addInhabitant,
      updateInhabitant,
      removeInhabitant,
      updateWaterParameter,
      resetAllData,
    }),
    [
      computedTank,
      countdowns,
      quickActions,
      routineTasks,
      inhabitants,
      waterParameters,
      isLoading,
      updateTank,
      updateCountdown,
      toggleQuickAction,
      addRoutineTask,
      toggleRoutineTaskComplete,
      toggleRoutineTaskAlarm,
      removeRoutineTask,
      addInhabitant,
      updateInhabitant,
      removeInhabitant,
      updateWaterParameter,
      resetAllData,
    ]
  );

  return <AquariumDataContext.Provider value={value}>{children}</AquariumDataContext.Provider>;
}

export function useAquariumData() {
  const context = useContext(AquariumDataContext);
  if (!context) {
    throw new Error('useAquariumData must be used within an AquariumDataProvider');
  }
  return context;
}
