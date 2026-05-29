import React from 'react';

const PATH_ICONS  = ['🌿', '🍄', '🌙'];
const PATH_COLORS = ['#4a9a2a', '#c8a830', '#5a7acc'];
const PATH_BG     = ['rgba(30,60,10,0.7)', 'rgba(50,40,5,0.7)', 'rgba(10,20,60,0.7)'];
const PATH_BORDER = ['#2a6a18', '#9a7a18', '#2a4a9a'];

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function ThreePathsScreen({ minigame, players = [] }) {
  const data     = minigame?.data  || {};
  const paths    = data.paths    || ['Тропа теней', 'Путь сквозь туман', 'Тропа ветра'];
  const choices  = data.choices  || {};
  const winPath  = data.revealed ? data.winPath : null;
  const revealed = data.revealed || false;

  const counts       = [0, 1, 2].map(i => Object.values(choices).filter(c => c === i).length);
  const totalChosen  = Object.keys(choices).length;
  const totalPlayers = players.filter(p => p.connected !== false).length;

  return (
    <div style={tp.wrap}>
      {/* Заголовок */}
      <div style={tp.header}>
        <div style={tp.spider}>🕷️</div>
        <div style={tp.title}>Три тропинки</div>
        <div style={tp.anansiLine}>
          {data.anansiLine || 'Я соткал три пути... но лишь один ведёт к победе.'}
        </div>
      </div>

      {/* Три тропы */}
      <div style={tp.paths}>
        {paths.map((pathName, i) => {
          const isWinner = revealed && winPath === i;
          const isLoser  = revealed && winPath !== i;
          const choosers = players.filter(p => choices[p.id] === i);

          return (
            <div
              key={i}
              style={{
                ...tp.pathCard,
                background:  isWinner ? 'rgba(80,160,40,0.25)' : isLoser ? 'rgba(10,10,10,0.5)' : PATH_BG[i],
                borderColor: isWinner ? '#7acc40' : isLoser ? '#1a2a18' : PATH_BORDER[i],
                transform:   isWinner ? 'scale(1.06)' : isLoser ? 'scale(0.94)' : 'scale(1)',
                opacity:     isLoser ? 0.45 : 1,
                transition:  'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <div style={tp.pathIcon}>{PATH_ICONS[i]}</div>
              <div style={{ ...tp.pathName, color: isWinner ? '#a0e060' : PATH_COLORS[i] }}>
                {pathName}
              </div>
              {isWinner && <div style={tp.winBadge}>✦ ВЕРНЫЙ ПУТЬ ✦</div>}
              <div style={tp.countBadge}>
                {counts[i] > 0
                  ? `${counts[i]} ${counts[i] === 1 ? 'игрок' : counts[i] < 5 ? 'игрока' : 'игроков'}`
                  : '—'}
              </div>
              {choosers.length > 0 && (
                <div style={tp.choosers}>
                  {choosers.map(p => (
                    <div key={p.id} style={tp.chooserBadge}>
                      <span style={{ fontSize: 16 }}>{CHAR_EMOJI[p.character] || '⭕'}</span>
                      <span style={tp.chooserName}>{p.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Статус */}
      <div style={tp.status}>
        {!revealed ? (
          <>
            <div style={tp.statusText}>Выбрали: {totalChosen} / {totalPlayers}</div>
            <div style={tp.dots}>
              {players.filter(p => p.connected !== false).map(p => (
                <div
                  key={p.id}
                  style={{
                    ...tp.dot,
                    background: choices[p.id] !== undefined ? PATH_COLORS[choices[p.id]] : '#1a2a18',
                    boxShadow:  choices[p.id] !== undefined
                      ? `0 0 8px ${PATH_COLORS[choices[p.id]]}88` : 'none',
                  }}
                  title={p.name}
                />
              ))}
            </div>
          </>
        ) : (
          <div style={tp.revealText}>Ананси открывает правду...</div>
        )}
      </div>
    </div>
  );
}

const tp = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    height: '100%', padding: '24px 40px 28px',
    gap: 20, animation: 'fadeIn 0.5s ease',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  spider: {
    fontSize: 48,
    filter: 'drop-shadow(0 0 16px rgba(200,168,48,0.6))',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(22px, 3.5vw, 40px)', color: '#f0d060',
    textShadow: '0 0 24px rgba(200,168,48,0.4)', letterSpacing: 3,
  },
  anansiLine: {
    fontSize: 'clamp(12px, 1.4vw, 16px)', color: '#9aaa70',
    fontStyle: 'italic', textAlign: 'center', maxWidth: 500, lineHeight: 1.5,
  },
  paths: {
    display: 'flex', gap: 20, flex: 1, width: '100%',
    alignItems: 'stretch', maxHeight: 380,
  },
  pathCard: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'flex-start',
    padding: '22px 16px', border: '2px solid',
    borderRadius: 24, backdropFilter: 'blur(12px)',
    gap: 10, cursor: 'default', position: 'relative', overflow: 'hidden',
  },
  pathIcon: { fontSize: 44, filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))' },
  pathName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(14px, 1.8vw, 20px)', fontWeight: 700,
    letterSpacing: 1, textAlign: 'center', lineHeight: 1.3,
  },
  winBadge: {
    background: 'rgba(100,200,50,0.15)', border: '1px solid #5aaa28',
    borderRadius: 20, padding: '4px 14px', fontSize: 11, color: '#8adc50',
    letterSpacing: 2, fontFamily: "'Cinzel', serif", fontWeight: 700,
    animation: 'pulse 1s infinite',
  },
  countBadge: { fontSize: 12, color: '#6a8a50', letterSpacing: 0.5, marginTop: 'auto' },
  choosers:   { display: 'flex', flexDirection: 'column', gap: 6, width: '100%', alignItems: 'center' },
  chooserBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(4,12,5,0.7)', border: '1px solid #1c3a1a',
    borderRadius: 20, padding: '4px 12px',
  },
  chooserName: { fontSize: 12, color: '#90c068', fontFamily: "'Nunito', sans-serif" },
  status:     { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  statusText: { fontSize: 13, color: '#5a8040', letterSpacing: 1, textTransform: 'uppercase' },
  dots:       { display: 'flex', gap: 8 },
  dot: {
    width: 12, height: 12, borderRadius: '50%',
    transition: 'background 0.4s ease, box-shadow 0.4s ease',
  },
  revealText: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16, color: '#c8a830',
    letterSpacing: 2, animation: 'pulse 1s infinite',
  },
};
