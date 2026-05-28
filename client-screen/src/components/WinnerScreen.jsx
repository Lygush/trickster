import React from 'react';

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function WinnerScreen({ winner, players, onReset }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.confetti}>✨🎉✨</div>
      <div style={styles.label}>Победитель!</div>
      <div style={styles.emoji}>
        {winner?.character ? CHAR_EMOJI[winner.character] : '🏆'}
      </div>
      <div style={styles.name}>{winner?.name || '???'}</div>
      <div style={styles.divider}/>
      <div style={styles.scores}>
        {[...players]
          .sort((a, b) => (b.finalPos || b.position) - (a.finalPos || a.position))
          .map((p, i) => (
            <div key={p.id} style={styles.scoreRow}>
              <span style={styles.rank}>#{i + 1}</span>
              <span style={styles.scoreEmoji}>{CHAR_EMOJI[p.character] || '?'}</span>
              <span style={styles.scoreName}>{p.name}</span>
            </div>
          ))
        }
      </div>
      <button style={styles.btn} onClick={onReset}>Новая игра</button>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 18,
    animation: 'fadeIn 0.6s ease',
  },
  confetti: { fontSize: 40, letterSpacing: 8 },
  label: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, color: '#c8a830',
    letterSpacing: 4, textTransform: 'uppercase',
  },
  emoji: {
    fontSize: 90,
    filter: 'drop-shadow(0 0 30px rgba(200,168,48,0.6))',
    animation: 'glow 1.5s infinite',
  },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.5)',
    letterSpacing: 2,
  },
  divider: {
    width: 200, height: 1,
    background: 'linear-gradient(to right, transparent, #2a5a22, transparent)',
  },
  scores: { display: 'flex', flexDirection: 'column', gap: 8, minWidth: 220 },
  scoreRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '6px 12px',
    background: 'rgba(10,22,10,0.6)',
    borderRadius: 8, border: '1px solid #1c3a18',
  },
  rank: { fontSize: 12, color: '#3a6028', width: 24 },
  scoreEmoji: { fontSize: 22 },
  scoreName: { fontSize: 14, color: '#d8f0b0', flex: 1 },
  btn: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, letterSpacing: 2,
    color: '#040c05',
    background: 'linear-gradient(135deg, #2a5a22, #5a9a30)',
    border: 'none', borderRadius: 30,
    padding: '12px 32px', cursor: 'pointer',
    boxShadow: '0 0 20px rgba(90,154,48,0.3)',
    marginTop: 8,
  },
};
