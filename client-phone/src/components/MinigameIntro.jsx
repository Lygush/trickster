import React from 'react';
import MINIGAMES from '../minigames/index';

/**
 * Показывается в фазе minigame_intro на телефоне.
 * Берёт name/desc из реестра — не нужно дублировать словари в App.jsx.
 */
export default function MinigameIntro({ minigame, player }) {
  const def  = MINIGAMES[minigame?.id];
  const name = def?.name || minigame?.id || '???';
  const desc = def?.desc || '';

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.anansi}>Ананси остановил всех!</div>
      <div style={s.name}>{name}</div>
      <div style={s.desc}>{desc}</div>
      <div style={s.loading}>Готовимся...</div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 18,
    animation: 'fadeIn 0.4s ease',
    padding: '0 24px',
  },
  spider: {
    fontSize: 64,
    animation: 'pulse 1.5s infinite',
    filter: 'drop-shadow(0 0 20px rgba(200,168,48,0.5))',
  },
  anansi: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13, color: '#c8a830',
    letterSpacing: 3, textTransform: 'uppercase',
  },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(24px, 6vw, 36px)',
    color: '#f0d060',
    textShadow: '0 0 24px rgba(200,168,48,0.5)',
    letterSpacing: 2, textAlign: 'center',
  },
  desc: {
    fontSize: 14, color: '#7aaa50',
    textAlign: 'center', lineHeight: 1.6,
    maxWidth: 300,
  },
  loading: {
    fontSize: 11, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase',
    animation: 'pulse 1s infinite',
  },
};
