import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

import useGame          from './shared/useGame';
import { ClockContext } from './shared/useCountdown';
import { CHAR_EMOJI }   from './shared/constants';

import JoinScreen      from './components/JoinScreen';
import CharSelect      from './components/CharSelect';
import WaitScreen      from './components/WaitScreen';
import AnswerScreen    from './components/AnswerScreen';
import ResultScreen    from './components/ResultScreen';
import FinalRaceScreen from './components/FinalRaceScreen';
import MinigameIntro   from './components/MinigameIntro';
import MinigameShell   from './components/MinigameShell';

// ── Сессия: секретный token в localStorage переживает перезагрузку,
//    блокировку экрана и закрытие вкладки. По нему сервер узнаёт игрока.
const TOKEN_KEY = 'trickster_token';
const NAME_KEY  = 'trickster_name';
const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch (_) { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} },
};
function getToken() {
  let t = store.get(TOKEN_KEY);
  if (!t) {
    t = Array.from(crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join('');
    store.set(TOKEN_KEY, t);
  }
  return t;
}

export default function App() {
  const [playerId, setPlayerId] = useState(undefined); // undefined = ещё не знаем, null = не в игре
  const [joining, setJoining]   = useState(false);

  const onEvent = useCallback((ev, data) => {
    if (ev === 'welcome' || ev === 'joined') { setPlayerId(data.playerId || null); setJoining(false); }
    if (ev === 'session_reset') setPlayerId(null);
  }, []);

  const { state, connected, error, emit, serverNow } = useGame({ role: 'phone', getToken, onEvent });
  useEffect(() => { if (error) setJoining(false); }, [error]);

  const handleJoin = (name) => {
    store.set(NAME_KEY, name);
    setJoining(true);
    emit('join', { name, token: getToken() });
  };

  const phase   = state?.phase || 'lobby';
  const players = state?.players || [];
  const me      = players.find(p => p.id === playerId) || null;
  const priv    = state?.me || null;

  // Плавная смена экранов
  const [shown, setShown] = useState(phase);
  const [exiting, setExiting] = useState(false);
  const prevPhase = useRef(phase);
  useEffect(() => {
    if (phase === prevPhase.current) return undefined;
    prevPhase.current = phase;
    setExiting(true);
    const t = setTimeout(() => { setShown(phase); setExiting(false); }, 200);
    return () => clearTimeout(t);
  }, [phase]);

  // ── Нет связи / не знаем, кто мы ─────────────────────────────────────────
  if (!state || playerId === undefined) {
    return <PhoneShell><Splash text={connected ? 'Загрузка...' : 'Подключение к игре...'} /></PhoneShell>;
  }

  if (!playerId || !me) {
    return (
      <PhoneShell>
        <JoinScreen
          onJoin={handleJoin}
          error={error}
          busy={joining}
          defaultName={store.get(NAME_KEY) || ''}
          gameRunning={phase !== 'lobby'}
          full={players.length >= (state.config?.maxPlayers || 5)}
        />
      </PhoneShell>
    );
  }

  const render = (p) => {
    switch (p) {
      case 'lobby':
        return (
          <CharSelect
            characters={state.characters}
            players={players}
            me={me}
            onSelect={(characterId) => emit('select_character', { characterId })}
            onLeave={() => emit('leave')}
          />
        );
      case 'question':
        return state.question && (
          <AnswerScreen
            key={state.question.id}
            question={state.question}
            me={me}
            priv={priv}
            deadline={state.deadline}
            duration={state.duration}
            onAnswer={(answerIndex) => emit('answer', { answerIndex })}
          />
        );
      case 'question_result':
        return <ResultScreen state={state} me={me} />;
      case 'minigame_intro':
        return <MinigameIntro state={state} me={me} onReady={() => emit('mg_ready')} />;
      case 'minigame':
        return state.minigame
          ? <MinigameShell state={state} me={me} priv={priv} onAction={(action, payload) => emit('mg_action', { action, ...payload })} />
          : <WaitScreen phase={p} me={me} players={players} />;
      case 'final_race_intro':
      case 'final_race':
      case 'final_result':
        return <FinalRaceScreen state={state} me={me} priv={priv} onAnswer={(answerIndex) => emit('answer', { answerIndex })} />;
      case 'winner':
        return <WinnerView state={state} me={me} />;
      default:
        return <WaitScreen phase={p} me={me} players={players} />;
    }
  };

  return (
    <ClockContext.Provider value={serverNow}>
      <PhoneShell>
        {!connected && <div style={offlineStyle}>Нет связи — переподключаемся...</div>}
        <div style={{ height: '100%', ...(exiting ? { animation: 'fadeOut 0.2s ease forwards' } : {}) }}>
          {render(shown === phase ? phase : shown)}
        </div>
        {error && <div style={errorStyle}>{error}</div>}
      </PhoneShell>
    </ClockContext.Provider>
  );
}

// ── Победитель ───────────────────────────────────────────────────────────────
function WinnerView({ state, me }) {
  const { winner, players, config } = state;
  const isWinner = winner?.id === me.id;
  const champ = players.find(p => p.id === winner?.id);
  const place = (winner?.ranking.findIndex(r => r.id === me.id) ?? -1) + 1;
  const myPos = state.finalRace?.positions?.[me.id] || 0;
  return (
    <div style={w.wrap}>
      <div style={{ fontSize: 84, animation: 'bounceIn .6s ease' }}>{isWinner ? '🏆' : CHAR_EMOJI[champ?.character] || '🕷️'}</div>
      <div style={w.title}>{isWinner ? 'Ты победил!' : `Победил ${champ?.name || '???'}!`}</div>
      <div style={w.sub}>{isWinner ? 'Ананси склоняет голову перед тобой' : 'Ананси уже плетёт новую сеть...'}</div>
      <div style={w.card}>
        <div style={w.row}><span>Место</span><b>{place} из {players.length}</b></div>
        <div style={w.row}><span>Трасса</span><b>{Math.min(myPos, config.finalSteps)} / {config.finalSteps}</b></div>
        <div style={w.row}><span>Очки маршрута</span><b>{me.score}</b></div>
      </div>
      <div style={w.hint}>Новую партию запускают на большом экране</div>
    </div>
  );
}

function Splash({ text }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 64, animation: 'pulse 1.5s infinite' }}>🕸️</div>
      <div style={{ color: '#7aaa50', letterSpacing: 2, fontSize: 13 }}>{text}</div>
    </div>
  );
}

function PhoneShell({ children }) {
  return (
    <div style={shellStyle}>
      <svg style={{ position: 'fixed', top: 0, right: 0, zIndex: 0, opacity: 0.05 }} width="160" height="160" viewBox="0 0 120 120">
        <g stroke="#6baa3a" fill="none" strokeWidth="0.8">
          <line x1="60" y1="0" x2="60" y2="120" /><line x1="0" y1="60" x2="120" y2="60" />
          <line x1="17" y1="17" x2="103" y2="103" /><line x1="103" y1="17" x2="17" y2="103" />
          <circle cx="60" cy="60" r="14" /><circle cx="60" cy="60" r="28" />
          <circle cx="60" cy="60" r="42" /><circle cx="60" cy="60" r="58" />
        </g>
      </svg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>{children}</div>
    </div>
  );
}

const shellStyle = {
  height: '100%', overflow: 'hidden', position: 'relative',
  background: 'radial-gradient(ellipse at 50% 0%, #0d2a10 0%, #040c05 60%)',
};
const errorStyle = {
  position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(200,72,48,0.95)', color: '#fff', borderRadius: 10,
  padding: '10px 20px', fontSize: 14, zIndex: 100, maxWidth: '90%', textAlign: 'center',
};
const offlineStyle = {
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, textAlign: 'center',
  background: 'rgba(200,72,48,0.92)', color: '#fff', fontSize: 12, padding: '6px',
};
const w = {
  wrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 14, padding: '0 24px' },
  title: { fontFamily: "'Cinzel', serif", fontSize: 26, color: '#f0d060', textShadow: '0 0 20px rgba(200,168,48,0.5)', textAlign: 'center' },
  sub: { fontSize: 14, color: '#7aaa50', textAlign: 'center', fontStyle: 'italic' },
  card: {
    width: '100%', maxWidth: 300, background: 'rgba(4,12,5,.85)', border: '1px solid #2a5a22',
    borderRadius: 14, padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 8,
  },
  row: { display: 'flex', justifyContent: 'space-between', fontSize: 15, color: '#c8e8a0' },
  hint: { fontSize: 12, color: '#5a8040', marginTop: 6 },
};
