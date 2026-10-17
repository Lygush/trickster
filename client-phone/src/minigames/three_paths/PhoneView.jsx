import React, { useState } from 'react';
import { CHAR_EMOJI } from '../../shared/constants';
import { ui } from '../ui';

const PATH_ICONS  = ['🌿', '🍄', '🌙'];
const PATH_COLORS = ['#7aca4a', '#e0c050', '#8aaaf0'];
const PATH_BG     = ['rgba(20,50,8,0.9)', 'rgba(50,38,4,0.9)', 'rgba(8,18,50,0.9)'];
const PATH_BORDER = ['#3a7a28', '#aa8a28', '#3a5aaa'];

export default function ThreePathsPhone({ minigame, priv, players, onAction }) {
  const data     = minigame.data || {};
  const paths    = data.paths || [];
  const choices  = data.choices || {};
  const revealed = !!data.revealed;
  const [tapped, setTapped] = useState(null);
  const myChoice = priv.myChoice ?? tapped;

  if (revealed) {
    const won = myChoice === data.winPath;
    return (
      <div style={{ ...ui.wrap, ...ui.center }}>
        <div style={{ fontSize: 60, animation: 'bounceIn .5s ease' }}>{won ? '✨' : '🕸️'}</div>
        <div style={ui.big}>{myChoice === null ? 'Ты не выбрал тропу' : won ? 'Верная тропа!' : 'Тупик...'}</div>
        <div style={{ ...ui.card, textAlign: 'center' }}>
          <div style={ui.label}>Верной была</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 18, color: PATH_COLORS[data.winPath], marginTop: 6 }}>
            {PATH_ICONS[data.winPath]} {paths[data.winPath]}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={ui.wrap}>
      <div style={{ fontSize: 14, color: '#b8c890', fontStyle: 'italic', textAlign: 'center' }}>«{data.anansiLine}»</div>
      <div style={ui.label}>{myChoice === null ? 'Выбери тропу' : 'Ты выбрал — ждём остальных'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
        {paths.map((name, i) => {
          const isMine = myChoice === i;
          const others = players.filter(p => choices[p.id] === i);
          return (
            <button
              key={i}
              disabled={myChoice !== null}
              onClick={() => { setTapped(i); onAction('choose', { pathIndex: i }); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, minHeight: 74,
                border: '2px solid', borderRadius: 18, padding: '14px 18px', cursor: 'pointer',
                background: PATH_BG[i], borderColor: isMine ? '#f0d060' : PATH_BORDER[i],
                opacity: myChoice !== null && !isMine ? 0.45 : 1,
                boxShadow: isMine ? '0 0 22px rgba(240,208,96,.3)' : 'none',
                animation: `answerAppear .35s ease ${i * 80}ms both`, transition: 'opacity .3s, border-color .3s',
              }}
            >
              <span style={{ fontSize: 32 }}>{PATH_ICONS[i]}</span>
              <span style={{ flex: 1, textAlign: 'left', fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, color: PATH_COLORS[i] }}>{name}</span>
              <span style={{ fontSize: 18 }}>{others.map(p => CHAR_EMOJI[p.character]).join('')}</span>
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 12, color: '#7a9a60', textAlign: 'center' }}>Один на верной тропе получает +2</div>
    </div>
  );
}
