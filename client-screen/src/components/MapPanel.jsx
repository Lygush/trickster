import React from 'react';

const CHARACTERS = {
  spider:  '🕷️',
  frog:    '🐸',
  snake:   '🐍',
  beetle:  '🪲',
  lizard:  '🦎',
};

const MINIGAME_SPOTS = [3, 6, 9, 12];

// Координаты 15 точек маршрута на SVG 180×400
// Точка 1 (старт) снизу, точка 15 (финиш) сверху
const WAYPOINT_COORDS = [
  null,           // index 0 unused
  { x: 90,  y: 310 }, // 1 START
  { x: 60,  y: 290 }, // 2
  { x: 118, y: 270 }, // 3 MINI
  { x: 58,  y: 252 }, // 4
  { x: 122, y: 232 }, // 5
  { x: 90,  y: 215 }, // 6 MINI
  { x: 55,  y: 215 }, // 7  (смещение чтоб не совпадало с 6)
  { x: 120, y: 174 }, // 8
  { x: 62,  y: 158 }, // 9 MINI
  { x: 90,  y: 138 }, // 10
  { x: 118, y: 120 }, // 11
  { x: 65,  y: 105 }, // 12 MINI
  { x: 90,  y: 85  }, // 13
  { x: 112, y: 68  }, // 14
  { x: 90,  y: 38  }, // 15 FINISH
];

// Сдвиги чтобы иконки разных игроков на одной точке не перекрывались
const OFFSETS = [
  { dx: 0,  dy: 0  },
  { dx: -14, dy: -8 },
  { dx: 14, dy: -8 },
  { dx: -10, dy: 10 },
  { dx: 10, dy: 10 },
];

export default function MapPanel({ players }) {
  // Группируем игроков по позиции
  const byPosition = {};
  players.forEach(p => {
    if (!byPosition[p.position]) byPosition[p.position] = [];
    byPosition[p.position].push(p);
  });

  return (
    <div style={styles.panel}>
      <div style={styles.title}>Маршрут</div>
      <div style={styles.svgWrap}>
        <svg viewBox="0 0 180 400" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="mg"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="sg"><feGaussianBlur stdDeviation="1.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {/* Path shadow */}
          <path d="M90 385 C45 365 140 335 90 305 C42 275 142 245 90 215 C40 185 144 155 90 125 C40 95 142 65 90 35 C82 24 90 16 90 16"
            fill="none" stroke="#060e06" strokeWidth="12" strokeLinecap="round"/>
          {/* Path */}
          <path d="M90 385 C45 365 140 335 90 305 C42 275 142 245 90 215 C40 185 144 155 90 125 C40 95 142 65 90 35 C82 24 90 16 90 16"
            fill="none" stroke="#1a3a18" strokeWidth="6" strokeLinecap="round"/>
          {/* Dashes */}
          <path d="M90 385 C45 365 140 335 90 305 C42 275 142 245 90 215 C40 185 144 155 90 125 C40 95 142 65 90 35 C82 24 90 16 90 16"
            fill="none" stroke="#2a5520" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="4 7" opacity="0.7"/>

          {/* Finish */}
          <circle cx="90" cy="16" r="9" fill="#102808" stroke="#5a9a30" strokeWidth="1.5" filter="url(#mg)"/>
          <text x="90" y="20" textAnchor="middle" fontSize="9" fill="#8acc40">🏁</text>
          <text x="90" y="10" textAnchor="middle" fontSize="6" fill="#4a8a28" letterSpacing="1" fontFamily="Nunito,sans-serif">ФИНИШ</text>

          {/* Start */}
          <circle cx="90" cy="320" r="7" fill="#0e2010" stroke="#2a5020" strokeWidth="1.2"/>
          <text x="90" y="334" textAnchor="middle" fontSize="6" fill="#3a6028" letterSpacing="1" fontFamily="Nunito,sans-serif">СТАРТ</text>

          {/* Waypoints 1–15 */}
          {WAYPOINT_COORDS.slice(1).map((pt, i) => {
            const step = i + 1;
            const isMini = MINIGAME_SPOTS.includes(step);
            const isFinish = step === 15;
            if (isFinish) return null;
            if (isMini) return (
              <g key={step}>
                <circle cx={pt.x} cy={pt.y} r="8" fill="#141c08" stroke="#c8a830" strokeWidth="1.5" filter="url(#sg)"/>
                <text x={pt.x} y={pt.y + 4} textAnchor="middle" fontSize="8" fill="#c8a830">★</text>
              </g>
            );
            return (
              <circle key={step} cx={pt.x} cy={pt.y} r="4" fill="#0e2010" stroke="#2a5020" strokeWidth="1"/>
            );
          })}

          {/* Player icons */}
          {Object.entries(byPosition).map(([pos, playersAtPos]) =>
            playersAtPos.map((p, idx) => {
              const posNum = parseInt(pos);
              if (posNum < 0 || posNum > 15) return null;
              const coord = posNum === 0
                ? { x: 90, y: 322 }
                : WAYPOINT_COORDS[posNum];
              if (!coord) return null;
              const off = OFFSETS[idx % OFFSETS.length];
              const emoji = CHARACTERS[p.character] || '❓';
              const isLeader = players[0]?.id === p.id; // лидер первый в массиве
              return (
                <text
                  key={p.id}
                  x={coord.x + off.dx}
                  y={coord.y + off.dy + 4}
                  textAnchor="middle"
                  fontSize={isLeader ? 18 : 15}
                  filter={isLeader ? 'url(#mg)' : undefined}
                  style={{ transition: 'all 0.5s ease' }}
                >
                  {emoji}
                </text>
              );
            })
          )}
        </svg>
      </div>
      <div style={styles.legend}>
        <div style={styles.legendItem}><div style={styles.legendDot}/> вопрос</div>
        <div style={styles.legendItem}><div style={styles.legendStar}/> мини-игра</div>
      </div>
    </div>
  );
}

const styles = {
  panel: {
    width: 200,
    flexShrink: 0,
    background: 'rgba(4,10,5,0.82)',
    borderRight: '1px solid #1c3a1a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '18px 10px 14px',
    backdropFilter: 'blur(6px)',
  },
  title: {
    fontSize: 9,
    letterSpacing: 3,
    color: '#3a6028',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  svgWrap: {
    flex: 1,
    width: '100%',
  },
  legend: {
    display: 'flex',
    gap: 10,
    marginTop: 8,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 9,
    color: '#3a6028',
  },
  legendDot: {
    width: 8, height: 8, borderRadius: '50%',
    background: '#2a5a22', border: '1px solid #5a9a30',
  },
  legendStar: {
    width: 10, height: 10, borderRadius: '50%',
    background: '#1a3010', border: '1px solid #c8a830',
  },
};
