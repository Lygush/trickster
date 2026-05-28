import React from 'react';

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};
const CHAR_NAME = {
  spider: 'Паук', frog: 'Лягушка', snake: 'Змея', beetle: 'Жук', lizard: 'Ящерица',
};

export default function LobbyScreen({ players, qrUrl, onStart, serverInfo }) {
  const allReady = players.length >= 2 && players.every(p => p.character);

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>🕸️ Сквозь Чащу</div>
      <div style={styles.sub}>Ананси ведёт игру</div>

      <div style={styles.row}>
        {/* QR + join info */}
        <div style={styles.qrBlock}>
          <div style={styles.qrLabel}>Подключись к игре</div>
          {qrUrl
            ? <img src={qrUrl} alt="QR" style={styles.qr}/>
            : <div style={styles.qrPlaceholder}>⏳</div>
          }
          {serverInfo && (
            <div style={styles.ipLabel}>
              {serverInfo.ip}:{serverInfo.port}/phone
            </div>
          )}
        </div>

        {/* Players list */}
        <div style={styles.playersList}>
          <div style={styles.playersTitle}>
            Игроки ({players.length})
          </div>
          {players.length === 0 && (
            <div style={styles.waiting}>Ждём игроков...</div>
          )}
          {players.map(p => (
            <div key={p.id} style={styles.playerRow}>
              <span style={styles.playerEmoji}>
                {p.character ? CHAR_EMOJI[p.character] : '⭕'}
              </span>
              <span style={styles.playerName}>{p.name}</span>
              {p.character
                ? <span style={styles.charName}>{CHAR_NAME[p.character]}</span>
                : <span style={styles.choosing}>выбирает...</span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Start button (only when ready) */}
      {allReady && (
        <button style={styles.startBtn} onClick={onStart}>
          Начать игру ▶
        </button>
      )}
      {players.length > 0 && !allReady && (
        <div style={styles.hint}>
          {players.length < 2 ? 'Нужно минимум 2 игрока' : 'Ждём, пока все выберут персонажа...'}
        </div>
      )}
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
    gap: 24,
    animation: 'fadeIn 0.5s ease',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(32px, 5vw, 64px)',
    color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.5)',
    letterSpacing: 4,
  },
  sub: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14,
    color: '#5a9a30',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: -16,
  },
  row: {
    display: 'flex',
    gap: 48,
    alignItems: 'flex-start',
  },
  qrBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
  },
  qrLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: '#3a6028',
    textTransform: 'uppercase',
  },
  qr: {
    width: 160,
    height: 160,
    borderRadius: 12,
    border: '2px solid #2a5a22',
  },
  qrPlaceholder: {
    width: 160, height: 160,
    background: '#0a1a0a',
    borderRadius: 12,
    border: '2px solid #2a5a22',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 40,
  },
  ipLabel: {
    fontSize: 12,
    color: '#5a9a30',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  playersList: {
    minWidth: 280,
    background: 'rgba(4,12,5,0.7)',
    border: '1px solid #1c3a1a',
    borderRadius: 14,
    padding: '16px 20px',
    backdropFilter: 'blur(10px)',
  },
  playersTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13,
    color: '#c8a830',
    marginBottom: 14,
    letterSpacing: 1,
  },
  waiting: {
    color: '#3a6028',
    fontSize: 13,
    fontStyle: 'italic',
    padding: '8px 0',
  },
  playerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 0',
    borderBottom: '1px solid #0f2010',
    animation: 'fadeIn 0.3s ease',
  },
  playerEmoji: { fontSize: 22 },
  playerName: { flex: 1, fontSize: 15, color: '#d8f0b0' },
  charName: {
    fontSize: 11, color: '#7aaa50',
    fontFamily: "'Cinzel', serif", letterSpacing: 0.5,
  },
  choosing: {
    fontSize: 11, color: '#3a6028', fontStyle: 'italic',
  },
  startBtn: {
    fontFamily: "'Cinzel', serif",
    fontSize: 16,
    letterSpacing: 2,
    color: '#040c05',
    background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none',
    borderRadius: 30,
    padding: '14px 40px',
    cursor: 'pointer',
    boxShadow: '0 0 30px rgba(200,168,48,0.4)',
    transition: 'transform .2s, box-shadow .2s',
    animation: 'glow 2s infinite',
  },
  hint: {
    fontSize: 12, color: '#3a6028',
    fontStyle: 'italic', letterSpacing: 1,
  },
};
