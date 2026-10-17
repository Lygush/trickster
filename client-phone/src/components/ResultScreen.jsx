import React from 'react';
import { LETTERS } from '../shared/constants';

export default function ResultScreen({ state, me }) {
  const q = state.question;
  const r = state.questionResult;
  if (!q || !r) return null;

  const myAnswer   = r.answers[me.id];
  const answered   = myAnswer !== undefined;
  const wasCorrect = r.correctIds.includes(me.id);
  const helped     = r.helped.includes(me.id);
  const hindered   = r.hindered?.[me.id];
  const kind = wasCorrect ? 'ok' : answered ? 'wrong' : 'miss';

  const icon  = { ok: '✓', wrong: '✗', miss: '⏱' }[kind];
  const text  = { ok: 'Верно! +1 очко', wrong: 'Неверно', miss: 'Не успел' }[kind];
  const color = { ok: '#8acc40', wrong: '#e07070', miss: '#c8a830' }[kind];

  return (
    <div style={s.wrap}>
      <div style={{ ...s.resultBadge, ...s[`badge_${kind}`] }}>
        <div style={{ ...s.resultIcon, color, animation: 'resultIconPop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>{icon}</div>
        <div style={{ ...s.resultText, color }}>{text}</div>
      </div>

      {helped && (
        <div style={s.helpCard}>
          <div style={{ fontSize: 30 }}>🕷️</div>
          <div>
            <div style={s.helpTitle}>Ананси подтолкнул тебя! +1</div>
            <div style={s.helpSub}>
              Паук помогает отстающим ({me.helpsUsed}/{state.config.helpMax}). Ответишь неверно — помощь кончится.
            </div>
          </div>
        </div>
      )}
      {hindered > 0 && (
        <div style={{ ...s.helpCard, borderColor: '#e08840' }}>
          <div style={{ fontSize: 26 }}>⚡</div>
          <div>
            <div style={{ ...s.helpTitle, color: '#e8a050' }}>Ты лидер — Ананси мешал тебе</div>
            <div style={s.helpSub}>Чем больше отрыв, тем сильнее помехи</div>
          </div>
        </div>
      )}

      <div style={s.posCard}>
        <div style={s.posLabel}>Мой счёт</div>
        <div style={{ ...s.posValue, animation: wasCorrect || helped ? 'bounceIn 0.5s 0.3s ease both' : 'fadeIn 0.4s ease' }}>
          {me.score}
        </div>
      </div>

      <div style={s.correctBlock}>
        <div style={s.correctLabel}>Правильный ответ</div>
        <div style={s.correctAns}>
          <div style={s.correctLetter}>{LETTERS[r.correctIndex]}</div>
          <span style={s.correctText}>{q.answers[r.correctIndex]}</span>
        </div>
      </div>
    </div>
  );
}

const s = {
  wrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 16, padding: '0 22px', animation: 'fadeInScale 0.35s ease',
  },
  resultBadge: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, borderRadius: 20, padding: '20px 44px', border: '1px solid' },
  badge_ok:    { background: 'rgba(10,30,10,0.9)', borderColor: 'rgba(107,199,64,.6)', boxShadow: '0 0 32px rgba(90,154,48,.2)' },
  badge_wrong: { background: 'rgba(30,8,4,0.9)', borderColor: 'rgba(200,72,48,.5)' },
  badge_miss:  { background: 'rgba(20,16,4,0.9)', borderColor: 'rgba(200,168,48,.4)' },
  resultIcon: { fontSize: 54, fontFamily: "'Cinzel', serif", lineHeight: 1 },
  resultText: { fontFamily: "'Cinzel', serif", fontSize: 17, letterSpacing: 1 },
  helpCard: {
    display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 340,
    background: 'rgba(30,22,4,.92)', border: '1px solid #c8a830', borderRadius: 14, padding: '10px 14px',
    animation: 'slideUp .5s ease .3s both',
  },
  helpTitle: { fontFamily: "'Cinzel',serif", fontSize: 14, color: '#f0d060' },
  helpSub: { fontSize: 12, color: '#b8a070', lineHeight: 1.35, marginTop: 2 },
  posCard: { background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a', borderRadius: 14, padding: '10px 36px', textAlign: 'center' },
  posLabel: { fontSize: 11, color: '#6a9a50', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  posValue: { fontFamily: "'Cinzel', serif", fontSize: 40, color: '#f0d060', lineHeight: 1 },
  correctBlock: {
    width: '100%', maxWidth: 340, background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a',
    borderRadius: 14, padding: '12px 16px', animation: 'slideUp 0.4s 0.15s ease both',
  },
  correctLabel: { fontSize: 11, color: '#6a9a50', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  correctAns: { display: 'flex', alignItems: 'center', gap: 10 },
  correctLetter: {
    width: 30, height: 30, borderRadius: '50%', background: '#152a0c', border: '1px solid #5a9a30',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#8acc40',
    fontWeight: 700, fontFamily: "'Cinzel', serif", flexShrink: 0,
  },
  correctText: { fontSize: 15, color: '#9ad850', lineHeight: 1.3 },
};
