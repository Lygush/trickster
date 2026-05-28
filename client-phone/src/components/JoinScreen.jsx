import React, { useState } from 'react';

export default function JoinScreen({ onJoin, error }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    onJoin(trimmed);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕸️</div>
      <div style={s.title}>Сквозь Чащу</div>
      <div style={s.sub}>Ананси ждёт тебя</div>

      <div style={s.card}>
        <div style={s.label}>Твоё имя</div>
        <input
          style={s.input}
          type="text"
          placeholder="Введи имя..."
          maxLength={20}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {error && <div style={s.error}>{error}</div>}
        <button
          style={{ ...s.btn, opacity: name.trim() ? 1 : 0.4 }}
          onClick={handleSubmit}
          disabled={!name.trim()}
        >
          Войти в чащу →
        </button>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 20, padding: '0 24px',
    animation: 'fadeIn 0.4s ease',
  },
  spider: {
    fontSize: 64,
    filter: 'drop-shadow(0 0 20px rgba(200,168,48,0.4))',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 28, color: '#f0d060',
    textShadow: '0 0 20px rgba(200,168,48,0.4)',
    letterSpacing: 2,
  },
  sub: {
    fontSize: 12, color: '#5a9a30',
    letterSpacing: 3, textTransform: 'uppercase',
    marginTop: -12,
  },
  card: {
    width: '100%', maxWidth: 340,
    background: 'rgba(4,12,5,0.9)',
    border: '1px solid #1c3a1a',
    borderRadius: 16, padding: '24px 20px',
    backdropFilter: 'blur(10px)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  label: {
    fontSize: 11, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    background: '#0a1a0a',
    border: '1px solid #2a5a22',
    borderRadius: 10,
    padding: '14px 16px',
    color: '#d8f0b0',
    fontSize: 18,
    fontFamily: "'Nunito', sans-serif",
    outline: 'none',
  },
  error: {
    fontSize: 12, color: '#c84830',
    textAlign: 'center',
  },
  btn: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, letterSpacing: 1,
    color: '#040c05',
    background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none', borderRadius: 30,
    padding: '14px', cursor: 'pointer',
    transition: 'opacity .2s',
    marginTop: 4,
  },
};
