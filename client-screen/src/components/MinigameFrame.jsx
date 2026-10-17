import React from 'react';
import MINIGAMES from '../minigames/index';
import { MINIGAME_INFO, CHAR_EMOJI } from '../shared/constants';
import TimerBar from './TimerBar';

// Общая рамка мини-игры на большом экране:
//   верх — название и таймер текущей стадии,
//   центр — ScreenView конкретной игры,
//   низ (в стадии reveal) — единая полоса итогов «+N очков».
export default function MinigameFrame({ state, assets, sounds }) {
  const { minigame, players } = state;
  const def  = MINIGAMES[minigame.id];
  const info = MINIGAME_INFO[minigame.id] || {};
  const View = def?.ScreenView;
  const isReveal = minigame.stage === 'reveal';
  const stageLabel = def?.stages?.[minigame.stage];

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.title}>{info.icon} {info.name}</div>
        {stageLabel && <div style={s.stage}>{stageLabel}</div>}
        <div style={s.timer}>
          {!isReveal && <TimerBar deadline={state.deadline} duration={state.duration} compact />}
        </div>
      </div>

      <div style={s.content}>
        {View
          ? <View minigame={minigame} players={players} assets={assets} sounds={sounds} />
          : <div style={s.missing}>Экран для «{info.name}» не найден</div>}
      </div>

      {isReveal && minigame.results && <ResultsStrip results={minigame.results} players={players} />}
    </div>
  );
}

function ResultsStrip({ results, players }) {
  const winners = players.filter(p => results[p.id] > 0).sort((a, b) => results[b.id] - results[a.id]);
  return (
    <div style={s.results}>
      <span style={s.resultsLabel}>Итоги:</span>
      {winners.length === 0 && <span style={s.nobody}>Ананси никого не наградил</span>}
      {winners.map((p, i) => (
        <div key={p.id} style={{ ...s.resultChip, animation: `cardFlyIn .5s cubic-bezier(.175,.885,.32,1.275) ${i * 120}ms both` }}>
          <span>{CHAR_EMOJI[p.character]}</span>
          <span style={s.resultName}>{p.name}</span>
          <span style={s.resultPts}>+{results[p.id]}</span>
        </div>
      ))}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', height: '100%', animation: 'fadeIn .4s ease' },
  header: {
    display: 'flex', alignItems: 'center', gap: '2vw', padding: '1.6vh 2.5vw',
    background: 'rgba(4,10,3,.7)', borderBottom: '1px solid rgba(212,175,55,.15)', flexShrink: 0,
  },
  title: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(18px,2vw,32px)', color: '#f0d060', letterSpacing: 2, whiteSpace: 'nowrap' },
  stage: {
    fontSize: 'clamp(12px,1.1vw,18px)', color: '#c8e8a0', letterSpacing: 2, textTransform: 'uppercase',
    border: '1px solid rgba(107,199,64,.35)', borderRadius: 20, padding: '4px 14px', whiteSpace: 'nowrap',
  },
  timer: { flex: 1, minWidth: 0 },
  content: { flex: 1, minHeight: 0, overflow: 'hidden' },
  missing: { padding: 40, color: '#c84830', textAlign: 'center' },
  results: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.2vw', flexWrap: 'wrap',
    padding: '1.8vh 2vw', background: 'rgba(30,22,2,.88)', borderTop: '1px solid rgba(212,175,55,.4)',
    flexShrink: 0, animation: 'fadeIn .4s ease',
  },
  resultsLabel: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(14px,1.3vw,22px)', color: '#c8a830', letterSpacing: 2, textTransform: 'uppercase' },
  nobody: { fontSize: 'clamp(14px,1.3vw,22px)', color: '#9a8a60', fontStyle: 'italic' },
  resultChip: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(18px,1.7vw,28px)',
    background: 'rgba(10,26,6,.95)', border: '1.5px solid rgba(107,199,64,.5)', borderRadius: 30, padding: '6px 18px',
  },
  resultName: { color: '#d8f0b0', fontFamily: "'Nunito',sans-serif", fontWeight: 700 },
  resultPts: { color: '#9de05a', fontFamily: "'Cinzel',serif", fontWeight: 700 },
};
