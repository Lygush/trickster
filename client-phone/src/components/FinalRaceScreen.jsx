import React, { useEffect, useState } from 'react';

const LETTERS = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 20;

export default function FinalRaceScreen({ question, myPosition, onAnswer, myAnswer, players, finalPositions }) {
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIMEOUT);

  useEffect(() => {
    if (!question) return;
    setTimeLeft(ANSWER_TIMEOUT);
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [question?.id]);

  const hasAnswered = myAnswer !== null;
  const pct = (timeLeft / ANSWER_TIMEOUT) * 100;
  const timerColor = timeLeft <= 5 ? '#c84830' : timeLeft <= 9 ? '#c8a830' : '#5a9a30';

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.flag}>🏁</div>
        <div style={s.title}>Финальная гонка!</div>
        <div style={s.myPos}>
          Позиция: <strong style={{ color: '#f0d060' }}>{myPosition || 0}</strong>
          <span style={{ color: '#3a6028' }}> / 12</span>
        </div>
      </div>

      {/* Позиции всех игроков */}
      {finalPositions && players && (
        <div style={s.positions}>
          {[...players]
            .sort((a, b) => (finalPositions[b.id] || 0) - (finalPositions[a.id] || 0))
            .map(p => (
              <div key={p.id} style={s.posRow}>
                <div style={s.posBar}>
                  <div style={{
                    ...s.posBarFill,
                    width: `${((finalPositions[p.id] || 0) / 12) * 100}%`,
                  }}/>
                </div>
                <span style={s.posNum}>{finalPositions[p.id] || 0}</span>
              </div>
            ))}
        </div>
      )}

      {question && (
        <>
          <div style={s.question}>{question.text}</div>
          <div style={s.timerRow}>
            <div style={s.timerBar}>
              <div style={{ ...s.timerFill, width: `${pct}%`, background: timerColor }}/>
            </div>
            <span style={{ ...s.timerNum, color: timerColor }}>{timeLeft}</span>
          </div>
          <div style={s.answers}>
            {question.answers.map((ans, i) => (
              <button
                key={i}
                style={{
                  ...s.ansBtn,
                  ...(hasAnswered ? s.ansDim : {}),
                  ...(hasAnswered && myAnswer === i ? s.ansChosen : {}),
                }}
                onClick={() => !hasAnswered && timeLeft > 0 && onAnswer(i)}
                disabled={hasAnswered || timeLeft === 0}
              >
                <div style={s.letter}>{LETTERS[i]}</div>
                <span>{ans}</span>
              </button>
            ))}
          </div>
          {hasAnswered && (
            <div style={s.answered}>✓ Ответ принят!</div>
          )}
        </>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    height: '100%', padding: '16px 16px 20px',
    gap: 12, overflowY: 'auto',
    animation: 'fadeIn 0.4s ease',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10,
    flexShrink: 0,
  },
  flag: { fontSize: 24 },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16, color: '#f0d060', flex: 1,
  },
  myPos: { fontSize: 13, color: '#7aaa50' },
  positions: {
    display: 'flex', flexDirection: 'column', gap: 4,
    background: 'rgba(4,12,5,0.7)',
    border: '1px solid #1c3a1a',
    borderRadius: 10, padding: '10px 12px',
    flexShrink: 0,
  },
  posRow: {
    display: 'flex', alignItems: 'center', gap: 8,
  },
  posBar: {
    flex: 1, height: 6, background: '#0f2010',
    borderRadius: 3, overflow: 'hidden',
  },
  posBarFill: {
    height: '100%', background: '#5a9a30', borderRadius: 3,
    transition: 'width 0.5s ease',
  },
  posNum: { fontSize: 11, color: '#5a9a30', minWidth: 20, textAlign: 'right' },
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(14px, 4vw, 18px)',
    color: '#d8f0b0', lineHeight: 1.4,
    background: 'rgba(4,12,5,0.85)',
    border: '1px solid #1c3a1a',
    borderRadius: 12, padding: '14px',
    flexShrink: 0,
  },
  timerRow: {
    display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
  },
  timerBar: {
    flex: 1, height: 4, background: '#0f2010',
    borderRadius: 2, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 2,
    transition: 'width 1s linear',
  },
  timerNum: {
    fontFamily: "'Cinzel', serif", fontSize: 18, minWidth: 28, textAlign: 'right',
  },
  answers: {
    display: 'flex', flexDirection: 'column', gap: 8, flex: 1,
  },
  ansBtn: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(10,22,10,0.85)',
    border: '1.5px solid #1c3a18', borderRadius: 12,
    padding: '14px', cursor: 'pointer',
    color: '#90c068', fontSize: 14,
    fontFamily: "'Nunito', sans-serif",
    textAlign: 'left', flex: 1, minHeight: 52,
  },
  ansDim: { opacity: 0.4, cursor: 'default' },
  ansChosen: {
    opacity: 1, borderColor: '#c8a830',
    background: 'rgba(30,25,4,0.95)',
  },
  letter: {
    width: 26, height: 26, borderRadius: '50%',
    background: '#0a1a0c', border: '1px solid #2a4a20',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, color: '#5a9a30', flexShrink: 0,
    fontWeight: 700, fontFamily: "'Cinzel', serif",
  },
  answered: {
    fontSize: 13, color: '#5a9a30',
    textAlign: 'center', flexShrink: 0,
  },
};
