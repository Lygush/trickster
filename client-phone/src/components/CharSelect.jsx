import React, { useState } from 'react';

const DESC = {
  spider: 'Ловкий и терпеливый',
  frog:   'Прыгучая и быстрая',
  snake:  'Хитрая и гибкая',
  beetle: 'Стойкий и упорный',
  lizard: 'Быстрая и зоркая',
};

export default function CharSelect({ characters = [], players, me, onSelect, onLeave }) {
  const [pressed, setPressed] = useState(null);
  const myChar = me?.character || null;
  const takenBy = {};
  players.forEach(p => { if (p.character && p.id !== me?.id) takenBy[p.character] = p.name; });
  const waitingFor = players.filter(p => p.connected && !p.character).length;

  const handlePress = (id) => {
    if (takenBy[id]) return;
    setPressed(id);
    setTimeout(() => setPressed(null), 180);
    onSelect(id);
  };

  return (
    <div style={s.wrap}>
      <div style={s.greeting}>Привет, {me?.name}!</div>
      <div style={s.title}>{myChar ? 'Твой персонаж' : 'Выбери персонажа'}</div>

      <div style={s.grid}>
        {characters.map((c, idx) => {
          const taken    = !!takenBy[c.id];
          const selected = c.id === myChar;
          return (
            <button
              key={c.id}
              style={{
                ...s.card,
                ...(selected ? s.cardSelected : {}),
                ...(taken ? s.cardTaken : {}),
                transform: pressed === c.id ? 'scale(0.93)' : selected ? 'scale(1.03)' : 'scale(1)',
                animation: `answerAppear 0.35s cubic-bezier(0.22,0.61,0.36,1) ${idx * 60}ms both`,
              }}
              onClick={() => handlePress(c.id)}
              disabled={taken}
            >
              <div style={s.emoji}>{c.emoji}</div>
              <div style={{ ...s.name, ...(selected ? s.nameSelected : {}) }}>{c.name}</div>
              <div style={s.desc}>{taken ? `занят: ${takenBy[c.id]}` : DESC[c.id]}</div>
              {selected && <div style={s.checkmark}>✓</div>}
            </button>
          );
        })}
      </div>

      {myChar && (
        <div style={s.ready}>
          {waitingFor > 0 ? `Ждём, пока выберут ещё ${waitingFor}...` : 'Все готовы! Ведущий запускает игру'}
        </div>
      )}
      <button style={s.leave} onClick={onLeave}>Выйти из лобби</button>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    height: '100%', padding: '24px 16px 16px', gap: 16, overflowY: 'auto',
    animation: 'fadeIn 0.4s ease',
  },
  greeting: { fontSize: 14, color: '#7aaa50', letterSpacing: 1 },
  title: { fontFamily: "'Cinzel', serif", fontSize: 22, color: '#f0d060', letterSpacing: 1 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 360 },
  card: {
    background: 'rgba(10,22,10,0.85)', border: '1.5px solid #1c3a18', borderRadius: 14,
    padding: '16px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    cursor: 'pointer', position: 'relative', color: 'inherit',
    transition: 'border-color .2s, background .2s, transform .15s, box-shadow .2s, opacity .2s',
  },
  cardSelected: { borderColor: '#c8a830', background: 'rgba(30,40,10,0.95)', boxShadow: '0 0 20px rgba(200,168,48,0.25)' },
  cardTaken: { opacity: 0.35, cursor: 'not-allowed' },
  emoji: { fontSize: 42 },
  name: { fontFamily: "'Cinzel', serif", fontSize: 14, color: '#d8f0b0' },
  nameSelected: { color: '#f0d060' },
  desc: { fontSize: 11, color: '#6a9a50', textAlign: 'center', lineHeight: 1.3 },
  checkmark: { position: 'absolute', top: 8, right: 10, fontSize: 15, color: '#c8a830', fontWeight: 700 },
  ready: { fontSize: 13, color: '#9de05a', letterSpacing: 0.5, textAlign: 'center', animation: 'pulse 1.8s infinite' },
  leave: {
    marginTop: 'auto', background: 'none', border: 'none', color: '#5a8040',
    fontSize: 12, textDecoration: 'underline', cursor: 'pointer', padding: 8,
  },
};
