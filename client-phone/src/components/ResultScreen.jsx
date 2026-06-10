import React from 'react';

const LETTERS = ['А', 'Б', 'В', 'Г'];

export default function ResultScreen({ question, revealData, myAnswer, myScore }) {
  if (!question || !revealData) return null;

  const correct    = revealData.correctIndex;
  const wasCorrect = myAnswer === correct;
  const answered   = myAnswer !== null && myAnswer !== undefined;

  const icon  = wasCorrect ? '✓' : answered ? '✗' : '⏱';
  const text  = wasCorrect ? 'Верно! +1 очко' : answered ? 'Неверно' : 'Не успел';
  const badge = wasCorrect ? s.badgeCorrect : answered ? s.badgeWrong : s.badgeMissed;

  return (
    <div style={s.wrap}>

      {/* ── Значок результата ── */}
      <div style={{ ...s.resultBadge, ...badge }}>
        <div style={{
          ...s.resultIcon,
          color: wasCorrect ? '#6bc740' : answered ? '#e05050' : '#c8a830',
          animation: 'resultIconPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both',
        }}>
          {icon}
        </div>
        <div style={{
          ...s.resultText,
          color: wasCorrect ? '#8acc40' : answered ? '#e07070' : '#c8a830',
        }}>
          {text}
        </div>
      </div>

      {/* ── Мой счёт ── */}
      <div style={s.posCard}>
        <div style={s.posLabel}>Мой счёт</div>
        <div style={{
          ...s.posValue,
          animation: wasCorrect ? 'bounceIn 0.5s 0.3s cubic-bezier(0.175,0.885,0.32,1.275) both' : 'fadeIn 0.4s ease',
        }}>
          {myScore ?? 0}
          <span style={s.posOf}> / 11</span>
        </div>
      </div>

      {/* ── Правильный ответ ── */}
      <div style={s.correctBlock}>
        <div style={s.correctLabel}>Правильный ответ</div>
        <div style={s.correctAns}>
          <div style={s.correctLetter}>{LETTERS[correct]}</div>
          <span style={s.correctText}>{question.answers[correct]}</span>
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
    animation: 'fadeInScale 0.35s ease',
  },
  resultBadge: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
    borderRadius: 20, padding: '22px 44px',
    border: '1px solid',
  },
  badgeCorrect: {
    background: 'rgba(10,30,10,0.9)',
    borderColor: 'rgba(107,199,64,.6)',
    boxShadow: '0 0 32px rgba(90,154,48,.2)',
  },
  badgeWrong: {
    background: 'rgba(30,8,4,0.9)',
    borderColor: 'rgba(200,72,48,.5)',
    boxShadow: '0 0 24px rgba(200,72,48,.12)',
  },
  badgeMissed: {
    background: 'rgba(20,16,4,0.9)',
    borderColor: 'rgba(200,168,48,.4)',
  },
  resultIcon: {
    fontSize: 54,
    fontFamily: "'Cinzel', serif",
    lineHeight: 1,
  },
  resultText: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16, letterSpacing: 1,
  },
  posCard: {
    background: 'rgba(4,12,5,0.85)',
    border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '12px 36px',
    textAlign: 'center',
  },
  posLabel: {
    fontSize: 10, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
  },
  posValue: {
    fontFamily: "'Cinzel', serif",
    fontSize: 40, color: '#f0d060',
    lineHeight: 1,
  },
  posOf: { fontSize: 20, color: '#5a9a30' },
  correctBlock: {
    width: '100%', maxWidth: 320,
    background: 'rgba(4,12,5,0.85)',
    border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '14px 16px',
    animation: 'slideUp 0.4s 0.15s ease both',
  },
  correctLabel: {
    fontSize: 10, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10,
  },
  correctAns: {
    display: 'flex', alignItems: 'center', gap: 10,
  },
  correctLetter: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#152a0c', border: '1px solid #5a9a30',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#8acc40', fontWeight: 700,
    fontFamily: "'Cinzel', serif", flexShrink: 0,
  },
  correctText: { fontSize: 14, color: '#8acc40', lineHeight: 1.3 },
  hint: {
    fontSize: 11, color: '#3a6028',
    letterSpacing: 1, animation: 'pulse 1.5s infinite',
  },
};
