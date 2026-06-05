import React from 'react';

// Визуальные слоты 1-15 (снизу вверх на карте, сверху вниз в рендере)
// Слоты 4, 8, 12 = мини-игры; слот 15 = финальная гонка
const TOTAL_SLOTS   = 15;
const MINI_SLOTS    = new Set([4, 8, 12]);

// Маппинг questionIndex (1-11) → визуальный слот
// Q1=1, Q2=2, Q3=3, [мини=4], Q4=5, Q5=6, Q6=7, [мини=8],
// Q7=9, Q8=10, Q9=11, [мини=12], Q10=13, Q11=14, [финал=15]
const Q_TO_SLOT = [0, 1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14];
//                0  1  2  3  4  5  6  7   8   9  10  11

function currentVisualSlot(questionIndex, phase) {
  if (phase === 'final_race' || phase === 'final_race_intro' || phase === 'winner') return 15;
  if (questionIndex <= 0) return 0;
  if (questionIndex > 11) return 14;
  return Q_TO_SLOT[questionIndex] ?? questionIndex;
}

export default function MapPanel({ questionIndex = 0, phase = 'question' }) {
  const curSlot = currentVisualSlot(questionIndex, phase);

  // Рендерим сверху вниз: 🏁(15), 14, 13, ... 1
  const slots = [
    { slot: 15, type: 'finish' },
    ...Array.from({ length: TOTAL_SLOTS - 1 }, (_, i) => ({
      slot: TOTAL_SLOTS - 1 - i,
      type: MINI_SLOTS.has(TOTAL_SLOTS - 1 - i) ? 'mini' : 'step',
    })),
  ];

  return (
    <div style={s.panel}>
      <div style={s.title}>Прогресс</div>

      <div style={s.track}>
        <div style={s.line} />

        {slots.map(({ slot, type }) => {
          const isDone = slot < curSlot;
          const isCur  = slot === curSlot;

          if (type === 'finish') {
            return (
              <div key="finish" style={{
                ...s.dot, ...s.dotFinish,
                ...(isCur ? s.dotCur : {}),
                ...(isDone ? s.dotDone : {}),
              }}>🏁</div>
            );
          }

          if (type === 'mini') {
            return (
              <div key={slot} style={{
                ...s.dot,
                ...(isDone ? s.dotMiniDone : s.dotMini),
                ...(isCur  ? s.dotCur : {}),
              }}>✦</div>
            );
          }

          // Обычный шаг
          return (
            <div key={slot} style={{
              ...s.dot,
              ...(isDone ? s.dotDone : {}),
              ...(isCur  ? s.dotCur  : {}),
            }}>
              {isCur  && <div style={{ ...s.inner, background: '#f3d779' }}/>}
              {isDone && <div style={{ ...s.inner, background: '#6bc740' }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DOT = 'clamp(16px, 2.4vh, 28px)';

const s = {
  panel: {
    width: 190, flexShrink: 0,
    background: 'rgba(4,9,3,.85)',
    borderRight: '1px solid rgba(212,175,55,.15)',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    padding: '1.4vh 0 1.4vh',
    gap: '0.6vh',
  },
  title: {
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(11px,1vw,16px)',
    color: '#c7a84b', letterSpacing: '.1em',
    textTransform: 'uppercase', opacity: .8,
    flexShrink: 0,
  },
  track: {
    flex: 1, minHeight: 0,
    display: 'flex', flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  line: {
    position: 'absolute',
    left: '50%', top: 8, bottom: 8,
    width: 2,
    background: 'linear-gradient(180deg,rgba(212,175,55,.55),rgba(212,175,55,.1))',
    transform: 'translateX(-50%)',
    zIndex: 0,
  },
  dot: {
    width: DOT, height: DOT,
    borderRadius: '50%',
    border: '1.5px solid rgba(212,175,55,.22)',
    background: '#0e1a0b',
    position: 'relative', zIndex: 1, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'clamp(7px,0.85vh,11px)',
    color: 'rgba(212,175,55,.35)',
    transition: 'all .4s',
  },
  dotFinish: {
    fontSize: 'clamp(10px,1.3vh,16px)',
    border: '2px solid rgba(212,175,55,.6)',
    background: '#1a2a08',
    color: 'unset',
  },
  dotDone: {
    background: '#1e3010',
    borderColor: 'rgba(107,199,64,.55)',
    color: 'rgba(107,199,64,.3)',
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
    boxShadow: '0 0 10px rgba(212,175,55,.5), 0 0 20px rgba(212,175,55,.2)',
  },
  inner: {
    width: 'clamp(5px,0.7vh,9px)',
    height: 'clamp(5px,0.7vh,9px)',
    borderRadius: '50%',
    position: 'absolute',
  },
};
