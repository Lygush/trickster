import React, { useEffect, useState } from 'react';

const LETTERS        = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 30;

const HINDRANCE = {
  1: { text: '⚡ Ананси путает!',  sub: 'Один из ответов — ловушка',      color: '#c8a830' },
  2: { text: '⚡ Ананси мешает!',  sub: 'Два ответа перепутаны местами',   color: '#c87830' },
  3: { text: '⚡ Ананси злится!',  sub: 'Варианты перемешаны',             color: '#c84830' },
};

// Возвращает { display: string[], originalIdx: number[] }
// originalIdx[i] — оригинальный индекс ответа на визуальной позиции i
function applyHindrance(answers, level) {
  const originalIdx = [0, 1, 2, 3];
  if (level === 2) {
    const i = Math.floor(Math.random() * 4);
    const j = (i + 1 + Math.floor(Math.random() * 3)) % 4;
    [originalIdx[i], originalIdx[j]] = [originalIdx[j], originalIdx[i]];
  } else if (level >= 3) {
    for (let i = originalIdx.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [originalIdx[i], originalIdx[j]] = [originalIdx[j], originalIdx[i]];
    }
  }
  return { display: originalIdx.map(i => answers[i]), originalIdx };
}

export default function AnswerScreen({ question, hindranceLevel, onAnswer, myAnswer, me }) {
  const [timeLeft,      setTimeLeft]      = useState(ANSWER_TIMEOUT);
  const [displayAnswers, setDisplayAnswers] = useState([]);
  const [originalIdx,   setOriginalIdx]   = useState([0, 1, 2, 3]);
  const [shaking,       setShaking]       = useState(false);

  useEffect(() => {
    if (!question) return;
    setTimeLeft(ANSWER_TIMEOUT);
    const { display, originalIdx: idx } = applyHindrance(question.answers, hindranceLevel);
    setDisplayAnswers(display);
    setOriginalIdx(idx);
    if (hindranceLevel >= 2) {
      setShaking(true);
      const t = setTimeout(() => setShaking(false), 700);
      return () => clearTimeout(t);
    }
  }, [question?.id]); // eslint-disable-line

  useEffect(() => {
    if (myAnswer !== null) return;
    const iv = setInterval(() => {
      setTimeLeft(t => { if (t <= 1) { clearInterval(iv); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(iv);
  }, [question?.id, myAnswer]);

  if (!question) return null;

  const pct        = (timeLeft / ANSWER_TIMEOUT) * 100;
  const isDanger   = timeLeft <= 6;
  const isWarning  = timeLeft <= 12 && !isDanger;
  const barColor   = isDanger ? '#c03030' : isWarning ? '#c08020' : '#6bc740';
  const barGrad    = isDanger
    ? 'linear-gradient(90deg,#c03030,#f06060)'
    : isWarning ? 'linear-gradient(90deg,#c08020,#f0c060)'
    : 'linear-gradient(90deg,#6bc740,#c6f060)';
  const numColor   = isDanger ? '#f06060' : isWarning ? '#f0a040' : '#c6f060';

  const hasAnswered = myAnswer !== null;
  const hindrance   = HINDRANCE[hindranceLevel];

  return (
    <div style={s.wrap}>

      {/* ── Помеха лидера ── */}
      {hindrance && !hasAnswered && (
        <div style={{
          ...s.banner,
          borderColor: hindrance.color,
          animation: shaking ? 'shake 0.6s ease' : 'fadeIn 0.3s ease',
        }}>
          <span style={{ ...s.bannerText, color: hindrance.color }}>{hindrance.text}</span>
          <span style={s.bannerSub}>{hindrance.sub}</span>
        </div>
      )}

      {/* ── Шапка: аватар + имя + очки ── */}
      <div style={s.header}>
        <div style={s.av}>
          {me?.character === 'spider'  ? '🕷️'
         : me?.character === 'frog'   ? '🐸'
         : me?.character === 'snake'  ? '🐍'
         : me?.character === 'beetle' ? '🪲'
         : me?.character === 'lizard' ? '🦎'
         : '?'}
        </div>
        <div style={s.info}>
          <div style={s.name}>{me?.name || '—'}</div>
          <div style={s.pts}>{me?.score ?? 0} очков</div>
        </div>
      </div>

      {/* ── Таймер ── */}
      <div style={s.timerWrap}>
        <div style={s.timerBar}>
          <div style={{ ...s.timerFill, width: `${pct}%`, background: barGrad }}/>
        </div>
        <div style={{ ...s.timerNum, color: numColor }}>{timeLeft}</div>
      </div>

      {/* ── Вопрос ── */}
      <div style={s.question}>{question.text}</div>

      {/* ── Ответы 2×2 ── */}
      <div style={{ ...s.grid, animation: shaking ? 'shake 0.6s ease' : 'none' }}>
        {displayAnswers.map((ans, i) => {
          const isChosen = hasAnswered && myAnswer === i;
          return (
            <button
              key={i}
              style={{
                ...s.btn,
                ...(hasAnswered && !isChosen ? s.btnDim    : {}),
                ...(isChosen               ? s.btnChosen  : {}),
              }}
              onClick={() => !hasAnswered && timeLeft > 0 && onAnswer(originalIdx[i])}
              disabled={hasAnswered || timeLeft === 0}
            >
              <div style={{ ...s.key, ...(isChosen ? s.keyChosen : {}) }}>
                {LETTERS[i]}
              </div>
              <div style={s.ansText}>{ans}</div>
            </button>
          );
        })}
      </div>

      {/* ── Статус ── */}
      {hasAnswered && (
        <div style={s.status}>✓ Ответ принят — смотри на экран!</div>
      )}
      {!hasAnswered && timeLeft === 0 && (
        <div style={{ ...s.status, color: '#c84830' }}>Время вышло!</div>
      )}

    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    height: '100%', padding: '12px 14px 16px',
    gap: 10, overflowY: 'auto',
    animation: 'fadeIn 0.3s ease',
  },

  // Помеха
  banner: {
    background: 'rgba(20,10,4,.92)',
    border: '1px solid',
    borderRadius: 10, padding: '8px 12px',
    display: 'flex', flexDirection: 'column', gap: 2,
    flexShrink: 0,
  },
  bannerText: {
    fontFamily: "'Cinzel',serif",
    fontSize: 12, letterSpacing: .3,
  },
  bannerSub: { fontSize: 10, color: '#a07840' },

  // Шапка
  header: {
    display: 'flex', alignItems: 'center', gap: 10,
    flexShrink: 0,
  },
  av: {
    width: 36, height: 36, borderRadius: '50%',
    border: '1.5px solid rgba(107,199,64,.45)',
    background: '#1a2e10',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, flexShrink: 0,
  },
  info: { display: 'flex', flexDirection: 'column', gap: 1 },
  name: { fontFamily: "'Cinzel',serif", fontSize: 13, color: '#9de05a' },
  pts:  { fontSize: 10, color: 'rgba(150,220,90,.45)' },

  // Таймер
  timerWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    flexShrink: 0,
  },
  timerBar: {
    flex: 1, height: 4,
    background: 'rgba(255,255,255,.08)',
    borderRadius: 2, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 2,
    transition: 'width 1s linear, background .5s',
  },
  timerNum: {
    fontFamily: "'Cinzel',serif",
    fontSize: 15, fontWeight: 700,
    minWidth: 22, textAlign: 'right',
    transition: 'color .4s', flexShrink: 0,
  },

  // Вопрос
  question: {
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(14px,4vw,19px)',
    color: 'rgba(200,230,160,.55)',
    lineHeight: 1.4, textAlign: 'center',
    padding: '10px 6px',
    borderTop: '1px solid rgba(107,199,64,.1)',
    borderBottom: '1px solid rgba(107,199,64,.1)',
    flexShrink: 0,
  },

  // Сетка ответов 2×2
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8,
    flex: 1, minHeight: 0,
  },
  btn: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 6,
    background: 'rgba(20,35,12,.82)',
    border: '1.5px solid rgba(107,199,64,.22)',
    borderRadius: 14,
    padding: '10px 6px',
    cursor: 'pointer',
    transition: 'border-color .2s, background .2s, transform .1s',
    WebkitTapHighlightColor: 'transparent',
    minHeight: 0,
  },
  btnDim:    { opacity: 0.35, cursor: 'default' },
  btnChosen: {
    borderColor: '#c8a830',
    background: 'rgba(30,22,2,.95)',
    boxShadow: '0 0 16px rgba(200,168,48,.22)',
    transform: 'scale(1.02)',
  },
  key: {
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(28px,8vw,42px)',
    fontWeight: 900, color: '#c8e8a0', lineHeight: 1,
  },
  keyChosen: { color: '#f0d060' },
  ansText: {
    fontFamily: "'Nunito',sans-serif",
    fontSize: 'clamp(10px,3vw,14px)',
    color: 'rgba(180,220,140,.75)',
    textAlign: 'center', lineHeight: 1.25,
  },

  // Статус
  status: {
    textAlign: 'center',
    fontSize: 11, color: '#5a9a30',
    letterSpacing: .4, flexShrink: 0,
    animation: 'fadeIn .3s ease',
  },
};
