import { useEffect, useState } from 'react';

export type CountdownParts = {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
};

function getCountdownParts(targetAt: Date): CountdownParts {
  const totalMs = Math.max(0, targetAt.getTime() - Date.now());
  const isExpired = totalMs === 0;
  const totalSeconds = Math.floor(totalMs / 1000);

  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    totalMs,
    isExpired,
  };
}

export function formatCountdown(parts: CountdownParts): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (parts.isExpired) return '00:00:00';
  return `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`;
}

export default function useCountdown(targetAt: Date): CountdownParts {
  const [parts, setParts] = useState(() => getCountdownParts(targetAt));

  useEffect(() => {
    setParts(getCountdownParts(targetAt));
    const interval = setInterval(() => {
      setParts(getCountdownParts(targetAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [targetAt]);

  return parts;
}
