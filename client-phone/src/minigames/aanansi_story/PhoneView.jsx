import React, { useState } from 'react';

/**
 * ИсторияАнансиPhone — телефон игрока в мини-игре «История Ананси».
 *
 * Механика:
 *   Ананси произносит начало истории на экране.
 *   Каждый игрок пишет свой вариант продолжения (1–2 предложения).
 *   Потом все читают вслух (или голосуют за лучший).
 *
 * Props:
 *   minigame — { data: { prompt, submissions, phase } }
 *   myId, onEmit
 */
export default function AanansiStoryPhone({ minigame, myId, onEmit }) {
  const data     = minigame?.data  || {};
  const prompt   = data.prompt     || 'Однажды в чаще леса...';
  const phase    = data.phase      || 'write';  // write | vote | reveal
  const mySubmit = (data.submissions || {})[myId];

  const [text, setText] = useState('');
  const [sent, setSent]  = useState(false);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || sent) return;
    setSent(true);
    onEmit('story_submit', { text: trimmed });
  };

  if (phase === 'reveal') {
    return (
      <div style={s.wrap}>
        <div style={s.spider}>🕷️</div>
        <div style={s.title}>Истории готовы!</div>
        <div style={s.hint}>Следи за большим экраном</div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.title}>История Ананси</div>
      <div style={s.prompt}>«{prompt}»</div>

      {(!mySubmit && !sent) ? (
        <>
          <div style={s.label}>Продолжи историю:</div>
          <textarea
            style={s.textarea}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Напиши 1–2 предложения..."
            maxLength={200}
            rows={4}
          />
          <div style={s.charCount}>{text.length} / 200</div>
          <button
            style={{ ...s.btn, opacity: text.trim() ? 1 : 0.4 }}
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Отправить →
          </button>
        </>
      ) : (
        <div style={s.sentWrap}>
          <div style={s.check}>✓</div>
          <div style={s.sentText}>Твой вариант отправлен!</div>
          <div style={s.myText}>{text || mySubmit}</div>
          <div style={s.hint}>Ждём остальных...</div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', height: '100%',
    padding: '20px 18px 24px', gap: 14,
    overflowY: 'auto', animation: 'fadeIn 0.4s ease',
  },
  spider: { fontSize: 52, animation: 'pulse 1.5s infinite',
    filter: 'drop-shadow(0 0 14px rgba(200,168,48,0.5))' },
  title: { fontFamily: "'Cinzel', serif", fontSize: 22, color: '#f0d060', letterSpacing: 2 },
  prompt: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(13px, 3.5vw, 16px)', color: '#d8f0b0',
    textAlign: 'center', lineHeight: 1.5,
    background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a',
    borderRadius: 12, padding: '14px', width: '100%',
    fontStyle: 'italic',
  },
  label: { fontSize: 11, color: '#3a6028', letterSpacing: 2, textTransform: 'uppercase' },
  textarea: {
    width: '100%', background: '#0a1a0a',
    border: '1px solid #2a5a22', borderRadius: 10,
    padding: '12px 14px', color: '#d8f0b0',
    fontSize: 15, fontFamily: "'Nunito', sans-serif",
    outline: 'none', resize: 'none', lineHeight: 1.5,
  },
  charCount: { fontSize: 10, color: '#2a4a20', alignSelf: 'flex-end' },
  btn: {
    fontFamily: "'Cinzel', serif", fontSize: 14, letterSpacing: 1,
    color: '#040c05', background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none', borderRadius: 30, padding: '14px 28px',
    cursor: 'pointer', width: '100%', transition: 'opacity .2s',
  },
  sentWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' },
  check: {
    width: 56, height: 56, borderRadius: '50%',
    background: 'rgba(10,30,10,0.9)', border: '2px solid #5a9a30',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 26, color: '#8acc40',
  },
  sentText: { fontFamily: "'Cinzel', serif", fontSize: 16, color: '#f0d060' },
  myText: {
    fontSize: 13, color: '#7a9a50', fontStyle: 'italic',
    background: 'rgba(4,12,5,0.7)', border: '1px solid #1c3a1a',
    borderRadius: 10, padding: '12px', width: '100%', lineHeight: 1.5,
    textAlign: 'center',
  },
  hint: { fontSize: 11, color: '#3a6028', letterSpacing: 1, animation: 'pulse 1.5s infinite' },
};
