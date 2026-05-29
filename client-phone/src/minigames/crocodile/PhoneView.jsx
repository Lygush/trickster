import React, { useState } from 'react';

/**
 * КрокодилPhone — телефон игрока в мини-игре «Крокодил».
 *
 * Механика:
 *   Один игрок (showman) показывает слово жестами перед экраном.
 *   Остальные угадывают и нажимают кнопку «Угадал!» (или шлют guess).
 *   Большой экран показывает слово только showman-у через камеру.
 *
 * Props:
 *   minigame — { data: { showmanId, word, guesses, revealed } }
 *   myId, onEmit
 */
export default function CrocodilePhone({ minigame, myId, onEmit }) {
  const data       = minigame?.data || {};
  const showmanId  = data.showmanId;
  const word       = data.word      || '???';
  const guesses    = data.guesses   || {};
  const revealed   = data.revealed  || false;
  const isShowman  = showmanId === myId;
  const myGuess    = guesses[myId];

  const [guessText, setGuessText] = useState('');

  const handleGuess = () => {
    const trimmed = guessText.trim();
    if (!trimmed) return;
    onEmit('croc_guess', { text: trimmed });
    setGuessText('');
  };

  // Показываем слово только ведущему
  if (isShowman) {
    return (
      <div style={s.wrap}>
        <div style={s.spider}>🕷️</div>
        <div style={s.roleLabel}>ТЫ ПОКАЗЫВАЕШЬ</div>
        <div style={s.wordCard}>
          <div style={s.wordLabel}>Слово:</div>
          <div style={s.word}>{word}</div>
        </div>
        <div style={s.desc}>
          Встань перед большим экраном.<br/>
          Покажи слово жестами — без звука!
        </div>
        {revealed && (
          <div style={s.result}>Время вышло!</div>
        )}
      </div>
    );
  }

  // Угадывающий
  if (revealed) {
    return (
      <div style={s.wrap}>
        <div style={s.spider}>🕷️</div>
        <div style={s.title}>Слово было:</div>
        <div style={s.revealWord}>{word}</div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.title}>Крокодил</div>
      <div style={s.desc}>Смотри на большой экран и угадывай слово!</div>

      <div style={s.inputRow}>
        <input
          style={s.input}
          value={guessText}
          onChange={e => setGuessText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleGuess()}
          placeholder="Твой вариант..."
          maxLength={40}
          autoComplete="off"
        />
        <button
          style={{ ...s.btn, opacity: guessText.trim() ? 1 : 0.4 }}
          onClick={handleGuess}
          disabled={!guessText.trim()}
        >→</button>
      </div>

      {myGuess && (
        <div style={s.myGuessHint}>
          Твой последний ответ: <strong style={{ color: '#c8a830' }}>{myGuess}</strong>
        </div>
      )}
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 18, padding: '20px 18px',
    animation: 'fadeIn 0.4s ease',
  },
  spider: { fontSize: 52, animation: 'pulse 1.5s infinite',
    filter: 'drop-shadow(0 0 14px rgba(200,168,48,0.5))' },
  roleLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: 12, color: '#c8a830', letterSpacing: 3,
    textTransform: 'uppercase',
  },
  wordCard: {
    background: 'rgba(4,12,5,0.9)', border: '2px solid #c8a830',
    borderRadius: 16, padding: '20px 36px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    boxShadow: '0 0 30px rgba(200,168,48,0.2)',
  },
  wordLabel: { fontSize: 11, color: '#5a9a30', letterSpacing: 2, textTransform: 'uppercase' },
  word: {
    fontFamily: "'Cinzel', serif",
    fontSize: 32, color: '#f0d060',
    textShadow: '0 0 20px rgba(200,168,48,0.5)',
  },
  title: { fontFamily: "'Cinzel', serif", fontSize: 22, color: '#f0d060', letterSpacing: 2 },
  desc: { fontSize: 13, color: '#7aaa50', textAlign: 'center', lineHeight: 1.6 },
  inputRow: { display: 'flex', gap: 8, width: '100%' },
  input: {
    flex: 1, background: '#0a1a0a', border: '1px solid #2a5a22',
    borderRadius: 10, padding: '14px 16px',
    color: '#d8f0b0', fontSize: 16,
    fontFamily: "'Nunito', sans-serif", outline: 'none',
  },
  btn: {
    fontFamily: "'Cinzel', serif", fontSize: 18,
    color: '#040c05', background: 'linear-gradient(135deg, #c8a830, #f0d060)',
    border: 'none', borderRadius: 10, padding: '0 18px',
    cursor: 'pointer', transition: 'opacity .2s',
  },
  myGuessHint: { fontSize: 12, color: '#3a6028' },
  revealWord: {
    fontFamily: "'Cinzel', serif",
    fontSize: 36, color: '#f0d060',
    textShadow: '0 0 20px rgba(200,168,48,0.5)',
  },
  result: { fontSize: 14, color: '#c84830', fontFamily: "'Cinzel', serif" },
};
