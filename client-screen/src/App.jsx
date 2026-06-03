import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './index.css';

import GameBackground from './components/GameBackground';
import LobbyScreen   from './components/LobbyScreen';
import MapPanel      from './components/MapPanel';
import WinnerScreen  from './components/WinnerScreen';
import MinigameIntro from './components/MinigameIntro';
import MINIGAMES     from './minigames/index';
import useAssets     from './hooks/useAssets';
import useSounds     from './hooks/useSounds';

const SERVER_URL  = process.env.REACT_APP_SERVER_URL || window.location.origin;
const TOTAL_Q     = 15;
const ANSWER_TIME = 30;
const CHAR_EMOJI  = { spider: '🕷️', frog: '🐸', snake: '🐍', beetle: '🪲', lizard: '🦎' };
const LETTERS     = ['А', 'Б', 'В', 'Г'];

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [gameState,  setGameState]  = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [revealData, setRevealData] = useState(null);
  const [answers,    setAnswers]    = useState({});
  const [winner,     setWinner]     = useState(null);
  const [qrUrl,      setQrUrl]      = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  const lastQuestionId = useRef(null);
  const socketRef      = useRef(null);
  const assets = useAssets();
  const sounds = useSounds(assets);

  useEffect(() => {
    const socket = io(SERVER_URL);
    socketRef.current = socket;

    socket.on('connect', () => setQrUrl(`${SERVER_URL}/qr`));

    socket.on('game_state', (state) => {
      setGameState(state);
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
        lobby: 'lobby', character_select: 'lobby', intro: 'lobby',
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
  const showMap        = ['question', 'question_result'].includes(phase);

  return (
    <div style={s.root}>
      <GameBackground phase={phase} minigameId={currentMinigame?.id} assets={assets} />

      <div style={s.layout}>

        {/* ── Левая колонка: карта ── */}
        {showMap && (
          <MapPanel
            players={players}
            questionIndex={gameState?.questionIndex || 0}
          />
        )}

        {/* ── Главная зона ── */}
        <div style={s.main}>

          {/* LOBBY */}
          {(phase === 'lobby' || phase === 'character_select') && (
            <LobbyScreen
              players={players} qrUrl={qrUrl}
              serverInfo={serverInfo} onStart={handleStart} assets={assets}
            />
          )}

          {/* INTRO */}
          {phase === 'intro' && (
            <div style={s.centered}>
              <div style={s.bigSpider}>🕸️</div>
              <div style={s.titleText}>Ананси плетёт свою сеть</div>
              <div style={s.subText}>Приготовьтесь...</div>
            </div>
          )}

          {/* ВОПРОС */}
          {(phase === 'question' || phase === 'question_result') && gameState?.currentQuestion && (
            <QuestionPhase
              players={players}
              answers={answers}
              question={gameState.currentQuestion}
              questionNum={questionNum}
              revealData={phase === 'question_result' ? revealData : null}
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
            <FinalRaceView gameState={gameState} players={players} />
          )}

          {/* ПОБЕДИТЕЛЬ */}
          {phase === 'winner' && winner && (
            <WinnerScreen winner={winner} players={players} onReset={handleReset} assets={assets} />
          )}

        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QuestionPhase: вся фаза вопроса в одном компоненте
// ─────────────────────────────────────────────────────────────────────────────
function QuestionPhase({ players, answers, question, questionNum, revealData }) {
  const sorted   = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const leaderId = sorted[0]?.id;
  const answered = new Set(Object.keys(answers || {}));

  return (
    <div style={qp.wrap}>

      {/* ── Верхняя строка: бейдж + номер вопроса ── */}
      <div style={qp.topRow}>
        <div style={qp.badge}>🕷️&nbsp;&nbsp;Ананси спрашивает</div>
        <div style={qp.qnum}>Вопрос {questionNum} из {TOTAL_Q}</div>
      </div>

      {/* ── Игроки ── */}
      <div style={qp.players}>
        {sorted.map(p => {
          const isLead      = p.id === leaderId;
          const hasAnswered = answered.has(p.id);
          let result = null;
          if (revealData && hasAnswered) {
            result = Number(answers[p.id]?.answerIndex) === revealData.correctIndex ? 'correct' : 'wrong';
          } else if (hasAnswered) {
            result = 'answered';
          }

          return (
            <div key={p.id} style={qp.player}>
              {/* Счёт */}
              <div style={{ ...qp.score, color: isLead ? '#f0d060' : '#8acc50' }}>
                {p.score ?? 0}<span style={qp.scoreOf}>/{TOTAL_Q}</span>
              </div>

              {/* Аватар */}
              <div style={{
                ...qp.avatar,
                borderColor: result === 'correct' ? '#5a9a30'
                           : result === 'wrong'   ? '#c84830'
                           : result === 'answered' ? '#5a9a30'
                           : isLead ? '#c8a830' : '#1e3e1c',
                boxShadow: isLead && !result ? '0 0 16px rgba(200,168,48,0.4)' : 'none',
                background: isLead ? 'rgba(28,20,2,0.9)' : 'rgba(8,16,8,0.88)',
              }}>
                <span style={qp.emoji}>{CHAR_EMOJI[p.character] || '?'}</span>
                {result && (
                  <div style={{
                    ...qp.dot,
                    background: result === 'correct' ? '#5a9a30' : result === 'wrong' ? '#c84830' : '#3a7a28',
                  }}>
                    {result === 'correct' ? '✓' : result === 'wrong' ? '✗' : '•'}
                  </div>
                )}
              </div>

              {/* Имя */}
              <div style={{ ...qp.name, color: isLead ? '#c8a830' : '#587848' }}>
                {p.name.length > 7 ? p.name.slice(0, 7) + '…' : p.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Вопрос + таймер ── */}
      <div style={qp.card}>
        <div style={qp.questionRow}>
          <div style={qp.questionText}>{question.text}</div>
          <Timer questionId={question.id} paused={!!revealData} />
        </div>

        <div style={qp.answersGrid}>
          {question.answers.map((ans, i) => {
            const isCorrect = revealData && i === revealData.correctIndex;
            const isWrong   = revealData && i !== revealData.correctIndex;
            return (
              <div key={i} style={{
                ...qp.ans,
                ...(isCorrect ? qp.ansCorrect : {}),
                ...(isWrong   ? qp.ansWrong   : {}),
              }}>
                <div style={{ ...qp.letter, ...(isCorrect ? qp.letterOk : {}) }}>
                  {LETTERS[i]}
                </div>
                <span>{ans}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Timer
// ─────────────────────────────────────────────────────────────────────────────
function Timer({ questionId, paused }) {
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

  const pct   = (t / ANSWER_TIME) * 100;
  const color = t <= 6 ? '#c84830' : t <= 12 ? '#c8a830' : '#5a9a30';
  return (
    <div style={tr.wrap}>
      <div style={{ ...tr.num, color }}>{t}</div>
      <div style={tr.track}><div style={{ ...tr.fill, width: `${pct}%`, background: color }}/></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FinalRaceView
// ─────────────────────────────────────────────────────────────────────────────
function FinalRaceView({ gameState, players }) {
  const fr = gameState?.finalRace;
  return (
    <div style={s.centered}>
      <div style={{ fontSize: 56 }}>🏁</div>
      <div style={s.titleText}>Финальная гонка!</div>
      {fr?.currentQuestion && (
        <div style={s.finalCard}>
          <div style={s.finalQ}>{fr.currentQuestion.text}</div>
        </div>
      )}
      {fr?.positions && (
        <div style={s.finalPositions}>
          {[...players]
            .sort((a, b) => (fr.positions[b.id] || 0) - (fr.positions[a.id] || 0))
            .map(p => {
              const pos = fr.positions[p.id] || 0;
              const pct = Math.min((pos / 12) * 100, 100);
              return (
                <div key={p.id} style={s.finalRow}>
                  <span style={{ fontSize: 20 }}>{CHAR_EMOJI[p.character] || '?'}</span>
                  <span style={s.finalName}>{p.name}</span>
                  <div style={s.finalBar}>
                    <div style={{ ...s.finalFill, width: `${pct}%` }}/>
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
// CharAvatar (экспорт для других компонентов)
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
  root:   { height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' },
  layout: { display: 'flex', flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden', height: '100vh' },
  main:   { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },

  centered:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 },
  bigSpider: { fontSize: 72, animation: 'pulse 2s infinite' },
  titleText: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(22px,4vw,46px)', color: '#f0d060', letterSpacing: 2, textShadow: '0 0 30px rgba(200,168,48,0.4)' },
  subText:   { fontSize: 14, color: '#5a9a30', letterSpacing: 2, textTransform: 'uppercase' },

  finalCard:      { background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a', borderRadius: 14, padding: '16px 28px', backdropFilter: 'blur(10px)', maxWidth: 640 },
  finalQ:         { fontFamily: "'Cinzel',serif", fontSize: 'clamp(14px,1.8vw,22px)', color: '#d8f0b0' },
  finalPositions: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', maxWidth: 520, background: 'rgba(4,12,5,0.85)', border: '1px solid #1c3a1a', borderRadius: 14, padding: '14px 18px', backdropFilter: 'blur(10px)' },
  finalRow:       { display: 'flex', alignItems: 'center', gap: 10 },
  finalName:      { fontSize: 13, color: '#8acc50', minWidth: 80, fontFamily: "'Nunito',sans-serif" },
  finalBar:       { flex: 1, height: 7, background: '#0f2010', borderRadius: 4, overflow: 'hidden' },
  finalFill:      { height: '100%', background: '#5a9a30', borderRadius: 4, transition: 'width .5s ease' },
  finalPos:       { fontSize: 13, color: '#d8f0b0', minWidth: 24, textAlign: 'right', fontFamily: "'Cinzel',serif" },
};

// QuestionPhase styles
const qp = {
  wrap: {
    display: 'flex', flexDirection: 'column',
    height: '100%', padding: '16px 28px 24px 24px', gap: 12,
  },

  // Верхняя строка
  topRow: { display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 },
  badge: {
    fontSize: 12, letterSpacing: 2.5, color: '#7acc50',
    textTransform: 'uppercase', border: '1px solid #2a5a22',
    padding: '5px 16px', borderRadius: 20,
    background: 'rgba(10,30,10,0.7)', backdropFilter: 'blur(6px)',
    fontFamily: "'Cinzel',serif", flexShrink: 0,
  },
  qnum: {
    fontSize: 11, color: '#3a6028', letterSpacing: 1.5,
    fontFamily: "'Cinzel',serif",
  },

  // Игроки
  players: {
    display: 'flex', gap: 14, alignItems: 'flex-end',
    flexShrink: 0, flexWrap: 'nowrap',
    overflowX: 'auto', scrollbarWidth: 'none',
    paddingBottom: 4,
  },
  player: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flexShrink: 0 },
  score:  { fontFamily: "'Cinzel',serif", fontSize: 13, lineHeight: 1 },
  scoreOf:{ fontSize: 8, color: '#2e4a22' },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    border: '2px solid', position: 'relative',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'border-color .3s, box-shadow .3s, background .3s',
  },
  emoji:  { fontSize: 24, lineHeight: 1 },
  dot:    {
    position: 'absolute', bottom: -2, right: -2,
    width: 16, height: 16, borderRadius: '50%',
    border: '2px solid #040c05',
    fontSize: 8, color: '#fff', fontWeight: 900,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  name:   { fontSize: 10, fontFamily: "'Nunito',sans-serif", textAlign: 'center', maxWidth: 56 },

  // Карточка вопроса
  card: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: 14,
    background: 'rgba(3,10,4,0.88)', border: '1px solid #1a3818',
    borderRadius: 18, padding: '20px 24px',
    backdropFilter: 'blur(14px)',
    boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
    minHeight: 0,
  },
  questionRow: { display: 'flex', alignItems: 'flex-start', gap: 20 },
  questionText:{
    flex: 1,
    fontFamily: "'Cinzel',serif",
    fontSize: 'clamp(17px, 2vw, 28px)',
    color: '#d8f0b0', lineHeight: 1.5,
  },
  answersGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
    flex: 1, minHeight: 0,
  },
  ans: {
    background: 'rgba(8,18,8,0.8)', border: '1px solid #1c3a18',
    borderRadius: 12, padding: '12px 16px',
    color: '#7ab058', fontSize: 'clamp(12px,1.3vw,18px)',
    display: 'flex', alignItems: 'center', gap: 12,
    transition: 'all .3s',
  },
  ansCorrect: {
    borderColor: '#5a9a30', background: 'rgba(15,45,8,0.92)',
    color: '#8acc40', boxShadow: '0 0 18px rgba(90,154,48,0.25)',
  },
  ansWrong: { opacity: 0.25 },
  letter: {
    width: 28, height: 28, borderRadius: '50%',
    background: '#0a1a0c', border: '1px solid #2a4a20',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, color: '#4a8a30', flexShrink: 0,
    fontWeight: 700, fontFamily: "'Cinzel',serif",
  },
  letterOk: { background: '#122a0a', borderColor: '#5a9a30', color: '#8acc40' },
};

// Timer styles
const tr = {
  wrap:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 },
  num:   { fontFamily: "'Cinzel',serif", fontSize: 42, lineHeight: 1, transition: 'color .4s', minWidth: 52, textAlign: 'center' },
  track: { width: 52, height: 4, background: '#0f2010', borderRadius: 2, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 2, transition: 'width 1s linear, background .5s' },
};
