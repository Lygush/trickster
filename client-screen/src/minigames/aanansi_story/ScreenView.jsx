import React from 'react';

const CHAR_EMOJI = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };

/**
 * ИсторияАнансиScreen — большой экран мини-игры «История Ананси».
 *
 * Фазы: write (ждём текстов) → reveal (показываем все варианты по очереди)
 */
export default function AanansiStoryScreen({ minigame, players }) {
  const data        = minigame?.data     || {};
  const prompt      = data.prompt        || 'Однажды в чаще леса...';
  const submissions = data.submissions   || {};
  const phase       = data.phase         || 'write';
  const current     = data.currentIndex;   // индекс показываемого текста в reveal

  const submitted = Object.keys(submissions).length;
  const total     = players.length;

  const allTexts = Object.entries(submissions).map(([id, text]) => ({
    player: players.find(p => p.id === id),
    text,
  }));

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.spider}>🕷️</div>
        <div style={s.title}>История Ананси</div>
        <div style={s.prompt}>«{prompt}»</div>
      </div>

      {phase === 'write' && (
        <div style={s.waiting}>
          <div style={s.waitCount}>{submitted} / {total}</div>
          <div style={s.waitLabel}>игроков пишут продолжение</div>
          <div style={s.dots}>
            {players.map(p => (
              <div key={p.id} style={{
                ...s.dot,
                background: submissions[p.id] !== undefined ? '#5a9a30' : '#1a2a18',
              }} title={p.name} />
            ))}
          </div>
        </div>
      )}

      {phase === 'reveal' && (
        <div style={s.stories}>
          {allTexts.map(({ player, text }, i) => (
            <div key={i} style={{
              ...s.storyCard,
              opacity: current === undefined || current === i ? 1 : 0.35,
              transform: current === i ? 'scale(1.03)' : 'scale(1)',
              transition: 'all 0.5s ease',
            }}>
              {player && (
                <div style={s.storyAuthor}>
                  <span style={{ fontSize: 20 }}>{CHAR_EMOJI[player.character] || '⭕'}</span>
                  <span style={s.authorName}>{player.name}</span>
                </div>
              )}
              <div style={s.storyText}>«{text}»</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', height: '100%',
    padding: '24px 48px', gap: 24,
    animation: 'fadeIn 0.4s ease', overflowY: 'auto',
  },
  header: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  spider: { fontSize: 48, animation: 'pulse 1.5s infinite' },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(22px, 3vw, 36px)', color: '#f0d060', letterSpacing: 2,
  },
  prompt: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(14px, 1.8vw, 20px)', color: '#d8f0b0',
    fontStyle: 'italic', textAlign: 'center', maxWidth: 600, lineHeight: 1.5,
    background: 'rgba(4,12,5,0.8)', border: '1px solid #1c3a1a',
    borderRadius: 12, padding: '14px 24px',
  },
  waiting: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  waitCount: {
    fontFamily: "'Cinzel', serif",
    fontSize: 48, color: '#f0d060',
  },
  waitLabel: { fontSize: 13, color: '#5a9a30', letterSpacing: 1 },
  dots: { display: 'flex', gap: 10, marginTop: 8 },
  dot: { width: 14, height: 14, borderRadius: '50%', transition: 'background 0.4s ease' },
  stories: { display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 640 },
  storyCard: {
    background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '18px 22px',
    backdropFilter: 'blur(8px)',
  },
  storyAuthor: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  authorName: { fontFamily: "'Cinzel', serif", fontSize: 13, color: '#c8a830', letterSpacing: 1 },
  storyText: { fontSize: 16, color: '#d8f0b0', fontStyle: 'italic', lineHeight: 1.6 },
};
