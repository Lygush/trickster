import React, { useState, useEffect } from 'react';

const PATH_ICONS  = ['🌿', '🍄', '🌙'];
const PATH_COLORS = ['#4a9a2a', '#c8a830', '#5a7acc'];
const PATH_BG     = [
  'rgba(20,50,8,0.9)',
  'rgba(50,38,4,0.9)',
  'rgba(8,18,50,0.9)',
];
const PATH_BORDER = ['#2a6a18', '#9a7a18', '#2a4a9a'];
const PATH_GLOW   = ['#4a9a2a', '#c8a830', '#5a7acc'];

const ANANSI_TAUNTS = [
  'Я соткал эту ловушку специально для тебя...',
  'Мудрость? Или просто удача? Посмотрим.',
  'Три пути. Один верный. Ошибёшься?',
  'Ананси наблюдает. Выбирай осторожно.',
  'Паутина уже натянута. Беги по правильной нити.',
];

export default function ThreePathsPhone({ minigame, myId, onEmit }) {
  const data     = minigame?.data || {};
  const paths    = data.paths    || ['Тропа теней', 'Путь сквозь туман', 'Тропа ветра'];
  const choices  = data.choices  || {};
  const revealed = data.revealed || false;
  const winPath  = data.winPath;  // только когда revealed === true

  const myChoice  = choices[myId];
  const hasChosen = myChoice !== undefined;
  const isWinner  = revealed && hasChosen && myChoice === winPath;
  const isLoser   = revealed && hasChosen && myChoice !== winPath;

  const [taunt] = useState(
    () => ANANSI_TAUNTS[Math.floor(Math.random() * ANANSI_TAUNTS.length)]
  );
  const [pulse, setPulse] = useState(false);

  // Пульс при reveal
  useEffect(() => {
    if (revealed) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 800);
      return () => clearTimeout(t);
    }
  }, [revealed]);

  // ── REVEAL экран ──────────────────────────────────────────────────────────
  if (revealed) {
    return (
      <div style={s.wrap}>
        <div style={s.spider}>🕷️</div>
        <div style={s.revealTitle}>
          {isWinner ? 'Верная тропа!' : 'Не угадал...'}
        </div>

        {/* Моя выбранная тропа */}
        {hasChosen && (
          <div style={{
            ...s.myChoiceCard,
            borderColor: isWinner ? '#7acc40' : '#4a1a1a',
            background:  isWinner ? 'rgba(60,120,20,0.3)' : 'rgba(30,8,8,0.5)',
          }}>
            <div style={s.myChoiceIcon}>{PATH_ICONS[myChoice]}</div>
            <div style={{ ...s.myChoiceName, color: isWinner ? '#a0e060' : '#aa4040' }}>
              {paths[myChoice]}
            </div>
            <div style={{ ...s.myChoiceResult, color: isWinner ? '#7acc40' : '#cc5040' }}>
              {isWinner ? '✦ +1 шаг вперёд!' : '✗ Тупик'}
            </div>
          </div>
        )}

        {/* Правильная тропа (если проиграл) */}
        {isLoser && (
          <div style={s.correctHint}>
            <span style={{ color: '#5a8040', fontSize: 12 }}>Верной тропой была:</span>
            <span style={s.correctPath}>
              {PATH_ICONS[winPath]} {paths[winPath]}
            </span>
          </div>
        )}

        <div style={s.anansiComment}>
          {isWinner
            ? 'Ананси доволен... на этот раз.'
            : 'Ананси ухмыляется. Он знал.'}
        </div>
      </div>
    );
  }

  // ── ВЫБОР ТРОПЫ ───────────────────────────────────────────────────────────
  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.title}>Три тропинки</div>
      <div style={s.taunt}>{taunt}</div>

      {!hasChosen ? (
        <>
          <div style={s.prompt}>Выбери тропу:</div>
          <div style={s.paths}>
            {paths.map((pathName, i) => (
              <button
                key={i}
                style={{
                  ...s.pathBtn,
                  background:   PATH_BG[i],
                  borderColor:  PATH_BORDER[i],
                  color:        PATH_COLORS[i],
                }}
                onClick={() => onEmit && onEmit('three_paths_choose', { pathIndex: i })}
              >
                <span style={s.pathBtnIcon}>{PATH_ICONS[i]}</span>
                <span style={s.pathBtnName}>{pathName}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        /* Уже выбрал — ждём остальных */
        <div style={s.waitWrap}>
          <div
            style={{
              ...s.chosenCard,
              borderColor: PATH_BORDER[myChoice],
              background:  PATH_BG[myChoice],
              boxShadow:   `0 0 24px ${PATH_GLOW[myChoice]}44`,
            }}
          >
            <div style={s.chosenIcon}>{PATH_ICONS[myChoice]}</div>
            <div style={{ ...s.chosenName, color: PATH_COLORS[myChoice] }}>
              {paths[myChoice]}
            </div>
            <div style={s.chosenConfirm}>Выбрано!</div>
          </div>
          <div style={s.waitText}>Смотри на экран...</div>
          <div style={s.dots}>
            <span style={{ ...s.dot, animationDelay: '0s'   }}>●</span>
            <span style={{ ...s.dot, animationDelay: '0.3s' }}>●</span>
            <span style={{ ...s.dot, animationDelay: '0.6s' }}>●</span>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    height: '100%', padding: '20px 18px 24px',
    gap: 14, overflowY: 'auto',
    animation: 'fadeIn 0.35s ease',
  },
  spider: {
    fontSize: 52,
    filter: 'drop-shadow(0 0 14px rgba(200,168,48,0.5))',
    animation: 'pulse 2s infinite',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 22, color: '#f0d060',
    letterSpacing: 2,
    textShadow: '0 0 20px rgba(200,168,48,0.4)',
  },
  taunt: {
    fontSize: 13, color: '#7a9a50',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: 280,
  },
  prompt: {
    fontSize: 11, color: '#4a7030',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  paths: {
    display: 'flex', flexDirection: 'column',
    gap: 12, width: '100%', flex: 1,
    justifyContent: 'center',
  },
  pathBtn: {
    display: 'flex', alignItems: 'center', gap: 14,
    border: '2px solid', borderRadius: 18,
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    fontFamily: "'Nunito', sans-serif",
    WebkitTapHighlightColor: 'transparent',
    minHeight: 64,
  },
  pathBtnIcon: {
    fontSize: 28, flexShrink: 0,
  },
  pathBtnName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16, fontWeight: 700,
    letterSpacing: 0.5,
  },
  waitWrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 16,
    flex: 1, justifyContent: 'center',
  },
  chosenCard: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    border: '2px solid', borderRadius: 22,
    padding: '24px 40px',
    animation: 'bounceIn 0.4s ease',
  },
  chosenIcon: {
    fontSize: 48,
  },
  chosenName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18, fontWeight: 700,
    letterSpacing: 1,
  },
  chosenConfirm: {
    fontSize: 11, color: '#5a9a30',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  waitText: {
    fontSize: 13, color: '#4a7030',
    letterSpacing: 1,
  },
  dots: {
    display: 'flex', gap: 6,
  },
  dot: {
    fontSize: 8, color: '#2a5a22',
    animation: 'pulse 1.2s infinite',
    display: 'inline-block',
  },
  // Reveal стили
  revealTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 26, letterSpacing: 2,
    color: '#f0d060',
    textShadow: '0 0 20px rgba(200,168,48,0.4)',
  },
  myChoiceCard: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    border: '2px solid', borderRadius: 22,
    padding: '20px 36px',
    animation: 'bounceIn 0.5s ease',
  },
  myChoiceIcon: { fontSize: 44 },
  myChoiceName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18, fontWeight: 700,
  },
  myChoiceResult: {
    fontFamily: "'Cinzel', serif",
    fontSize: 15, letterSpacing: 1,
  },
  correctHint: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4,
    background: 'rgba(4,12,5,0.7)',
    border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '10px 20px',
  },
  correctPath: {
    fontSize: 15, color: '#90c068',
    fontFamily: "'Cinzel', serif",
  },
  anansiComment: {
    fontSize: 13, color: '#7a9a50',
    fontStyle: 'italic', textAlign: 'center',
  },
};