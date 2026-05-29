import React from 'react';

const CHAR_EMOJI = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };

/**
 * ГолосованиеScreen — большой экран мини-игры «Голосование».
 *
 * Показывает вопрос и в реальном времени обновляет счётчики голосов.
 * При revealed=true — анимированно открывает победителя.
 */
export default function PersonalityVoteScreen({ minigame, players }) {
  const data     = minigame?.data || {};
  const question = data.question  || 'Кто из игроков самый хитрый?';
  const votes    = data.votes     || {};
  const revealed = data.revealed  || false;
  const winner   = data.winner;

  // Считаем голоса по игрокам
  const voteCounts = {};
  players.forEach(p => { voteCounts[p.id] = 0; });
  Object.values(votes).forEach(targetId => {
    if (voteCounts[targetId] !== undefined) voteCounts[targetId]++;
  });

  const totalVotes   = Object.keys(votes).length;
  const totalPlayers = players.length;
  const winnerPlayer = players.find(p => p.id === winner);

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.question}>{question}</div>

      <div style={s.players}>
        {[...players].sort((a, b) => (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0)).map(p => {
          const count     = voteCounts[p.id] || 0;
          const isWinner  = revealed && p.id === winner;
          const barWidth  = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

          return (
            <div key={p.id} style={{
              ...s.playerRow,
              borderColor: isWinner ? '#c8a830' : '#1c3a18',
              background: isWinner ? 'rgba(30,25,4,0.95)' : 'rgba(10,22,10,0.8)',
              transform: isWinner ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.5s ease',
            }}>
              <span style={{ fontSize: 28 }}>{CHAR_EMOJI[p.character] || '⭕'}</span>
              <span style={s.playerName}>{p.name}</span>
              <div style={s.barWrap}>
                <div style={{ ...s.barFill, width: `${barWidth}%`,
                  background: isWinner ? '#c8a830' : '#5a9a30' }} />
              </div>
              <span style={{ ...s.count, color: isWinner ? '#f0d060' : '#7aaa50' }}>
                {count}
              </span>
              {isWinner && <span style={s.crown}>👑</span>}
            </div>
          );
        })}
      </div>

      <div style={s.status}>
        {!revealed
          ? `Проголосовали: ${totalVotes} / ${totalPlayers}`
          : winnerPlayer
            ? `${winnerPlayer.name} — выбор Ананси!`
            : 'Результаты...'}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', height: '100%',
    padding: '24px 48px', gap: 20,
    animation: 'fadeIn 0.4s ease',
  },
  spider: { fontSize: 48, animation: 'pulse 1.5s infinite',
    filter: 'drop-shadow(0 0 16px rgba(200,168,48,0.5))' },
  question: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(18px, 2.5vw, 30px)', color: '#d8f0b0',
    textAlign: 'center', lineHeight: 1.4,
    background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '18px 28px',
    backdropFilter: 'blur(10px)', maxWidth: 700,
  },
  players: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 600 },
  playerRow: {
    display: 'flex', alignItems: 'center', gap: 14,
    border: '1.5px solid', borderRadius: 12, padding: '12px 18px',
    backdropFilter: 'blur(8px)',
  },
  playerName: { fontFamily: "'Cinzel', serif", fontSize: 16, color: '#d8f0b0', minWidth: 120 },
  barWrap: { flex: 1, height: 6, background: '#0f2010', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s ease, background 0.5s ease' },
  count: { fontFamily: "'Cinzel', serif", fontSize: 20, minWidth: 28, textAlign: 'right' },
  crown: { fontSize: 20 },
  status: {
    fontSize: 13, color: '#5a9a30',
    letterSpacing: 1, textTransform: 'uppercase',
    animation: 'pulse 1.5s infinite',
  },
};
