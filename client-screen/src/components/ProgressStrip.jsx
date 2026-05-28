import React from 'react';

const MINIGAME_SPOTS = [3, 6, 9, 12];

export default function ProgressStrip({ leaderPosition, questionNum }) {
  return (
    <div style={styles.wrap}>
      {Array.from({ length: 15 }, (_, i) => {
        const step = i + 1;
        const isMini    = MINIGAME_SPOTS.includes(step);
        const isDone    = step < leaderPosition;
        const isCurrent = step === leaderPosition;
        return (
          <div
            key={step}
            style={{
              ...styles.dot,
              ...(isMini    ? styles.dotMini    : {}),
              ...(isDone    ? styles.dotDone    : {}),
              ...(isCurrent ? styles.dotCurrent : {}),
              ...(isMini && isDone ? styles.dotMiniDone : {}),
            }}
          />
        );
      })}
      {questionNum && (
        <div style={styles.label}>Вопрос {questionNum} · Шаг {leaderPosition} из 15</div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    position: 'absolute',
    top: 54,
    left: 32,
    display: 'flex',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#101e10', border: '1px solid #1c3a18', flexShrink: 0,
  },
  dotMini: {
    borderColor: '#c8a830', background: '#1a3010',
  },
  dotDone: {
    background: '#2a5a22', borderColor: '#5a9a30',
  },
  dotMiniDone: {
    background: '#2a4810', borderColor: '#f0d060',
  },
  dotCurrent: {
    background: '#c8a830', borderColor: '#f0d060',
    width: 20, borderRadius: 4,
    boxShadow: '0 0 6px rgba(200,168,48,0.4)',
  },
  label: {
    marginLeft: 10,
    fontSize: 10, color: '#3a6028', letterSpacing: 1,
  },
};
