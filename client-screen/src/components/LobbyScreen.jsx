import React from 'react';
import { CHAR_EMOJI, CHAR_NAME } from '../shared/constants';

export default function LobbyScreen({ players, characters, config, qrUrl, phoneUrl, error, onStart }) {
  const online   = players.filter(p => p.connected);
  const minP     = config?.minPlayers ?? 2;
  const maxP     = config?.maxPlayers ?? 5;
  const allReady = online.length >= minP && online.every(p => p.character);
  const taken    = new Set(players.map(p => p.character).filter(Boolean));

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>🕸️ Сквозь Чащу</div>
      <div style={styles.sub}>Ананси ведёт игру</div>

      <div style={styles.row}>
        <div style={styles.qrBlock}>
          <div style={styles.qrLabel}>Наведи камеру телефона</div>
          <img src={qrUrl} alt="QR-код для подключения" style={styles.qr} />
          {phoneUrl && <div style={styles.ipLabel}>{phoneUrl}</div>}
          <div style={styles.wifi}>Телефон должен быть в той же Wi-Fi сети</div>
        </div>

        <div style={styles.playersList}>
          <div style={styles.playersTitle}>Игроки ({players.length}/{maxP})</div>
          {players.length === 0 && <div style={styles.waiting}>Ждём игроков...</div>}
          {players.map(p => (
            <div key={p.id} style={{ ...styles.playerRow, opacity: p.connected ? 1 : 0.4 }}>
              <span style={styles.playerEmoji}>{p.character ? CHAR_EMOJI[p.character] : '⭕'}</span>
              <span style={styles.playerName}>{p.name}</span>
              {!p.connected
                ? <span style={styles.choosing}>отключился</span>
                : p.character
                  ? <span style={styles.charName}>{CHAR_NAME[p.character]}</span>
                  : <span style={styles.choosing}>выбирает...</span>}
            </div>
          ))}
          <div style={styles.freeChars}>
            {(characters || []).map(c => (
              <span key={c.id} style={{ opacity: taken.has(c.id) ? 0.2 : 1 }} title={c.name}>{c.emoji}</span>
            ))}
          </div>
        </div>
      </div>

      {allReady ? (
        <button style={styles.startBtn} onClick={onStart}>Начать игру ▶</button>
      ) : (
        <div style={styles.hint}>
          {online.length < minP ? `Нужно минимум ${minP} игрока` : 'Ждём, пока все выберут персонажа...'}
        </div>
      )}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: '3vh', animation: 'fadeIn 0.5s ease',
  },
  title: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(36px, 5.5vw, 84px)', color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.5)', letterSpacing: 4,
  },
  sub: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(13px,1.2vw,20px)', color: '#7aaa50',
    letterSpacing: 3, textTransform: 'uppercase', marginTop: '-2vh',
  },
  row: { display: 'flex', gap: '4vw', alignItems: 'flex-start' },
  qrBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  qrLabel: { fontSize: 'clamp(12px,1vw,16px)', letterSpacing: 2, color: '#9aca70', textTransform: 'uppercase' },
  qr: {
    width: 'clamp(160px, 18vw, 300px)', height: 'clamp(160px, 18vw, 300px)',
    borderRadius: 14, border: '3px solid #2a5a22', background: '#fff',
  },
  ipLabel: { fontSize: 'clamp(13px,1.1vw,18px)', color: '#c8e8a0', fontFamily: 'monospace', letterSpacing: 1 },
  wifi: { fontSize: 'clamp(11px,0.9vw,14px)', color: '#5a8040' },
  playersList: {
    minWidth: 'clamp(280px, 26vw, 460px)', background: 'rgba(4,12,5,0.8)',
    border: '1px solid #1c3a1a', borderRadius: 14, padding: '2vh 1.6vw', backdropFilter: 'blur(10px)',
  },
  playersTitle: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(14px,1.3vw,22px)', color: '#c8a830', marginBottom: 14, letterSpacing: 1 },
  waiting: { color: '#5a8040', fontSize: 'clamp(13px,1.1vw,18px)', fontStyle: 'italic', padding: '8px 0' },
  playerRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: '1vh 0',
    borderBottom: '1px solid #0f2010', animation: 'fadeIn 0.3s ease',
  },
  playerEmoji: { fontSize: 'clamp(22px,2vw,34px)' },
  playerName: { flex: 1, fontSize: 'clamp(15px,1.4vw,24px)', color: '#d8f0b0' },
  charName: { fontSize: 'clamp(11px,1vw,16px)', color: '#9aca70', fontFamily: "'Cinzel', serif" },
  choosing: { fontSize: 'clamp(11px,1vw,16px)', color: '#5a8040', fontStyle: 'italic' },
  freeChars: { display: 'flex', gap: 10, justifyContent: 'center', marginTop: 14, fontSize: 'clamp(18px,1.6vw,28px)' },
  startBtn: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(16px,1.4vw,24px)', letterSpacing: 2,
    color: '#040c05', background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none', borderRadius: 30, padding: '16px 48px', cursor: 'pointer',
    boxShadow: '0 0 30px rgba(200,168,48,0.4)', animation: 'glow 2s infinite',
  },
  hint: { fontSize: 'clamp(13px,1.1vw,18px)', color: '#7aaa50', fontStyle: 'italic', letterSpacing: 1 },
  error: { fontSize: 'clamp(13px,1.1vw,18px)', color: '#f08070' },
};
