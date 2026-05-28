import React from 'react';

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function WaitScreen({ phase, player, players }) {
  const leader = [...(players || [])].sort((a, b) => b.position - a.position)[0];
  const myPos  = player?.position || 0;

  const getMessage = () => {
    if (phase === 'intro')           return 'Ананси готовит первый вопрос...';
    if (phase === 'question_result') return 'Смотри на экран!';
    if (phase === 'minigame_intro')  return 'Ананси затевает что-то...';
    if (phase === 'minigame')        return 'Мини-игра!';
    if (phase === 'final_race_intro') return 'Финальная гонка начинается!';
    return 'Ждём...';
  };

  return (
    <div style={s.wrap}>
      <div style={s.avatar}>
        {CHAR_EMOJI[player?.character] || '⭕'}
      </div>
      <div style={s.name}>{player?.name}</div>

      <div style={s.posCard}>
        <div style={s.posLabel}>Твоя позиция</div>
        <div style={s.posValue}>{myPos} <span style={s.posOf}>/ 15</span></div>
      </div>

      {leader && leader.id !== player?.id && (
        <div style={s.leaderCard}>
          <span style={{ fontSize: 16 }}>{CHAR_EMOJI[leader.character]}</span>
          <span style={s.leaderText}>
            {leader.name} впереди — позиция {leader.position}
          </span>
        </div>
      )}

      <div style={s.message}>{getMessage()}</div>
      <div style={s.dots}>
        <span style={{ animationDelay: '0s',   ...s.dot }}>●</span>
        <span style={{ animationDelay: '0.3s', ...s.dot }}>●</span>
        <span style={{ animationDelay: '0.6s', ...s.dot }}>●</span>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 18, padding: '0 24px',
    animation: 'fadeIn 0.4s ease',
  },
  avatar: {
    fontSize: 72,
    filter: 'drop-shadow(0 0 16px rgba(90,154,48,0.3))',
  },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: 20, color: '#d8f0b0', letterSpacing: 1,
  },
  posCard: {
    background: 'rgba(4,12,5,0.8)',
    border: '1px solid #1c3a1a', borderRadius: 14,
    padding: '12px 32px', textAlign: 'center',
  },
  posLabel: {
    fontSize: 10, color: '#3a6028',
    letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4,
  },
  posValue: {
    fontFamily: "'Cinzel', serif",
    fontSize: 36, color: '#f0d060',
  },
  posOf: {
    fontSize: 18, color: '#5a9a30',
  },
  leaderCard: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(30,20,4,0.8)',
    border: '1px solid #3a2a10', borderRadius: 10,
    padding: '8px 16px',
  },
  leaderText: {
    fontSize: 12, color: '#c8a830',
  },
  message: {
    fontSize: 14, color: '#5a9a30',
    letterSpacing: 1, textAlign: 'center',
  },
  dots: {
    display: 'flex', gap: 6,
  },
  dot: {
    fontSize: 8, color: '#2a5a22',
    animation: 'pulse 1.2s infinite',
    display: 'inline-block',
  },
};
