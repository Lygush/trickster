import React from 'react';
import { CHAR_EMOJI } from '../../shared/constants';

// Слово до reveal сервер не присылает — экран знает только его «форму» (длины слов).
export default function CrocodileScreen({ minigame, players }) {
  const data     = minigame?.data || {};
  const revealed = !!data.revealed;
  const showman  = players.find(p => p.id === data.showmanId);
  const winner   = players.find(p => p.id === data.winnerId);
  const guesses  = [...(data.guesses || [])].reverse();

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        {showman && (
          <div style={s.showman}>
            <span style={s.showmanEmoji}>{CHAR_EMOJI[showman.character] || '⭕'}</span>
            <div>
              <div style={s.showmanName}>{showman.name}</div>
              <div style={s.showmanSub}>показывает жестами — без слов и звуков!</div>
            </div>
          </div>
        )}

        {revealed ? (
          <div style={s.revealBlock}>
            <div style={s.revealWord}>{data.word}</div>
            <div style={s.revealSub}>
              {winner ? <>Угадал <b style={{ color: '#f0d060' }}>{winner.name}</b>! +2, ведущему +1</> : 'Никто не угадал...'}
            </div>
          </div>
        ) : (
          <div style={s.wordShape}>
            {(data.wordShape || []).map((len, wi) => (
              <div key={wi} style={s.wordPart}>
                {Array.from({ length: len }, (_, i) => <span key={i} style={s.letter} />)}
              </div>
            ))}
            <div style={s.lettersHint}>
              {(data.wordShape || []).reduce((a, b) => a + b, 0)} букв
              {data.skips > 0 && ` · слово менялось ${data.skips} раз`}
            </div>
          </div>
        )}
      </div>

      <div style={s.right}>
        <div style={s.guessesLabel}>Догадки</div>
        {guesses.length === 0 && <div style={s.noGuesses}>Пока тишина...</div>}
        {guesses.map((g, i) => {
          const p = players.find(x => x.id === g.playerId);
          const isWin = revealed && i === 0 && data.winnerId === g.playerId;
          return (
            <div key={guesses.length - i} style={{
              ...s.guessRow,
              borderColor: isWin ? '#c8a830' : '#1c3a18',
              background:  isWin ? 'rgba(30,25,4,0.95)' : 'rgba(10,22,10,0.8)',
              opacity: 1 - i * 0.06,
              animation: i === 0 ? 'fadeIn .3s ease' : 'none',
            }}>
              <span style={{ fontSize: 'clamp(18px,1.6vw,28px)' }}>{CHAR_EMOJI[p?.character] || '⭕'}</span>
              <span style={s.guesserName}>{p?.name}</span>
              <span style={{ ...s.guessText, color: isWin ? '#f0d060' : '#d8f0b0' }}>{g.text}</span>
              {isWin && <span style={s.check}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', height: '100%', padding: '3vh 3vw', gap: '3vw' },
  left: { flex: 1.2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5vh' },
  right: { flex: 1, display: 'flex', flexDirection: 'column', gap: '1vh', overflow: 'hidden' },
  showman: {
    display: 'flex', alignItems: 'center', gap: '1.4vw',
    background: 'rgba(4,12,5,.85)', border: '1.5px solid rgba(212,175,55,.4)', borderRadius: 20, padding: '2vh 2.4vw',
  },
  showmanEmoji: { fontSize: 'clamp(50px,5vw,90px)', animation: 'pulse 1.5s infinite' },
  showmanName: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(24px,2.6vw,44px)', color: '#f0d060' },
  showmanSub: { fontSize: 'clamp(14px,1.3vw,22px)', color: '#9aca70' },
  wordShape: { display: 'flex', flexWrap: 'wrap', gap: '2vw', justifyContent: 'center', alignItems: 'center' },
  wordPart: { display: 'flex', gap: '0.8vw' },
  letter: { display: 'inline-block', width: 'clamp(24px,2.6vw,46px)', height: 5, background: '#6a9a40', borderRadius: 3 },
  lettersHint: { width: '100%', textAlign: 'center', fontSize: 'clamp(13px,1.2vw,20px)', color: '#7aaa50', marginTop: '1vh' },
  revealBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vh' },
  revealWord: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(40px, 5.5vw, 96px)', color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.6)', letterSpacing: 3, animation: 'correctPop 0.6s ease both',
  },
  revealSub: { fontSize: 'clamp(16px,1.6vw,28px)', color: '#d8f0b0' },
  guessesLabel: { fontSize: 'clamp(12px,1vw,16px)', color: '#7aaa50', letterSpacing: 2, textTransform: 'uppercase' },
  noGuesses: { fontSize: 'clamp(14px,1.3vw,22px)', color: '#4a6a30', fontStyle: 'italic' },
  guessRow: {
    display: 'flex', alignItems: 'center', gap: '1vw', border: '1px solid', borderRadius: 12,
    padding: '1vh 1.2vw', backdropFilter: 'blur(6px)', flexShrink: 0,
  },
  guesserName: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(13px,1.1vw,18px)', color: '#90c068', minWidth: '8vw' },
  guessText: { flex: 1, fontSize: 'clamp(16px,1.6vw,26px)' },
  check: { fontSize: 'clamp(18px,1.6vw,28px)', color: '#8acc40', fontWeight: 700 },
};
