import React, { useState } from 'react';
import { CHAR_EMOJI } from '../../shared/constants';
import { ui } from '../ui';

export default function CrocodilePhone({ minigame, priv, me, players, onAction }) {
  const data = minigame.data || {};
  const [guess, setGuess] = useState('');
  const showman = players.find(p => p.id === data.showmanId);
  const isShowman = priv.role === 'showman';

  if (data.revealed) {
    const winner = players.find(p => p.id === data.winnerId);
    return (
      <div style={{ ...ui.wrap, ...ui.center }}>
        <div style={ui.label}>Слово было</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: 36, color: '#f0d060', animation: 'bounceIn .5s ease' }}>{data.word}</div>
        <div style={ui.big}>
          {winner ? (winner.id === me.id ? 'Ты угадал! +2' : `Угадал ${winner.name}`) : 'Никто не угадал'}
        </div>
        {isShowman && winner && <div style={{ color: '#9de05a' }}>Отличный показ! +1</div>}
      </div>
    );
  }

  if (isShowman) {
    const skipsLeft = (data.maxSkips ?? 2) - (data.skips || 0);
    return (
      <div style={{ ...ui.wrap, ...ui.center }}>
        <div style={{ ...ui.label, color: '#c8a830' }}>Ты показываешь</div>
        <div style={{
          ...ui.card, textAlign: 'center', borderColor: '#c8a830', borderWidth: 2,
          boxShadow: '0 0 30px rgba(200,168,48,0.2)', padding: '24px 16px',
        }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 38, color: '#f0d060' }}>{priv.word}</div>
        </div>
        <div style={{ fontSize: 15, color: '#c8e8a0', textAlign: 'center', lineHeight: 1.5 }}>
          Встань перед экраном и покажи слово жестами.<br />Никаких звуков и букв в воздухе!
        </div>
        <button style={{ ...ui.goldBtn, background: 'rgba(30,24,4,.9)', color: '#d8b040', border: '1px solid #8a7020', opacity: skipsLeft ? 1 : 0.4 }}
          disabled={!skipsLeft} onClick={() => onAction('skip_word')}>
          ↻ Другое слово ({skipsLeft})
        </button>
        <div style={{ fontSize: 12, color: '#7a9a60' }}>Догадок: {data.guesses?.length || 0}</div>
      </div>
    );
  }

  const send = () => {
    const t = guess.trim();
    if (!t) return;
    onAction('guess', { text: t });
    setGuess('');
  };
  const myGuesses = (data.guesses || []).filter(g => g.playerId === me.id).slice(-3).reverse();

  return (
    <div style={ui.wrap}>
      {showman && (
        <div style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 34 }}>{CHAR_EMOJI[showman.character]}</span>
          <span style={{ color: '#c8e8a0', fontSize: 15 }}><b style={{ color: '#f0d060' }}>{showman.name}</b> показывает. Угадывай!</span>
        </div>
      )}
      <div style={{ fontSize: 13, color: '#7aaa50' }}>
        Слово: {(data.wordShape || []).map(n => '_'.repeat(n)).join(' ')} ({(data.wordShape || []).reduce((a, b) => a + b, 0)} букв)
      </div>
      <form style={{ display: 'flex', gap: 8, width: '100%' }} onSubmit={(e) => { e.preventDefault(); send(); }}>
        <input
          style={{
            flex: 1, minWidth: 0, background: '#0a1a0a', border: '1px solid #3a6a28', borderRadius: 12,
            padding: '14px 16px', color: '#e8f5d0', fontSize: 17, fontFamily: "'Nunito', sans-serif", outline: 'none',
          }}
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Твоя догадка..."
          maxLength={40}
          autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
          enterKeyHint="send"
        />
        <button type="submit" style={{ ...ui.goldBtn, width: 'auto', borderRadius: 12, padding: '0 20px', fontSize: 20, opacity: guess.trim() ? 1 : 0.4 }}>→</button>
      </form>
      {myGuesses.length > 0 && (
        <div style={{ width: '100%' }}>
          <div style={ui.label}>Мимо:</div>
          {myGuesses.map((g, i) => <div key={i} style={{ color: '#a08070', fontSize: 14, marginTop: 4 }}>✗ {g.text}</div>)}
        </div>
      )}
    </div>
  );
}
