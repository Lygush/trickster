import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './index.css';

import JoinScreen      from './components/JoinScreen';
import CharSelect      from './components/CharSelect';
import WaitScreen      from './components/WaitScreen';
import AnswerScreen    from './components/AnswerScreen';
import ResultScreen    from './components/ResultScreen';
import FinalRaceScreen from './components/FinalRaceScreen';
import MinigameIntro   from './components/MinigameIntro';

import MINIGAMES from './minigames/index';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.origin;

const CHAR_EMOJI = {
  spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎',
};

export default function App() {
  const [joined,      setJoined]      = useState(false);
  const [playerName,  setPlayerName]  = useState('');
  const [error,       setError]       = useState('');
  const [gameState,   setGameState]   = useState(null);
  const [revealData,  setRevealData]  = useState(null);
  const [myAnswer,    setMyAnswer]    = useState(null);
  const [aanansiHelp, setAanansiHelp] = useState(false);
  const [winner,      setWinner]      = useState(null);

  const socketRef = useRef(null);
  const myIdRef   = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => { myIdRef.current = socket.id; });

    socket.on('game_state', (state) => {
      setGameState(state);
      if (state.phase === 'question') {
        setMyAnswer(null);
        setRevealData(null);
      }
    });

    socket.on('question_result', (data) => {
      setRevealData(data);
      const mine = data.answers?.[myIdRef.current];
      if (mine) setMyAnswer(mine.answerIndex);
    });

    socket.on('game_winner', (data) => { setWinner(data.player); });

    socket.on('error', ({ message }) => {
      setError(message);
      setTimeout(() => setError(''), 3000);
    });

    return () => socket.disconnect();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleJoin = (name) => {
    setPlayerName(name);
    socketRef.current?.emit('join', { name });
    setJoined(true);
  };

  const handleSelectChar = (characterId) => {
    socketRef.current?.emit('select_character', { characterId });
  };

  const handleAnswer = (answerIndex) => {
    if (myAnswer !== null) return;
    setMyAnswer(answerIndex);
    socketRef.current?.emit('answer', { answerIndex });
  };

  // Универсальный emit для мини-игр: минигра сама знает какое событие слать
  const handleMinigameEmit = (event, payload) => {
    socketRef.current?.emit(event, payload);
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const phase   = gameState?.phase   || 'lobby';
  const players = gameState?.players || [];
  const myId    = myIdRef.current;
  const me      = players.find(p => p.id === myId);

  const takenChars     = players.filter(p => p.id !== myId && p.character).map(p => p.character);
  const hindranceLevel = me?.hindranceLevel || 0;

  const finalPositions = gameState?.finalRace?.positions  || null;
  const finalQuestion  = gameState?.finalRace?.currentQuestion || null;
  const myFinalPos     = finalPositions ? (finalPositions[myId] || 0) : 0;

  const currentMinigame = gameState?.currentMinigame;

  // ── Render ────────────────────────────────────────────────────────────────

  if (!joined) {
    return <PhoneShell><JoinScreen onJoin={handleJoin} error={error} /></PhoneShell>;
  }

  if (phase === 'lobby' || phase === 'character_select') {
    return (
      <PhoneShell>
        <CharSelect
          takenChars={takenChars}
          myChar={me?.character || null}
          onSelect={handleSelectChar}
          playerName={playerName}
        />
        {error && <div style={errorStyle}>{error}</div>}
      </PhoneShell>
    );
  }

  if (phase === 'question') {
    return (
      <PhoneShell>
        <AnswerScreen
          key={gameState?.currentQuestion?.id}
          question={gameState?.currentQuestion}
          hindranceLevel={hindranceLevel}
          onAnswer={handleAnswer}
          myAnswer={myAnswer}
          aanansiHelp={aanansiHelp}
        />
      </PhoneShell>
    );
  }

  if (phase === 'question_result') {
    return (
      <PhoneShell>
        <ResultScreen
          question={gameState?.currentQuestion}
          revealData={revealData}
          myAnswer={myAnswer}
          myPosition={me?.position || 0}
        />
      </PhoneShell>
    );
  }

  // ── Мини-игры ─────────────────────────────────────────────────────────────
  //
  // Всё что нужно знать App.jsx — есть ли PhoneView в реестре.
  // Добавляя новую мини-игру, этот блок не трогаем.

  if (phase === 'minigame_intro') {
    return (
      <PhoneShell>
        <MinigameIntro minigame={currentMinigame} player={me} />
      </PhoneShell>
    );
  }

  if (phase === 'minigame') {
    const def       = MINIGAMES[currentMinigame?.id];
    const PhoneView = def?.PhoneView ?? null;

    return (
      <PhoneShell>
        {PhoneView ? (
          <PhoneView
            key={currentMinigame.id}
            minigame={currentMinigame}
            myId={myId}
            me={me}
            players={players}
            onEmit={handleMinigameEmit}
          />
        ) : (
          <WaitScreen phase={phase} player={me} players={players} />
        )}
      </PhoneShell>
    );
  }

  // ── Финальная гонка ───────────────────────────────────────────────────────

  if (phase === 'final_race' || phase === 'final_race_intro') {
    return (
      <PhoneShell>
        <FinalRaceScreen
          question={finalQuestion}
          myPosition={myFinalPos}
          onAnswer={handleAnswer}
          myAnswer={myAnswer}
          players={players}
          finalPositions={finalPositions}
        />
      </PhoneShell>
    );
  }

  if (phase === 'winner') {
    const isWinner = winner?.id === myId;
    return (
      <PhoneShell>
        <div style={winnerStyles.wrap}>
          <div style={{ fontSize: 80 }}>
            {isWinner ? '🏆' : CHAR_EMOJI[me?.character] || '🕷️'}
          </div>
          <div style={winnerStyles.title}>
            {isWinner ? 'Ты победил!' : `Победил ${winner?.name || '???'}!`}
          </div>
          <div style={winnerStyles.sub}>
            {isWinner
              ? 'Ананси склоняет голову перед тобой'
              : 'В следующий раз повезёт!'}
          </div>
          <div style={winnerStyles.pos}>
            Твоя позиция: {me?.position || 0} / 15
          </div>
        </div>
      </PhoneShell>
    );
  }

  return <PhoneShell><WaitScreen phase={phase} player={me} players={players} /></PhoneShell>;
}

// ── Shell ──────────────────────────────────────────────────────────────────

function PhoneShell({ children }) {
  return (
    <div style={shellStyle}>
      <svg
        style={{ position: 'fixed', top: 0, right: 0, zIndex: 0, opacity: 0.04 }}
        width="160" height="160" viewBox="0 0 120 120"
      >
        <g stroke="#6baa3a" fill="none" strokeWidth="0.8">
          <line x1="60" y1="0"  x2="60"  y2="120"/>
          <line x1="0"  y1="60" x2="120" y2="60"/>
          <line x1="17" y1="17" x2="103" y2="103"/>
          <line x1="103" y1="17" x2="17" y2="103"/>
          <circle cx="60" cy="60" r="14"/>
          <circle cx="60" cy="60" r="28"/>
          <circle cx="60" cy="60" r="42"/>
          <circle cx="60" cy="60" r="58"/>
        </g>
      </svg>
      <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
        {children}
      </div>
    </div>
  );
}

const shellStyle = {
  height: '100%',
  background: 'radial-gradient(ellipse at 50% 0%, #0d2a10 0%, #040c05 60%)',
  overflow: 'hidden',
  position: 'relative',
};

const errorStyle = {
  position: 'fixed', bottom: 20, left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(200,72,48,0.9)',
  color: '#fff', borderRadius: 10,
  padding: '10px 20px', fontSize: 13,
  zIndex: 100,
};

const winnerStyles = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 16, padding: '0 24px',
    animation: 'bounceIn 0.5s ease',
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: 24, color: '#f0d060',
    textShadow: '0 0 20px rgba(200,168,48,0.5)',
    textAlign: 'center',
  },
  sub:  { fontSize: 13, color: '#5a9a30', textAlign: 'center', lineHeight: 1.5 },
  pos:  { fontSize: 12, color: '#3a6028', marginTop: 8 },
};
