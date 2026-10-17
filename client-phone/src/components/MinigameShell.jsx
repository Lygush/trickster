import React from 'react';
import MINIGAMES from '../minigames/index';
import { MINIGAME_INFO } from '../shared/constants';
import useCountdown from '../shared/useCountdown';

// Общая обёртка мини-игры на телефоне: шапка с названием и таймером,
// PhoneView конкретной игры, единая плашка «+N очков» на стадии reveal.
export default function MinigameShell({ state, me, priv, onAction }) {
  const mg   = state.minigame;
  const info = MINIGAME_INFO[mg.id] || {};
  const View = MINIGAMES[mg.id]?.PhoneView;
  const isReveal = mg.stage === 'reveal';
  const { left, frac } = useCountdown(isReveal ? null : state.deadline, state.duration);
  const myPts = mg.results?.[me.id] || 0;

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>{info.icon} {info.name}</span>
        {!isReveal && state.deadline && <span style={{ ...s.time, color: frac < 0.25 ? '#f06060' : '#c6f060' }}>{left}</span>}
      </div>
      {!isReveal && state.deadline && (
        <div style={s.bar}><div style={{ ...s.fill, width: `${frac * 100}%` }} /></div>
      )}

      <div style={s.body}>
        {View
          ? <View minigame={mg} stage={mg.stage} priv={priv?.minigame || {}} me={me} players={state.players} onAction={onAction} />
          : <div style={s.missing}>Смотри на большой экран</div>}
      </div>

      {isReveal && (
        <div style={{ ...s.result, ...(myPts ? s.resultWin : {}) }}>
          {myPts ? `+${myPts} ${myPts === 1 ? 'очко' : 'очка'}! Теперь у тебя ${me.score}` : 'В этот раз без очков'}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%' },
  header: { display: 'flex', alignItems: 'center', padding: '10px 16px 6px', flexShrink: 0 },
  title: { flex: 1, fontFamily: "'Cinzel',serif", fontSize: 15, color: '#f0d060', letterSpacing: 1 },
  time: { fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 22 },
  bar: { height: 4, margin: '0 16px', background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 },
  fill: { height: '100%', background: 'linear-gradient(90deg,#6bc740,#c6f060)', transition: 'width .25s linear' },
  body: { flex: 1, minHeight: 0, overflowY: 'auto' },
  missing: { padding: 40, textAlign: 'center', color: '#7aaa50' },
  result: {
    flexShrink: 0, margin: '0 14px 14px', padding: '12px', borderRadius: 12, textAlign: 'center',
    fontFamily: "'Cinzel',serif", fontSize: 16, color: '#b8a080',
    background: 'rgba(20,16,8,.9)', border: '1px solid #4a3a20', animation: 'slideUp .4s ease',
  },
  resultWin: { color: '#f0d060', background: 'rgba(30,24,4,.95)', borderColor: '#c8a830', boxShadow: '0 0 24px rgba(200,168,48,.25)' },
};
