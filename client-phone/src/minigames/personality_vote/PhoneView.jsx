import React, { useState } from 'react';
import { CHAR_EMOJI } from '../../shared/constants';
import { ui } from '../ui';

export default function PersonalityVotePhone({ minigame, priv, me, players, onAction }) {
  const data = minigame.data || {};
  const [tapped, setTapped] = useState(null);
  const myVote = priv.myVote ?? tapped;
  const others = players.filter(p => p.id !== me.id);

  if (data.revealed) {
    const top = data.top || [];
    const agreed = top.includes(myVote);
    const iAmTop = top.includes(me.id);
    return (
      <div style={{ ...ui.wrap, ...ui.center }}>
        <div style={ui.prompt}>{data.question}</div>
        <div style={ui.label}>Стая выбрала</div>
        {top.map(id => {
          const p = players.find(x => x.id === id);
          return (
            <div key={id} style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, borderColor: '#c8a830' }}>
              <span style={{ fontSize: 36 }}>{CHAR_EMOJI[p?.character]}</span>
              <span style={{ ...ui.playerName, color: '#f0d060' }}>{p?.name}</span>
              <span style={{ color: '#c8a830' }}>{data.counts?.[id]} гол.</span>
            </div>
          );
        })}
        {top.length === 0 && <div style={ui.hint}>Никто не проголосовал</div>}
        <div style={{ ...ui.big, fontSize: 16 }}>
          {iAmTop ? '🕸️ Ананси пометил тебя!' : agreed ? 'Ты угадал мнение стаи!' : myVote ? 'Стая думает иначе' : 'Ты не проголосовал'}
        </div>
      </div>
    );
  }

  return (
    <div style={ui.wrap}>
      <div style={ui.prompt}>{data.question}</div>
      <div style={ui.label}>{myVote ? 'Голос принят' : 'Твой выбор'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
        {others.map((p, i) => (
          <button
            key={p.id}
            disabled={!!myVote}
            onClick={() => { setTapped(p.id); onAction('vote', { targetId: p.id }); }}
            style={{
              ...ui.playerBtn,
              ...(myVote === p.id ? ui.playerBtnChosen : {}),
              opacity: myVote && myVote !== p.id ? 0.4 : 1,
              animation: `answerAppear .35s ease ${i * 60}ms both`,
            }}
          >
            <span style={{ fontSize: 30 }}>{CHAR_EMOJI[p.character] || '⭕'}</span>
            <span style={ui.playerName}>{p.name}</span>
            {myVote === p.id && <span style={{ color: '#f0d060' }}>✓</span>}
          </button>
        ))}
      </div>
      {myVote && <div style={ui.hint}>Ждём остальных...</div>}
    </div>
  );
}
