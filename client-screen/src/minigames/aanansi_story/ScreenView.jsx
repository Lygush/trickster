import React from 'react';
import { CHAR_EMOJI, plural } from '../../shared/constants';

// write  — промпт и кто уже написал
// vote   — анонимные варианты (номера), кто проголосовал
// reveal — варианты с авторами и голосами, лучшие сверху
export default function AanansiStoryScreen({ minigame, players }) {
  const stage = minigame?.stage;
  const data  = minigame?.data || {};
  const online = players.filter(p => p.connected);

  return (
    <div style={s.wrap}>
      <div style={s.prompt}>
        <span style={s.spider}>🕷️</span>
        «{data.prompt}»
      </div>

      {stage === 'write' && (
        <div style={s.waiting}>
          <div style={s.waitLabel}>Игроки пишут продолжение...</div>
          <div style={s.chips}>
            {online.map(p => {
              const done = (data.submittedIds || []).includes(p.id);
              return (
                <div key={p.id} style={{ ...s.chip, opacity: done ? 1 : 0.35 }}>
                  <span style={{ fontSize: 'clamp(22px,2.2vw,36px)' }}>{CHAR_EMOJI[p.character]}</span>
                  <span style={s.chipName}>{p.name}</span>
                  <span style={s.chipMark}>{done ? '✍ готово' : '✍ ...'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(stage === 'vote' || data.revealed) && (
        <div style={s.stories}>
          {(data.entries || []).map((e, i) => {
            const author = data.revealed ? players.find(p => p.id === e.authorId) : null;
            const best = data.revealed && i === 0 && e.votes > 0;
            return (
              <div key={e.id} style={{
                ...s.storyCard,
                borderColor: best ? '#c8a830' : 'rgba(107,199,64,.25)',
                background: best ? 'rgba(30,25,4,.92)' : 'rgba(4,12,5,.88)',
                animation: `fadeIn .4s ease ${i * 0.12}s both`,
              }}>
                <div style={s.storyHead}>
                  {data.revealed ? (
                    <>
                      <span style={{ fontSize: 'clamp(18px,1.8vw,30px)' }}>{CHAR_EMOJI[author?.character] || '⭕'}</span>
                      <span style={s.authorName}>{author?.name}</span>
                      <span style={s.votes}>{best && '👑 '}{e.votes} {plural(e.votes, 'голос', 'голоса', 'голосов')}</span>
                    </>
                  ) : (
                    <span style={s.num}>Вариант {i + 1}</span>
                  )}
                </div>
                <div style={s.storyText}>{e.text}</div>
              </div>
            );
          })}
        </div>
      )}

      {stage === 'vote' && (
        <div style={s.voteStatus}>Голосуйте на телефонах! Проголосовали: {(data.votedIds || []).length} / {online.length}</div>
      )}
    </div>
  );
}

const s = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', padding: '3vh 4vw', gap: '2.4vh', overflowY: 'auto' },
  prompt: {
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(18px, 2.2vw, 36px)', color: '#e8f5d0',
    fontStyle: 'italic', textAlign: 'center', maxWidth: 1300, lineHeight: 1.45,
    background: 'rgba(4,12,5,0.85)', border: '1px solid rgba(212,175,55,.3)', borderRadius: 16, padding: '2vh 3vw',
  },
  spider: { marginRight: 12, fontStyle: 'normal' },
  waiting: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '3vh' },
  waitLabel: { fontSize: 'clamp(16px,1.6vw,26px)', color: '#9aca70', letterSpacing: 1 },
  chips: { display: 'flex', gap: '1.4vw', flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: 'rgba(10,22,10,.85)', border: '1px solid #2a5a22', borderRadius: 16, padding: '1.4vh 1.6vw', minWidth: '10vw',
    transition: 'opacity .3s',
  },
  chipName: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(14px,1.3vw,22px)', color: '#d8f0b0' },
  chipMark: { fontSize: 'clamp(12px,1vw,16px)', color: '#9de05a' },
  stories: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(32vw, 1fr))', gap: '1.6vh 1.6vw', width: '100%' },
  storyCard: { border: '1.5px solid', borderRadius: 16, padding: '1.8vh 1.6vw', backdropFilter: 'blur(8px)' },
  storyHead: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1vh' },
  num: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(13px,1.2vw,20px)', color: '#c8a830', letterSpacing: 2 },
  authorName: { fontFamily: "'Cinzel', serif", fontSize: 'clamp(14px,1.3vw,22px)', color: '#c8a830' },
  votes: { marginLeft: 'auto', fontSize: 'clamp(14px,1.3vw,22px)', color: '#f0d060', fontWeight: 700 },
  storyText: { fontSize: 'clamp(16px,1.6vw,26px)', color: '#d8f0b0', lineHeight: 1.45 },
  voteStatus: { fontSize: 'clamp(14px,1.3vw,22px)', color: '#c8a830', fontFamily: "'Cinzel',serif" },
};
