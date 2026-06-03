// gameState.js

const CHARACTERS = [
  { id: 'spider',  emoji: '🕷️', name: 'Паук'    },
  { id: 'frog',    emoji: '🐸', name: 'Лягушка' },
  { id: 'snake',   emoji: '🐍', name: 'Змея'    },
  { id: 'beetle',  emoji: '🪲', name: 'Жук'     },
  { id: 'lizard',  emoji: '🦎', name: 'Ящерица' },
];

const TOTAL_QUESTIONS = 15;            // фиксированное число вопросов в раунде
const MINIGAME_SPOTS  = [3, 6, 9, 12]; // после этих вопросов — мини-игра
const FINAL_STEPS     = 12;            // шагов до победы в финальной гонке

// Псевдоним для обратной совместимости с импортами
const ROUTE_LENGTH = TOTAL_QUESTIONS;

function createGame() {
  return {
    phase: 'lobby',
    players: {},
    questions: [],
    questionIndex: 0,   // сколько вопросов уже задано (1-based после increment)
    currentQuestion: null,
    answers: {},
    answerTimer: null,
    roundLocked: false,
    activeTimers: [],
    minigameQueue: [],
    currentMinigame: null,
    finalRace: null,
    hindranceOverride: {},
    aanansiHelpsCount: {},
    aanansiHelpActive: {},
  };
}

function createPlayer(socketId, name) {
  return {
    id: socketId,
    name,
    character: null,
    score: 0,        // правильных ответов за раунд
    ready: false,
    connected: true,
    baseHindrance: 0,
    extraPenalty: 0,
  };
}

function getPlayers(game) {
  return Object.values(game.players);
}

// Лидер = больше всего правильных ответов
function getLeader(game) {
  const players = getPlayers(game).filter(p => p.connected);
  if (!players.length) return null;
  return players.reduce((a, b) => (a.score >= b.score ? a : b));
}

function getLastPlace(game) {
  const players = getPlayers(game).filter(p => p.connected);
  if (!players.length) return null;
  return players.reduce((a, b) => (a.score <= b.score ? a : b));
}

function calcHindranceLevel(game, leaderId) {
  if (!leaderId || !game.players[leaderId]) return 0;
  if (game.hindranceOverride[leaderId] !== undefined) {
    return game.hindranceOverride[leaderId];
  }

  const leader = game.players[leaderId];
  const others = getPlayers(game).filter(p => p.id !== leaderId && p.connected);
  if (!others.length) return 0;

  const secondScore = Math.max(...others.map(p => p.score));
  const gap = leader.score - secondScore;

  if (gap >= 6) return 3;
  if (gap >= 4) return 2;
  if (gap >= 2) return 1;
  return 0;
}

function checkAanansiHelp(game, playerId) {
  const player = game.players[playerId];
  if (!player) return false;
  if ((game.aanansiHelpsCount[playerId] || 0) >= 3) return false;
  if (game.aanansiHelpActive[playerId] === false) return false;

  const leader = getLeader(game);
  if (!leader || leader.id === playerId) return false;

  const gap = leader.score - player.score;
  return gap >= 5;
}

function updateHindrances(game) {
  const leader = getLeader(game);
  getPlayers(game).forEach(p => {
    p.baseHindrance = (leader && p.id === leader.id)
      ? calcHindranceLevel(game, p.id)
      : 0;
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function publicState(game) {
  // Скрываем winPath для three_paths до раскрытия
  let minigamePublic = null;
  if (game.currentMinigame) {
    const mg = game.currentMinigame;
    if (mg.id === 'three_paths' && mg.data) {
      const { winPath, ...safeData } = mg.data;
      minigamePublic = {
        ...mg,
        data: mg.data.revealed ? mg.data : { ...safeData },
      };
    } else {
      minigamePublic = mg;
    }
  }

  let finalRacePublic = null;
  if (game.finalRace) {
    const fr = game.finalRace;
    finalRacePublic = {
      positions:       fr.positions,
      finished:        fr.finished,
      currentQuestion: fr.currentQuestion ? {
        id:      fr.currentQuestion.id,
        text:    fr.currentQuestion.text,
        answers: fr.currentQuestion.answers,
      } : null,
    };
  }

  return {
    phase:           game.phase,
    questionIndex:   game.questionIndex,   // ← клиент знает какой вопрос по счёту
    totalQuestions:  TOTAL_QUESTIONS,
    players: getPlayers(game).map(p => ({
      id:             p.id,
      name:           p.name,
      character:      p.character,
      score:          p.score,
      hindranceLevel: p.baseHindrance + p.extraPenalty,
      connected:      p.connected,
    })),
    currentQuestion: game.currentQuestion
      ? { id: game.currentQuestion.id, text: game.currentQuestion.text, answers: game.currentQuestion.answers }
      : null,
    currentMinigame: minigamePublic,
    finalRace:       finalRacePublic,
  };
}

function resetGameState(game) {
  game.activeTimers.forEach(id => clearTimeout(id));
  game.activeTimers = [];
  const fresh = createGame();
  Object.assign(game, fresh, { players: game.players });
  Object.values(game.players).forEach(p => {
    p.score         = 0;
    p.ready         = false;
    p.baseHindrance = 0;
    p.extraPenalty  = 0;
  });
}

module.exports = {
  CHARACTERS,
  ROUTE_LENGTH,      // псевдоним = TOTAL_QUESTIONS
  TOTAL_QUESTIONS,
  MINIGAME_SPOTS,
  FINAL_STEPS,
  createGame,
  createPlayer,
  getPlayers,
  getLeader,
  getLastPlace,
  calcHindranceLevel,
  checkAanansiHelp,
  updateHindrances,
  shuffle,
  publicState,
  resetGameState,
};
