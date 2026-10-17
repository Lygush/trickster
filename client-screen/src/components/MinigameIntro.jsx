import React from 'react';
import { MINIGAME_INFO, CHAR_EMOJI } from '../shared/constants';
import useCountdown from '../shared/useCountdown';

// Интро мини-игры: название, правила, кто нажал «Готов», обратный отсчёт.
export default function MinigameIntro({ minigame, players, deadline, duration }) {
  const info = MINIGAME_INFO[minigame?.id] || { name: minigame?.id, rules: [] };
  const { left } = useCountdown(deadline, duration);
  const ready = new Set(minigame?.readyIds || []);
  const online = players.filter(p => p.connected);

  return (
    <div style={s.wrap}>
      <div style={s.anansi}>🕷️ Ананси остановил вас!</div>
      <div style={s.name}><span style={s.icon}>{info.icon}</span>{info.name}</div>
      <div style={s.desc}>{info.desc}</div>

      <div style={s.rules}>
        {info.rules.map((r, i) => (
          <div key={i} style={{ ...s.rule, animation: `fadeIn .4s ease ${0.3 + i * 0.25}s both` }}>
            <span style={s.ruleNum}>{i + 1}</span>
            <span>{r}</span>
          </div>
        ))}
      </div>

      <div style={s.footer}>
        <div style={s.readyRow}>
          {online.map(p => (
            <div key={p.id} style={{ ...s.readyChip, opacity: ready.has(p.id) ? 1 : 0.35 }}>
              <span>{CHAR_EMOJI[p.character]}</span>
              <span style={s.readyName}>{p.name}</span>
              {ready.has(p.id) && <span style={{ color: '#8acc40' }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={s.countdown}>
          Начинаем через <b style={{ color: '#f0d060' }}>{left}</b> — или когда все нажмут «Готов»
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: '2.2vh', padding: '3vh 6vw', animation: 'fadeIn 0.4s ease',
  },
  anansi: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(13px,1.2vw,20px)', color: '#c8a830', letterSpacing: 3, textTransform: 'uppercase' },
  name: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(34px, 5vw, 76px)', color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.5)', letterSpacing: 2,
    display: 'flex', alignItems: 'center', gap: '1.5vw', animation: 'correctPop .6s ease both',
  },
  icon: { fontSize: '0.9em' },
  desc: { fontSize: 'clamp(16px,1.6vw,26px)', color: '#9aca70', textAlign: 'center', fontStyle: 'italic' },
  rules: {
    display: 'flex', flexDirection: 'column', gap: '1.4vh',
    background: 'rgba(4,12,5,.85)', border: '1px solid rgba(212,175,55,.25)',
    borderRadius: 18, padding: '2.6vh 2.6vw', maxWidth: 900, width: '100%',
    backdropFilter: 'blur(8px)',
  },
  rule: { display: 'flex', alignItems: 'center', gap: '1.2vw', fontSize: 'clamp(16px,1.6vw,26px)', color: '#d8f0b0', lineHeight: 1.35 },
  ruleNum: {
    width: 'clamp(28px,2.6vw,40px)', height: 'clamp(28px,2.6vw,40px)', borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid #c8a830', color: '#f0d060', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Cinzel',serif", fontWeight: 700,
  },
  footer: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4vh' },
  readyRow: { display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  readyChip: {
    display: 'flex', alignItems: 'center', gap: 6, fontSize: 'clamp(14px,1.3vw,20px)',
    background: 'rgba(10,22,10,.8)', border: '1px solid #2a5a22', borderRadius: 20, padding: '4px 14px',
    transition: 'opacity .3s',
  },
  readyName: { color: '#c8e8a0', fontFamily: "'Nunito',sans-serif" },
  countdown: { fontSize: 'clamp(13px,1.1vw,18px)', color: '#7aaa50', letterSpacing: 1 },
};
