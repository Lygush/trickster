import React from 'react';
import { CHAR_EMOJI, LETTERS } from '../shared/constants';
import TimerBar from './TimerBar';

// Финальная гонка на большом экране:
//   intro  — правила и стартовые позиции,
//   race   — вопрос с вариантами, таймер, кто уже ответил,
//   result — верный ответ, кто первый (+2), кто продвинулся (+1).
export default function FinalRace({ state }) {
  const { phase, players, finalRace: fr, config } = state;
  if (!fr) return null;
  const steps   = config.finalSteps;
  const result  = fr.result;
  const answered = new Set(state.answeredIds);
  const isIntro = phase === 'final_race_intro';

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.title}>🏁 Финальная гонка</div>
        {!isIntro && <div style={s.round}>Раунд {fr.round}</div>}
        <div style={{ flex: 1 }}>
          {phase === 'final_race' && <TimerBar deadline={state.deadline} duration={state.duration} compact />}
        </div>
      </div>

      {/* ── Трасса ── */}
      <div style={s.track}>
        {players.map((p, i) => {
          const pos     = Math.min(fr.positions[p.id] || 0, steps);
          const moved   = result?.steps[p.id] || 0;
          const isFirst = result?.firstId === p.id;
          return (
            <div key={p.id} style={{ ...s.lane, opacity: p.connected ? 1 : 0.45 }}>
              <div style={s.laneName}>
                {phase === 'final_race' && (
                  <span style={{ ...s.ansDot, background: answered.has(p.id) ? '#c6f060' : 'transparent' }} />
                )}
                <span style={s.laneNameText}>{p.name}</span>
              </div>
              <div style={s.cells}>
                {Array.from({ length: steps }, (_, c) => (
                  <div key={c} style={{
                    ...s.cell,
                    background: c < pos ? 'rgba(107,199,64,.22)' : 'rgba(255,255,255,.04)',
                    borderColor: c === steps - 1 ? 'rgba(212,175,55,.6)' : 'rgba(107,199,64,.15)',
                  }}>
                    {c === steps - 1 && <span style={s.flag}>🏁</span>}
                  </div>
                ))}
                {/* Фишка игрока: позиция 1 = первая клетка */}
                <div style={{
                  ...s.token,
                  left: `calc(${(Math.max(pos, 1) - 0.5) / steps * 100}% - 2.4vh)`,
                  boxShadow: isFirst ? '0 0 22px rgba(240,208,96,.9)' : '0 2px 10px rgba(0,0,0,.6)',
                  borderColor: isFirst ? '#f0d060' : moved ? '#6bc740' : 'rgba(212,175,55,.4)',
                  transitionDelay: `${0.4 + i * 0.12}s`,
                }}>
                  {CHAR_EMOJI[p.character] || '?'}
                  {moved > 0 && (
                    <span style={{ ...s.stepBadge, background: isFirst ? '#c8a830' : '#3a7a20' }}>+{moved}</span>
                  )}
                </div>
              </div>
              <div style={s.posNum}>{fr.positions[p.id] || 0}</div>
            </div>
          );
        })}
      </div>

      {/* ── Нижняя зона: правила / вопрос ── */}
      {isIntro ? (
        <div style={s.introCard}>
          <div style={s.introTitle}>Кто первым дойдёт до {steps}-й клетки — победит!</div>
          <div style={s.introRules}>
            <span>⚡ Первый верный ответ — <b>+2 шага</b></span>
            <span>✓ Остальные верные — <b>+1 шаг</b></span>
            <span>⏱ На ответ — 10 секунд</span>
          </div>
          <div style={s.introSub}>Стартовая клетка зависит от очков: 4+ → 2, 8+ → 3, 12+ → 4</div>
        </div>
      ) : fr.question && (
        <div style={s.qCard}>
          <div style={s.qText}>{fr.question.text}</div>
          <div style={s.answers}>
            {fr.question.answers.map((a, i) => {
              const isCorrect = result && i === result.correctIndex;
              const pickers = result ? players.filter(p => result.answers[p.id] === i) : [];
              return (
                <div key={i} style={{
                  ...s.ans,
                  ...(isCorrect ? s.ansOk : {}),
                  opacity: result && !isCorrect ? 0.35 : 1,
                }}>
                  <span style={s.ansKey}>{LETTERS[i]}</span>
                  <span style={s.ansText}>{a}</span>
                  <span style={s.pickers}>
                    {pickers.map(p => <span key={p.id} title={p.name}>{CHAR_EMOJI[p.character]}</span>)}
                  </span>
                </div>
              );
            })}
          </div>
          {result && (
            <div style={s.resultLine}>
              {result.firstId
                ? <>⚡ Первым ответил <b style={{ color: '#f0d060' }}>{players.find(p => p.id === result.firstId)?.name}</b> — +2 шага!</>
                : 'Никто не ответил верно — Ананси доволен'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', padding: '2vh 2.5vw', gap: '2vh', animation: 'fadeIn .4s ease' },
  header: { display: 'flex', alignItems: 'center', gap: '2vw' },
  title: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(22px,2.6vw,42px)', color: '#f0d060', letterSpacing: 2, textShadow: '0 0 24px rgba(200,168,48,.4)' },
  round: { fontSize: 'clamp(13px,1.2vw,20px)', color: '#c8e8a0', border: '1px solid rgba(107,199,64,.35)', borderRadius: 20, padding: '4px 14px' },

  track: {
    display: 'flex', flexDirection: 'column', gap: '1.2vh',
    background: 'rgba(4,12,5,.82)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 16,
    padding: '1.8vh 1.6vw', backdropFilter: 'blur(8px)',
  },
  lane: { display: 'flex', alignItems: 'center', gap: '1vw', transition: 'opacity .3s' },
  laneName: { width: '11vw', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  laneNameText: { fontFamily: "'Nunito',sans-serif", fontWeight: 700, fontSize: 'clamp(13px,1.3vw,22px)', color: '#c8e8a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  ansDot: { width: 10, height: 10, borderRadius: '50%', border: '1px solid rgba(150,220,90,.4)', flexShrink: 0, transition: 'background .3s' },
  cells: { flex: 1, display: 'flex', gap: 3, position: 'relative', height: '6vh', minHeight: 36 },
  cell: { flex: 1, border: '1px solid', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .6s' },
  flag: { fontSize: '2.4vh', opacity: 0.6 },
  token: {
    position: 'absolute', top: '50%', marginTop: '-2.4vh',
    width: '4.8vh', height: '4.8vh', borderRadius: '50%',
    background: '#1a2e10', border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2.8vh', transition: 'left .8s cubic-bezier(.34,1.56,.64,1), box-shadow .4s, border-color .4s',
    zIndex: 2,
  },
  stepBadge: {
    position: 'absolute', top: '-1.6vh', right: '-1.6vh', fontSize: '1.6vh', fontWeight: 700,
    color: '#fff', borderRadius: 10, padding: '1px 6px', fontFamily: "'Cinzel',serif",
    animation: 'correctPop .5s ease 1s both',
  },
  posNum: { width: '3vw', textAlign: 'right', fontFamily: "'Cinzel',serif", fontSize: 'clamp(16px,1.6vw,28px)', color: '#f0d060', fontWeight: 700 },

  introCard: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2vh',
    animation: 'fadeIn .6s ease .3s both',
  },
  introTitle: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(20px,2.4vw,40px)', color: '#e8f5d0', textAlign: 'center' },
  introRules: { display: 'flex', gap: '3vw', fontSize: 'clamp(15px,1.5vw,26px)', color: '#c8e8a0', flexWrap: 'wrap', justifyContent: 'center' },
  introSub: { fontSize: 'clamp(13px,1.2vw,20px)', color: '#7aaa50' },

  qCard: {
    background: 'rgba(6,16,4,.9)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 16,
    padding: '2vh 2vw', display: 'flex', flexDirection: 'column', gap: '1.4vh', marginTop: 'auto',
  },
  qText: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(20px,2.4vw,38px)', color: '#e8f5d0', fontWeight: 700, lineHeight: 1.35 },
  answers: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1vh 1vw' },
  ans: {
    display: 'flex', alignItems: 'center', gap: '0.8vw', padding: '1.2vh 1.4vw',
    background: 'rgba(20,36,14,.82)', border: '1px solid rgba(107,199,64,.22)', borderRadius: 12,
    transition: 'opacity .4s, background .4s, border-color .4s',
  },
  ansOk: { background: 'rgba(20,55,10,.95)', borderColor: 'rgba(107,199,64,.8)', boxShadow: '0 0 18px rgba(107,199,64,.25)' },
  ansKey: { fontFamily: "'Cinzel',serif", fontWeight: 700, color: '#9de05a', fontSize: 'clamp(16px,1.6vw,26px)', width: '2vw' },
  ansText: { flex: 1, fontSize: 'clamp(15px,1.5vw,24px)', color: '#c8e8a0' },
  pickers: { display: 'flex', gap: 4, fontSize: 'clamp(16px,1.6vw,26px)' },
  resultLine: { textAlign: 'center', fontSize: 'clamp(15px,1.5vw,24px)', color: '#c8e8a0', animation: 'fadeIn .4s ease' },
};
