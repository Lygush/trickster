import React, { useContext, useEffect, useRef, useState } from 'react';
import { LETTERS, CHAR_EMOJI } from '../shared/constants';
import useCountdown, { ClockContext } from '../shared/useCountdown';

// Помехи лидеру (решает сервер, телефон только показывает):
//   ур.1 — варианты перемешаны и «скачут», первый выбор Ананси сбрасывает
//   ур.2 — + телефон заблокирован первые секунды
//   ур.3 — + экран перевёрнут
const HINDRANCE = {
  1: { title: '⚡ Ананси путает лидера!', sub: 'Варианты перемешаны, а первый выбор он сбросит', color: '#d8b040' },
  2: { title: '⚡ Ананси мешает лидеру!', sub: 'Паутина держит телефон, варианты перемешаны', color: '#e08840' },
  3: { title: '⚡ Ананси в ярости!', sub: 'Мир перевернулся. Держись!', color: '#f06048' },
};

export default function AnswerScreen({ question, me, priv, deadline, duration, onAnswer }) {
  const serverNow = useContext(ClockContext);
  const { left, frac } = useCountdown(deadline, duration);
  const h = priv?.hindrance || null;
  const order = h?.order || [0, 1, 2, 3];
  const myAnswer = priv?.answer ?? null;

  const [tapped, setTapped]       = useState(null);  // оптимистично, до ответа сервера
  const [resetMsg, setResetMsg]   = useState(false);
  const [lockLeft, setLockLeft]   = useState(0);
  const prevReset = useRef(h?.resetPending);

  // Ананси сбросил выбор: сервер снял resetPending, а ответа нет
  useEffect(() => {
    if (prevReset.current && h && !h.resetPending && myAnswer === null) {
      setTapped(null);
      setResetMsg(true);
      navigator.vibrate?.(200);
      const t = setTimeout(() => setResetMsg(false), 2200);
      prevReset.current = false;
      return () => clearTimeout(t);
    }
    prevReset.current = h?.resetPending;
    return undefined;
  }, [h?.resetPending, myAnswer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Блокировка телефона
  useEffect(() => {
    const until = h?.lockedUntil || 0;
    const tick = () => setLockLeft(Math.max(0, Math.ceil((until - serverNow()) / 1000)));
    tick();
    if (until <= serverNow()) return undefined;
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [h?.lockedUntil, serverNow]);

  useEffect(() => { if (h?.level) navigator.vibrate?.([80, 60, 80]); }, [h?.level]);

  const answered = myAnswer !== null;
  const chosen   = answered ? myAnswer : tapped;
  const timeUp   = deadline && left === 0;
  const locked   = lockLeft > 0;
  const info     = h ? HINDRANCE[h.level] : null;

  const isDanger  = frac <= 0.25;
  const isWarning = frac <= 0.5 && !isDanger;
  const barGrad   = isDanger ? 'linear-gradient(90deg,#c03030,#f06060)'
    : isWarning ? 'linear-gradient(90deg,#c08020,#f0c060)' : 'linear-gradient(90deg,#6bc740,#c6f060)';
  const numColor  = isDanger ? '#f06060' : isWarning ? '#f0a040' : '#c6f060';

  const press = (origIdx) => {
    if (answered || timeUp || locked || (tapped !== null && !h?.resetPending)) return;
    setTapped(origIdx);
    onAnswer(origIdx);
  };

  return (
    <div style={s.wrap}>
      {info && !answered && (
        <div style={{ ...s.banner, borderColor: info.color, animation: 'shake 0.6s ease' }}>
          <span style={{ ...s.bannerText, color: info.color }}>{info.title}</span>
          <span style={s.bannerSub}>{info.sub}</span>
        </div>
      )}

      <div style={s.header}>
        <div style={s.av}>{CHAR_EMOJI[me?.character] || '?'}</div>
        <div style={s.info}>
          <div style={s.name}>{me?.name}</div>
          <div style={s.pts}>{me?.score ?? 0} очков</div>
        </div>
        <div style={{ ...s.timerNum, color: numColor }}>{left}</div>
      </div>
      <div style={s.timerBar}>
        <div style={{ ...s.timerFill, width: `${frac * 100}%`, background: barGrad }} />
      </div>

      <div style={s.question}>{question.text}</div>

      <div style={{
        ...s.grid,
        transform: h?.flipped ? 'rotate(180deg)' : 'none',
        transition: 'transform .8s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {order.map((origIdx, pos) => {
          const isChosen = chosen === origIdx;
          const isDimmed = chosen !== null && !isChosen;
          return (
            <button
              key={origIdx}
              style={{
                ...s.btn,
                ...(isDimmed ? s.btnDim : {}),
                ...(isChosen ? s.btnChosen : {}),
                animation: h && !answered
                  ? `answerAppear .32s ease ${pos * 70}ms both, jitter ${0.25 + pos * 0.07}s linear ${0.4 + pos * 0.05}s infinite`
                  : `answerAppear 0.32s cubic-bezier(0.22,0.61,0.36,1) ${pos * 70}ms both`,
              }}
              onClick={() => press(origIdx)}
              disabled={answered || timeUp || locked}
            >
              {/* Лидеру с помехой буквы не показываем — порядок не совпадает с экраном */}
              {!h && <div style={{ ...s.key, ...(isChosen ? s.keyChosen : {}) }}>{LETTERS[origIdx]}</div>}
              <div style={{ ...s.ansText, ...(h ? s.ansTextBig : {}) }}>{question.answers[origIdx]}</div>
            </button>
          );
        })}

        {locked && (
          <div style={s.lockOverlay}>
            <div style={{ fontSize: 54 }}>🕸️</div>
            <div style={s.lockText}>Ананси держит паутину</div>
            <div style={s.lockNum}>{lockLeft}</div>
          </div>
        )}
      </div>

      {resetMsg && <div style={s.resetToast}>🕷️ Ананси сбросил твой выбор! Выбирай снова</div>}
      {answered && <div style={s.status}>✓ Ответ принят — смотри на экран!</div>}
      {!answered && timeUp && <div style={{ ...s.status, color: '#e06048' }}>Время вышло!</div>}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', padding: '12px 14px 16px', gap: 10, animation: 'fadeIn 0.3s ease' },
  banner: {
    background: 'rgba(20,10,4,.92)', border: '1px solid', borderRadius: 10,
    padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0,
  },
  bannerText: { fontFamily: "'Cinzel',serif", fontSize: 14, letterSpacing: .3 },
  bannerSub:  { fontSize: 12, color: '#c8a070' },
  header: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  av: {
    width: 38, height: 38, borderRadius: '50%', border: '1.5px solid rgba(107,199,64,.45)',
    background: '#1a2e10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0,
  },
  info: { display: 'flex', flexDirection: 'column', gap: 1, flex: 1 },
  name: { fontFamily: "'Cinzel',serif", fontSize: 14, color: '#9de05a' },
  pts:  { fontSize: 12, color: 'rgba(150,220,90,.6)' },
  timerNum: { fontFamily: "'Cinzel',serif", fontWeight: 700, fontSize: 24, minWidth: 34, textAlign: 'right' },
  timerBar: { height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 },
  timerFill: { height: '100%', borderRadius: 3, transition: 'width .25s linear, background .5s' },
  question: {
    fontFamily: "'Cinzel',serif", fontSize: 'clamp(15px,4.2vw,20px)', color: 'rgba(220,240,190,.85)',
    lineHeight: 1.4, textAlign: 'center', padding: '8px 4px', flexShrink: 0,
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, flex: 1, minHeight: 0, position: 'relative' },
  btn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
    background: 'rgba(20,35,12,.85)', border: '1.5px solid rgba(107,199,64,.25)', borderRadius: 14,
    padding: '10px 6px', cursor: 'pointer', minHeight: 0, color: 'inherit',
    transition: 'border-color .2s, background .2s, opacity .2s',
  },
  btnDim:    { opacity: 0.3 },
  btnChosen: { borderColor: '#c8a830', background: 'rgba(30,22,2,.95)', boxShadow: '0 0 18px rgba(200,168,48,.25)' },
  key: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(30px,9vw,46px)', fontWeight: 900, color: '#c8e8a0', lineHeight: 1 },
  keyChosen: { color: '#f0d060' },
  ansText: { fontFamily: "'Nunito',sans-serif", fontSize: 'clamp(12px,3.4vw,15px)', color: 'rgba(200,230,160,.85)', textAlign: 'center', lineHeight: 1.25 },
  ansTextBig: { fontSize: 'clamp(15px,4.4vw,19px)', fontWeight: 700 },
  lockOverlay: {
    position: 'absolute', inset: 0, borderRadius: 14, background: 'rgba(4,10,4,.88)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
    border: '1.5px dashed rgba(200,168,48,.5)',
  },
  lockText: { fontFamily: "'Cinzel',serif", color: '#d8b040', fontSize: 16 },
  lockNum: { fontFamily: "'Cinzel',serif", color: '#f0d060', fontSize: 40, fontWeight: 700 },
  resetToast: {
    textAlign: 'center', fontSize: 14, color: '#f0d060', background: 'rgba(40,20,4,.95)',
    border: '1px solid #c8a830', borderRadius: 10, padding: '8px', animation: 'shake .5s ease', flexShrink: 0,
  },
  status: { textAlign: 'center', fontSize: 13, color: '#8acc50', flexShrink: 0, animation: 'fadeIn .3s ease' },
};
