// index.js — точка входа, Express + Socket.io (ИСПРАВЛЕНО: 9 багов)

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const QRCode     = require('qrcode');
const os         = require('os');

const {
  CHARACTERS, ROUTE_LENGTH, MINIGAME_SPOTS, FINAL_STEPS,
  createGame, createPlayer, getPlayers, getLeader, getLastPlace,
  checkAanansiHelp, updateHindrances, shuffle, publicState,
} = require('./gameState');

const { buildAssetsConfig, ASSETS_DIR } = require('./assetsConfig');

const QUESTIONS_RAW = require('../data/questions.json');

// ── Конфиг ───────────────────────────────────────────────────────────────────
const PORT             = process.env.PORT || 3001;
const ANSWER_TIMEOUT   = 20_000;
const RESULT_PAUSE     = 3_000;
// Баг #5: добавлена обработка MINIGAME_TIMEOUT с fallback
const MINIGAME_TIMEOUT = parseInt(process.env.MINIGAME_TIMEOUT, 10) || 20_000;

// ── Приложение ───────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

app.use(express.json());

// ── Статика клиентов ─────────────────────────────────────────────────────────
const SCREEN_BUILD = path.join(__dirname, '../../client-screen/build');
const PHONE_BUILD  = path.join(__dirname, '../../client-phone/build');

app.use('/screen', express.static(SCREEN_BUILD));
app.use('/phone',  express.static(PHONE_BUILD));

app.get('/screen/*', (req, res) =>
  res.sendFile(path.join(SCREEN_BUILD, 'index.html')));
app.get('/phone/*', (req, res) =>
  res.sendFile(path.join(PHONE_BUILD, 'index.html')));

app.get('/', (req, res) => res.redirect('/screen'));

// ── Статика ассетов ──────────────────────────────────────────────────────────
const fs = require('fs');
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
app.use('/assets', express.static(ASSETS_DIR));

// ── API: конфиг ассетов ──────────────────────────────────────────────────────
app.get('/api/assets', (req, res) => {
  res.json(buildAssetsConfig());
});

// ── QR-код ───────────────────────────────────────────────────────────────────
app.get('/qr', async (req, res) => {
  const ip  = getLocalIP();
  const url = `http://${ip}:${PORT}/phone`;
  try {
    const png = await QRCode.toBuffer(url, { width: 300 });
    res.set('Content-Type', 'image/png').send(png);
  } catch (e) {
    res.status(500).send('QR error');
  }
});

app.get('/status', (req, res) =>
  res.json({ ok: true, phase: game.phase, players: getPlayers(game).length }));

// ── Состояние игры ───────────────────────────────────────────────────────────
let game = createGame();

// ── Утилиты ──────────────────────────────────────────────────────────────────
function getLocalIP() {
  const ifaces = os.networkInterfaces();
  const candidates = [];
  for (const name of Object.keys(ifaces))
    for (const iface of ifaces[name])
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.'))
          candidates.unshift(iface.address);
        else
          candidates.push(iface.address);
      }
  return candidates[0] || '127.0.0.1';
}

const broadcast      = (event, data) => io.emit(event, data);
const broadcastState = ()            => broadcast('game_state', publicState(game));
const log            = (...args)     => console.log('[SERVER]', ...args);

// ── Таймеры для безопасного сброса (баг #9) ─────────────────────────────────
let answerTimerId      = null;
let minigameIntroTimer = null;
let minigameTimerId    = null;
let resultPauseTimer   = null;   // универсальный таймер пауз (question_result, etc.)

function clearAllTimers() {
  if (answerTimerId)      { clearTimeout(answerTimerId);      answerTimerId      = null; }
  if (minigameIntroTimer) { clearTimeout(minigameIntroTimer); minigameIntroTimer = null; }
  if (minigameTimerId)    { clearTimeout(minigameTimerId);    minigameTimerId    = null; }
  if (resultPauseTimer)   { clearTimeout(resultPauseTimer);   resultPauseTimer   = null; }
}

// ── Логика вопроса ───────────────────────────────────────────────────────────
function startQuestion() {
  if (game.questionIndex >= game.questions.length) {
    game.questions     = shuffle(QUESTIONS_RAW);
    game.questionIndex = 0;
  }
  game.currentQuestion = game.questions[game.questionIndex++];
  game.answers         = {};
  game.phase           = 'question';
  game.answeringInProgress = false;   // баг #3: флаг для защиты от повторного вызова
  log('Вопрос:', game.currentQuestion.text);
  broadcastState();
  answerTimerId = setTimeout(() => revealAnswers(), ANSWER_TIMEOUT);
}

function revealAnswers() {
  // Баг #3: защита от двойного вызова из-за гонки таймера
  if (game.answeringInProgress) return;
  game.answeringInProgress = true;

  clearTimeout(answerTimerId);
  answerTimerId = null;
  game.phase = 'question_result';
  broadcastState();

  // Баг #1: приводим к числу, потому что JSON может содержать строку
  const correct = Number(game.currentQuestion.correct);
  const moved   = [];

  getPlayers(game).forEach(p => {
    const ans = game.answers[p.id];
    if (ans && Number(ans.answerIndex) === correct) {
      p.position = Math.min(p.position + 1, ROUTE_LENGTH);
      moved.push(p.id);
    } else if (!ans) {
      if (checkAanansiHelp(game, p.id)) {
        game.aanansiHelpsCount[p.id] = (game.aanansiHelpsCount[p.id] || 0) + 1;
        p.position = Math.min(p.position + 1, ROUTE_LENGTH);
        // Баг #7: флаг должен сбрасываться после использования помощи
        game.aanansiHelpActive[p.id] = false;
        log(`Ананси помогает ${p.name} (${game.aanansiHelpsCount[p.id]})`);
      }
    } else if (Number(ans.answerIndex) !== correct) {
      game.aanansiHelpActive[p.id] = false;
    }
  });

  updateHindrances(game);
  const leader    = getLeader(game);
  const nextPhase = leader ? checkMilestone(leader) : null;

  broadcast('question_result', {
    correctIndex: correct,
    answers:      game.answers,
    moved,
    players: getPlayers(game).map(p => ({
      id: p.id, name: p.name, position: p.position, hindranceLevel: p.hindranceLevel,
    })),
  });

  resultPauseTimer = setTimeout(() => {
    resultPauseTimer = null;
    if      (nextPhase === 'final_race') startFinalRace();
    else if (nextPhase === 'minigame')   startMinigameIntro();
    else                                 startQuestion();
  }, RESULT_PAUSE);
}

function checkMilestone(leader) {
  if (leader.position >= ROUTE_LENGTH) return 'final_race';
  if (MINIGAME_SPOTS.includes(leader.position)) {
    const key = `minigame_${leader.position}`;
    if (!game[key]) { game[key] = true; return 'minigame'; }
  }
  return null;
}

// ── Мини-игры ────────────────────────────────────────────────────────────────
const MINIGAMES_SHORT = ['three_paths', 'personality_vote'];
const MINIGAMES_LONG  = ['spy', 'aanansi_story', 'crocodile'];
let minigameShortIdx = 0, minigameLongIdx = 0, minigameTurn = 'short';

function pickNextMinigame() {
  if (minigameTurn === 'short') {
    const id = MINIGAMES_SHORT[minigameShortIdx++ % MINIGAMES_SHORT.length];
    minigameTurn = 'long';
    return id;
  } else {
    const id = MINIGAMES_LONG[minigameLongIdx++ % MINIGAMES_LONG.length];
    minigameTurn = 'short';
    return id;
  }
}

function startMinigameIntro() {
  const id = pickNextMinigame();
  game.currentMinigame = { id, phase: 'intro', data: null };
  game.phase = 'minigame_intro';
  log('Мини-игра (интро):', id);
  broadcastState();

  minigameIntroTimer = setTimeout(() => {
    minigameIntroTimer = null;
    game.phase = 'minigame';
    game.currentMinigame.phase = 'active';

    if (id === 'three_paths') {
      startThreePaths();
    } else {
      // Заглушка для остальных — тоже с таймаутом (баг #4)
      broadcastState();
      minigameTimerId = setTimeout(() => {
        minigameTimerId = null;
        endMinigame();
      }, MINIGAME_TIMEOUT);
    }
  }, 3_000);
}

function endMinigame() {
  clearTimeout(minigameTimerId);
  minigameTimerId = null;
  game.currentMinigame = null;
  log('Мини-игра завершена');
  startQuestion();
}

// ── THREE PATHS ──────────────────────────────────────────────────────────────
const PATH_FLAVORS = [
  ['Тропа теней', 'Путь сквозь туман', 'Тропа ветра'],
  ['Левая тропа', 'Средний путь', 'Правая тропа'],
  ['Путь паука', 'Тропа луны', 'Дорога звёзд'],
  ['Тёмный лес', 'Светлая поляна', 'Речной брод'],
  ['Северная тропа', 'Западный путь', 'Южная дорога'],
];

function startThreePaths() {
  const flavors  = PATH_FLAVORS[Math.floor(Math.random() * PATH_FLAVORS.length)];
  const winPath  = Math.floor(Math.random() * 3);
  const anansiLine = pickAanansiLine();

  game.currentMinigame.data = {
    paths: flavors,
    winPath,
    choices: {},
    revealed: false,
    anansiLine,
  };

  broadcastState();
  log(`Three Paths: победная тропа = ${winPath} («${flavors[winPath]}»)`);
  // Баг #4: теперь используем общий MINIGAME_TIMEOUT
  answerTimerId = setTimeout(() => revealThreePaths(), MINIGAME_TIMEOUT);
}

const ANANSI_LINES = [
  'Я соткал три пути... но лишь один ведёт к победе.',
  'Три тропы уходят в чащу. Выбери мудро — или просто угадай.',
  'Ананси улыбается. Он знает, какой путь правильный. Ты — нет.',
  'Одна тропа ведёт вперёд. Две — назад в паутину.',
  'Выбор прост: три тропы, одна удача.',
];

function pickAanansiLine() {
  return ANANSI_LINES[Math.floor(Math.random() * ANANSI_LINES.length)];
}

function revealThreePaths() {
  clearTimeout(answerTimerId);
  answerTimerId = null;
  const mg   = game.currentMinigame;
  if (!mg || mg.id !== 'three_paths') return;

  const data = mg.data;
  data.revealed = true;

  const winners = [];
  getPlayers(game).forEach(p => {
    const choice = data.choices[p.id];
    if (choice === data.winPath) {
      p.position = Math.min(p.position + 1, ROUTE_LENGTH);
      winners.push(p.id);
      log(`${p.name} выбрал верную тропу, +1 шаг`);
    }
  });

  updateHindrances(game);
  mg.phase = 'reveal';

  broadcastState();

  broadcast('three_paths_result', {
    winPath:  data.winPath,
    choices:  data.choices,
    winners,
    players:  getPlayers(game).map(p => ({
      id: p.id, name: p.name, position: p.position,
    })),
  });

  log(`Three Paths reveal: победители = ${winners.length}`);
  resultPauseTimer = setTimeout(() => {
    resultPauseTimer = null;
    endMinigame();
  }, 4_000);
}

// ── Финальная гонка ──────────────────────────────────────────────────────────
function startFinalRace() {
  const players = getPlayers(game);
  const leader  = getLeader(game);
  const startPositions = {};
  players.forEach(p => {
    if      (p.id === leader.id || p.position >= ROUTE_LENGTH) startPositions[p.id] = 4;
    else if (p.position >= 10)                                  startPositions[p.id] = 3;
    else if (p.position >= 5)                                   startPositions[p.id] = 2;
    else                                                        startPositions[p.id] = 1;
  });
  game.finalRace = {
    positions: startPositions,
    answers: {},
    questionIdx: 0,
    questions: shuffle(QUESTIONS_RAW),
    finished: false,
    winnerDeclared: false,   // баг #6: флаг, чтобы не объявить двух победителей
  };
  game.phase = 'final_race_intro';
  log('Финальная гонка!');
  broadcastState();
  resultPauseTimer = setTimeout(() => {
    resultPauseTimer = null;
    game.phase = 'final_race';
    broadcastState();
    startFinalQuestion();
  }, 4_000);
}

function startFinalQuestion() {
  const fr = game.finalRace;
  if (fr.finished || fr.winnerDeclared) return;   // баг #6: дополнительная защита
  fr.currentQuestion = fr.questions[fr.questionIdx++ % fr.questions.length];
  fr.answers    = {};
  fr.firstAnswer = null;
  log('Финал. Вопрос:', fr.currentQuestion.text);
  broadcastState();
  answerTimerId = setTimeout(() => revealFinalAnswers(), ANSWER_TIMEOUT);
}

function revealFinalAnswers() {
  clearTimeout(answerTimerId);
  answerTimerId = null;
  const fr      = game.finalRace;
  if (fr.finished || fr.winnerDeclared) return;

  // Баг #1: приводим к числу
  const correct = Number(fr.currentQuestion.correct);

  // ── Первый правильный ответ по timestamp ─────────────────────────────────
  let firstCorrectSid  = null;
  let firstCorrectTime = Infinity;

  Object.entries(fr.answers).forEach(([pid, ans]) => {
    if (Number(ans.answerIndex) === correct && ans.timestamp < firstCorrectTime) {
      firstCorrectTime = ans.timestamp;
      firstCorrectSid  = pid;
    }
  });

  Object.entries(fr.answers).forEach(([pid, ans]) => {
    if (Number(ans.answerIndex) === correct) {
      const steps = (firstCorrectSid === pid) ? 2 : 1;
      fr.positions[pid] = (fr.positions[pid] || 0) + steps;
      log(`${game.players[pid]?.name} +${steps} ${firstCorrectSid === pid ? '(первый!)' : '(верно)'}`);
    }
  });

  // Баг #6: один победитель – выбираем по max steps, затем по времени ответа
  const finishing = Object.entries(fr.positions)
    .filter(([, pos]) => pos >= FINAL_STEPS)
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];               // больше шагов первее
      const ta = fr.answers[a[0]]?.timestamp || Infinity;
      const tb = fr.answers[b[0]]?.timestamp || Infinity;
      return ta - tb;                                      // раньше ответивший
    });

  if (finishing.length > 0) {
    const [winnerId] = finishing[0];
    fr.winnerDeclared = true;
    fr.finished = true;
    game.phase = 'winner';
    const winnerPlayer = game.players[winnerId];
    log('Победитель:', winnerPlayer?.name);
    broadcast('game_winner', { player: winnerPlayer, finalPositions: fr.positions });
    broadcastState();
    return;
  }

  broadcastState();
  resultPauseTimer = setTimeout(() => {
    resultPauseTimer = null;
    startFinalQuestion();
  }, RESULT_PAUSE);
}

// ── Socket.io ────────────────────────────────────────────────────────────────
io.on('connection', socket => {
  const sid = socket.id;
  log(`Подключился: ${sid}`);
  socket.emit('game_state', publicState(game));
  socket.emit('server_info', { ip: getLocalIP(), port: PORT, characters: CHARACTERS });

  socket.on('join', ({ name }) => {
    if (game.phase !== 'lobby' && game.phase !== 'character_select') {
      socket.emit('error', { message: 'Игра уже идёт' }); return;
    }
    if (!name?.trim()) { socket.emit('error', { message: 'Нужно имя' }); return; }
    game.players[sid] = createPlayer(sid, name.trim().slice(0, 20));
    log(`Присоединился: ${game.players[sid].name}`);
    broadcastState();
  });

  socket.on('select_character', ({ characterId }) => {
    const player = game.players[sid];
    if (!player) { socket.emit('error', { message: 'Сначала войди' }); return; }
    if (!CHARACTERS.find(c => c.id === characterId)) { socket.emit('error', { message: 'Нет такого персонажа' }); return; }
    if (getPlayers(game).find(p => p.id !== sid && p.character === characterId)) {
      socket.emit('error', { message: 'Персонаж занят' }); return;
    }
    player.character = characterId;
    player.ready     = true;
    log(`${player.name} → ${characterId}`);
    broadcastState();
  });

  // Баг #2: защита от двойного старта
  socket.on('start_game', () => {
    if (game.phase !== 'lobby' && game.phase !== 'character_select') {
      socket.emit('error', { message: 'Игра уже началась' });
      return;
    }
    const players = getPlayers(game);
    if (players.length < 2)               { socket.emit('error', { message: 'Нужно минимум 2 игрока' }); return; }
    if (!players.every(p => p.character)) { socket.emit('error', { message: 'Не все выбрали персонажа' }); return; }
    game.questions     = shuffle(QUESTIONS_RAW);
    game.questionIndex = 0;
    game.phase         = 'intro';
    log('Игра стартует!');
    broadcastState();
    resultPauseTimer = setTimeout(() => {
      resultPauseTimer = null;
      startQuestion();
    }, 3_000);
  });

  socket.on('answer', ({ answerIndex }) => {
    const player = game.players[sid];
    // Баг #1: теперь answerIndex всегда число (клиент шлёт число, мы проверяем)
    if (!player || typeof answerIndex !== 'number') return;

    if (game.phase === 'question') {
      if (game.answers[sid]) return;
      game.answers[sid] = { answerIndex, timestamp: Date.now() };
      log(`${player.name} → ${answerIndex}`);
      const connected = getPlayers(game).filter(p => p.connected);
      if (Object.keys(game.answers).length >= connected.length) {
        clearTimeout(answerTimerId);
        answerTimerId = null;
        revealAnswers();
      }
    }

    if (game.phase === 'final_race' && game.finalRace && !game.finalRace.winnerDeclared) {
      const fr = game.finalRace;
      if (fr.answers[sid]) return;
      fr.answers[sid] = { answerIndex, timestamp: Date.now() };
      const connected = getPlayers(game).filter(p => p.connected);
      if (Object.keys(fr.answers).length >= connected.length) {
        clearTimeout(answerTimerId);
        answerTimerId = null;
        revealFinalAnswers();
      }
    }
  });

  // ── THREE PATHS: выбор тропы ──────────────────────────────────────────────
  socket.on('three_paths_choose', ({ pathIndex }) => {
    const player = game.players[sid];
    if (!player) return;
    if (game.phase !== 'minigame') return;
    if (game.currentMinigame?.id !== 'three_paths') return;
    if (game.currentMinigame?.data?.revealed) return;
    if (typeof pathIndex !== 'number' || pathIndex < 0 || pathIndex > 2) return;

    const data = game.currentMinigame.data;
    if (data.choices[sid] !== undefined) return;

    data.choices[sid] = pathIndex;
    log(`${player.name} выбрал тропу ${pathIndex}`);
    broadcastState();

    const connected = getPlayers(game).filter(p => p.connected);
    if (Object.keys(data.choices).length >= connected.length) {
      clearTimeout(answerTimerId);
      answerTimerId = null;
      revealThreePaths();
    }
  });

  // Баги #8, #9: полный сброс с очисткой всех таймеров
  socket.on('reset_game', () => {
    clearAllTimers();            // сначала убиваем все висящие таймеры
    game = createGame();         // новое состояние
    minigameShortIdx = 0;
    minigameLongIdx  = 0;
    minigameTurn     = 'short';
    log('Сброс');
    broadcastState();
  });

  socket.on('disconnect', () => {
    if (game.players[sid]) {
      game.players[sid].connected = false;
      log(`Отключился: ${game.players[sid].name}`);
      broadcastState();
    }
  });
});

// ── Запуск ───────────────────────────────────────────────────────────────────
server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const assetsConfig = buildAssetsConfig();
  const assetsLoaded = Object.values(assetsConfig.backgrounds).filter(Boolean).length
    + Object.values(assetsConfig.characters).filter(Boolean).length
    + Object.values(assetsConfig.sounds.music).filter(Boolean).length
    + Object.values(assetsConfig.sounds.sfx).filter(Boolean).length;

  console.log(`
╔══════════════════════════════════════════╗
║        🕸️  СКВОЗЬ ЧАЩУ — СЕРВЕР  🕸️       ║
╠══════════════════════════════════════════╣
║  Большой экран → http://${ip}:${PORT}/screen
║  Телефоны      → http://${ip}:${PORT}/phone
║  QR-код        → http://${ip}:${PORT}/qr
║  Статус        → http://${ip}:${PORT}/status
║  Ассеты API    → http://${ip}:${PORT}/api/assets
╠══════════════════════════════════════════╣
║  Ассетов загружено: ${assetsLoaded} файлов
╚══════════════════════════════════════════╝
  `);
});