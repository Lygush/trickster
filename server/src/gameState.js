// gameState.js — единое состояние игры на сервере

const CHARACTERS = [
  { id: 'spider',   emoji: '🕷️', name: 'Паук'     },
  { id: 'frog',     emoji: '🐸', name: 'Лягушка'  },
  { id: 'snake',    emoji: '🐍', name: 'Змея'     },
  { id: 'beetle',   emoji: '🪲', name: 'Жук'      },
  { id: 'lizard',   emoji: '🦎', name: 'Ящерица'  },
];

const ROUTE_LENGTH   = 15;
const MINIGAME_SPOTS = [3, 6, 9, 12];
const FINAL_STEPS    = 12;

const HINDRANCE_LEVELS = [
  { gap: 8, level: 3 },
  { gap: 5, level: 2 },
  { gap: 4, level: 1 },
  { gap: 3, level: 0 },
];

function createGame() {
  return {
    phase: 'lobby',
    players: {},
    questions: [],
    questionIndex: 0,
    currentQuestion: null,
    answers: {},
    answerTimer: null,
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
    position: 0,
    ready: false,
    connected: true,
    hindranceLevel: 0,
  };
}

function getPlayers(game) {
  return Object.values(game.players);
}

function getLeader(game) {
  const players = getPlayers(game).filter(p => p.connected);
  if (!players.length) return null;
  return players.reduce((a, b) => (a.position >= b.position ? a : b));
}

function getLastPlace(game) {
  const players = getPlayers(game).filter(p => p.connected);
  if (!players.length) return null;
  return players.reduce((a, b) => (a.position <= b.position ? a : b));
}

function calcHindranceLevel(game, leaderId) {
  if (game.hindranceOverride[leaderId] !== undefined) {
    return game.hindranceOverride[leaderId];
  }
  const leader = game.players[leaderId];
  if (!leader) return 0;

  const others = getPlayers(game).filter(p => p.id !== leaderId && p.connected);
  if (!others.length) return 0;

  const secondPos = Math.max(...others.map(p => p.position));
  const gap = leader.position - secondPos;

  if (gap >= 8) return 3;
  if (gap >= 5) return 2;
  if (gap >= 4) return 1;
  return 0;
}

function checkAanansiHelp(game, playerId) {
  const player = game.players[playerId];
  if (!player) return false;
  if ((game.aanansiHelpsCount[playerId] || 0) >= 3) return false;
  if (game.aanansiHelpActive[playerId] === false) return false;

  const leader = getLeader(game);
  if (!leader || leader.id === playerId) return false;

  const gap = leader.position - player.position;
  return gap >= 6;
}

function updateHindrances(game) {
  const leader = getLeader(game);
  getPlayers(game).forEach(p => {
    if (leader && p.id === leader.id) {
      p.hindranceLevel = calcHindranceLevel(game, p.id);
    } else {
      p.hindranceLevel = 0;
    }
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

/** Публичное состояние для рассылки клиентам */
function publicState(game) {
  // Для three_paths скрываем winPath до reveal
  let minigamePublic = null;
  if (game.currentMinigame) {
    const mg = game.currentMinigame;
    if (mg.id === 'three_paths' && mg.data) {
      const { winPath, ...safeData } = mg.data;
      minigamePublic = {
        ...mg,
        data: mg.data.revealed
          ? mg.data                // reveal — winPath открыт
          : { ...safeData },       // активная игра — winPath скрыт
      };
    } else {
      minigamePublic = mg;
    }
  }

  return {
    phase: game.phase,
    players: getPlayers(game).map(p => ({
      id:             p.id,
      name:           p.name,
      character:      p.character,
      position:       p.position,
      hindranceLevel: p.hindranceLevel,
      connected:      p.connected,
    })),
    currentQuestion: game.currentQuestion
      ? {
          id:      game.currentQuestion.id,
          text:    game.currentQuestion.text,
          answers: game.currentQuestion.answers,
        }
      : null,
    currentMinigame: minigamePublic,
    finalRace:       game.finalRace,
  };
}

module.exports = {
  CHARACTERS,
  ROUTE_LENGTH,
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
};
