import React, { useEffect, useRef, useState } from 'react';

const TOTAL_SLOTS = 15;
const MINI_SLOTS  = new Set([4, 8, 12]);
const Q_TO_SLOT   = [0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14];

function currentVisualSlot(questionIndex, phase) {
  if (phase === 'final_race' || phase === 'final_race_intro' || phase === 'winner') return 15;
  if (questionIndex <= 0) return 0;
  if (questionIndex > 11) return 14;
  return Q_TO_SLOT[questionIndex] ?? questionIndex;
}

// Горизонтальный прогресс-трек для топбара
export default function MapPanel({ questionIndex = 0, phase = 'question' }) {
  const curSlot  = currentVisualSlot(questionIndex, phase);
  const prevSlot = useRef(curSlot);
  const [jumpSlot, setJumpSlot] = useState(null);

  useEffect(() => {
    if (curSlot !== prevSlot.current) {
      setJumpSlot(curSlot);
      const t = setTimeout(() => setJumpSlot(null), 500);
      prevSlot.current = curSlot;
      return () => clearTimeout(t);
    }
  }, [curSlot]);

  // Слоты 1→15 слева направо, финиш справа
  const slots = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const slot = i + 1;
    return {
      slot,
      type: slot === 15 ? 'finish' : MINI_SLOTS.has(slot) ? 'mini' : 'step',
    };
  });

  return (
    <div style={s.track}>
      {slots.map(({ slot, type }, i) => {
        const isDone = slot < curSlot;
        const isCur  = slot === curSlot;
        const isJump = slot === jumpSlot;

        // Линия-коннектор между точками (кроме последней)
        const connector = i < TOTAL_SLOTS - 1 ? (
          <div key={`c${slot}`} style={{
            ...s.conn,
            background: isDone ? 'rgba(107,199,64,.5)' : 'rgba(212,175,55,.12)',
            transition: 'background 0.4s',
          }} />
        ) : null;

        if (type === 'finish') {
          return (
            <React.Fragment key={slot}>
              <div style={{
                ...s.dot, ...s.dotFinish,
                ...(isCur  ? s.dotCur  : {}),
                ...(isDone ? s.dotDone : {}),
                animation: isJump ? 'dotJump 0.45s cubic-bezier(0.36,0.07,0.19,0.97)' : 'none',
              }}>🏁</div>
            </React.Fragment>
          );
        }

        if (type === 'mini') {
          return (
            <React.Fragment key={slot}>
              <div style={{
                ...s.dot,
                ...(isDone ? s.dotMiniDone : s.dotMini),
                ...(isCur  ? s.dotCur : {}),
                animation: isJump ? 'dotJump 0.45s cubic-bezier(0.36,0.07,0.19,0.97)' : 'none',
              }}>✦</div>
              {connector}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={slot}>
            <div style={{
              ...s.dot,
              ...(isDone ? s.dotDone : {}),
              ...(isCur  ? s.dotCur  : {}),
              animation: isJump ? 'dotJump 0.45s cubic-bezier(0.36,0.07,0.19,0.97)' : 'none',
            }}>
              {isCur  && <div style={{ ...s.inner, background: '#f3d779' }}/>}
              {isDone && <div style={{ ...s.inner, background: '#6bc740' }}/>}
            </div>
            {connector}
          </React.Fragment>
        );
      })}
    </div>
  );
}

const DOT = 'clamp(10px, 1.6vh, 18px)';

const s = {
  track: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  conn: {
    width: 'clamp(3px, 0.5vw, 8px)',
    height: 2,
    flexShrink: 0,
    borderRadius: 1,
  },
  dot: {
    width: DOT, height: DOT,
    borderRadius: '50%',
    border: '1.5px solid rgba(212,175,55,.22)',
    background: '#0e1a0b',
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'clamp(5px, 0.7vh, 9px)',
    color: 'rgba(212,175,55,.35)',
    transition: 'background 0.4s, border-color 0.4s, box-shadow 0.4s',
    position: 'relative',
  },
  dotFinish: {
    fontSize: 'clamp(7px, 1vh, 13px)',
    border: '1.5px solid rgba(212,175,55,.6)',
    background: '#1a2a08',
    color: 'unset',
  },
  dotDone: {
    background: '#1e3010',
    borderColor: 'rgba(107,199,64,.55)',
  },
  dotMini: {
    borderColor: 'rgba(212,175,55,.6)',
    background: '#1e2c10',
    color: 'rgba(212,175,55,.9)',
  },
  dotMiniDone: {
    borderColor: 'rgba(107,199,64,.55)',
    background: '#1e3010',
    color: 'rgba(107,199,64,.75)',
  },
  dotCur: {
    background: '#2a4018',
    borderColor: '#d4af37',
    borderWidth: 2,
    boxShadow: '0 0 7px rgba(212,175,55,.6), 0 0 14px rgba(212,175,55,.25)',
  },
  inner: {
    width: 'clamp(3px, 0.5vh, 6px)',
    height: 'clamp(3px, 0.5vh, 6px)',
    borderRadius: '50%',
    position: 'absolute',
  },
};
