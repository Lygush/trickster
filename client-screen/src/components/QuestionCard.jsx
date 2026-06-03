import React, { useEffect, useRef, useState } from 'react';

const LETTERS      = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 30;

export default function QuestionCard({ question, revealData }) {
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIMEOUT);
  const intervalRef = useRef(null);

  useEffect(() => {
    setTimeLeft(ANSWER_TIMEOUT);
    clearInterval(intervalRef.current);
    if (!revealData) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => { if (t <= 1) { clearInterval(intervalRef.current); return 0; } return t - 1; });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [question?.id, !!revealData]);

  if (!question) return null;

  return (
    <div style={s.card}>
      {/* Вопрос */}
      <div style={s.question}>{question.text}</div>

      {/* Ответы */}
      <div style={s.answers}>
        {question.answers.map((ans, i) => {
          const isCorrect = revealData != null && i === revealData.correctIndex;
          const isWrong   = revealData != null && i !== revealData.correctIndex;
          return (
            <div key={i} style={{ ...s.ans, ...(isCorrect ? s.ansCorrect : isWrong ? s.ansWrong : {}) }}>
              <div style={{ ...s.letter, ...(isCorrect ? s.letterCorrect : {}) }}>{LETTERS[i]}</div>
              <span style={s.ansText}>{ans}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  card: {
    background: 'rgba(4,12,5,0.93)',
    border: '1px solid #1e3e1c',
    borderRadius: 18,
    padding: '24px 28px 22px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 8px 50px rgba(0,0,0,0.75)',
    display: 'flex', flexDirection: 'column', gap: 16,
    animation: 'fadeIn 0.35s ease',
  },
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(18px, 2.2vw, 30px)',
    color: '#d8f0b0', lineHeight: 1.45,
    textShadow: '0 0 40px rgba(90,154,48,0.12)',
  },
  answers: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
  },
  ans: {
    background: 'rgba(10,22,10,0.85)',
    border: '1px solid #1c3a18', borderRadius: 12,
    padding: '13px 16px', color: '#90c068',
    fontSize: 'clamp(13px, 1.35vw, 19px)',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'all .3s',
  },
  ansCorrect: {
    borderColor: '#5a9a30', background: 'rgba(20,50,10,0.92)',
    color: '#8acc40', boxShadow: '0 0 20px rgba(90,154,48,0.28)',
  },
  ansWrong: { opacity: 0.28 },
  letter: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#0a1a0c', border: '1px solid #2a4a20',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, color: '#5a9a30', flexShrink: 0,
    fontWeight: 700, fontFamily: "'Cinzel', serif",
  },
  letterCorrect: { background: '#152a0c', borderColor: '#5a9a30', color: '#8acc40' },
  ansText: { flex: 1, lineHeight: 1.3 },
};
