import React from 'react';

const CHARACTERS = [
  { id: 'spider', emoji: '🕷️', name: 'Паук',    desc: 'Ловкий и терпеливый' },
  { id: 'frog',   emoji: '🐸', name: 'Лягушка', desc: 'Прыгучая и быстрая'  },
  { id: 'snake',  emoji: '🐍', name: 'Змея',    desc: 'Хитрая и гибкая'     },
  { id: 'beetle', emoji: '🪲', name: 'Жук',     desc: 'Стойкий и упорный'   },
  { id: 'lizard', emoji: '🦎', name: 'Ящерица', desc: 'Быстрая и зоркая'    },
];

export default function CharSelect({ takenChars, myChar, onSelect, playerName }) {
  return (
    <div style={s.wrap}>
      <div style={s.greeting}>Привет, {playerName}!</div>
      <div style={s.title}>Выбери персонажа</div>

      <div style={s.grid}>
        {CHARACTERS.map(c => {
          const taken   = takenChars.includes(c.id) && c.id !== myChar;
          const selected = c.id === myChar;
          return (
            <button
              key={c.id}
              style={{
                ...s.card,
                ...(selected ? s.cardSelected : {}),
                ...(taken    ? s.cardTaken    : {}),
              }}
              onClick={() => !taken && onSelect(c.id)}
              disabled={taken}
            >
              <div style={s.emoji}>{c.emoji}</div>
              <div style={{ ...s.name, ...(selected ? s.nameSelected : {}) }}>
                {c.name}
              </div>
              <div style={s.desc}>
                {taken ? 'Занят' : c.desc}
              </div>
              {selected && <div style={s.checkmark}>✓</div>}
            </button>
          );
        })}
      </div>

      {myChar && (
        <div style={s.ready}>
          Готово! Ждём начала игры...
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center',
    height: '100%', padding: '24px 16px 16px',
    gap: 16, overflowY: 'auto',
    animation: 'fadeIn 0.4s ease',
  },
  greeting: {
    fontSize: 13, color: '#5a9a30', letterSpacing: 1,
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 20, color: '#f0d060', letterSpacing: 1,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12, width: '100%', maxWidth: 360,
  },
  card: {
    background: 'rgba(10,22,10,0.85)',
    border: '1.5px solid #1c3a18',
    borderRadius: 14, padding: '16px 12px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 6,
    cursor: 'pointer', position: 'relative',
    transition: 'border-color .2s, background .2s, transform .15s',
    color: 'inherit',
  },
  cardSelected: {
    borderColor: '#c8a830',
    background: 'rgba(30,40,10,0.95)',
    boxShadow: '0 0 20px rgba(200,168,48,0.25)',
    transform: 'scale(1.03)',
  },
  cardTaken: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
  emoji: { fontSize: 40 },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13, color: '#d8f0b0',
  },
  nameSelected: { color: '#f0d060' },
  desc: {
    fontSize: 10, color: '#3a6028',
    textAlign: 'center', lineHeight: 1.3,
  },
  checkmark: {
    position: 'absolute', top: 8, right: 10,
    fontSize: 14, color: '#c8a830', fontWeight: 700,
  },
  ready: {
    fontSize: 12, color: '#5a9a30',
    letterSpacing: 1, textTransform: 'uppercase',
    animation: 'pulse 1.5s infinite',
    marginTop: 4,
  },
};
