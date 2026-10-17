import React, { useEffect, useState } from 'react';
import { LETTERS, CHAR_EMOJI } from '../shared/constants';
import useCountdown from '../shared/useCountdown';

// Финальная гонка на телефоне. Ответ берётся с сервера (priv.answer),
// поэтому между раундами он сбрасывается сам — без локального состояния.
export default function FinalRaceScreen({ state, me, priv, onAnswer }) {
  const { phase, finalRace: fr, config, players } = state;
  const { left, frac } = useCountdown(phase === 'final_race' ? state.deadline : null, state.duration);
  const [tapped, setTapped] = useState(null);
  useEffect(() => setTapped(null), [fr?.round]);
  if (!fr) return null;

  const steps   = config.finalSteps;
  const myPos   = fr.positions[me.id] || 0;
  const answer  = priv?.answer ?? tapped;
  const result  = fr.result;
  const myStep  = result?.steps[me.id] || 0;
  const isFirst = result?.firstId === me.id;

  const press = (i) => {
    if (answer !== null || left === 0) return;
    setTapped(i);
    onAnswer(i);
  };

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <span style={s.title}>🏁 Финальная гонка</span>
        {fr.round > 0 && <span style={s.round}>раунд {fr.round}</span>}
      </div>

      {/* Мини-трасса */}
      <div style={s.track}>
        {[...players].sort((a, b) => (fr.positions[b.id] || 0) - (fr.positions[a.id] || 0)).map(p => {
          const pos = Math.min(fr.positions[p.id] || 0, steps);
          const mine = p.id === me.id;
          return (
            <div key={p.id} style={s.lane}>
              <span style={{ ...s.laneName, color: mine ? '#f0d060' : '#90b870' }}>{p.name}</span>
              <div style={s.laneBar}>
                <div style={{ ...s.laneFill, width: `${(pos / steps) * 100}%`, background: mine ? '#c8a830' : '#4a8a28' }} />
                <span style={{ ...s.laneToken, left: `calc(${(pos / steps) * 100}% - 11px)` }}>{CHAR_EMOJI[p.character]}</span>
              </div>
              <span style={s.laneNum}>{fr.positions[p.id] || 0}</span>
            </div>
          );
        })}
      </div>

      {phase === 'final_race_intro' && (
        <div style={s.intro}>
          <div style={s.introBig}>Ты стартуешь с клетки {myPos}</div>
          <div style={s.introText}>Первый верный ответ — <b>+2 шага</b>, остальные верные — <b>+1</b>.<br />До финиша {steps} клеток. Отвечай быстро!</div>
        </div>
      )}

      {phase !== 'final_race_intro' && fr.question && (
        <>
          <div style={s.question}>{fr.question.text}</div>
          {phase === 'final_race' && (
            <div style={s.timerRow}>
              <div style={s.timerBar}><div style={{ ...s.timerFill, width: `${frac * 100}%`, background: frac < 0.3 ? '#e05040' : '#8acc40' }} /></div>
              <span style={{ ...s.timerNum, color: frac < 0.3 ? '#f06060' : '#c6f060' }}>{left}</span>
            </div>
          )}
          <div style={s.answers}>
            {fr.question.answers.map((a, i) => {
              const isCorrect = result && i === result.correctIndex;
              const isMine = answer === i;
              return (
                <button key={i} onClick={() => press(i)} disabled={answer !== null || !!result || left === 0}
                  style={{
                    ...s.ansBtn,
                    ...(answer !== null && !isMine && !result ? s.dim : {}),
                    ...(isMine ? s.chosen : {}),
                    ...(isCorrect ? s.correct : {}),
                    ...(result && !isCorrect && !isMine ? s.dim : {}),
                  }}>
                  <span style={s.letter}>{LETTERS[i]}</span>
                  <span>{a}</span>
                </button>
              );
            })}
          </div>
          {result ? (
            <div style={{ ...s.verdict, color: myStep ? '#f0d060' : '#c08070' }}>
              {isFirst ? '⚡ Ты первый! +2 шага' : myStep ? '✓ Верно! +1 шаг' : answer !== null ? '✗ Мимо — стоишь на месте' : '⏱ Не успел'}
            </div>
          ) : answer !== null && <div style={s.waiting}>Ответ принят. Кто быстрее?..</div>}
        </>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', padding: '12px 14px 16px', gap: 10, overflowY: 'auto', animation: 'fadeIn 0.4s ease' },
  header: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  title: { fontFamily: "'Cinzel', serif", fontSize: 17, color: '#f0d060', flex: 1 },
  round: { fontSize: 12, color: '#9aca70' },
  track: { display: 'flex', flexDirection: 'column', gap: 8, background: 'rgba(4,12,5,0.8)', border: '1px solid #1c3a1a', borderRadius: 12, padding: '10px 12px', flexShrink: 0 },
  lane: { display: 'flex', alignItems: 'center', gap: 8 },
  laneName: { width: 70, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  laneBar: { flex: 1, height: 8, background: '#0f2010', borderRadius: 4, position: 'relative' },
  laneFill: { height: '100%', borderRadius: 4, transition: 'width .8s ease' },
  laneToken: { position: 'absolute', top: -8, fontSize: 18, transition: 'left .8s cubic-bezier(.34,1.56,.64,1)' },
  laneNum: { width: 20, textAlign: 'right', fontSize: 12, color: '#d8f0b0', fontFamily: "'Cinzel',serif" },
  intro: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center' },
  introBig: { fontFamily: "'Cinzel',serif", fontSize: 22, color: '#f0d060' },
  introText: { fontSize: 14, color: '#c8e8a0', lineHeight: 1.6 },
  question: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(15px, 4.2vw, 19px)', color: '#e8f5d0', lineHeight: 1.4, textAlign: 'center', flexShrink: 0 },
  timerRow: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  timerBar: { flex: 1, height: 5, background: '#0f2010', borderRadius: 3, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 3, transition: 'width .25s linear' },
  timerNum: { fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700, minWidth: 28, textAlign: 'right' },
  answers: { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  ansBtn: {
    display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(10,22,10,0.88)',
    border: '1.5px solid #2a4a20', borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
    color: '#c8e8a0', fontSize: 15, fontFamily: "'Nunito', sans-serif", textAlign: 'left', flex: 1, minHeight: 50,
    transition: 'opacity .3s, border-color .3s, background .3s',
  },
  dim: { opacity: 0.35 },
  chosen: { borderColor: '#c8a830', background: 'rgba(30,25,4,0.95)' },
  correct: { borderColor: '#7acc40', background: 'rgba(20,55,10,.95)', opacity: 1 },
  letter: {
    width: 28, height: 28, borderRadius: '50%', background: '#0a1a0c', border: '1px solid #3a6a28',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#8acc40',
    flexShrink: 0, fontWeight: 700, fontFamily: "'Cinzel', serif",
  },
  verdict: { textAlign: 'center', fontFamily: "'Cinzel',serif", fontSize: 18, animation: 'bounceIn .5s ease', flexShrink: 0 },
  waiting: { textAlign: 'center', fontSize: 13, color: '#8acc50', flexShrink: 0 },
};
