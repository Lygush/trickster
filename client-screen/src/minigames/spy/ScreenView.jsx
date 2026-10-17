import React from 'react';
import { CHAR_EMOJI } from '../../shared/constants';

// Шпион на большом экране. Никаких секретов до reveal: сервер их и не присылает.
export default function SpyScreen({ minigame, players }) {
  const stage = minigame?.stage;
  const data  = minigame?.data || {};
  const online = players.filter(p => p.connected);

  if (data.revealed) {
    const spy = players.find(p => p.id === data.spyId);
    const counts = data.counts || {};
    return (
      <div style={s.wrap}>
        <div style={s.revealLabel}>{data.caught ? 'Шпион пойман!' : 'Шпион ускользнул!'}</div>
        <div style={s.spyCard}>
          <div style={s.spyEmoji}>{CHAR_EMOJI[spy?.character] || '🕵️'}</div>
          <div style={s.spyName}>{spy?.name}</div>
          <div style={s.spySub}>был шпионом</div>
        </div>
        <div style={s.wordLine}>
          Слово: <b style={{ color: '#f0d060' }}>{data.word}</b>
          {data.spyGuess && (
            <span style={{ color: data.spyGuess === data.word ? '#9de05a' : '#e08070' }}>
              {'  ·  '}шпион назвал «{data.spyGuess}» {data.spyGuess === data.word ? '✓' : '✗'}
            </span>
          )}
        </div>
        <div style={s.voteRow}>
          {players.map(p => {
            const target = players.find(t => t.id === data.votes?.[p.id]);
            return (
              <div key={p.id} style={{ ...s.voteChip, borderColor: p.id === data.spyId ? '#c84830' : '#2a5a22' }}>
                <span>{CHAR_EMOJI[p.character]} {p.name}</span>
                <span style={s.arrow}>→</span>
                <span>{target ? `${CHAR_EMOJI[target.character]} ${target.name}` : '—'}</span>
                <span style={s.voteCount}>{counts[p.id] ? `(${counts[p.id]})` : ''}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const doneIds = new Set(stage === 'vote' ? data.votedIds : data.readyIds);
  return (
    <div style={s.wrap}>
      <div style={s.bigIcon}>🕵️</div>
      {stage === 'discuss' ? (
        <>
          <div style={s.title}>Среди вас затаился шпион</div>
          <div style={s.desc}>
            Посмотрите на телефоны. По очереди задавайте друг другу вопросы о слове —<br />
            так, чтобы свои поняли, а шпион не догадался.
          </div>
        </>
      ) : (
        <>
          <div style={s.title}>Голосуйте! Кто шпион?</div>
          <div style={s.desc}>
            Шпион тоже голосует — и пытается угадать слово.
            {data.spyGuessed && <b style={{ color: '#c8a830' }}> Шпион уже сделал догадку...</b>}
          </div>
        </>
      )}
      <div style={s.chips}>
        {online.map(p => (
          <div key={p.id} style={{ ...s.chip, opacity: doneIds.has(p.id) ? 1 : 0.35 }}>
            <span style={{ fontSize: 'clamp(22px,2.2vw,36px)' }}>{CHAR_EMOJI[p.character]}</span>
            <span style={s.chipName}>{p.name}</span>
            <span style={s.chipMark}>{doneIds.has(p.id) ? (stage === 'vote' ? 'голос ✓' : 'готов ✓') : '...'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: '3vh', padding: '3vh 5vw', animation: 'fadeIn 0.4s ease',
  },
  bigIcon: { fontSize: 'clamp(60px,7vw,120px)', animation: 'pulse 2s infinite' },
  title: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(26px, 3.4vw, 56px)', color: '#f0d060', letterSpacing: 2, textAlign: 'center' },
  desc: { fontSize: 'clamp(16px,1.6vw,26px)', color: '#b8d890', textAlign: 'center', lineHeight: 1.5 },
  chips: { display: 'flex', gap: '1.4vw', flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: 'rgba(10,22,10,.85)', border: '1px solid #2a5a22', borderRadius: 16,
    padding: '1.4vh 1.6vw', minWidth: '10vw', transition: 'opacity .3s',
  },
  chipName: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(14px,1.3vw,22px)', color: '#d8f0b0' },
  chipMark: { fontSize: 'clamp(12px,1vw,16px)', color: '#9de05a' },

  revealLabel: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(28px,3.6vw,60px)', color: '#f0d060', animation: 'correctPop .6s ease both' },
  spyCard: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    background: 'rgba(30,8,4,.9)', border: '2px solid #c84830', borderRadius: 20, padding: '2.4vh 4vw',
    animation: 'cardFlyIn .6s ease .4s both',
  },
  spyEmoji: { fontSize: 'clamp(50px,5vw,90px)' },
  spyName: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(22px,2.4vw,40px)', color: '#f0d0c0' },
  spySub: { fontSize: 'clamp(13px,1.1vw,18px)', color: '#e08070', letterSpacing: 2, textTransform: 'uppercase' },
  wordLine: { fontSize: 'clamp(18px,1.8vw,30px)', color: '#d8f0b0', animation: 'fadeIn .5s ease .9s both' },
  voteRow: { display: 'flex', gap: '1vw', flexWrap: 'wrap', justifyContent: 'center', animation: 'fadeIn .5s ease 1.2s both' },
  voteChip: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 'clamp(13px,1.2vw,20px)', color: '#c8e8a0',
    background: 'rgba(4,12,5,.85)', border: '1px solid', borderRadius: 20, padding: '6px 14px',
  },
  arrow: { color: '#7a9a60' },
  voteCount: { color: '#c8a830' },
};
