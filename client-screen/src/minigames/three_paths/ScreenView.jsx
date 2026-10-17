import React from 'react';
import { CHAR_EMOJI, plural } from '../../shared/constants';

const PATH_ICONS  = ['🌿', '🍄', '🌙'];
const PATH_COLORS = ['#6aba3a', '#d8b840', '#7a9aec'];
const PATH_BG     = ['rgba(30,60,10,0.75)', 'rgba(50,40,5,0.75)', 'rgba(10,20,60,0.75)'];
const PATH_BORDER = ['#2a6a18', '#9a7a18', '#2a4a9a'];

export default function ThreePathsScreen({ minigame, players = [] }) {
  const data     = minigame?.data || {};
  const paths    = data.paths || ['', '', ''];
  const choices  = data.choices || {};
  const revealed = !!data.revealed;
  const winPath  = revealed ? data.winPath : null;
  const online   = players.filter(p => p.connected);
  const chosen   = Object.keys(choices).length;

  return (
    <div style={tp.wrap}>
      <div style={tp.anansiLine}>«{data.anansiLine}»</div>

      <div style={tp.paths}>
        {paths.map((pathName, i) => {
          const isWinner = revealed && winPath === i;
          const isLoser  = revealed && winPath !== i;
          const choosers = players.filter(p => choices[p.id] === i);
          return (
            <div key={i} style={{
              ...tp.pathCard,
              background:  isWinner ? 'rgba(80,160,40,0.3)' : isLoser ? 'rgba(10,10,10,0.55)' : PATH_BG[i],
              borderColor: isWinner ? '#7acc40' : isLoser ? '#1a2a18' : PATH_BORDER[i],
              transform:   isWinner ? 'scale(1.06)' : isLoser ? 'scale(0.94)' : 'scale(1)',
              opacity:     isLoser ? 0.45 : 1,
            }}>
              <div style={tp.pathIcon}>{PATH_ICONS[i]}</div>
              <div style={{ ...tp.pathName, color: isWinner ? '#b0f070' : PATH_COLORS[i] }}>{pathName}</div>
              {isWinner && <div style={tp.winBadge}>✦ ВЕРНЫЙ ПУТЬ ✦</div>}
              {isLoser && <div style={tp.loseBadge}>тупик</div>}
              <div style={tp.choosers}>
                {choosers.map(p => (
                  <div key={p.id} style={tp.chooserBadge}>
                    <span style={{ fontSize: 'clamp(18px,1.8vw,30px)' }}>{CHAR_EMOJI[p.character] || '⭕'}</span>
                    <span style={tp.chooserName}>{p.name}</span>
                  </div>
                ))}
              </div>
              <div style={tp.countBadge}>
                {choosers.length ? `${choosers.length} ${plural(choosers.length, 'игрок', 'игрока', 'игроков')}` : '—'}
              </div>
            </div>
          );
        })}
      </div>

      <div style={tp.status}>
        {revealed
          ? (Object.values(choices).filter(c => c === winPath).length === 1
              ? 'Одиночка на верной тропе забирает двойную награду!'
              : 'Ананси открывает правду...')
          : `Выбрали: ${chosen} / ${online.length}`}
      </div>
    </div>
  );
}

const tp = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    height: '100%', padding: '3vh 4vw', gap: '3vh',
  },
  anansiLine: { fontSize: 'clamp(16px,1.8vw,30px)', color: '#b8c890', fontStyle: 'italic', textAlign: 'center', maxWidth: 1100 },
  paths: { display: 'flex', gap: '2vw', flex: 1, width: '100%', alignItems: 'stretch', minHeight: 0 },
  pathCard: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '3vh 1.5vw', border: '2px solid', borderRadius: 24,
    backdropFilter: 'blur(12px)', gap: '1.5vh', overflow: 'hidden',
    transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
  },
  pathIcon: { fontSize: 'clamp(44px,5vw,90px)' },
  pathName: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(18px,2vw,34px)', fontWeight: 700, textAlign: 'center', lineHeight: 1.25 },
  winBadge: {
    background: 'rgba(100,200,50,0.15)', border: '1px solid #5aaa28', borderRadius: 20,
    padding: '4px 16px', fontSize: 'clamp(12px,1.1vw,18px)', color: '#9aec60',
    letterSpacing: 2, fontFamily: "'Cinzel', serif", fontWeight: 700, animation: 'pulse 1s infinite',
  },
  loseBadge: { fontSize: 'clamp(12px,1.1vw,18px)', color: '#aa5040', letterSpacing: 2, textTransform: 'uppercase' },
  choosers: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', alignItems: 'center', flex: 1 },
  chooserBadge: {
    display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(4,12,5,0.75)',
    border: '1px solid #2a4a28', borderRadius: 24, padding: '4px 16px', animation: 'bounceIn .4s ease',
  },
  chooserName: { fontSize: 'clamp(14px,1.4vw,24px)', color: '#c8e8a0', fontFamily: "'Nunito', sans-serif", fontWeight: 700 },
  countBadge: { fontSize: 'clamp(12px,1.1vw,18px)', color: '#7a9a60' },
  status: { fontSize: 'clamp(14px,1.4vw,22px)', color: '#c8a830', letterSpacing: 1, fontFamily: "'Cinzel',serif" },
};
