import React from 'react';
import MINIGAMES from '../minigames/index';

/**
 * Показывается в фазе minigame_intro на большом экране,
 * а также как fallback когда ScreenView для игры ещё не реализован.
 */
export default function MinigameIntro({ minigame, waiting = false }) {
  const def  = MINIGAMES[minigame?.id];
  const name = def?.name || minigame?.id || '???';
  const desc = def?.desc || '';

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.anansi}>Ананси остановил вас!</div>
      <div style={s.name}>{name}</div>
      <div style={s.desc}>{desc}</div>
      {waiting
        ? <div style={s.waiting}>Мини-игра идёт — экран скоро!</div>
        : <div style={s.loading}>Готовимся...</div>
      }
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 20,
    animation: 'fadeIn 0.4s ease',
  },
  spider: {
    fontSize: 80,
    animation: 'pulse 1.5s infinite',
    filter: 'drop-shadow(0 0 20px rgba(200,168,48,0.5))',
  },
  anansi: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, color: '#c8a830',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(28px, 4vw, 48px)',
    color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.5)',
    letterSpacing: 2,
  },
  desc: {
    fontSize: 16, color: '#7aaa50',
    textAlign: 'center', maxWidth: 500, lineHeight: 1.6,
  },
  loading: {
    fontSize: 12, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase',
    animation: 'pulse 1s infinite',
  },
  waiting: {
    fontSize: 14, color: '#5a9a30',
    border: '1px solid #2a5a22', borderRadius: 8,
    padding: '10px 20px',
  },
};
