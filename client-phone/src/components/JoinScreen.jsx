import React, { useState } from 'react';

export default function JoinScreen({ onJoin, error }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) return;
    onJoin(trimmed);
  };

  return (
    <div style={s.wrap}>
      {/* Паутина — рисуется через stroke-dashoffset */}
      <svg
        style={s.web}
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
      >
        <g stroke="#4a8828" strokeWidth="0.8">
          <line x1="60" y1="0"  x2="60"  y2="120" style={webLine(0)} />
          <line x1="0"  y1="60" x2="120" y2="60"  style={webLine(0.1)} />
          <line x1="17" y1="17" x2="103" y2="103" style={webLine(0.2)} />
          <line x1="103" y1="17" x2="17" y2="103" style={webLine(0.3)} />
          <circle cx="60" cy="60" r="14" strokeDasharray="90" style={webLine(0.4)} />
          <circle cx="60" cy="60" r="28" strokeDasharray="180" style={webLine(0.5)} />
          <circle cx="60" cy="60" r="42" strokeDasharray="270" style={webLine(0.6)} />
          <circle cx="60" cy="60" r="56" strokeDasharray="360" style={webLine(0.7)} />
        </g>
      </svg>

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
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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

// Генерирует inline-стиль для линии паутины с анимацией
function webLine(delay) {
  return {
    strokeDasharray: 600,
    strokeDashoffset: 600,
    animation: `webDraw 1.2s ease ${delay}s forwards`,
    opacity: 0.35,
  };
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 20, padding: '0 24px',
    animation: 'fadeIn 0.4s ease',
    position: 'relative',
  },
  web: {
    position: 'absolute', top: 0, right: 0,
    width: 140, height: 140,
    opacity: 1, pointerEvents: 'none',
  },
  spider: {
    fontSize: 64,
    filter: 'drop-shadow(0 0 20px rgba(200,168,48,0.4))',
    animation: 'bounceIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) 0.3s both',
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
    animation: 'slideUp 0.45s 0.15s ease both',
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
    transition: 'border-color .2s',
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
    transition: 'opacity .2s, transform .1s',
    marginTop: 4,
    // active через CSS — не через JS
    WebkitTapHighlightColor: 'transparent',
  },
};
