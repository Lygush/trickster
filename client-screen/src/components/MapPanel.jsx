import React from 'react';

const CHAR_EMOJI = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };
const MINI_SPOTS = new Set([3, 6, 9, 12]);
const TOTAL      = 15;

export default function MapPanel({ players, questionIndex = 0 }) {
  const sorted   = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const leaderId = sorted[0]?.id;

  // Слоты сверху вниз: ФИНИШ, 15, 14 … 1
  const slots = [
    { type: 'finish' },
    ...Array.from({ length: TOTAL }, (_, i) => ({ type: 'step', q: TOTAL - i })),
  ];

  return (
    <div style={s.panel}>

      {/* ── Трек ── */}
      <div style={s.track}>
        {slots.map((slot, idx) => {
          if (slot.type === 'finish') {
            return (
              <React.Fragment key="finish">
                <div style={s.slotFinish}>🏁</div>
                <div style={{ ...s.line, background: questionIndex > TOTAL ? '#2a5a22' : '#111f11' }}/>
              </React.Fragment>
            );
          }

          const { q } = slot;
          const isMini = MINI_SPOTS.has(q);
          const isDone = q < questionIndex;
          const isCur  = q === questionIndex;
          const isLast = q === 1;

          return (
            <React.Fragment key={q}>
              <div style={{
                ...s.slot,
                ...(isMini ? s.mini : {}),
                ...(isDone ? s.done : {}),
                ...(isCur  ? s.cur  : {}),
              }}>
                {isMini ? '★' : q}
              </div>
              {!isLast && (
                <div style={{ ...s.line, background: isDone ? '#2a5a22' : '#111f11' }}/>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Разделитель ── */}
      <div style={s.sep}/>

      {/* ── Таблица очков ── */}
      <div style={s.label}>ОЧКИ</div>
      <div style={s.scores}>
        {sorted.map((p, i) => {
          const score  = p.score ?? 0;
          const isLead = p.id === leaderId;
          return (
            <div key={p.id} style={{
              ...s.row,
              opacity:     p.connected ? 1 : 0.35,
              background:  isLead ? 'rgba(26,18,2,0.95)' : 'rgba(5,12,5,0.9)',
              borderColor: isLead ? '#6a5412' : '#162614',
            }}>
              <span style={s.rank}>{i + 1}</span>
              <span style={s.emo}>{CHAR_EMOJI[p.character] ?? '❓'}</span>
              <div style={s.nameCol}>
                <span style={{ ...s.name, color: isLead ? '#c8a830' : '#6aaa3a' }}>
                  {p.name.length > 8 ? p.name.slice(0, 8) + '…' : p.name}
                </span>
                <div style={s.bar}>
                  <div style={{
                    ...s.fill,
                    width: `${(score / TOTAL) * 100}%`,
                    background: isLead ? '#c8a830' : '#3a7a28',
                  }}/>
                </div>
              </div>
              <span style={{ ...s.sc, color: isLead ? '#f0d060' : '#c8e8a0' }}>
                {score}<span style={s.scOf}>/{TOTAL}</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Легенда */}
      <div style={s.legend}><span style={{ color: '#c8a830' }}>★</span> мини-игра</div>
    </div>
  );
}

const s = {
  panel: {
    width: 200, flexShrink: 0,
    background: 'rgba(2,7,2,0.92)',
    borderRight: '1px solid #122212',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    padding: '56px 10px 14px',     // большой отступ сверху → трек смещается вниз
    backdropFilter: 'blur(10px)',
    gap: 6,
    overflowY: 'auto', scrollbarWidth: 'none',
  },

  track: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    flexShrink: 0,
  },
  line: { width: 2, height: 7, borderRadius: 1, transition: 'background .4s', flexShrink: 0 },

  slot: {
    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid #1c3618', background: '#070d07',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 700, fontFamily: "'Cinzel',serif",
    color: '#243820', transition: 'all .35s',
  },
  mini: { borderColor: '#6a5412', color: '#c8a830', background: '#100d00', fontSize: 12 },
  done: { borderColor: '#2e6822', color: '#4a9a30', background: '#0b1c09' },
  cur:  { borderColor: '#c8a830', color: '#f0d060', background: 'rgba(200,168,48,0.14)', width: 30, height: 30, fontSize: 11, boxShadow: '0 0 10px rgba(200,168,48,0.35)' },
  slotFinish: {
    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
    border: '1.5px solid #c8a830', background: '#0a1804',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14,
  },

  sep:    { width: '88%', height: 1, background: '#122212', flexShrink: 0, margin: '4px 0' },
  label:  { fontSize: 7, letterSpacing: 3, color: '#2a4a20', textTransform: 'uppercase', fontFamily: "'Cinzel',serif", flexShrink: 0 },

  scores: { width: '100%', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 },
  row: {
    display: 'flex', alignItems: 'center', gap: 5,
    border: '1px solid', borderRadius: 8, padding: '5px 7px',
    transition: 'all .4s',
  },
  rank:    { fontSize: 8, color: '#283e20', minWidth: 10, fontFamily: "'Cinzel',serif" },
  emo:     { fontSize: 14, lineHeight: 1, flexShrink: 0 },
  nameCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden', minWidth: 0 },
  name:    { fontSize: 10, fontFamily: "'Nunito',sans-serif", overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', transition: 'color .4s' },
  bar:     { width: '100%', height: 3, background: '#0a140a', borderRadius: 2, overflow: 'hidden' },
  fill:    { height: '100%', borderRadius: 2, transition: 'width .6s ease' },
  sc:      { fontFamily: "'Cinzel',serif", fontSize: 12, minWidth: 26, textAlign: 'right', flexShrink: 0 },
  scOf:    { fontSize: 8, color: '#2e4a20' },
  legend:  { fontSize: 8, color: '#2e4820', marginTop: 2 },
};
