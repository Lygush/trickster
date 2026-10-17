import React from 'react';
import { CHAR_EMOJI } from '../shared/constants';

const MESSAGES = {
  intro:            'Ананси готовит первый вопрос...',
  question_result:  'Смотри на экран!',
  minigame_intro:   'Ананси затевает что-то...',
  minigame:         'Мини-игра!',
  final_race_intro: 'Финальная гонка начинается!',
};

export default function WaitScreen({ phase, me, players = [] }) {
  const sorted   = [...players].sort((a, b) => b.score - a.score);
  const leader   = sorted[0];
  const isLeader = leader?.id === me?.id && (sorted[1]?.score ?? -1) < leader.score;

  return (
    <div style={s.wrap}>
      <div style={s.avatar}>{CHAR_EMOJI[me?.character] || '⭕'}</div>
      <div style={s.name}>{me?.name}</div>

      <div style={s.posCard}>
        <div style={s.posLabel}>Мой счёт</div>
        <div style={s.posValue}>{me?.score ?? 0}</div>
      </div>

      {leader && !isLeader && leader.score > 0 && (
        <div style={s.leaderCard}>
          <span style={{ fontSize: 18 }}>{CHAR_EMOJI[leader.character]}</span>
          <span style={s.leaderText}>{leader.name} впереди — {leader.score} очков</span>
        </div>
      )}
      {isLeader && (
        <div style={s.leadingCard}>
          <span>👑</span><span style={s.leadingText}>Ты лидируешь! Ананси это заметил...</span>
        </div>
      )}

      <div style={s.message}>{MESSAGES[phase] || 'Ждём...'}</div>
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 24px', animation: 'fadeIn 0.4s ease' },
  avatar: { fontSize: 72, filter: 'drop-shadow(0 0 16px rgba(90,154,48,0.3))' },
  name: { fontFamily: "'Cinzel', serif", fontSize: 20, color: '#d8f0b0', letterSpacing: 1 },
  posCard: { background: 'rgba(4,12,5,0.8)', border: '1px solid #1c3a1a', borderRadius: 14, padding: '12px 32px', textAlign: 'center' },
  posLabel: { fontSize: 11, color: '#6a9a50', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  posValue: { fontFamily: "'Cinzel', serif", fontSize: 36, color: '#f0d060' },
  leaderCard: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(30,20,4,0.85)', border: '1px solid #3a2a10', borderRadius: 10, padding: '8px 16px' },
  leaderText: { fontSize: 13, color: '#c8a830' },
  leadingCard: {
    display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(30,25,2,0.85)',
    border: '1px solid rgba(212,175,55,.4)', borderRadius: 10, padding: '8px 18px', animation: 'pulse 2s infinite',
  },
  leadingText: { fontSize: 13, color: '#f0d060', fontFamily: "'Cinzel', serif" },
  message: { fontSize: 15, color: '#8acc50', letterSpacing: 1, textAlign: 'center', animation: 'pulse 1.6s infinite' },
};
