import React, { useEffect, useRef, useState } from 'react';

// Горизонтальный прогресс-трек маршрута: ● вопросы, ✦ мини-игры, 🏁 финал.
// Строится по конфигу с сервера (число вопросов и точки мини-игр).
function buildSlots(config) {
  const slots = [];
  for (let q = 1; q <= (config?.totalQuestions || 11); q++) {
    slots.push({ type: 'q', q });
    if (config?.minigameSpots?.includes(q)) slots.push({ type: 'mini', q });
  }
  slots.push({ type: 'finish' });
  return slots;
}

function currentIndex(slots, questionNumber, phase) {
  if (['final_race_intro', 'final_race', 'final_result', 'winner'].includes(phase)) return slots.length - 1;
  if (phase === 'minigame_intro' || phase === 'minigame') {
    return slots.findIndex(s => s.type === 'mini' && s.q === questionNumber);
  }
  return slots.findIndex(s => s.type === 'q' && s.q === questionNumber);
}

export default function MapPanel({ questionNumber = 0, phase = 'question', config }) {
  const slots = buildSlots(config);
  const cur = currentIndex(slots, questionNumber, phase);
  const prev = useRef(cur);
  const [jump, setJump] = useState(null);

  useEffect(() => {
    if (cur === prev.current) return undefined;
    prev.current = cur;
    setJump(cur);
    const t = setTimeout(() => setJump(null), 500);
    return () => clearTimeout(t);
  }, [cur]);

  return (
    <div style={s.track}>
      {slots.map((slot, i) => {
        const isDone = i < cur;
        const isCur  = i === cur;
        const anim   = i === jump ? 'dotJump 0.45s cubic-bezier(0.36,0.07,0.19,0.97)' : 'none';
        const dotStyle = {
          ...s.dot,
          ...(slot.type === 'mini' ? (isDone ? s.dotMiniDone : s.dotMini) : {}),
          ...(slot.type === 'finish' ? s.dotFinish : {}),
          ...(isDone && slot.type === 'q' ? s.dotDone : {}),
          ...(isCur ? s.dotCur : {}),
          animation: anim,
        };
        return (
          <React.Fragment key={i}>
            <div style={dotStyle}>
              {slot.type === 'mini' && '✦'}
              {slot.type === 'finish' && '🏁'}
              {slot.type === 'q' && isCur  && <div style={{ ...s.inner, background: '#f3d779' }} />}
              {slot.type === 'q' && isDone && <div style={{ ...s.inner, background: '#6bc740' }} />}
            </div>
            {i < slots.length - 1 && (
              <div style={{ ...s.conn, background: isDone ? 'rgba(107,199,64,.5)' : 'rgba(212,175,55,.12)' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const DOT = 'clamp(10px, 1.6vh, 18px)';

const s = {
  track: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  conn: { width: 'clamp(3px, 0.5vw, 8px)', height: 2, flexShrink: 0, borderRadius: 1, transition: 'background 0.4s' },
  dot: {
    width: DOT, height: DOT, borderRadius: '50%',
    border: '1.5px solid rgba(212,175,55,.22)', background: '#0e1a0b',
    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'clamp(6px, 0.8vh, 10px)', color: 'rgba(212,175,55,.35)',
    transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s', position: 'relative',
  },
  dotFinish:   { fontSize: 'clamp(7px, 1vh, 13px)', border: '1.5px solid rgba(212,175,55,.6)', background: '#1a2a08' },
  dotDone:     { background: '#1e3010', borderColor: 'rgba(107,199,64,.55)' },
  dotMini:     { borderColor: 'rgba(212,175,55,.6)', background: '#1e2c10', color: 'rgba(212,175,55,.9)' },
  dotMiniDone: { borderColor: 'rgba(107,199,64,.55)', background: '#1e3010', color: 'rgba(107,199,64,.75)' },
  dotCur: {
    background: '#2a4018', borderColor: '#d4af37', borderWidth: 2,
    boxShadow: '0 0 7px rgba(212,175,55,.6), 0 0 14px rgba(212,175,55,.25)',
  },
  inner: { width: 'clamp(3px, 0.5vh, 6px)', height: 'clamp(3px, 0.5vh, 6px)', borderRadius: '50%', position: 'absolute' },
};
