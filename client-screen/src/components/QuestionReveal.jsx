import React, { useEffect, useState } from 'react';

const CHAR_EMOJI = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };
const LETTERS    = ['А', 'Б', 'В', 'Г'];
const MAX_SCORE  = 15;
const ITEM_H     = 48; // px — высота одной цифры в барабане

// ─── Барабан ──────────────────────────────────────────────────────────────────
// Все active=true приходят в ОДНОМ рендере → один коммит → один кадр → синхронно
function SlotDrum({ prevScore, score, active, color }) {
  const fromY = -(prevScore * ITEM_H);
  const toY   = -(score     * ITEM_H);
  const items = Array.from({ length: MAX_SCORE + 1 }, (_, i) => i);

  return (
    <div style={{ height: ITEM_H, overflow: 'hidden', position: 'relative' }}>
      <div style={{
        '--slot-from' : `${fromY}px`,
        '--slot-to'   : `${toY}px`,
        transform     : `translateY(${active ? toY : fromY}px)`,
        animation     : active
          ? 'slotRoll 0.85s cubic-bezier(0.15, 0.85, 0.25, 1) both'
          : 'none',
        willChange    : 'transform',
      }}>
        {items.map(n => (
          <div key={n} style={{
            height         : ITEM_H,
            display        : 'flex',
            alignItems     : 'center',
            justifyContent : 'center',
            fontFamily     : "'Cinzel', serif",
            fontSize       : 'clamp(22px, 2.6vw, 40px)',
            fontWeight     : 700,
            color,
            lineHeight     : 1,
          }}>
            {n}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Карточка игрока ──────────────────────────────────────────────────────────
function PlayerCard({ player, isCorrect, prevScore, animateScore, entryDelay }) {
  const scoreColor = isCorrect ? '#7dd44a' : '#a8a090';

  return (
    <div style={{
      display        : 'flex',
      flexDirection  : 'column',
      alignItems     : 'center',
      gap            : 6,
      border         : '1.5px solid',
      borderRadius   : 16,
      padding        : 'clamp(10px,1.6vh,20px) clamp(8px,1.2vw,18px)',
      position       : 'relative',
      borderColor    : isCorrect ? 'rgba(107,199,64,.45)' : 'rgba(200,72,48,.3)',
      background     : isCorrect ? 'rgba(10,24,7,.95)'    : 'rgba(22,7,5,.95)',
      boxShadow      : isCorrect
        ? '0 0 40px rgba(107,199,64,.14), 0 8px 40px rgba(0,0,0,.75)'
        : '0 0 24px rgba(200,72,48,.08), 0 8px 40px rgba(0,0,0,.75)',
      animation      : `cardFlyIn 0.55s cubic-bezier(0.175,0.885,0.32,1.275) ${entryDelay}ms both`,
    }}>
      {/* ✓ / ✗ значок */}
      <div style={{
        position      : 'absolute',
        top           : -12, right: -12,
        width         : 26, height: 26,
        borderRadius  : '50%',
        display       : 'flex',
        alignItems    : 'center',
        justifyContent: 'center',
        fontWeight    : 700,
        fontSize      : 14,
        background    : isCorrect ? '#1a420c' : '#370a0a',
        color         : isCorrect ? '#6bc740' : '#e05050',
        border        : '2px solid rgba(255,255,255,.07)',
      }}>
        {isCorrect ? '✓' : '✗'}
      </div>

      {/* Имя — над аватаром */}
      <div style={{
        fontFamily   : "'Nunito', sans-serif",
        fontSize     : 'clamp(11px,1.1vw,16px)',
        fontWeight   : 700,
        color        : '#c0e090',
        textAlign    : 'center',
        maxWidth     : '100%',
        overflow     : 'hidden',
        textOverflow : 'ellipsis',
        whiteSpace   : 'nowrap',
      }}>
        {player.name}
      </div>

      {/* Аватар */}
      <div style={{
        fontSize       : 'clamp(24px,3.2vw,46px)',
        lineHeight     : 1,
        background     : 'rgba(4,10,4,.55)',
        border         : `2px solid ${isCorrect ? 'rgba(107,199,64,.4)' : 'rgba(200,72,48,.2)'}`,
        borderRadius   : '50%',
        width          : 'clamp(46px,5.5vw,76px)',
        height         : 'clamp(46px,5.5vw,76px)',
        display        : 'flex',
        alignItems     : 'center',
        justifyContent : 'center',
      }}>
        {CHAR_EMOJI[player.character] || '?'}
      </div>

      {/* Барабан с очками — без фона */}
      <SlotDrum
        prevScore={prevScore}
        score={player.score}
        active={animateScore}
        color={scoreColor}
      />
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────
// Хронология:
//  0 ms        → правильный ответ появляется по центру
//  1 100 ms    → ответ начинает уезжать наверх (transition 0.65s)
//  1 800 ms    → ответ на месте, пауза 200ms
//  2 000 ms    → первая карточка влетает (+ stagger 140ms на каждую)
//  + lastLands + 350ms → барабаны крутятся синхронно
export default function QuestionReveal({ question, revealData, players }) {
  const [phase, setPhase] = useState('answer');

  useEffect(() => {
    if (!revealData) return;
    setPhase('answer');

    const total     = players.length || 1;
    const cardsAt   = 2000;                            // карточки после паузы
    const lastLands = 80 + (total - 1) * 140 + 580;  // последняя карточка приземлилась
    const scoresAt  = cardsAt + lastLands + 350;

    const t1 = setTimeout(() => setPhase('sliding'), 1100);  // ответ едет
    const t2 = setTimeout(() => setPhase('cards'),   cardsAt);
    const t3 = setTimeout(() => setPhase('scores'),  scoresAt);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [revealData?.correctIndex]); // eslint-disable-line

  if (!question || !revealData) return null;

  const { correctIndex, moved = [], players: revealPlayers = [] } = revealData;

  const enriched = players.map(p => {
    const rp = revealPlayers.find(x => x.id === p.id) || p;
    return { ...p, score: rp.score ?? p.score ?? 0 };
  });

  const showCards  = phase === 'cards' || phase === 'scores';
  const answerMoved = phase !== 'answer';  // начинаем двигать уже на 'sliding'
  const cols        = Math.min(enriched.length, 4);

  return (
    <div style={{
      display        : 'flex',
      flexDirection  : 'column',
      alignItems     : 'center',
      justifyContent : 'flex-start',
      height         : '100%',
      paddingTop     : '3vh',
      gap            : 'clamp(14px,2.2vh,32px)',
    }}>

      {/* ── Правильный ответ ─────────────────────────────────────────────── */}
      {/* Всегда в DOM. Внешний div — позиция (transition). Внутренний — pop. */}
      <div style={{
        transform : answerMoved ? 'translateY(0) scale(1)' : 'translateY(26vh) scale(1.06)',
        transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ animation: 'correctPop 0.6s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
          <div style={{
            fontFamily   : "'Cinzel', serif",
            fontSize     : 'clamp(10px,1vw,15px)',
            color        : '#7acc50',
            letterSpacing: 3,
            textTransform: 'uppercase',
            opacity      : 0.7,
            textAlign    : 'center',
            marginBottom : 8,
          }}>
            Правильный ответ
          </div>
          <div style={{
            display     : 'flex',
            alignItems  : 'center',
            gap         : 14,
            background  : 'rgba(10,26,6,.97)',
            border      : '2px solid rgba(107,199,64,.45)',
            borderRadius: 16,
            padding     : 'clamp(10px,1.5vh,20px) clamp(14px,2.5vw,38px)',
            boxShadow   : '0 0 50px rgba(107,199,64,.13), 0 12px 50px rgba(0,0,0,.85)',
          }}>
            <div style={{
              width          : 'clamp(32px,3.5vw,50px)',
              height         : 'clamp(32px,3.5vw,50px)',
              borderRadius   : '50%',
              background     : '#122008',
              border         : '2px solid #4a8828',
              display        : 'flex',
              alignItems     : 'center',
              justifyContent : 'center',
              fontFamily     : "'Cinzel', serif",
              fontSize       : 'clamp(13px,1.4vw,22px)',
              fontWeight     : 700,
              color          : '#8acc40',
              flexShrink     : 0,
            }}>
              {LETTERS[correctIndex]}
            </div>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize  : 'clamp(15px,1.8vw,28px)',
              color     : '#d8f0b0',
              lineHeight: 1.3,
            }}>
              {question.answers[correctIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* ── Карточки ─────────────────────────────────────────────────────── */}
      {showCards && (
        <div style={{
          display              : 'grid',
          gridTemplateColumns  : `repeat(${cols}, 1fr)`,
          gap                  : 'clamp(8px,1.2vw,18px)',
          width                : '100%',
          maxWidth             : '88vw',
        }}>
          {enriched.map((p, i) => {
            const isCorrect = moved.includes(p.id);
            const prevScore = p.score - (isCorrect ? 1 : 0);
            return (
              <PlayerCard
                key={p.id}
                player={p}
                isCorrect={isCorrect}
                prevScore={prevScore}
                animateScore={phase === 'scores'}
                entryDelay={80 + i * 140}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
