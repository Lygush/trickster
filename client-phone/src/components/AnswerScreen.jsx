import React, { useEffect, useState } from 'react';

const LETTERS = ['А', 'Б', 'В', 'Г'];
const ANSWER_TIMEOUT = 20;

const HINDRANCE_LABELS = {
  1: { text: 'Ананси путает!', sub: 'Один из ответов — ловушка', color: '#c8a830' },
  2: { text: 'Ананси мешает!', sub: 'Два ответа перепутаны местами', color: '#c87830' },
  3: { text: 'Ананси злится!', sub: 'Варианты перемешаны', color: '#c84830' },
};

function applyHindrance(answers, level) {
  if (!level || level === 0) return answers;

  const result = [...answers];

  if (level === 1) {
    // Один случайный неверный ответ помечается визуально как "ловушка" — просто показываем предупреждение
    return result;
  }

  if (level === 2) {
    // Меняем два случайных ответа местами
    const i = Math.floor(Math.random() * 4);
    let j = (i + 1 + Math.floor(Math.random() * 3)) % 4;
    [result[i], result[j]] = [result[j], result[i]];
    return result;
  }

  if (level === 3) {
    // Перемешиваем все ответы (Fisher-Yates)
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  return result;
}

export default function AnswerScreen({ question, hindranceLevel, onAnswer, myAnswer, aanansiHelp }) {
  const [timeLeft, setTimeLeft] = useState(ANSWER_TIMEOUT);
  const [displayAnswers, setDisplayAnswers] = useState([]);
  const [shaking, setShaking] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Перемешиваем ответы при получении нового вопроса
  useEffect(() => {
    if (!question) return;
    setTimeLeft(ANSWER_TIMEOUT);
    setDisplayAnswers(applyHindrance(question.answers, hindranceLevel));
    setShaking(hindranceLevel >= 2);
    setShowHelp(false);

    // Убираем тряску через секунду
    const t = setTimeout(() => setShaking(false), 800);
    return () => clearTimeout(t);
  }, [question?.id]);

  // Таймер
  useEffect(() => {
    if (myAnswer !== null) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [question?.id, myAnswer]);

  // Показываем помощь Ананси
  useEffect(() => {
    if (aanansiHelp) {
      setShowHelp(true);
      const t = setTimeout(() => setShowHelp(false), 4000);
      return () => clearTimeout(t);
    }
  }, [aanansiHelp]);

  if (!question) return null;

  const pct        = (timeLeft / ANSWER_TIMEOUT) * 100;
  const isDanger   = timeLeft <= 5;
  const isWarning  = timeLeft <= 9 && !isDanger;
  const timerColor = isDanger ? '#c84830' : isWarning ? '#c8a830' : '#5a9a30';
  const hindrance  = HINDRANCE_LABELS[hindranceLevel];
  const hasAnswered = myAnswer !== null;

  return (
    <div style={s.wrap}>

      {/* Помеха лидера */}
      {hindrance && !hasAnswered && (
        <div style={{ ...s.hindranceBanner, borderColor: hindrance.color, animation: shaking ? 'shake 0.6s ease' : 'fadeIn 0.3s ease' }}>
          <div style={{ ...s.hindranceTitle, color: hindrance.color }}>
            🕷️ {hindrance.text}
          </div>
          <div style={s.hindranceSub}>{hindrance.sub}</div>
        </div>
      )}

      {/* Помощь Ананси отстающему */}
      {showHelp && (
        <div style={s.helpBanner}>
          <div style={s.helpTitle}>🕷️ Ананси помогает тебе!</div>
          <div style={s.helpSub}>Ты далеко позади — паук подскажет</div>
        </div>
      )}

      {/* Вопрос */}
      <div style={s.question}>{question.text}</div>

      {/* Таймер */}
      <div style={s.timerRow}>
        <div style={s.timerBar}>
          <div style={{
            ...s.timerFill,
            width: `${pct}%`,
            background: timerColor,
            boxShadow: `0 0 8px ${timerColor}88`,
          }}/>
        </div>
        <div style={{ ...s.timerNum, color: timerColor }}>{timeLeft}</div>
      </div>

      {/* Кнопки ответов */}
      <div style={s.answers}>
        {displayAnswers.map((ans, i) => {
          const isMyAnswer = hasAnswered && myAnswer === i;
          return (
            <button
              key={i}
              style={{
                ...s.ansBtn,
                ...(hasAnswered ? s.ansBtnDim : {}),
                ...(isMyAnswer  ? s.ansBtnChosen : {}),
              }}
              onClick={() => !hasAnswered && timeLeft > 0 && onAnswer(i)}
              disabled={hasAnswered || timeLeft === 0}
            >
              <div style={{
                ...s.letter,
                ...(isMyAnswer ? s.letterChosen : {}),
              }}>
                {LETTERS[i]}
              </div>
              <span style={s.ansText}>{ans}</span>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div style={s.answered}>
          ✓ Ответ принят — смотри на экран!
        </div>
      )}

      {!hasAnswered && timeLeft === 0 && (
        <div style={s.timeout}>Время вышло!</div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    height: '100%', padding: '16px 16px 20px',
    gap: 14, overflowY: 'auto',
    animation: 'fadeIn 0.35s ease',
  },
  hindranceBanner: {
    background: 'rgba(20,10,4,0.9)',
    border: '1px solid',
    borderRadius: 12, padding: '10px 14px',
    animation: 'slideUp 0.3s ease',
  },
  hindranceTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13, letterSpacing: 0.5,
  },
  hindranceSub: {
    fontSize: 11, color: '#7aaa50', marginTop: 3,
  },
  helpBanner: {
    background: 'rgba(4,20,10,0.9)',
    border: '1px solid #2a5a22',
    borderRadius: 12, padding: '10px 14px',
    animation: 'bounceIn 0.4s ease',
  },
  helpTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13, color: '#8acc40',
  },
  helpSub: {
    fontSize: 11, color: '#5a9a30', marginTop: 3,
  },
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(15px, 4.5vw, 20px)',
    color: '#d8f0b0', lineHeight: 1.45,
    background: 'rgba(4,12,5,0.85)',
    border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '16px',
    backdropFilter: 'blur(8px)',
    flexShrink: 0,
  },
  timerRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    flexShrink: 0,
  },
  timerBar: {
    flex: 1, height: 4,
    background: '#0f2010', borderRadius: 2, overflow: 'hidden',
  },
  timerFill: {
    height: '100%', borderRadius: 2,
    transition: 'width 1s linear, background .5s',
  },
  timerNum: {
    fontFamily: "'Cinzel', serif",
    fontSize: 20, minWidth: 28, textAlign: 'right',
    transition: 'color .5s',
  },
  answers: {
    display: 'flex', flexDirection: 'column', gap: 10,
    flex: 1,
  },
  ansBtn: {
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'rgba(10,22,10,0.85)',
    border: '1.5px solid #1c3a18',
    borderRadius: 14, padding: '16px 14px',
    cursor: 'pointer', color: '#90c068',
    fontSize: 'clamp(13px, 3.5vw, 16px)',
    fontFamily: "'Nunito', sans-serif",
    transition: 'border-color .2s, background .2s, transform .1s',
    textAlign: 'left', flex: 1,
    minHeight: 58,
    WebkitTapHighlightColor: 'transparent',
  },
  ansBtnDim: {
    opacity: 0.45,
    cursor: 'default',
  },
  ansBtnChosen: {
    opacity: 1,
    borderColor: '#c8a830',
    background: 'rgba(30,25,4,0.95)',
    boxShadow: '0 0 20px rgba(200,168,48,0.2)',
    transform: 'scale(1.01)',
  },
  letter: {
    width: 30, height: 30, borderRadius: '50%',
    background: '#0a1a0c', border: '1px solid #2a4a20',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, color: '#5a9a30', flexShrink: 0,
    fontWeight: 700, fontFamily: "'Cinzel', serif",
    transition: 'border-color .2s, color .2s',
  },
  letterChosen: {
    borderColor: '#c8a830', color: '#f0d060',
    background: '#1a1a04',
  },
  ansText: { flex: 1, lineHeight: 1.3 },
  answered: {
    fontSize: 13, color: '#5a9a30',
    textAlign: 'center', letterSpacing: 0.5,
    animation: 'fadeIn 0.3s ease',
    flexShrink: 0,
  },
  timeout: {
    fontSize: 13, color: '#c84830',
    textAlign: 'center', letterSpacing: 1,
    textTransform: 'uppercase',
    flexShrink: 0,
  },
};
