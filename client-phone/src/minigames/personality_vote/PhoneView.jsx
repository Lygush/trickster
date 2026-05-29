import React, { useState } from 'react';

/**
 * ГолосованиеPhone — телефон игрока в мини-игре «Голосование».
 *
 * Props:
 *   minigame — { id, data: { question, votes, revealed, winner } }
 *   myId     — socket.id
 *   players  — все игроки
 *   onEmit   — (event, payload) => void
 *
 * Механика:
 *   Ананси задаёт вопрос типа «Кто скорее всего запутается в паутине?»
 *   Каждый голосует за одного из других игроков.
 *   Тот, за кого проголосовали больше — получает штраф ИЛИ бонус (зависит от вопроса).
 */
export default function PersonalityVotePhone({ minigame, myId, players, onEmit }) {
  const data      = minigame?.data || {};
  const question  = data.question  || 'Кто из игроков самый хитрый?';
  const votes     = data.votes     || {};
  const revealed  = data.revealed  || false;
  const winner    = data.winner;

  const [voted, setVoted] = useState(false);
  const myVote = votes[myId];
  const hasVoted = myVote !== undefined || voted;

  const others = players.filter(p => p.id !== myId);

  const handleVote = (targetId) => {
    if (hasVoted) return;
    setVoted(true);
    onEmit('personality_vote', { targetId });
  };

  const CHAR_EMOJI = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };

  if (revealed) {
    const winnerPlayer = players.find(p => p.id === winner);
    return (
      <div style={s.wrap}>
        <div style={s.spider}>🕷️</div>
        <div style={s.title}>Результат!</div>
        {winnerPlayer && (
          <div style={s.resultCard}>
            <div style={{ fontSize: 48 }}>{CHAR_EMOJI[winnerPlayer.character] || '⭕'}</div>
            <div style={s.winnerName}>{winnerPlayer.name}</div>
            <div style={s.winnerSub}>набрал больше всего голосов</div>
          </div>
        )}
        <div style={s.hint}>Смотри на экран!</div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.question}>{question}</div>

      {!hasVoted ? (
        <div style={s.players}>
          {others.map(p => (
            <button key={p.id} style={s.playerBtn} onClick={() => handleVote(p.id)}>
              <span style={{ fontSize: 28 }}>{CHAR_EMOJI[p.character] || '⭕'}</span>
              <span style={s.playerName}>{p.name}</span>
            </button>
          ))}
        </div>
      ) : (
        <div style={s.voted}>
          <div style={s.check}>✓</div>
          <div style={s.votedText}>Голос принят!</div>
          <div style={s.hint}>Ждём остальных...</div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 16, padding: '20px 18px',
    animation: 'fadeIn 0.4s ease',
  },
  spider: { fontSize: 52, animation: 'pulse 1.5s infinite',
    filter: 'drop-shadow(0 0 14px rgba(200,168,48,0.5))' },
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(15px, 4vw, 20px)', color: '#d8f0b0',
    textAlign: 'center', lineHeight: 1.5,
    background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '16px', width: '100%',
  },
  players: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%' },
  playerBtn: {
    display: 'flex', alignItems: 'center', gap: 14,
    background: 'rgba(10,22,10,0.85)', border: '1.5px solid #1c3a18',
    borderRadius: 14, padding: '14px 18px',
    cursor: 'pointer', color: '#90c068',
    fontFamily: "'Nunito', sans-serif",
    WebkitTapHighlightColor: 'transparent',
    transition: 'border-color .2s, background .2s',
  },
  playerName: { fontFamily: "'Cinzel', serif", fontSize: 16, color: '#d8f0b0' },
  voted: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  check: {
    width: 60, height: 60, borderRadius: '50%',
    background: 'rgba(10,30,10,0.9)', border: '2px solid #5a9a30',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, color: '#8acc40',
  },
  votedText: { fontFamily: "'Cinzel', serif", fontSize: 18, color: '#f0d060' },
  hint: { fontSize: 11, color: '#3a6028', letterSpacing: 1, animation: 'pulse 1.5s infinite' },
  resultCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    background: 'rgba(4,12,5,0.9)', border: '1px solid #c8a830',
    borderRadius: 16, padding: '24px 36px',
    boxShadow: '0 0 30px rgba(200,168,48,0.2)',
  },
  winnerName: { fontFamily: "'Cinzel', serif", fontSize: 24, color: '#f0d060' },
  winnerSub: { fontSize: 12, color: '#7aaa50' },
};
