import React from 'react';
import { MINIGAME_INFO } from '../shared/constants';
import useCountdown from '../shared/useCountdown';

// Правила мини-игры + кнопка «Готов». Когда готовы все — игра начинается раньше.
export default function MinigameIntro({ state, me, onReady }) {
  const mg = state.minigame;
  const info = MINIGAME_INFO[mg?.id] || { name: mg?.id, rules: [] };
  const { left } = useCountdown(state.deadline, state.duration);
  const isReady = mg?.readyIds?.includes(me.id);
  const readyCount = mg?.readyIds?.length || 0;
  const online = state.players.filter(p => p.connected).length;

  return (
    <div style={s.wrap}>
      <div style={s.anansi}>🕷️ Ананси остановил всех!</div>
      <div style={s.name}>{info.icon} {info.name}</div>
      <div style={s.desc}>{info.desc}</div>

      <div style={s.rules}>
        {info.rules.map((r, i) => (
          <div key={i} style={s.rule}><span style={s.dot}>{i + 1}</span><span>{r}</span></div>
        ))}
      </div>

      <button style={{ ...s.btn, ...(isReady ? s.btnDone : {}) }} onClick={onReady} disabled={isReady}>
        {isReady ? `✓ Готов (${readyCount}/${online})` : 'Понятно, готов!'}
      </button>
      <div style={s.timer}>Старт через {left} с</div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 14, padding: '16px 20px', animation: 'fadeIn 0.4s ease', overflowY: 'auto',
  },
  anansi: { fontFamily: "'Cinzel', serif", fontSize: 12, color: '#c8a830', letterSpacing: 3, textTransform: 'uppercase' },
  name: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(24px, 7vw, 34px)', color: '#f0d060', textShadow: '0 0 24px rgba(200,168,48,0.5)', textAlign: 'center' },
  desc: { fontSize: 14, color: '#9aca70', textAlign: 'center', fontStyle: 'italic', lineHeight: 1.45 },
  rules: {
    display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360,
    background: 'rgba(4,12,5,.85)', border: '1px solid rgba(212,175,55,.25)', borderRadius: 14, padding: '14px',
  },
  rule: { display: 'flex', gap: 10, fontSize: 14, color: '#d8f0b0', lineHeight: 1.4, alignItems: 'flex-start' },
  dot: {
    width: 22, height: 22, borderRadius: '50%', border: '1px solid #c8a830', color: '#f0d060', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontFamily: "'Cinzel',serif",
  },
  btn: {
    width: '100%', maxWidth: 360, fontFamily: "'Cinzel', serif", fontSize: 16, letterSpacing: 1,
    color: '#040c05', background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none', borderRadius: 30, padding: '15px', cursor: 'pointer',
  },
  btnDone: { background: 'rgba(20,40,10,.9)', color: '#9de05a', border: '1px solid #5a9a30' },
  timer: { fontSize: 12, color: '#6a9a50', letterSpacing: 1 },
};
