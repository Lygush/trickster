import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './index.css';

import JungleScene   from './components/JungleScene';
import LobbyScreen   from './components/LobbyScreen';
import MapPanel      from './components/MapPanel';
import ProgressStrip from './components/ProgressStrip';
import QuestionCard  from './components/QuestionCard';
import WinnerScreen  from './components/WinnerScreen';
import MinigameIntro from './components/MinigameIntro';

import MINIGAMES from './minigames/index';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.origin;

export default function App() {
  const [gameState,   setGameState]   = useState(null);
  const [serverInfo,  setServerInfo]  = useState(null);
  const [revealData,  setRevealData]  = useState(null);
  const [answers,     setAnswers]     = useState({});
  const [winner,      setWinner]      = useState(null);
  const [qrUrl,       setQrUrl]       = useState(null);
  const [questionNum, setQuestionNum] = useState(0);

  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => { setQrUrl(`${SERVER_URL}/qr`); });

    socket.on('game_state', (state) => {
      setGameState(state);
      if (state.phase === 'question') {
        setRevealData(null);
        setAnswers({});
        setQuestionNum(n => n + 1);
      }
    });

    socket.on('server_info', (info) => { setServerInfo(info); });

    socket.on('question_result', (data) => {
      setRevealData(data);
      setAnswers(data.answers || {});
    });

    socket.on('game_winner', (data) => { setWinner(data.player); });

    return () => socket.disconnect();
  }, []);

  const handleStart = () => socketRef.current?.emit('start_game');
  const handleReset = () => {
    socketRef.current?.emit('reset_game');
    setWinner(null);
    setRevealData(null);
    setAnswers({});
    setQuestionNum(0);
  };

  const phase   = gameState?.phase   || 'lobby';
  const players = gameState?.players || [];
  const leader  = [...players].sort((a, b) => b.position - a.position)[0];
  const showMap = ['question', 'question_result', 'intro'].includes(phase);

  const currentMinigame = gameState?.currentMinigame;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <JungleScene />

      <div style={styles.layout}>

        {showMap && <MapPanel players={players} />}

        <div style={styles.mainPanel}>
          {/* Web deco */}
          <svg style={styles.webDeco} width="120" height="120" viewBox="0 0 120 120">
            <g stroke="#6baa3a" fill="none" strokeWidth="0.9">
              <line x1="60" y1="0" x2="60" y2="120"/>
              <line x1="0" y1="60" x2="120" y2="60"/>
              <line x1="17" y1="17" x2="103" y2="103"/>
              <line x1="103" y1="17" x2="17" y2="103"/>
              <circle cx="60" cy="60" r="14"/><circle cx="60" cy="60" r="28"/>
              <circle cx="60" cy="60" r="42"/><circle cx="60" cy="60" r="58"/>
            </g>
          </svg>

          {/* LOBBY */}
          {(phase === 'lobby' || phase === 'character_select') && (
            <LobbyScreen players={players} qrUrl={qrUrl} serverInfo={serverInfo} onStart={handleStart} />
          )}

          {/* INTRO */}
          {phase === 'intro' && (
            <div style={styles.centeredMsg}>
              <div style={styles.introSpider}>🕸️</div>
              <div style={styles.introTitle}>Ананси плетёт свою сеть</div>
              <div style={styles.introSub}>Приготовьтесь...</div>
            </div>
          )}

          {/* QUESTION / QUESTION RESULT */}
          {(phase === 'question' || phase === 'question_result') && gameState?.currentQuestion && (
            <>
              <div style={styles.topBar}>
                <div style={styles.anansiBadge}>Ананси спрашивает</div>
                <div style={styles.stepLabel}>
                  Вопрос {questionNum} · Шаг {leader?.position || 0} из 15
                </div>
              </div>
              <ProgressStrip leaderPosition={leader?.position || 0} questionNum={questionNum} />
              <div style={styles.questionWrap}>
                <QuestionCard
                  key={gameState.currentQuestion?.id}
                  question={gameState.currentQuestion}
                  players={players}
                  answers={answers}
                  revealData={phase === 'question_result' ? revealData : null}
                  questionIndex={questionNum}
                  leaderPosition={leader?.position || 0}
                />
              </div>
            </>
          )}

          {/* MINIGAME INTRO */}
          {phase === 'minigame_intro' && (
            <MinigameIntro minigame={currentMinigame} />
          )}

          {/* MINIGAME — только реестр, никаких if по id */}
          {phase === 'minigame' && (() => {
            const def        = MINIGAMES[currentMinigame?.id];
            const ScreenView = def?.ScreenView ?? null;
            return ScreenView
              ? <ScreenView key={currentMinigame.id} minigame={currentMinigame} players={players} />
              : <MinigameIntro minigame={currentMinigame} waiting />;
          })()}

          {/* FINAL RACE */}
          {(phase === 'final_race_intro' || phase === 'final_race') && (
            <div style={styles.centeredMsg}>
              <div style={{ fontSize: 60 }}>🏁</div>
              <div style={styles.introTitle}>Финальная гонка!</div>
              <div style={styles.introSub}>Все стартуют с позиций — кто первый?</div>
              {gameState?.finalRace?.currentQuestion && (
                <div style={styles.finalQuestion}>
                  {gameState.finalRace.currentQuestion.text}
                </div>
              )}
              {gameState?.finalRace?.positions && (
                <div style={styles.finalPositions}>
                  {players.map(p => (
                    <div key={p.id} style={styles.finalPosRow}>
                      <span style={{ fontSize: 22 }}>
                        {p.character === 'spider' ? '🕷️'
                          : p.character === 'frog'   ? '🐸'
                          : p.character === 'snake'  ? '🐍'
                          : p.character === 'beetle' ? '🪲'
                          : '🦎'}
                      </span>
                      <span style={{ color: '#d8f0b0', fontSize: 14 }}>{p.name}</span>
                      <div style={styles.finalBar}>
                        <div style={{
                          ...styles.finalBarFill,
                          width: `${((gameState.finalRace.positions[p.id] || 0) / 12) * 100}%`,
                        }}/>
                      </div>
                      <span style={{ color: '#7aaa50', fontSize: 12, minWidth: 20 }}>
                        {gameState.finalRace.positions[p.id] || 0}/12
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WINNER */}
          {phase === 'winner' && (
            <WinnerScreen winner={winner} players={players} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex', flex: 1, position: 'relative',
    zIndex: 1, overflow: 'hidden', height: '100vh',
  },
  mainPanel: {
    flex: 1, display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end', padding: '0 40px 28px 32px',
    position: 'relative',
  },
  webDeco: { position: 'absolute', top: 10, right: 14, opacity: 0.05, pointerEvents: 'none' },
  topBar: {
    position: 'absolute', top: 20, left: 32, right: 40,
    display: 'flex', alignItems: 'center', gap: 12,
  },
  anansiBadge: {
    fontSize: 10, letterSpacing: 2.5, color: '#5a9a30',
    textTransform: 'uppercase', border: '1px solid #2a5a22',
    padding: '3px 10px', borderRadius: 20,
    background: 'rgba(90,154,48,0.08)', backdropFilter: 'blur(4px)',
  },
  stepLabel: { fontSize: 10, color: '#3a6028', letterSpacing: 1, marginLeft: 'auto' },
  questionWrap: { marginTop: 'auto' },
  centeredMsg: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    height: '100%', gap: 16, animation: 'fadeIn 0.5s ease',
  },
  introSpider: { fontSize: 70, animation: 'pulse 2s infinite' },
  introTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(24px, 4vw, 48px)', color: '#f0d060',
    textShadow: '0 0 30px rgba(200,168,48,0.4)', letterSpacing: 2,
  },
  introSub: {
    fontSize: 14, color: '#5a9a30', letterSpacing: 2,
    textTransform: 'uppercase', animation: 'pulse 1.5s infinite',
  },
  finalQuestion: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(14px, 2vw, 22px)', color: '#d8f0b0',
    textAlign: 'center', maxWidth: 600,
    background: 'rgba(4,12,5,0.8)', border: '1px solid #1c3a1a',
    borderRadius: 12, padding: '16px 24px', backdropFilter: 'blur(10px)',
  },
  finalPositions: {
    display: 'flex', flexDirection: 'column', gap: 8,
    width: '100%', maxWidth: 500,
    background: 'rgba(4,12,5,0.8)', border: '1px solid #1c3a1a',
    borderRadius: 12, padding: '14px 18px', backdropFilter: 'blur(10px)',
  },
  finalPosRow: { display: 'flex', alignItems: 'center', gap: 10 },
  finalBar: { flex: 1, height: 6, background: '#0f2010', borderRadius: 3, overflow: 'hidden' },
  finalBarFill: {
    height: '100%', background: '#5a9a30', borderRadius: 3,
    transition: 'width 0.5s ease',
  },
};
