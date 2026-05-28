import React, { useEffect, useRef, useState } from 'react';

const LETTERS = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 20;

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function QuestionCard({ question, players, answers, revealData, questionIndex, leaderPosition }) {
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIMEOUT);
  const intervalRef = useRef(null);

  // Reset timer on new question, stop when revealed
  useEffect(() => {
    setTimeLeft(ANSWER_TIMEOUT);
    clearInterval(intervalRef.current);

    if (!revealData) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [question?.id, !!revealData]);

  if (!question) return null;

  const pct       = (timeLeft / ANSWER_TIMEOUT) * 100;
  const isWarning = timeLeft <= 9 && timeLeft > 5;
  const isDanger  = timeLeft <= 5;
  const timerColor = isDanger ? '#c84830' : isWarning ? '#c8a830' : '#5a9a30';

  const answeredIds = new Set(Object.keys(answers || {}));
  const leader = [...players].sort((a, b) => b.position - a.position)[0];

  return (
    <div style={styles.card}>
      {/* Question text */}
      <div style={styles.question}>{question.text}</div>

      {/* Answer grid */}
      <div style={styles.answers}>
        {question.answers.map((ans, i) => {
          const isCorrect = revealData != null && i === revealData.correctIndex;
          const isWrong   = revealData != null && i !== revealData.correctIndex;
          return (
            <div key={i} style={{
              ...styles.ans,
              ...(isCorrect ? styles.ansCorrect : {}),
              ...(isWrong   ? styles.ansWrong   : {}),
            }}>
              <div style={{
                ...styles.ansLetter,
                ...(isCorrect ? styles.ansLetterCorrect : {}),
              }}>{LETTERS[i]}</div>
              {ans}
            </div>
          );
        })}
      </div>

      {/* Bottom row: timer + players */}
      <div style={styles.bottomRow}>
        {/* Timer */}
        <div style={styles.timerBar}>
          <div style={{
            ...styles.timerFill,
            width: `${pct}%`,
            background: timerColor,
            boxShadow: `0 0 8px ${timerColor}99`,
          }}/>
        </div>
        <div style={{ ...styles.timerNum, color: timerColor }}>{timeLeft}</div>

        {/* Players */}
        <div style={styles.playersRow}>
          {players.map(p => {
            const hasAnswered = answeredIds.has(p.id);
            const isLeader = leader?.id === p.id;
            return (
              <div key={p.id} style={styles.player}>
                <div style={{
                  ...styles.avatar,
                  borderColor: isLeader ? '#c8a830' : hasAnswered ? '#5a9a30' : '#1c3a18',
                  boxShadow:   isLeader
                    ? '0 0 12px rgba(200,168,48,0.35)'
                    : hasAnswered
                      ? '0 0 10px rgba(90,154,48,0.25)'
                      : 'none',
                }}>
                  {CHAR_EMOJI[p.character] || '?'}
                  {hasAnswered && <div style={styles.answeredDot}>✓</div>}
                </div>
                <div style={{
                  ...styles.playerName,
                  color: isLeader ? '#c8a830' : hasAnswered ? '#7aaa50' : '#3a6028',
                }}>
                  {p.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: 'rgba(4,12,5,0.88)',
    border: '1px solid #1c3a1a',
    borderRadius: 14,
    padding: '22px 26px 18px',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(90,154,48,0.06)',
    animation: 'fadeIn 0.4s ease',
  },
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(16px, 1.9vw, 24px)',
    color: '#d8f0b0',
    lineHeight: 1.45,
    marginBottom: 20,
    textShadow: '0 0 40px rgba(90,154,48,0.2)',
  },
  answers: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 18,
  },
  ans: {
    background: 'rgba(10,22,10,0.85)',
    border: '1px solid #1c3a18',
    borderRadius: 9,
    padding: '11px 14px',
    color: '#90c068',
    fontSize: 'clamp(12px, 1.1vw, 14px)',
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    // transition убран — иначе цвет «доезжает» из предыдущего вопроса
  },
  ansCorrect: {
    borderColor: '#5a9a30',
    background: 'rgba(20,50,10,0.9)',
    color: '#8acc40',
    boxShadow: '0 0 18px rgba(90,154,48,0.25)',
  },
  ansWrong: {
    opacity: 0.4,
  },
  ansLetter: {
    width: 24, height: 24, borderRadius: '50%',
    background: '#0a1a0c', border: '1px solid #2a4a20',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, color: '#5a9a30', flexShrink: 0,
    fontWeight: 600, fontFamily: "'Cinzel', serif",
  },
  ansLetterCorrect: {
    background: '#152a0c', borderColor: '#5a9a30', color: '#8acc40',
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  timerBar: {
    flex: 1, height: 3, background: '#0f2010', borderRadius: 2, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 2,
    transition: 'width 1s linear, background .5s',
  },
  timerNum: {
    fontFamily: "'Cinzel', serif",
    fontSize: 18,
    minWidth: 26,
    textAlign: 'right',
    transition: 'color .5s',
  },
  playersRow: {
    display: 'flex',
    gap: 14,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  player: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: 'rgba(10,26,12,0.9)',
    border: '1.5px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
    transition: 'border-color .3s, box-shadow .3s',
    position: 'relative',
  },
  answeredDot: {
    position: 'absolute', bottom: -1, right: -1,
    width: 12, height: 12, borderRadius: '50%',
    background: '#5a9a30', border: '2px solid #040c05',
    fontSize: 6, color: '#040c05', fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  playerName: {
    fontSize: 10,
    transition: 'color .3s',
  },
};
