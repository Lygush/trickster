import React, { useEffect, useRef, useState } from 'react';

const LETTERS        = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 30;

const HINDRANCE = {
  1: { text: '⚡ Ананси путает!',  sub: 'Один из ответов — ловушка',    color: '#c8a830' },
  2: { text: '⚡ Ананси мешает!',  sub: 'Два ответа перепутаны местами', color: '#c87830' },
  3: { text: '⚡ Ананси злится!',  sub: 'Варианты перемешаны',           color: '#c84830' },
};

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

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function AnswerScreen({ question, hindranceLevel, onAnswer, myAnswer, me }) {
  const [timeLeft,       setTimeLeft]       = useState(ANSWER_TIMEOUT);
  const [displayAnswers, setDisplayAnswers] = useState([]);
  const [originalIdx,    setOriginalIdx]    = useState([0, 1, 2, 3]);
  const [shaking,        setShaking]        = useState(false);
  // flashIdx: индекс нажатой кнопки для анимации вспышки
  const [flashIdx,       setFlashIdx]       = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!question) return;
    setTimeLeft(ANSWER_TIMEOUT);
    setFlashIdx(null);
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
    if (myAnswer !== null) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [question?.id, myAnswer]); // eslint-disable-line

  if (!question) return null;

  const pct       = (timeLeft / ANSWER_TIMEOUT) * 100;
  const isDanger  = timeLeft <= 6;
  const isWarning = timeLeft <= 12 && !isDanger;
  const barGrad   = isDanger
    ? 'linear-gradient(90deg,#c03030,#f06060)'
    : isWarning
      ? 'linear-gradient(90deg,#c08020,#f0c060)'
      : 'linear-gradient(90deg,#6bc740,#c6f060)';
  const numColor  = isDanger ? '#f06060' : isWarning ? '#f0a040' : '#c6f060';

  const hasAnswered = myAnswer !== null;
  const hindrance   = HINDRANCE[hindranceLevel];

  const handlePress = (visualIdx) => {
    if (hasAnswered || timeLeft === 0) return;
    setFlashIdx(visualIdx);
    onAnswer(originalIdx[visualIdx]);
  };

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

      {/* ── Шапка ── */}
      <div style={s.header}>
        <div style={s.av}>{CHAR_EMOJI[me?.character] || '?'}</div>
        <div style={s.info}>
          <div style={s.name}>{me?.name || '—'}</div>
          <div style={s.pts}>{me?.score ?? 0} очков</div>
        </div>
      </div>

      {/* ── Таймер ── */}
      <div style={{
        ...s.timerWrap,
        animation: isDanger ? 'timerDangerPhone 0.5s ease-in-out infinite' : 'none',
      }}>
        <div style={s.timerBar}>
          <div style={{ ...s.timerFill, width: `${pct}%`, background: barGrad }}/>
        </div>
        <div style={{
          ...s.timerNum,
          color: numColor,
          fontSize: isDanger ? 20 : isWarning ? 17 : 15,
          transition: 'color .4s, font-size .3s',
        }}>
          {timeLeft}
        </div>
      </div>

      {/* ── Вопрос ── */}
      <div style={s.question}>{question.text}</div>

      {/* ── Ответы 2×2 ── */}
      <div style={{ ...s.grid, animation: shaking ? 'shake 0.6s ease' : 'none' }}>
        {displayAnswers.map((ans, i) => {
          const isChosen  = hasAnswered && myAnswer === originalIdx[i];
          const isFlashed = flashIdx === i;
          const isDimmed  = hasAnswered && !isChosen;

          return (
            <button
              key={i}
              style={{
                ...s.btn,
                ...(isDimmed  ? s.btnDim    : {}),
                ...(isChosen  ? s.btnChosen : {}),
                // Stagger на появление при смене вопроса
                animation: isFlashed
                  ? 'btnPress 0.18s ease'
                  : `answerAppear 0.32s cubic-bezier(0.22,0.61,0.36,1) ${i * 70}ms both`,
              }}
              onClick={() => handlePress(i)}
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
  banner: {
    background: 'rgba(20,10,4,.92)',
    border: '1px solid',
    borderRadius: 10, padding: '8px 12px',
    display: 'flex', flexDirection: 'column', gap: 2,
    flexShrink: 0,
  },
  bannerText: { fontFamily: "'Cinzel',serif", fontSize: 12, letterSpacing: .3 },
  bannerSub:  { fontSize: 10, color: '#a07840' },
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
  timerWrap: {
    display: 'flex', alignItems: 'center', gap: 8,
    flexShrink: 0,
  },
  timerBar: {
    flex: 1, height: 5,
    background: 'rgba(255,255,255,.08)',
    borderRadius: 3, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 3,
    transition: 'width 1s linear, background .5s',
  },
  timerNum: {
    fontFamily: "'Cinzel',serif",
    fontWeight: 700,
    minWidth: 26, textAlign: 'right',
    flexShrink: 0,
  },
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8, flex: 1, minHeight: 0,
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
    WebkitTapHighlightColor: 'transparent',
    minHeight: 0,
    // transition только для не-анимированных свойств
    transition: 'border-color .2s, background .2s, opacity .2s',
  },
  btnDim:    { opacity: 0.3, cursor: 'default' },
  btnChosen: {
    borderColor: '#c8a830',
    background: 'rgba(30,22,2,.95)',
    boxShadow: '0 0 18px rgba(200,168,48,.25)',
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
  status: {
    textAlign: 'center',
    fontSize: 11, color: '#5a9a30',
    letterSpacing: .4, flexShrink: 0,
    animation: 'fadeIn .3s ease',
  },
};
