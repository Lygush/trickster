import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './index.css';

import GameBackground  from './components/GameBackground';
import LobbyScreen    from './components/LobbyScreen';
import MapPanel       from './components/MapPanel';
import WinnerScreen   from './components/WinnerScreen';
import MinigameIntro  from './components/MinigameIntro';
import QuestionReveal from './components/QuestionReveal';
import MINIGAMES      from './minigames/index';
import useAssets     from './hooks/useAssets';
import useSounds     from './hooks/useSounds';

const SERVER_URL  = process.env.REACT_APP_SERVER_URL || window.location.origin;
const ANSWER_TIME = 30;
const CHAR_EMOJI  = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };
const LETTERS     = ['А', 'Б', 'В', 'Г'];

export default function App() {
  const [gameState,   setGameState]   = useState(null);
  const [serverInfo,  setServerInfo]  = useState(null);
  const [revealData,  setRevealData]  = useState(null);
  const [answers,     setAnswers]     = useState({});
  const [winner,      setWinner]      = useState(null);
  const [qrUrl,       setQrUrl]       = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  // Баг 3: задержка появления QuestionReveal чтобы вопрос успел выехать
  const [revealVisible, setRevealVisible] = useState(false);

  const socketRef      = useRef(null);
  const prevPlayersLen = useRef(0);
  const lastQuestionId = useRef(null);
  const assets = useAssets();
  const sounds = useSounds(assets);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => setQrUrl(`${SERVER_URL}/qr`));

    socket.on('game_state', (state) => {
      setGameState(state);
      if (state.phase === 'lobby') {
        const newLen = state.players?.length || 0;
        if (newLen > prevPlayersLen.current) sounds.playSfx?.('join');
        prevPlayersLen.current = newLen;
      }
      if (state.phase === 'question') {
        setRevealData(null);
        setAnswers({});
        const qid = state.currentQuestion?.id;
        if (qid && qid !== lastQuestionId.current) {
          lastQuestionId.current = qid;
          setQuestionNum(n => n + 1);
          sounds.playSfx?.('tick');
        }
      }
      const musicMap = {
        lobby: 'lobby', intro: 'lobby',
        question: 'question', question_result: 'question',
        minigame_intro: 'minigame', minigame: 'minigame',
        final_race_intro: 'final_race', final_race: 'final_race',
        winner: 'winner',
      };
      if (musicMap[state.phase]) sounds.playMusic?.(musicMap[state.phase]);
    });

    socket.on('server_info', (info) => setServerInfo(info));

    socket.on('question_result', (data) => {
      setRevealData(data);
      setAnswers(data.answers || {});
      sounds.playSfx?.(data.moved?.length > 0 ? 'correct' : 'wrong');
    });

    socket.on('game_winner', (data) => {
      setWinner(data.player);
      sounds.playSfx?.('winner');
    });

    return () => socket.disconnect();
  }, []); // eslint-disable-line

  const handleStart = () => socketRef.current?.emit('start_game');
  const handleReset = () => {
    socketRef.current?.emit('reset_game');
    setWinner(null); setRevealData(null);
    setAnswers({}); setQuestionNum(0);
    lastQuestionId.current = null;
    sounds.stopMusic?.();
  };

  const phase          = gameState?.phase   || 'lobby';
  const players        = gameState?.players || [];
  const currentMinigame = gameState?.currentMinigame;
  const isQuestionPhase = phase === 'question' || phase === 'question_result';

  // Задержка появления QuestionReveal чтобы вопрос успел выехать
  // (useEffect здесь, ПОСЛЕ объявления phase — иначе TDZ в deps array)
  useEffect(() => {
    if (phase === 'question_result') {
      setRevealVisible(false);
      const t = setTimeout(() => setRevealVisible(true), 650);
      return () => clearTimeout(t);
    } else {
      setRevealVisible(false);
    }
  }, [phase]); // eslint-disable-line

  return (
    <div style={s.root}>
      <GameBackground phase={phase} minigameId={currentMinigame?.id} assets={assets} />

      <div style={s.layout}>

        {/* ═══ ТОПБАР ═══ */}
        {isQuestionPhase && (
          <Topbar players={players} answers={answers} revealData={phase === 'question_result' ? revealData : null} />
        )}

        {/* ═══ ТЕЛО ═══ */}
        <div style={s.body}>

          {/* Минимапа */}
          {isQuestionPhase && (
            <MapPanel
              players={players}
              questionIndex={gameState?.questionIndex || 0}
              phase={phase}
            />
          )}

          {/* Правая зона */}
          <div style={s.right}>

            {/* LOBBY */}
            {(phase === 'lobby') && (
              <LobbyScreen players={players} qrUrl={qrUrl} serverInfo={serverInfo} onStart={handleStart} assets={assets} />
            )}

            {/* INTRO */}
            {phase === 'intro' && (
              <div style={s.centered}>
                <div style={s.bigIcon}>🕸️</div>
                <div style={s.titleText}>Ананси плетёт свою сеть</div>
                <div style={s.subText}>Приготовьтесь...</div>
              </div>
            )}

            {/* ВОПРОС — активная фаза + слайд-аут при переходе к результату */}
            {(phase === 'question' || (phase === 'question_result' && !revealVisible)) && gameState?.currentQuestion && (
              <>
                <div style={s.spacer} />
                <div style={{
                  ...s.bottomZone,
                  animation: phase === 'question_result' ? 'slideOutDown 0.6s ease forwards' : 'fadeIn 0.35s ease',
                }}>
                  <TimerBar
                    questionId={gameState.currentQuestion.id}
                    paused={phase === 'question_result'}
                  />
                  <QuestionCard
                    key={gameState.currentQuestion.id}
                    question={gameState.currentQuestion}
                    revealData={null}
                  />
                </div>
              </>
            )}

            {/* ВОПРОС — результат: анимированный экран */}
            {phase === 'question_result' && revealVisible && gameState?.currentQuestion && (
              <QuestionReveal
                key={gameState.currentQuestion.id + '_reveal'}
                question={gameState.currentQuestion}
                revealData={revealData}
                players={players}
              />
            )}

            {/* МИНИ-ИГРА ИНТРО */}
            {phase === 'minigame_intro' && <MinigameIntro minigame={currentMinigame} />}

            {/* МИНИ-ИГРА */}
            {phase === 'minigame' && (() => {
              const ScreenView = MINIGAMES[currentMinigame?.id]?.ScreenView;
              return ScreenView
                ? <ScreenView minigame={currentMinigame} players={players} assets={assets} sounds={sounds} />
                : <MinigameIntro minigame={currentMinigame} waiting />;
            })()}

            {/* ФИНАЛЬНАЯ ГОНКА */}
            {(phase === 'final_race_intro' || phase === 'final_race') && (
              <FinalRace gameState={gameState} players={players} />
            )}

            {/* ПОБЕДИТЕЛЬ */}
            {phase === 'winner' && winner && (
              <WinnerScreen winner={winner} players={players} onReset={handleReset} assets={assets} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ players, answers, revealData }) {
  const sorted   = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const leaderId = sorted[0]?.id;
  const answered = new Set(Object.keys(answers || {}));

  return (
    <div style={tb.bar}>
      <div style={tb.pill}>🕷 Ананси спрашивает</div>
      <div style={tb.chips}>
        {sorted.map(p => {
          const isLead      = p.id === leaderId;
          const hasAnswered = answered.has(p.id);
          const dotColor = hasAnswered
            ? (revealData
                ? (Number(answers[p.id]?.answerIndex) === revealData.correctIndex ? '#6bc740' : '#e05050')
                : '#6bc740')
            : 'transparent';

          return (
            <div key={p.id} style={{
              ...tb.chip,
              borderColor: isLead ? 'rgba(212,175,55,.45)' : 'rgba(107,199,64,.18)',
              background:  isLead ? 'rgba(30,20,2,.55)'    : 'rgba(5,12,4,.5)',
            }}>
              {/* Точка-индикатор: показывает ответил/нет и верно/нет цветом */}
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: dotColor,
                flexShrink: 0,
                transition: 'background 0.3s',
              }} />
              <div style={{ ...tb.av, borderColor: isLead ? '#d4af37' : 'rgba(107,199,64,.4)' }}>
                {CHAR_EMOJI[p.character] || '?'}
              </div>
              <span style={{ ...tb.name, color: isLead ? '#d4af37' : 'rgba(150,220,90,.6)' }}>
                {p.name.length > 7 ? p.name.slice(0,7)+'…' : p.name}
              </span>
              <span style={tb.score}>{p.score ?? 0}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const tb = {
  bar: {
    height: '8vh', minHeight: 52, maxHeight: 80,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    background: 'rgba(4,10,3,.82)',
    borderBottom: '1px solid rgba(212,175,55,.15)',
    padding: '0 2vw', gap: '1.5vw',
    flexShrink: 0, zIndex: 20, position: 'relative',
  },
  pill: {
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(14px,1.4vw,22px)',
    color: '#c7a84b', letterSpacing: '.06em',
    whiteSpace: 'nowrap', flexShrink: 0,
  },
  chips: { display: 'flex', alignItems: 'center', gap: '1vw', flexWrap: 'nowrap' },
  chip: {
    display: 'flex', alignItems: 'center', gap: '0.4vw',
    border: '1px solid', borderRadius: 30,
    padding: '0.5vh 1.2vw 0.5vh 0.6vw',
    transition: 'border-color .3s, background .3s',
  },
  av: {
    width: '4vh', height: '4vh', minWidth: 28, minHeight: 28,
    borderRadius: '50%', border: '1px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'clamp(14px,2.2vh,26px)', background: '#1a2e10',
    flexShrink: 0,
  },
  name:  { fontSize: 'clamp(12px,1.2vw,20px)', fontFamily: "'Cinzel',serif", whiteSpace: 'nowrap' },
  score: { fontSize: 'clamp(14px,1.5vw,24px)', color: '#9de05a', fontWeight: 700, marginLeft: '0.4vw' },
  dot:   { fontSize: 'clamp(8px,0.8vw,11px)', fontWeight: 900, marginLeft: '0.1vw' },
};

// ─────────────────────────────────────────────────────────────────────────────
// TimerBar
// ─────────────────────────────────────────────────────────────────────────────
function TimerBar({ questionId, paused }) {
  const [t, setT] = useState(ANSWER_TIME);
  const ref = useRef(null);

  useEffect(() => {
    setT(ANSWER_TIME);
    clearInterval(ref.current);
    if (!paused) {
      ref.current = setInterval(() => {
        setT(p => { if (p <= 1) { clearInterval(ref.current); return 0; } return p - 1; });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [questionId, paused]);

  const pct = (t / ANSWER_TIME) * 100;
  const isDanger  = t <= 8;
  const isWarning = t <= 14 && !isDanger;
  const numColor  = isDanger ? '#f06060' : isWarning ? '#f0a040' : '#c6f060';
  const barGrad   = isDanger
    ? 'linear-gradient(90deg,#c03030,#f06060)'
    : isWarning
      ? 'linear-gradient(90deg,#c08020,#f0c060)'
      : 'linear-gradient(90deg,#6bc740,#c6f060)';

  return (
    <div style={tm.row}>
      {/* Левая полоска — уменьшается справа налево */}
      <div style={tm.barWrap}>
        <div style={{ ...tm.fill, ...tm.fillLeft, width: `${pct}%`, background: barGrad }} />
      </div>

      {/* Число по центру */}
      <div style={{ ...tm.num, color: numColor }}>{t}</div>

      {/* Правая полоска — уменьшается слева направо */}
      <div style={tm.barWrap}>
        <div style={{ ...tm.fill, width: `${pct}%`, background: barGrad }} />
      </div>
    </div>
  );
}

const tm = {
  row: {
    display: 'flex', alignItems: 'center',
    gap: '1.5vw', width: '100%',
  },
  num: {
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(36px,4.2vw,64px)',
    fontWeight: 700, lineHeight: 1,
    minWidth: '4.5vw', textAlign: 'center',
    transition: 'color .5s', flexShrink: 0,
  },
  /* Контейнер полоски */
  barWrap: {
    flex: 1,
    height: '1.4vh', minHeight: 8,
    background: 'rgba(255,255,255,.1)',
    borderRadius: 4, overflow: 'hidden',
    display: 'flex', alignItems: 'center',
  },
  fill: {
    height: '100%', borderRadius: 4,
    transition: 'width 1s linear, background .5s',
    flexShrink: 0,
  },
  /* Левая полоска — прижата к правому краю контейнера, убывает справа налево */
  fillLeft: { marginLeft: 'auto' },
};

// ─────────────────────────────────────────────────────────────────────────────
// QuestionCard
// ─────────────────────────────────────────────────────────────────────────────
function QuestionCard({ question, revealData }) {
  if (!question) return null;
  return (
    <div style={qc.card}>
      <div style={qc.text}>{question.text}</div>
      <div style={qc.grid}>
        {question.answers.map((ans, i) => {
          const isCorrect = revealData != null && i === revealData.correctIndex;
          const isWrong   = revealData != null && i !== revealData.correctIndex;
          return (
            <div key={i} style={{
              ...qc.ans,
              ...(isCorrect ? qc.ansOk   : {}),
              ...(isWrong   ? qc.ansWrong : {}),
            }}>
              <div style={{ ...qc.key, ...(isCorrect ? qc.keyOk : {}) }}>{LETTERS[i]}</div>
              <span style={qc.ansText}>{ans}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const qc = {
  card: {
    background: 'rgba(6,16,4,.9)',
    border: '1px solid rgba(212,175,55,.2)',
    borderRadius: '1.2vw',
    padding: '2.2vh 2.2vw',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 6px 32px rgba(0,0,0,.55)',
  },
  text: {
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(24px,2.8vw,44px)',
    color: '#e8f5d0', fontWeight: 700,
    lineHeight: 1.45, marginBottom: '1.4vh',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2vh 1.2vw' },
  ans: {
    background: 'rgba(20,36,14,.82)',
    border: '1px solid rgba(107,199,64,.22)',
    borderRadius: '0.9vw',
    padding: '1.6vh 1.8vw',
    display: 'flex', alignItems: 'center', gap: '0.6vw',
    transition: 'all .3s',
  },
  ansOk:   { borderColor: 'rgba(107,199,64,.7)', background: 'rgba(20,55,10,.92)', boxShadow: '0 0 12px rgba(107,199,64,.2)' },
  ansWrong:{ opacity: 0.28 },
  key: {
    width: 'clamp(34px,4vh,54px)', height: 'clamp(34px,4vh,54px)',
    borderRadius: '50%', flexShrink: 0,
    background: 'rgba(107,199,64,.12)', border: '1.5px solid rgba(107,199,64,.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(14px,1.6vw,24px)',
    fontWeight: 700, color: '#9de05a',
  },
  keyOk:   { background: 'rgba(107,199,64,.25)', borderColor: 'rgba(107,199,64,.7)', color: '#c6f060' },
  ansText: { fontFamily: "'Nunito',sans-serif", fontSize: 'clamp(16px,1.6vw,26px)', color: '#c8e8a0', lineHeight: 1.3 },
};

// ─────────────────────────────────────────────────────────────────────────────
// FinalRace
// ─────────────────────────────────────────────────────────────────────────────
function FinalRace({ gameState, players }) {
  const fr = gameState?.finalRace;
  return (
    <div style={s.centered}>
      <div style={s.bigIcon}>🏁</div>
      <div style={s.titleText}>Финальная гонка!</div>
      {fr?.currentQuestion && (
        <div style={s.finalCard}>
          <div style={s.finalQ}>{fr.currentQuestion.text}</div>
        </div>
      )}
      {fr?.positions && (
        <div style={s.finalList}>
          {[...players]
            .sort((a, b) => (fr.positions[b.id] || 0) - (fr.positions[a.id] || 0))
            .map(p => {
              const pos = fr.positions[p.id] || 0;
              return (
                <div key={p.id} style={s.finalRow}>
                  <span>{CHAR_EMOJI[p.character] || '?'}</span>
                  <span style={s.finalName}>{p.name}</span>
                  <div style={s.finalBar}>
                    <div style={{ ...s.finalFill, width: `${Math.min((pos / 12) * 100, 100)}%` }}/>
                  </div>
                  <span style={s.finalPos}>{pos}</span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CharAvatar (экспорт для дочерних компонентов)
// ─────────────────────────────────────────────────────────────────────────────
export function CharAvatar({ character, assets, size = 32, style = {} }) {
  const imgUrl = character ? assets?.characters?.[character] : null;
  if (imgUrl) return <img src={imgUrl} alt={character} style={{ width: size, height: size, objectFit: 'contain', ...style }} />;
  return <span style={{ fontSize: size * 0.8, lineHeight: 1, ...style }}>{CHAR_EMOJI[character] || '⭕'}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Стили
// ─────────────────────────────────────────────────────────────────────────────
const s = {
  root:   { height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' },
  layout: { display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' },
  body:   { display: 'flex', flex: 1, overflow: 'hidden' },
  right:  { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  spacer: { flex: 1 },
  bottomZone: {
    padding: '0 2.5vw 2.5vh',
    display: 'flex', flexDirection: 'column', gap: '1.4vh',
  },

  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 },
  bigIcon:  { fontSize: 'clamp(48px,7vw,96px)', animation: 'pulse 2s infinite' },
  titleText:{ fontFamily: "'Cinzel',serif", fontSize: 'clamp(20px,3.5vw,52px)', color: '#f0d060', letterSpacing: 2, textShadow: '0 0 30px rgba(200,168,48,.4)' },
  subText:  { fontSize: 'clamp(10px,1vw,16px)', color: '#5a9a30', letterSpacing: 3, textTransform: 'uppercase' },

  finalCard:  { background: 'rgba(4,12,5,.88)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 14, padding: '14px 26px', backdropFilter: 'blur(10px)', maxWidth: 640 },
  finalQ:     { fontFamily: "'Cinzel',serif", fontSize: 'clamp(13px,1.6vw,22px)', color: '#e8f5d0' },
  finalList:  { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 500, background: 'rgba(4,12,5,.88)', border: '1px solid rgba(212,175,55,.2)', borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(10px)' },
  finalRow:   { display: 'flex', alignItems: 'center', gap: 10, fontSize: 20 },
  finalName:  { fontSize: 13, color: '#8acc50', minWidth: 80, fontFamily: "'Nunito',sans-serif" },
  finalBar:   { flex: 1, height: 7, background: '#0f2010', borderRadius: 4, overflow: 'hidden' },
  finalFill:  { height: '100%', background: '#6bc740', borderRadius: 4, transition: 'width .5s ease' },
  finalPos:   { fontSize: 13, color: '#d8f0b0', minWidth: 24, textAlign: 'right', fontFamily: "'Cinzel',serif" },
};
