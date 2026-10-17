import React from 'react';
import useCountdown from '../shared/useCountdown';

// Двусторонняя полоса таймера с числом по центру. Цвет и пульс зависят от остатка.
export default function TimerBar({ deadline, duration, compact = false }) {
  const { left, frac } = useCountdown(deadline, duration);
  const pct       = deadline ? frac * 100 : 0;
  const isDanger  = deadline && frac <= 0.25;
  const isWarning = deadline && frac <= 0.5 && !isDanger;
  const numColor  = isDanger ? '#f06060' : isWarning ? '#f0a040' : '#c6f060';
  const barGrad   = isDanger
    ? 'linear-gradient(90deg,#c03030,#f06060)'
    : isWarning ? 'linear-gradient(90deg,#c08020,#f0c060)'
    : 'linear-gradient(90deg,#6bc740,#c6f060)';
  const size = compact ? 'clamp(22px,2.4vw,36px)' : isDanger ? 'clamp(42px,5.2vw,76px)' : 'clamp(36px,4.2vw,64px)';

  return (
    <div style={{ ...st.row, animation: isDanger && !compact ? 'timerDanger 0.6s ease-in-out infinite' : 'none' }}>
      <div style={st.barWrap}>
        <div style={{ ...st.fill, marginLeft: 'auto', width: `${pct}%`, background: barGrad }} />
      </div>
      <div style={{ ...st.num, color: numColor, fontSize: size }}>{deadline ? left : '—'}</div>
      <div style={st.barWrap}>
        <div style={{ ...st.fill, width: `${pct}%`, background: barGrad }} />
      </div>
    </div>
  );
}

const st = {
  row: { display: 'flex', alignItems: 'center', gap: '1.5vw', width: '100%' },
  num: {
    fontFamily: "'Cinzel',serif", fontWeight: 700, lineHeight: 1,
    minWidth: '4.5vw', textAlign: 'center', flexShrink: 0,
    transition: 'color .5s, font-size .3s',
  },
  barWrap: {
    flex: 1, height: '1.4vh', minHeight: 8,
    background: 'rgba(255,255,255,.1)', borderRadius: 4,
    overflow: 'hidden', display: 'flex', alignItems: 'center',
  },
  fill: { height: '100%', borderRadius: 4, transition: 'width .25s linear, background .5s', flexShrink: 0 },
};
