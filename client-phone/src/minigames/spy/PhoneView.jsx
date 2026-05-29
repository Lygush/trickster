import React from 'react';

/**
 * ШпионPhone — телефон игрока во время мини-игры «Шпион».
 *
 * Props приходят из App.jsx:
 *   minigame  — { id, data: { spyId, word, role } }  (данные с сервера)
 *   myId      — socket.id текущего игрока
 *   me        — объект игрока { id, name, character, ... }
 *   players   — все игроки
 *   onEmit    — (event, payload) => void  (шлёт событие на сервер)
 *
 * Что реализовать:
 *   - Показать игроку его роль: «шпион» или «мирный житель + слово»
 *   - Шпион не знает слово; остальные знают слово, но не знают кто шпион
 *   - Кнопка «Я готов» → onEmit('spy_ready', {})
 */
export default function SpyPhone({ minigame, myId, me, onEmit }) {
  const data   = minigame?.data || {};
  const isSpy  = data.spyId === myId;
  const word   = data.word  || '???';

  return (
    <div style={s.wrap}>
      <div style={s.spider}>🕷️</div>
      <div style={s.title}>Шпион</div>

      {isSpy ? (
        <>
          <div style={s.roleCard}>
            <div style={s.roleLabel}>Ты шпион!</div>
            <div style={s.roleSub}>Ты не знаешь слово. Веди себя как все.</div>
          </div>
        </>
      ) : (
        <>
          <div style={s.roleCard}>
            <div style={s.roleLabel}>Слово:</div>
            <div style={s.word}>{word}</div>
            <div style={s.roleSub}>Не выдай его шпиону.</div>
          </div>
        </>
      )}

      <div style={s.hint}>Жди инструкций ведущего...</div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 20, padding: '0 24px',
    animation: 'fadeIn 0.4s ease',
  },
  spider: { fontSize: 64, animation: 'pulse 1.5s infinite' },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 28, color: '#f0d060', letterSpacing: 2,
  },
  roleCard: {
    background: 'rgba(4,12,5,0.9)', border: '1px solid #1c3a1a',
    borderRadius: 16, padding: '24px 32px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 10,
  },
  roleLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, color: '#c8a830', letterSpacing: 2,
  },
  word: {
    fontFamily: "'Cinzel', serif",
    fontSize: 32, color: '#d8f0b0',
  },
  roleSub: { fontSize: 13, color: '#5a9a30', textAlign: 'center' },
  hint: { fontSize: 11, color: '#3a6028', letterSpacing: 1, animation: 'pulse 1.5s infinite' },
};
