import React from 'react';
import { CHAR_EMOJI } from '../../shared/constants';

// Во время голосования видно только, КТО уже проголосовал.
// На reveal — сколько голосов у каждого и кто избранник.
export default function PersonalityVoteScreen({ minigame, players }) {
  const data     = minigame?.data || {};
  const revealed = !!data.revealed;
  const counts   = data.counts || {};
  const top      = data.top || [];
  const voted    = new Set(revealed ? Object.keys(data.votes || {}) : data.votedIds || []);
  const total    = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
  const sorted   = revealed ? [...players].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0)) : players;

  return (
    <div style={s.wrap}>
      <div style={s.question}>{data.question}</div>

      <div style={s.players}>
        {sorted.map((p, i) => {
          const count = counts[p.id] || 0;
          const isTop = revealed && top.includes(p.id);
          return (
            <div key={p.id} style={{
              ...s.playerRow,
              borderColor: isTop ? '#c8a830' : '#1c3a18',
              background:  isTop ? 'rgba(30,25,4,0.95)' : 'rgba(10,22,10,0.85)',
              transform:   isTop ? 'scale(1.03)' : 'scale(1)',
              animation:   revealed ? `fadeIn .4s ease ${i * 0.15}s both` : 'none',
            }}>
              <span style={s.emoji}>{CHAR_EMOJI[p.character] || '⭕'}</span>
              <span style={s.playerName}>{p.name}</span>
              {revealed ? (
                <>
                  <div style={s.barWrap}>
                    <div style={{ ...s.barFill, width: `${(count / total) * 100}%`, background: isTop ? '#c8a830' : '#5a9a30' }} />
                  </div>
                  <span style={{ ...s.count, color: isTop ? '#f0d060' : '#9aca70' }}>{count}</span>
                  {isTop && <span style={s.crown}>🕸️</span>}
                </>
              ) : (
                <span style={{ ...s.votedMark, opacity: voted.has(p.id) ? 1 : 0.25 }}>
                  {voted.has(p.id) ? '✓ проголосовал' : 'думает...'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {revealed && (
        <div style={s.verdict}>
          {top.length === 0 ? 'Никто не проголосовал — Ананси скучает'
            : top.length === 1 ? `Метка Ананси достаётся: ${players.find(p => p.id === top[0])?.name}!`
            : 'Стая разделилась — меток несколько!'}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: '3vh 5vw', gap: '3vh' },
  question: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(22px, 2.8vw, 46px)', color: '#e8f5d0',
    textAlign: 'center', lineHeight: 1.35, background: 'rgba(4,12,5,0.85)', border: '1px solid rgba(212,175,55,.3)',
    borderRadius: 18, padding: '2.4vh 3vw', backdropFilter: 'blur(10px)', maxWidth: 1300,
  },
  players: { display: 'flex', flexDirection: 'column', gap: '1.4vh', width: '100%', maxWidth: 1000 },
  playerRow: {
    display: 'flex', alignItems: 'center', gap: '1.4vw', border: '1.5px solid', borderRadius: 14,
    padding: '1.4vh 1.6vw', backdropFilter: 'blur(8px)', transition: 'all 0.5s ease',
  },
  emoji: { fontSize: 'clamp(26px,2.6vw,44px)' },
  playerName: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(16px,1.7vw,28px)', color: '#d8f0b0', minWidth: '14vw' },
  barWrap: { flex: 1, height: 10, background: '#0f2010', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5, transition: 'width 0.8s ease .3s' },
  count: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(20px,2vw,34px)', minWidth: 36, textAlign: 'right' },
  crown: { fontSize: 'clamp(20px,2vw,34px)' },
  votedMark: { marginLeft: 'auto', fontSize: 'clamp(13px,1.2vw,20px)', color: '#9de05a', transition: 'opacity .3s' },
  verdict: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(18px,2vw,32px)', color: '#f0d060', textAlign: 'center', animation: 'fadeIn .5s ease .8s both' },
};
