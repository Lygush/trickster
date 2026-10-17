import React, { useEffect, useRef, useState } from 'react';
import './index.css';

import useGame, { SERVER_URL }   from './shared/useGame';
import { ClockContext }          from './shared/useCountdown';
import { CHAR_EMOJI, LETTERS }   from './shared/constants';

import GameBackground  from './components/GameBackground';
import LobbyScreen     from './components/LobbyScreen';
import MapPanel        from './components/MapPanel';
import WinnerScreen    from './components/WinnerScreen';
import MinigameIntro   from './components/MinigameIntro';
import MinigameFrame   from './components/MinigameFrame';
import QuestionReveal  from './components/QuestionReveal';
import FinalRace       from './components/FinalRace';
import TimerBar        from './components/TimerBar';
import HostControls    from './components/HostControls';
import useAssets       from './hooks/useAssets';
import useSounds       from './hooks/useSounds';

const MUSIC = {
  lobby: 'lobby', intro: 'lobby',
  question: 'question', question_result: 'question',
  minigame_intro: 'minigame', minigame: 'minigame',
  final_race_intro: 'final_race', final_race: 'final_race', final_result: 'final_race',
  winner: 'winner',
};

export default function App() {
  const { state, connected, serverInfo, error, emit, serverNow } = useGame({ role: 'screen' });
  const assets = useAssets();
  const sounds = useSounds(assets);

  const phase    = state?.phase || 'lobby';
  const players  = state?.players || [];
  const minigame = state?.minigame;

  useScreenSounds(state, sounds);

  // Плавная смена «вопрос → результат»: карточка вопроса уезжает вниз
  const [revealVisible, setRevealVisible] = useState(false);
  useEffect(() => {
    if (phase !== 'question_result') { setRevealVisible(false); return undefined; }
    const t = setTimeout(() => setRevealVisible(true), 650);
    return () => clearTimeout(t);
  }, [phase]);

  if (!state) {
    return (
      <div style={s.root}>
        <GameBackground phase="lobby" assets={assets} />
        <div style={{ ...s.centered, position: 'relative', zIndex: 1 }}>
          <div style={s.bigIcon}>🕸️</div>
          <div style={s.subText}>{connected ? 'Загрузка...' : 'Подключение к серверу...'}</div>
        </div>
      </div>
    );
  }

  const isQuestionPhase = phase === 'question' || phase === 'question_result';
  const showQuestion = phase === 'question' || (phase === 'question_result' && !revealVisible);

  return (
    <ClockContext.Provider value={serverNow}>
      <div style={s.root}>
        <GameBackground phase={phase} minigameId={minigame?.id} assets={assets} />

        <div style={s.layout}>
          {isQuestionPhase && <Topbar state={state} />}

          <div style={s.body}>
            {phase === 'lobby' && (
              <LobbyScreen
                players={players}
                characters={state.characters}
                config={state.config}
                qrUrl={`${SERVER_URL}/qr`}
                phoneUrl={serverInfo?.phoneUrl}
                error={error}
                onStart={() => emit('start_game')}
              />
            )}

            {phase === 'intro' && (
              <div style={s.centered}>
                <div style={s.bigIcon}>🕸️</div>
                <div style={s.titleText}>Ананси плетёт свою сеть</div>
                <div style={s.subText}>{state.config.totalQuestions} вопросов · 3 мини-игры · финальная гонка</div>
              </div>
            )}

            {showQuestion && state.question && (
              <>
                <div style={s.spacer} />
                <div style={{
                  ...s.bottomZone,
                  animation: phase === 'question_result' ? 'slideOutDown 0.6s ease forwards' : 'fadeIn 0.35s ease',
                }}>
                  <TimerBar deadline={phase === 'question' ? state.deadline : null} duration={state.duration} />
                  <QuestionCard key={state.question.id} question={state.question} />
                </div>
              </>
            )}

            {phase === 'question_result' && revealVisible && state.question && state.questionResult && (
              <QuestionReveal
                key={state.question.id + '_reveal'}
                question={state.question}
                result={state.questionResult}
                players={players}
              />
            )}

            {phase === 'minigame_intro' && (
              <MinigameIntro minigame={minigame} players={players} deadline={state.deadline} duration={state.duration} />
            )}

            {phase === 'minigame' && minigame && (
              <MinigameFrame state={state} assets={assets} sounds={sounds} />
            )}

            {['final_race_intro', 'final_race', 'final_result'].includes(phase) && (
              <FinalRace state={state} />
            )}

            {phase === 'winner' && state.winner && (
              <WinnerScreen
                winner={state.winner}
                players={players}
                finalSteps={state.config.finalSteps}
                onReplay={() => emit('reset_game', { keepPlayers: true })}
                onNewPlayers={() => emit('reset_game', { keepPlayers: false })}
              />
            )}
          </div>
        </div>

        <HostControls
          phase={phase}
          canSkip={!!state.deadline && phase !== 'lobby'}
          connected={connected}
          onSkip={() => emit('host_skip')}
          onReset={() => emit('reset_game', { keepPlayers: true })}
        />
      </div>
    </ClockContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Звуки по смене состояния
// ─────────────────────────────────────────────────────────────────────────────
function useScreenSounds(state, sounds) {
  const prev = useRef({ phase: null, players: 0, stage: null });
  useEffect(() => {
    if (!state) return;
    const p = prev.current;
    const { phase } = state;
    if (MUSIC[phase]) sounds.playMusic(MUSIC[phase]);
    if (phase === 'lobby' && state.players.length > p.players) sounds.playSfx('join');
    if (phase !== p.phase) {
      if (phase === 'question' || phase === 'final_race') sounds.playSfx('tick');
      if (phase === 'question_result') {
        const r = state.questionResult;
        sounds.playSfx(r?.correctIds.length ? 'correct' : 'wrong');
        if (r?.helped.length) setTimeout(() => sounds.playVoice('help'), 1200);
        if (Object.keys(r?.hindered || {}).length) sounds.playVoice('hindrance');
      }
      if (phase === 'final_result') sounds.playSfx('step');
      if (phase === 'minigame_intro') sounds.playSfx('minigame_start');
      if (phase === 'intro') sounds.playVoice('intro');
      if (phase === 'winner') sounds.playSfx('winner');
    }
    const stage = state.minigame?.stage;
    if (stage === 'reveal' && p.stage !== 'reveal') sounds.playSfx('correct');
    prev.current = { phase, players: state.players.length, stage };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─────────────────────────────────────────────────────────────────────────────
// Topbar: прогресс-трек слева, чипы игроков справа
// ─────────────────────────────────────────────────────────────────────────────
function Topbar({ state }) {
  const { players, answeredIds, questionResult, questionNumber, phase } = state;
  const sorted   = [...players].sort((a, b) => b.score - a.score);
  const leaderId = sorted[0] && sorted[1] && sorted[0].score > sorted[1].score ? sorted[0].id : null;
  const answered = new Set(phase === 'question' ? answeredIds : Object.keys(questionResult?.answers || {}));

  return (
    <div style={tb.bar}>
      <div style={tb.trackWrap}>
        <MapPanel questionNumber={questionNumber} phase={phase} config={state.config} />
      </div>
      <div style={tb.qnum}>
        Вопрос <b style={{ color: '#f0d060' }}>{questionNumber}</b> / {state.config.totalQuestions}
      </div>
      <div style={tb.sep} />
      <div style={tb.chips}>
        {sorted.map(p => {
          const isLead   = p.id === leaderId;
          const hasAns   = answered.has(p.id);
          const wasRight = questionResult?.correctIds.includes(p.id);
          const dotColor = !hasAns ? 'transparent'
            : questionResult ? (wasRight ? '#6bc740' : '#e05050') : '#c6f060';
          const hind = p.hindranceLevel || questionResult?.hindered?.[p.id];

          return (
            <div key={p.id} style={{
              ...tb.chip,
              opacity: p.connected ? 1 : 0.4,
              borderColor: isLead ? 'rgba(212,175,55,.45)' : 'rgba(107,199,64,.18)',
              background:  isLead ? 'rgba(30,20,2,.55)'    : 'rgba(5,12,4,.5)',
            }}>
              <div style={{
                width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
                background: dotColor,
                border: hasAns ? 'none' : '1px solid rgba(150,220,90,.3)',
                transition: 'background 0.3s',
              }} />
              <div style={{ ...tb.av, borderColor: isLead ? '#d4af37' : 'rgba(107,199,64,.4)' }}>
                {CHAR_EMOJI[p.character] || '?'}
              </div>
              <span style={{ ...tb.name, color: isLead ? '#d4af37' : 'rgba(150,220,90,.75)' }}>
                {p.name.length > 9 ? p.name.slice(0, 9) + '…' : p.name}
              </span>
              {hind > 0 && <span title="Помеха Ананси" style={tb.badge}>{'⚡'.repeat(hind)}</span>}
              <span style={tb.score}>{p.score}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const tb = {
  bar: {
    height: '8vh', minHeight: 52, maxHeight: 84,
    display: 'flex', alignItems: 'center',
    background: 'rgba(4,10,3,.82)',
    borderBottom: '1px solid rgba(212,175,55,.15)',
    padding: '0 2vw', gap: '1.4vw',
    flexShrink: 0, zIndex: 20, position: 'relative',
  },
  trackWrap: { flexShrink: 0, display: 'flex', alignItems: 'center' },
  qnum: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(12px,1.1vw,18px)', color: 'rgba(150,220,90,.7)', whiteSpace: 'nowrap' },
  sep: { width: 1, height: '60%', background: 'rgba(212,175,55,.15)', flexShrink: 0 },
  chips: { display: 'flex', alignItems: 'center', gap: '0.8vw', flex: 1, justifyContent: 'flex-end', minWidth: 0 },
  chip: {
    display: 'flex', alignItems: 'center', gap: '0.4vw',
    border: '1px solid', borderRadius: 30,
    padding: '0.5vh 1.1vw 0.5vh 0.6vw',
    transition: 'border-color .3s, background .3s, opacity .3s',
    flexShrink: 0,
  },
  av: {
    width: '4vh', height: '4vh', minWidth: 28, minHeight: 28,
    borderRadius: '50%', border: '1px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 'clamp(14px,2.2vh,26px)', background: '#1a2e10', flexShrink: 0,
  },
  name:  { fontSize: 'clamp(12px,1.15vw,20px)', fontFamily: "'Cinzel',serif", whiteSpace: 'nowrap' },
  badge: { fontSize: 'clamp(11px,1vw,16px)', animation: 'pulse 1s infinite' },
  score: { fontSize: 'clamp(14px,1.5vw,24px)', color: '#9de05a', fontWeight: 700, marginLeft: '0.3vw' },
};

// ─────────────────────────────────────────────────────────────────────────────
// QuestionCard — с stagger на вариантах ответов
// ─────────────────────────────────────────────────────────────────────────────
function QuestionCard({ question }) {
  return (
    <div style={qc.card}>
      <div style={qc.text}>{question.text}</div>
      <div style={qc.grid}>
        {question.answers.map((ans, i) => (
          <div key={i} style={{
            ...qc.ans,
            animation: `answerStagger 0.38s cubic-bezier(0.22,0.61,0.36,1) ${i * 80}ms both`,
          }}>
            <div style={qc.key}>{LETTERS[i]}</div>
            <span style={qc.ansText}>{ans}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const qc = {
  card: {
    background: 'rgba(6,16,4,.9)',
    border: '1px solid rgba(212,175,55,.2)',
    borderRadius: '1.2vw', padding: '2.2vh 2.2vw',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 6px 32px rgba(0,0,0,.55)',
  },
  text: {
    fontFamily: "'Cinzel',serif", fontSize: 'clamp(24px,2.8vw,44px)',
    color: '#e8f5d0', fontWeight: 700, lineHeight: 1.45, marginBottom: '1.4vh',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2vh 1.2vw' },
  ans: {
    background: 'rgba(20,36,14,.82)', border: '1px solid rgba(107,199,64,.22)',
    borderRadius: '0.9vw', padding: '1.6vh 1.8vw',
    display: 'flex', alignItems: 'center', gap: '0.8vw',
  },
  key: {
    width: 'clamp(34px,4vh,54px)', height: 'clamp(34px,4vh,54px)',
    borderRadius: '50%', flexShrink: 0,
    background: 'rgba(107,199,64,.12)', border: '1.5px solid rgba(107,199,64,.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Cinzel',serif", fontSize: 'clamp(14px,1.6vw,24px)',
    fontWeight: 700, color: '#9de05a',
  },
  ansText: { fontFamily: "'Nunito',sans-serif", fontSize: 'clamp(16px,1.6vw,26px)', color: '#c8e8a0', lineHeight: 1.3 },
};

// ─────────────────────────────────────────────────────────────────────────────
const s = {
  root:   { height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' },
  layout: { display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', zIndex: 1, overflow: 'hidden' },
  body:   { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  spacer: { flex: 1 },
  bottomZone: { padding: '0 2.5vw 2.5vh', display: 'flex', flexDirection: 'column', gap: '1.4vh' },
  centered:  { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 },
  bigIcon:   { fontSize: 'clamp(48px,7vw,96px)', animation: 'pulse 2s infinite' },
  titleText: { fontFamily: "'Cinzel',serif", fontSize: 'clamp(20px,3.5vw,52px)', color: '#f0d060', letterSpacing: 2, textShadow: '0 0 30px rgba(200,168,48,.4)', textAlign: 'center' },
  subText:   { fontSize: 'clamp(12px,1.1vw,18px)', color: '#7aaa50', letterSpacing: 3, textTransform: 'uppercase', textAlign: 'center' },
};
