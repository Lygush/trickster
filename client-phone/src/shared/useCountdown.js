// shared/useCountdown.js — обратный отсчёт до серверного дедлайна.
// deadline и duration приходят с сервера (мс). Часы сервера берутся из
// ClockContext (провайдер ставится в App со значением serverNow из useGame).
// Возвращает { left (сек), frac (1 → 0), active }.

import { createContext, useContext, useEffect, useState } from 'react';

export const ClockContext = createContext(() => Date.now());

export default function useCountdown(deadline, duration) {
  const serverNow = useContext(ClockContext);
  const [now, setNow] = useState(() => serverNow());

  useEffect(() => {
    if (!deadline) return undefined;
    setNow(serverNow());
    const id = setInterval(() => setNow(serverNow()), 200);
    return () => clearInterval(id);
  }, [deadline, serverNow]);

  if (!deadline) return { left: 0, frac: 0, active: false };
  const leftMs = Math.max(0, deadline - now);
  return {
    left: Math.ceil(leftMs / 1000),
    frac: duration ? Math.min(1, leftMs / duration) : 0,
    active: leftMs > 0,
  };
}
