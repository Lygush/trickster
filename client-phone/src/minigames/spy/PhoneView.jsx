import React, { useState } from 'react';
import { CHAR_EMOJI } from '../../shared/constants';
import { ui } from '../ui';

// Роль скрыта под «шторкой»: нажми и держи, чтобы подсмотреть — соседи не увидят.
function SecretCard({ isSpy, word }) {
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  return (
    <div
      onTouchStart={show} onTouchEnd={hide} onMouseDown={show} onMouseUp={hide} onMouseLeave={hide}
      style={{
        ...ui.card, minHeight: 130, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: 8, cursor: 'pointer', userSelect: 'none',
        borderColor: open ? (isSpy ? '#c84830' : '#c8a830') : '#2a4a20',
        background: open ? (isSpy ? 'rgba(40,8,4,.95)' : 'rgba(30,25,4,.95)') : 'rgba(4,12,5,.88)',
      }}
    >
      {!open && <><div style={{ fontSize: 34 }}>🙈</div><div style={ui.label}>Зажми, чтобы увидеть роль</div></>}
      {open && isSpy && (
        <>
          <div style={{ fontSize: 40 }}>🕵️</div>
          <div style={{ ...ui.big, color: '#f07060' }}>Ты шпион!</div>
          <div style={{ fontSize: 13, color: '#d0a090', textAlign: 'center' }}>Слова ты не знаешь. Слушай и притворяйся своим.</div>
        </>
      )}
      {open && !isSpy && (
        <>
          <div style={ui.label}>Тайное слово</div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 30, color: '#f0d060' }}>{word}</div>
          <div style={{ fontSize: 13, color: '#9aca70' }}>Не называй его прямо!</div>
        </>
      )}
    </div>
  );
}

export default function SpyPhone({ minigame, stage, priv, me, players, onAction }) {
  const data  = minigame.data || {};
  const isSpy = priv.role === 'spy';
  const [voteTap, setVoteTap]   = useState(null);
  const [guessTap, setGuessTap] = useState(null);
  const myVote  = priv.myVote ?? voteTap;
  const myGuess = priv.myGuess ?? guessTap;

  if (data.revealed) {
    const spy = players.find(p => p.id === data.spyId);
    return (
      <div style={{ ...ui.wrap, ...ui.center }}>
        <div style={{ fontSize: 56 }}>{data.caught ? '🎯' : '🕵️'}</div>
        <div style={ui.big}>{data.caught ? 'Шпион пойман!' : 'Шпион ускользнул!'}</div>
        <div style={{ ...ui.card, textAlign: 'center' }}>
          <div>{CHAR_EMOJI[spy?.character]} <b style={{ color: '#f07060' }}>{spy?.name}</b> — шпион</div>
          <div style={{ marginTop: 6, color: '#c8e8a0' }}>Слово: <b style={{ color: '#f0d060' }}>{data.word}</b></div>
        </div>
      </div>
    );
  }

  if (stage === 'discuss') {
    return (
      <div style={ui.wrap}>
        <SecretCard isSpy={isSpy} word={priv.word} />
        <div style={{ ...ui.card, fontSize: 14, color: '#c8e8a0', lineHeight: 1.5 }}>
          Задавайте друг другу вопросы о слове по кругу.<br />
          {isSpy ? 'Угадай слово по ответам и не выдай себя.' : 'Отвечай так, чтобы свои поняли, а шпион — нет.'}
        </div>
        <button
          style={{ ...ui.goldBtn, ...(priv.ready ? { background: 'rgba(20,40,10,.9)', color: '#9de05a', border: '1px solid #5a9a30' } : {}) }}
          disabled={priv.ready}
          onClick={() => onAction('ready')}
        >
          {priv.ready ? `✓ Готов (${data.readyIds?.length || 0}/${players.filter(p => p.connected).length})` : 'Готов голосовать'}
        </button>
      </div>
    );
  }

  // stage === 'vote'
  const others = players.filter(p => p.id !== me.id);
  return (
    <div style={ui.wrap}>
      <div style={ui.label}>{myVote ? 'Голос принят' : 'Кто шпион?'}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
        {others.map(p => (
          <button key={p.id} disabled={!!myVote}
            onClick={() => { setVoteTap(p.id); onAction('vote', { targetId: p.id }); }}
            style={{ ...ui.playerBtn, ...(myVote === p.id ? ui.playerBtnChosen : {}), opacity: myVote && myVote !== p.id ? 0.4 : 1 }}>
            <span style={{ fontSize: 26 }}>{CHAR_EMOJI[p.character]}</span>
            <span style={ui.playerName}>{p.name}</span>
          </button>
        ))}
      </div>

      {isSpy && (
        <>
          <div style={{ ...ui.label, color: '#e08070', marginTop: 6 }}>{myGuess ? 'Твоя догадка' : 'Угадай слово (+1)'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%' }}>
            {(priv.options || []).map(w => (
              <button key={w} disabled={!!myGuess}
                onClick={() => { setGuessTap(w); onAction('guess', { word: w }); }}
                style={{
                  ...ui.playerBtn, justifyContent: 'center', padding: '10px', fontSize: 14,
                  ...(myGuess === w ? ui.playerBtnChosen : {}), opacity: myGuess && myGuess !== w ? 0.35 : 1,
                }}>
                {w}
              </button>
            ))}
          </div>
        </>
      )}
      {!isSpy && <div style={{ fontSize: 12, color: '#7a9a60' }}>Слово: {priv.word}</div>}
    </div>
  );
}
