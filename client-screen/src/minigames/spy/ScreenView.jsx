import React from 'react';

/**
 * ШпионScreen — большой экран во время мини-игры «Шпион».
 *
 * Props:
 *   minigame — { id, data: { spyId, word, votes, phase } }
 *   players  — все игроки
 *
 * Что реализовать:
 *   - Фаза discuss: показать таймер обсуждения, не раскрывать шпиона
 *   - Фаза vote: показать, кто за кого голосует
 *   - Фаза reveal: показать кто был шпионом, слово, итог
 */
export default function SpyScreen({ minigame, players }) {
  const data = minigame?.data || {};

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.title}>Шпион</div>
      <div style={s.desc}>
        Среди {players.length} игроков затаился шпион.<br/>
        Обсуждайте — кто он?
      </div>
      <div style={s.hint}>Реализация скоро</div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 20, animation: 'fadeIn 0.4s ease',
  },
  spider: { fontSize: 80, animation: 'pulse 1.5s infinite' },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(28px, 4vw, 48px)', color: '#f0d060', letterSpacing: 2,
  },
  desc: { fontSize: 16, color: '#7aaa50', textAlign: 'center', lineHeight: 1.6 },
  hint: { fontSize: 13, color: '#3a6028', border: '1px solid #2a5a22', borderRadius: 8, padding: '8px 16px' },
};
