import React, { useState } from 'react';

// Небольшая панель ведущего в правом нижнем углу: пропуск этапа,
// полноэкранный режим, перезапуск. Становится заметной при наведении.
export default function HostControls({ phase, canSkip, connected, onSkip, onReset }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    setConfirmReset(false);
    onReset();
  };

  return (
    <div style={s.wrap} className="host-controls">
      {!connected && <div style={s.offline}>⚠ Нет связи с сервером</div>}
      {canSkip && (
        <button style={s.btn} onClick={onSkip} title="Пропустить этап (завершить таймер)">⏭ Дальше</button>
      )}
      {phase !== 'lobby' && phase !== 'winner' && (
        <button style={{ ...s.btn, ...(confirmReset ? s.danger : {}) }} onClick={handleReset}>
          {confirmReset ? 'Точно? В лобби' : '↺'}
        </button>
      )}
      <button style={s.btn} onClick={toggleFullscreen} title="Полный экран">⛶</button>
    </div>
  );
}

const s = {
  wrap: {
    position: 'fixed', right: 14, bottom: 12, zIndex: 50,
    display: 'flex', gap: 8, alignItems: 'center',
  },
  btn: {
    fontFamily: "'Nunito',sans-serif", fontSize: 13,
    color: 'rgba(200,232,160,.8)', background: 'rgba(4,12,5,.75)',
    border: '1px solid rgba(107,199,64,.25)', borderRadius: 20,
    padding: '6px 12px', cursor: 'pointer',
  },
  danger: { borderColor: '#c84830', color: '#f08070' },
  offline: {
    fontSize: 13, color: '#f08070', background: 'rgba(30,8,4,.85)',
    border: '1px solid #c84830', borderRadius: 20, padding: '6px 12px',
  },
};
