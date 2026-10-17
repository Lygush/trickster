import React, { useState } from 'react';
import { CHAR_EMOJI } from '../../shared/constants';
import { ui } from '../ui';

const MAX = 200;

export default function AanansiStoryPhone({ minigame, stage, priv, me, players, onAction }) {
  const data = minigame.data || {};
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const [voteTap, setVoteTap] = useState(null);
  const myVote = priv.myVote ?? voteTap;

  if (data.revealed) {
    const mine = (data.entries || []).find(e => e.authorId === me.id);
    return (
      <div style={{ ...ui.wrap, ...ui.center }}>
        <div style={{ fontSize: 50 }}>📜</div>
        <div style={ui.big}>{mine ? `За твою историю: ${mine.votes} гол.` : 'Ты не успел написать историю'}</div>
        <div style={ui.hint}>Авторы — на большом экране</div>
      </div>
    );
  }

  if (stage === 'write') {
    const done = priv.mySubmission || sent;
    const submit = () => {
      const t = text.trim();
      if (!t || done) return;
      setSent(true);
      onAction('submit', { text: t });
    };
    return (
      <div style={ui.wrap}>
        <div style={{ ...ui.prompt, fontStyle: 'italic' }}>«{data.prompt}»</div>
        {!done ? (
          <>
            <div style={ui.label}>Продолжи историю</div>
            <textarea
              style={{
                width: '100%', background: '#0a1a0a', border: '1px solid #3a6a28', borderRadius: 12,
                padding: '12px 14px', color: '#e8f5d0', fontSize: 16, fontFamily: "'Nunito', sans-serif",
                outline: 'none', resize: 'none', lineHeight: 1.5,
              }}
              value={text}
              onChange={e => setText(e.target.value.slice(0, MAX))}
              placeholder="...и тогда Ананси"
              rows={5}
              autoFocus
            />
            <div style={{ alignSelf: 'flex-end', fontSize: 11, color: text.length > MAX - 20 ? '#e0a040' : '#5a8040' }}>{text.length} / {MAX}</div>
            <button style={{ ...ui.goldBtn, opacity: text.trim() ? 1 : 0.4 }} disabled={!text.trim()} onClick={submit}>
              Отправить →
            </button>
          </>
        ) : (
          <>
            <div style={ui.check}>✓</div>
            <div style={ui.big}>Отправлено!</div>
            <div style={{ ...ui.card, fontSize: 14, color: '#9aba80', fontStyle: 'italic' }}>{priv.mySubmission || text}</div>
            <div style={ui.hint}>Ждём остальных...</div>
          </>
        )}
      </div>
    );
  }

  // stage === 'vote'
  const entries = data.entries || [];
  return (
    <div style={ui.wrap}>
      <div style={ui.label}>{myVote ? 'Голос принят' : 'Какое продолжение лучше?'}</div>
      {entries.map((e, i) => {
        const own = e.id === priv.myEntryId;
        return (
          <button key={e.id} disabled={own || !!myVote}
            onClick={() => { setVoteTap(e.id); onAction('vote', { entryId: e.id }); }}
            style={{
              ...ui.playerBtn, flexDirection: 'column', alignItems: 'flex-start', gap: 6,
              ...(myVote === e.id ? ui.playerBtnChosen : {}),
              opacity: own ? 0.45 : myVote && myVote !== e.id ? 0.4 : 1,
            }}>
            <span style={{ fontSize: 11, color: '#c8a830', letterSpacing: 1 }}>
              ВАРИАНТ {i + 1}{own ? ' · твой' : ''}
            </span>
            <span style={{ fontSize: 15, lineHeight: 1.4 }}>{e.text}</span>
          </button>
        );
      })}
      {myVote && <div style={ui.hint}>Ждём остальных...</div>}
      {!entries.some(e => e.id !== priv.myEntryId) && (
        <div style={ui.hint}>{CHAR_EMOJI[me.character]} Голосовать не за что — ждём</div>
      )}
    </div>
  );
}
