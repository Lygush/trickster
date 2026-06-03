import React, { useEffect, useRef, useState } from 'react';

const LETTERS = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 30;

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function QuestionCard({ question, players, answers, revealData, questionIndex }) {
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIMEOUT);
  const intervalRef = useRef(null);

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

  const pct        = (timeLeft / ANSWER_TIMEOUT) * 100;
  const isWarning  = timeLeft <= 12 && timeLeft > 6;
  const isDanger   = timeLeft <= 6;
  const timerColor = isDanger ? '#c84830' : isWarning ? '#c8a830' : '#5a9a30';

  const answeredIds = new Set(Object.keys(answers || {}));
  const sorted      = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const leaderId    = sorted[0]?.id;

  return (
    <div style={styles.card}>

      {/* ── Вопрос ── */}
      <div style={styles.question}>{question.text}</div>

      {/* ── Ответы ── */}
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
              <span style={styles.ansText}>{ans}</span>
            </div>
          );
        })}
      </div>

      {/* ── Нижняя панель: таймер + игроки ── */}
      <div style={styles.bottomRow}>

        {/* Таймер */}
        <div style={styles.timerBlock}>
          <div style={{ ...styles.timerNum, color: timerColor }}>{timeLeft}</div>
          <div style={styles.timerBarWrap}>
            <div style={{
              ...styles.timerFill,
              width: `${pct}%`,
              background: timerColor,
              boxShadow: `0 0 8px ${timerColor}99`,
            }}/>
          </div>
        </div>

        {/* Разделитель */}
        <div style={styles.divider}/>

        {/* Игроки — скролл если много */}
        <div style={styles.playersRow}>
          {sorted.map(p => {
            const hasAnswered = answeredIds.has(p.id);
            const isLead      = p.id === leaderId;

            return (
              <div key={p.id} style={styles.player}>
                {/* Аватар */}
                <div style={{
                  ...styles.avatar,
                  borderColor: isLead
                    ? '#c8a830'
                    : hasAnswered
                      ? '#5a9a30'
                      : '#1c3a18',
                  boxShadow: isLead
                    ? '0 0 16px rgba(200,168,48,0.4)'
                    : hasAnswered
                      ? '0 0 10px rgba(90,154,48,0.25)'
                      : 'none',
                  background: isLead ? 'rgba(30,22,2,0.9)' : 'rgba(10,20,10,0.9)',
                }}>
                  <span style={styles.avatarEmoji}>{CHAR_EMOJI[p.character] || '?'}</span>

                  {/* Галочка ответа */}
                  {hasAnswered && !revealData && (
                    <div style={styles.checkDot}>✓</div>
                  )}

                  {/* После ревила — правильно/нет */}
                  {revealData && hasAnswered && (() => {
                    const playerAns = answers[p.id];
                    const correct   = playerAns && Number(playerAns.answerIndex) === revealData.correctIndex;
                    return (
                      <div style={{
                        ...styles.checkDot,
                        background: correct ? '#5a9a30' : '#c84830',
                      }}>
                        {correct ? '✓' : '✗'}
                      </div>
                    );
                  })()}
                </div>

                {/* Имя */}
                <div style={{
                  ...styles.playerName,
                  color: isLead ? '#c8a830' : hasAnswered ? '#7aaa50' : '#3a6028',
                }}>
                  {p.name.length > 6 ? p.name.slice(0, 6) + '…' : p.name}
                </div>

                {/* Позиция */}
                <div style={styles.playerPos}>
                  {p.score ?? 0}<span style={styles.playerPosOf}>/15</span>
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
    background: 'rgba(4,12,5,0.92)',
    border: '1px solid #1c3a1a',
    borderRadius: 18,
    padding: '28px 32px 22px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(90,154,48,0.07)',
    animation: 'fadeIn 0.4s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },

  /* Вопрос */
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(20px, 2.4vw, 32px)',
    color: '#d8f0b0',
    lineHeight: 1.4,
    textShadow: '0 0 40px rgba(90,154,48,0.15)',
  },

  /* Сетка ответов */
  answers: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  ans: {
    background: 'rgba(10,22,10,0.85)',
    border: '1px solid #1c3a18',
    borderRadius: 12,
    padding: '14px 18px',
    color: '#90c068',
    fontSize: 'clamp(14px, 1.4vw, 20px)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  ansCorrect: {
    borderColor: '#5a9a30',
    background: 'rgba(20,50,10,0.9)',
    color: '#8acc40',
    boxShadow: '0 0 22px rgba(90,154,48,0.3)',
  },
  ansWrong: {
    opacity: 0.3,
  },
  ansLetter: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#0a1a0c', border: '1px solid #2a4a20',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, color: '#5a9a30', flexShrink: 0,
    fontWeight: 700, fontFamily: "'Cinzel', serif",
  },
  ansLetterCorrect: {
    background: '#152a0c', borderColor: '#5a9a30', color: '#8acc40',
  },
  ansText: { flex: 1, lineHeight: 1.3 },

  /* Нижняя полоса */
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
  },

  /* Таймер */
  timerBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
    width: 52,
  },
  timerNum: {
    fontFamily: "'Cinzel', serif",
    fontSize: 36,
    lineHeight: 1,
    transition: 'color .5s',
  },
  timerBarWrap: {
    width: '100%', height: 4,
    background: '#0f2010', borderRadius: 2, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 2,
    transition: 'width 1s linear, background .5s',
  },

  divider: {
    width: 1, alignSelf: 'stretch',
    background: '#1a3818', flexShrink: 0,
  },

  /* Игроки */
  playersRow: {
    display: 'flex',
    gap: 16,
    alignItems: 'center',
    overflowX: 'auto',
    flex: 1,
    // скрываем scrollbar визуально
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  },
  player: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .3s, box-shadow .3s',
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 26, lineHeight: 1,
  },
  checkDot: {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: '50%',
    background: '#5a9a30', border: '2px solid #040c05',
    fontSize: 8, color: '#fff', fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  playerName: {
    fontSize: 12, fontFamily: "'Nunito', sans-serif",
    transition: 'color .3s', textAlign: 'center',
    maxWidth: 58,
  },
  playerPos: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, color: '#d8f0b0',
  },
  playerPosOf: {
    fontSize: 9, color: '#3a6028',
  },
};
