import React, { useEffect, useRef } from 'react';

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

const COLORS = [
  '#f0d060','#6bc740','#e05050','#60b0f0','#f09030',
  '#c060f0','#40d0b0','#f06090','#a0d030','#f06030',
];

function Confetti({ canvasRef }) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const PIECE_COUNT = 120;
    const pieces = Array.from({ length: PIECE_COUNT }, (_, i) => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * -canvas.height * 0.5 - 20,
      w:    6 + Math.random() * 8,
      h:    8 + Math.random() * 10,
      rot:  Math.random() * Math.PI * 2,
      rotV: (Math.random() - 0.5) * 0.18,
      vx:   (Math.random() - 0.5) * 2.5,
      vy:   2.5 + Math.random() * 3.5,
      color: COLORS[i % COLORS.length],
      opacity: 0.9 + Math.random() * 0.1,
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      pieces.forEach(p => {
        p.y   += p.vy;
        p.x   += p.vx;
        p.rot += p.rotV;
        p.vy  += 0.04; // gravity
        if (p.y < canvas.height + 20) alive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity * Math.max(0, 1 - (p.y / canvas.height) * 0.6);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (alive) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [canvasRef]);

  return null;
}

export default function WinnerScreen({ winner, players, onReset }) {
  const canvasRef = useRef(null);

  // Сортируем по очкам
  const sorted = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div style={styles.wrap}>
      <canvas
        ref={canvasRef}
        style={styles.canvas}
      />
      <Confetti canvasRef={canvasRef} />

      <div style={styles.label}>Победитель!</div>
      <div style={styles.emoji}>
        {winner?.character ? CHAR_EMOJI[winner.character] : '🏆'}
      </div>
      <div style={styles.name}>{winner?.name || '???'}</div>
      <div style={styles.divider}/>
      <div style={styles.scores}>
        {sorted.map((p, i) => (
          <div key={p.id} style={{
            ...styles.scoreRow,
            borderColor: i === 0 ? 'rgba(212,175,55,.45)' : 'rgba(107,199,64,.15)',
            background:  i === 0 ? 'rgba(30,20,2,.55)'    : 'rgba(10,22,10,.6)',
            animation: `fadeIn 0.4s ease ${i * 80}ms both`,
          }}>
            <span style={{ ...styles.rank, color: i === 0 ? '#d4af37' : '#3a6028' }}>
              {i === 0 ? '🏆' : `#${i + 1}`}
            </span>
            <span style={styles.scoreEmoji}>{CHAR_EMOJI[p.character] || '?'}</span>
            <span style={styles.scoreName}>{p.name}</span>
            <span style={{ ...styles.pts, color: i === 0 ? '#d4af37' : '#7acc50' }}>
              {p.score ?? 0} / 11
            </span>
          </div>
        ))}
      </div>
      <button style={styles.btn} onClick={onReset}>Новая игра</button>
    </div>
  );
}

const styles = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 18,
    animation: 'fadeIn 0.6s ease',
    position: 'relative',
  },
  canvas: {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: 0,
  },
  label: {
    fontFamily: "'Cinzel', serif",
    fontSize: 13, color: '#c8a830',
    letterSpacing: 4, textTransform: 'uppercase',
    zIndex: 1,
  },
  emoji: {
    fontSize: 90,
    filter: 'drop-shadow(0 0 30px rgba(200,168,48,0.6))',
    animation: 'correctPop 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both',
    zIndex: 1,
  },
  name: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(32px, 5vw, 56px)',
    color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.5)',
    letterSpacing: 2, zIndex: 1,
  },
  divider: {
    width: 200, height: 1,
    background: 'linear-gradient(to right, transparent, #2a5a22, transparent)',
    zIndex: 1,
  },
  scores: {
    display: 'flex', flexDirection: 'column', gap: 6,
    minWidth: 260, zIndex: 1,
  },
  scoreRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '8px 14px',
    borderRadius: 10, border: '1px solid',
    transition: 'all .3s',
  },
  rank:      { fontSize: 13, width: 28, textAlign: 'center' },
  scoreEmoji:{ fontSize: 22 },
  scoreName: { fontSize: 14, color: '#d8f0b0', flex: 1, fontFamily: "'Nunito', sans-serif" },
  pts:       { fontSize: 13, fontFamily: "'Cinzel', serif", fontWeight: 700 },
  btn: {
    fontFamily: "'Cinzel', serif",
    fontSize: 14, letterSpacing: 2,
    color: '#040c05',
    background: 'linear-gradient(135deg, #2a5a22, #5a9a30)',
    border: 'none', borderRadius: 30,
    padding: '13px 36px', cursor: 'pointer',
    boxShadow: '0 0 20px rgba(90,154,48,0.3)',
    marginTop: 8, zIndex: 1,
    transition: 'transform .15s, box-shadow .15s',
  },
};
