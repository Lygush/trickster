import React from 'react';

const LETTERS = ['А', 'Б', 'В', 'Г'];

export default function ResultScreen({ question, revealData, myAnswer, myScore }) {
  if (!question || !revealData) return null;

  const correct    = revealData.correctIndex;
  const wasCorrect = myAnswer === correct;
  const answered   = myAnswer !== null;

  return (
    <div style={s.wrap}>

      {/* Результат */}
      <div style={{
        ...s.resultBadge,
        ...(wasCorrect ? s.badgeCorrect : answered ? s.badgeWrong : s.badgeMissed),
      }}>
        <div style={s.resultIcon}>
          {wasCorrect ? '✓' : answered ? '✗' : '⏱'}
        </div>
        <div style={s.resultText}>
          {wasCorrect ? 'Верно! +1 очко' : answered ? 'Неверно' : 'Не успел'}
        </div>
      </div>

      {/* Позиция */}
      <div style={s.posCard}>
        <div style={s.posLabel}>Мой счёт</div>
        <div style={s.posValue}>
          {myScore ?? 0} <span style={s.posOf}>/ 15</span>
        </div>
      </div>

      {/* Правильный ответ */}
      <div style={s.correctBlock}>
        <div style={s.correctLabel}>Правильный ответ</div>
        <div style={s.correctAns}>
          <div style={s.correctLetter}>{LETTERS[correct]}</div>
          <span>{question.answers[correct]}</span>
        </div>
      </div>

      <div style={s.hint}>Следи за большим экраном...</div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 20, padding: '0 24px',
    animation: 'fadeInScale 0.4s ease',
  },
  resultBadge: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 8,
    borderRadius: 20, padding: '20px 40px',
    border: '1px solid',
  },
  badgeCorrect: {
    background: 'rgba(10,30,10,0.9)',
    borderColor: '#5a9a30',
    boxShadow: '0 0 30px rgba(90,154,48,0.2)',
  },
  badgeWrong: {
    background: 'rgba(30,8,4,0.9)',
    borderColor: '#c84830',
    boxShadow: '0 0 20px rgba(200,72,48,0.15)',
  },
  badgeMissed: {
    background: 'rgba(20,16,4,0.9)',
    borderColor: '#c8a830',
  },
  resultIcon: {
    fontSize: 48,
    fontFamily: "'Cinzel', serif",
    color: '#d8f0b0',
  },
  resultText: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16, color: '#d8f0b0', letterSpacing: 1,
  },
  posCard: {
    background: 'rgba(4,12,5,0.8)',
    border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '12px 32px',
    textAlign: 'center',
  },
  posLabel: {
    fontSize: 10, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
  },
  posValue: {
    fontFamily: "'Cinzel', serif",
    fontSize: 36, color: '#f0d060',
  },
  posOf: { fontSize: 18, color: '#5a9a30' },
  correctBlock: {
    width: '100%', maxWidth: 320,
    background: 'rgba(4,12,5,0.8)',
    border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '14px 16px',
  },
  correctLabel: {
    fontSize: 10, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
  },
  correctAns: {
    display: 'flex', alignItems: 'center', gap: 10,
    fontSize: 15, color: '#8acc40',
  },
  correctLetter: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#152a0c', border: '1px solid #5a9a30',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#8acc40', fontWeight: 700,
    fontFamily: "'Cinzel', serif", flexShrink: 0,
  },
  hint: {
    fontSize: 11, color: '#3a6028',
    letterSpacing: 1, animation: 'pulse 1.5s infinite',
  },
};
