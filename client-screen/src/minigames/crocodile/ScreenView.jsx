import React from 'react';

const CHAR_EMOJI = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };

/**
 * КрокодилScreen — большой экран мини-игры «Крокодил».
 *
 * Показывает:
 *   - Имя ведущего (без слова — чтобы остальные не видели)
 *   - Поток угадываний в реальном времени
 *   - При revealed — слово и победителя
 */
export default function CrocodileScreen({ minigame, players }) {
  const data      = minigame?.data  || {};
  const showmanId = data.showmanId;
  const word      = data.word       || '???';
  const guesses   = data.guesses    || {};   // { playerId: 'lastGuess' }
  const revealed  = data.revealed   || false;
  const winnerId  = data.winnerId;

  const showman    = players.find(p => p.id === showmanId);
  const guessList  = Object.entries(guesses)
    .map(([id, text]) => ({ player: players.find(p => p.id === id), text }))
    .filter(g => g.player);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.spider}>🕷️</div>
        <div style={s.title}>Крокодил</div>
        {showman && (
          <div style={s.showman}>
            <span style={{ fontSize: 28 }}>{CHAR_EMOJI[showman.character] || '⭕'}</span>
            <span style={s.showmanName}>{showman.name} показывает...</span>
          </div>
        )}
        {!revealed && (
          <div style={s.wordHidden}>
            {Array.from(word).map((ch, i) =>
              ch === ' ' ? <span key={i} style={s.wordSpace}/> : <span key={i} style={s.wordDash}/>
            )}
          </div>
        )}
        {revealed && (
          <div style={s.revealWord}>{word}</div>
        )}
      </div>

      <div style={s.guesses}>
        <div style={s.guessesLabel}>Варианты:</div>
        {guessList.length === 0 && (
          <div style={s.noGuesses}>Пока никто не угадал...</div>
        )}
        {guessList.map(({ player, text }, i) => {
          const isWinner = revealed && player.id === winnerId;
          return (
            <div key={i} style={{
              ...s.guessRow,
              borderColor: isWinner ? '#c8a830' : '#1c3a18',
              background: isWinner ? 'rgba(30,25,4,0.95)' : 'rgba(10,22,10,0.7)',
              transform: isWinner ? 'scale(1.04)' : 'scale(1)',
              transition: 'all 0.5s ease',
            }}>
              <span style={{ fontSize: 20 }}>{CHAR_EMOJI[player.character] || '⭕'}</span>
              <span style={{ ...s.guesserName, color: isWinner ? '#c8a830' : '#90c068' }}>
                {player.name}
              </span>
              <span style={{ ...s.guessText, color: isWinner ? '#f0d060' : '#d8f0b0' }}>
                {text}
              </span>
              {isWinner && <span style={s.checkmark}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', height: '100%',
    padding: '24px 48px', gap: 20,
    animation: 'fadeIn 0.4s ease', overflowY: 'auto',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  spider: { fontSize: 48, animation: 'pulse 1.5s infinite' },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(24px, 3.5vw, 42px)', color: '#f0d060', letterSpacing: 2,
  },
  showman: { display: 'flex', alignItems: 'center', gap: 10 },
  showmanName: { fontFamily: "'Cinzel', serif", fontSize: 18, color: '#d8f0b0' },
  wordHidden: { display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 },
  wordDash: {
    display: 'inline-block', width: 24, height: 3,
    background: '#3a6028', borderRadius: 2,
  },
  wordSpace: { display: 'inline-block', width: 12 },
  revealWord: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(28px, 4vw, 52px)', color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.6)',
    letterSpacing: 2, animation: 'bounceIn 0.5s ease',
  },
  guesses: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 560 },
  guessesLabel: { fontSize: 10, color: '#3a6028', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  noGuesses: { fontSize: 13, color: '#2a4a20', fontStyle: 'italic' },
  guessRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    border: '1px solid', borderRadius: 10, padding: '10px 16px',
    backdropFilter: 'blur(6px)',
  },
  guesserName: { fontFamily: "'Cinzel', serif", fontSize: 13, minWidth: 90 },
  guessText: { flex: 1, fontSize: 16 },
  checkmark: { fontSize: 18, color: '#8acc40', fontWeight: 700 },
};
