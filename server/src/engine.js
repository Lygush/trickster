// engine.js — вся игровая логика «Сквозь чащу», без привязки к транспорту.
//
// Engine ничего не знает про socket.io: он получает события через
//   connect(sid) / disconnect(sid) / handle(sid, event, payload)
// и отправляет сообщения через переданную функцию send(sid, event, data).
// Благодаря этому всю партию можно прогнать в тестах (см. test/simulate.js).
//
// Идентичность игрока НЕ привязана к socket.id: телефон хранит секретный token,
// сервер хранит стабильный player.id. Переподключение (перезагрузка вкладки,
// блокировка экрана) сохраняет всё: очки, позицию в финале, роль в мини-игре.

const C = require('./config');
const MINIGAMES = require('./minigames');
const { CHARACTERS } = require('./content');
const { shuffle, pick, randomId } = require('./utils');

const realScheduler = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (id) => clearTimeout(id),
};

class Engine {
  constructor({ questions, send, log = console.log, scheduler = realScheduler, timings = C.T }) {
    this.allQuestions = validateQuestions(questions, log);
    this.send  = send;
    this.log   = (...a) => log('[GAME]', ...a);
    this.clock = scheduler;
    this.T     = timings;

    this.sockets  = new Map();   // sid → { role: 'screen'|'phone'|null, playerId }
    this.timer    = null;        // единственный активный таймер фазы
    this.timerFn  = null;
    this.questionPool = shuffle(this.allQuestions);
    this.game = this.createGame();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Состояние
  // ═══════════════════════════════════════════════════════════════════════

  createGame(players = {}) {
    return {
      phase: 'lobby',
      deadline: null,
      players,                  // id → player
      questionNumber: 0,
      usedQuestionIds: new Set(),
      question: null,
      answers: {},              // pid → { answerIndex, t }
      questionResult: null,
      hindranceStreak: 0,
      minigame: null,
      minigamesPlayed: [],
      finalRace: null,
      winner: null,
    };
  }

  createPlayer(name, token) {
    return {
      id: randomId(), token, name,
      character: null, score: 0, connected: true,
      hindrance: null,          // { level, order, lockedUntil, resetPending, flipped }
      helpsUsed: 0, helpActive: true,
    };
  }

  players()   { return Object.values(this.game.players); }
  connected() { return this.players().filter(p => p.connected); }
  now()       { return this.clock.now(); }

  allConnected(pred) {
    const c = this.connected();
    return c.length > 0 && c.every(p => pred(p.id));
  }

  // ── Таймер фазы: всегда ровно один, поэтому «зависших» таймеров не бывает ──
  setTimer(ms, fn) {
    this.clearTimer();
    if (ms == null) { this.game.deadline = null; this.game.duration = null; return; }
    this.game.deadline = this.now() + ms;
    this.game.duration = ms;
    this.timerFn = fn;
    this.timer = this.clock.setTimeout(() => {
      this.timer = null;
      this.timerFn = null;
      fn();
    }, ms);
  }

  clearTimer() {
    if (this.timer) this.clock.clearTimeout(this.timer);
    this.timer = null;
    this.timerFn = null;
  }

  setPhase(phase, ms, fn) {
    this.game.phase = phase;
    this.setTimer(ms, fn);
    this.broadcast();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Транспорт
  // ═══════════════════════════════════════════════════════════════════════

  connect(sid) {
    this.sockets.set(sid, { role: null, playerId: null });
  }

  disconnect(sid) {
    const s = this.sockets.get(sid);
    this.sockets.delete(sid);
    if (!s?.playerId) return;
    // Игрок мог уже переподключиться с другого сокета
    const stillBound = [...this.sockets.values()].some(x => x.playerId === s.playerId);
    const p = this.game.players[s.playerId];
    if (!p || stillBound) return;
    p.connected = false;
    this.log(`Отключился: ${p.name}`);
    this.onPlayerLeft(p.id);
    this.broadcast();
  }

  handle(sid, event, payload = {}) {
    const s = this.sockets.get(sid);
    if (!s) return;
    if (payload === null || typeof payload !== 'object') payload = {};
    const fn = HANDLERS[event];
    if (!fn) return;
    try {
      fn.call(this, sid, s, payload);
    } catch (e) {
      this.log(`Ошибка в обработчике ${event}:`, e);
    }
  }

  error(sid, message) { this.send(sid, 'game_error', { message }); }

  broadcast() {
    const base = this.publicState();
    for (const [sid, s] of this.sockets) {
      const p = s.playerId && this.game.players[s.playerId];
      this.send(sid, 'game_state', p ? { ...base, me: this.privateState(p) } : base);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Лобби
  // ═══════════════════════════════════════════════════════════════════════

  bindPlayer(sid, s, player) {
    // Если этот игрок уже был привязан к другому сокету — отвязываем старый
    for (const [otherSid, other] of this.sockets) {
      if (other.playerId === player.id && otherSid !== sid) other.playerId = null;
    }
    s.role = 'phone';
    s.playerId = player.id;
    player.connected = true;
  }

  findByToken(token) {
    return token ? this.players().find(p => p.token === token) : null;
  }

  removeFromLobby(pid) {
    delete this.game.players[pid];
    for (const s of this.sockets.values()) if (s.playerId === pid) s.playerId = null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Основной маршрут: вопросы
  // ═══════════════════════════════════════════════════════════════════════

  startGame() {
    const g = this.game;
    // Отключившиеся в лобби игроки в партию не попадают
    this.players().filter(p => !p.connected).forEach(p => this.removeFromLobby(p.id));
    this.players().forEach(p => {
      p.score = 0; p.hindrance = null; p.helpsUsed = 0; p.helpActive = true;
    });
    Object.assign(g, {
      questionNumber: 0, usedQuestionIds: new Set(), questionResult: null,
      hindranceStreak: 0, minigame: null, minigamesPlayed: [], finalRace: null, winner: null,
    });
    this.log(`Игра стартует: ${this.players().map(p => p.name).join(', ')}`);
    this.setPhase('intro', this.T.INTRO, () => this.startQuestion());
  }

  nextQuestion() {
    const g = this.game;
    // Берём вопрос, который ещё не звучал в этой партии; пул между партиями
    // тоже не повторяется, пока не исчерпается.
    for (let attempt = 0; attempt < 2; attempt++) {
      while (this.questionPool.length) {
        const q = this.questionPool.pop();
        if (!g.usedQuestionIds.has(q.id)) {
          g.usedQuestionIds.add(q.id);
          return q;
        }
      }
      this.questionPool = shuffle(this.allQuestions);
    }
    // Все вопросы исчерпаны в рамках одной партии — разрешаем повторы
    g.usedQuestionIds.clear();
    return this.nextQuestion();
  }

  startQuestion() {
    const g = this.game;
    g.questionNumber++;
    g.question = this.nextQuestion();
    g.answers = {};
    g.questionResult = null;
    this.assignHindrances();
    this.log(`Вопрос ${g.questionNumber}: ${g.question.text}`);
    this.setPhase('question', this.T.QUESTION, () => this.revealQuestion());
  }

  // ── Помехи лидеру ─────────────────────────────────────────────────────────
  // Ур.1: варианты перемешаны + первый выбор «сбрасывается» Ананси.
  // Ур.2: + телефон заблокирован первые 2 секунды (задержка приёма ответа).
  // Ур.3: + экран перевёрнут вверх ногами, блокировка 3 секунды.
  assignHindrances() {
    const g = this.game;
    this.players().forEach(p => { p.hindrance = null; });
    const ranked = this.connected().sort((a, b) => b.score - a.score);
    if (ranked.length < 2) { g.hindranceStreak = 0; return; }

    const [leader, second] = ranked;
    const gap = leader.score - second.score;
    let level = C.HINDRANCE_GAPS.filter(t => gap >= t).length;

    if (level > 0 && g.hindranceStreak >= C.HINDRANCE_MAX_STREAK) {
      this.log(`Помеха: ${leader.name} получает передышку (отрыв ${gap})`);
      level = 0;
    }
    g.hindranceStreak = level > 0 ? g.hindranceStreak + 1 : 0;
    if (!level) return;

    const lockMs = level >= 3 ? 3000 : level >= 2 ? 2000 : 0;
    let order = shuffle([0, 1, 2, 3]);
    if (order.every((v, i) => v === i)) order = [1, 0, 3, 2];
    leader.hindrance = {
      level,
      order,
      resetPending: true,
      lockedUntil: lockMs ? this.now() + Math.round(lockMs * C.TIME_SCALE) : 0,
      flipped: level >= 3,
    };
    this.log(`Помеха ур.${level} для лидера ${leader.name} (отрыв ${gap})`);
  }

  answer(pid, answerIndex) {
    const g = this.game;
    const p = g.players[pid];
    if (!p || !Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) return;

    if (g.phase === 'question') {
      if (g.answers[pid]) return;
      const h = p.hindrance;
      if (h && h.lockedUntil > this.now()) return;          // телефон ещё заблокирован
      if (h && h.resetPending) {                             // Ананси сбрасывает первый выбор
        h.resetPending = false;
        this.log(`Помеха: Ананси сбросил выбор ${p.name}`);
        this.broadcast();
        return;
      }
      g.answers[pid] = { answerIndex, t: this.now() };
      this.broadcast();
      if (this.allConnected(id => g.answers[id])) this.revealQuestion();
      return;
    }

    if (g.phase === 'final_race') {
      const fr = g.finalRace;
      if (fr.answers[pid]) return;
      fr.answers[pid] = { answerIndex, t: this.now() };
      this.broadcast();
      if (this.allConnected(id => fr.answers[id])) this.revealFinal();
    }
  }

  revealQuestion() {
    const g = this.game;
    if (g.phase !== 'question') return;
    const correct = g.question.correct;
    const deltas = {}, correctIds = [], helped = [];

    this.players().forEach(p => {
      if (g.answers[p.id]?.answerIndex === correct) {
        p.score += 1; deltas[p.id] = 1; correctIds.push(p.id);
      }
    });

    // ── Помощь отстающему ──────────────────────────────────────────────────
    const top = Math.max(0, ...this.connected().map(p => p.score));
    this.connected().forEach(p => {
      if (correctIds.includes(p.id)) return;
      const ans = g.answers[p.id];
      if (ans && p.helpsUsed > 0 && p.helpActive) {
        // Получил помощь, но снова ошибся — Ананси больше не помогает
        p.helpActive = false;
        this.log(`Помощь: ${p.name} ошибся после помощи — помощь отключена`);
        return;
      }
      if (p.helpActive && p.helpsUsed < C.HELP_MAX && top - p.score >= C.HELP_GAP) {
        p.score += 1; p.helpsUsed += 1;
        deltas[p.id] = 1; helped.push(p.id);
        this.log(`Помощь: Ананси подтолкнул ${p.name} (${p.helpsUsed}/${C.HELP_MAX})`);
      }
    });

    const hindered = {};
    this.players().forEach(p => { if (p.hindrance) hindered[p.id] = p.hindrance.level; });

    g.questionResult = {
      correctIndex: correct,
      answers: Object.fromEntries(Object.entries(g.answers).map(([id, a]) => [id, a.answerIndex])),
      correctIds, helped, deltas, hindered,
    };
    this.players().forEach(p => { p.hindrance = null; });

    const n = g.questionNumber;
    const spotIdx = C.MINIGAME_SPOTS.indexOf(n);
    const next = n >= C.TOTAL_QUESTIONS ? () => this.startFinalRace()
      : spotIdx >= 0 ? () => this.startMinigameIntro(C.MINIGAME_KINDS[spotIdx] || 'short')
      : () => this.startQuestion();
    this.setPhase('question_result', this.T.QUESTION_RESULT, next);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Мини-игры
  // ═══════════════════════════════════════════════════════════════════════

  pickMinigame(kind) {
    const n = this.connected().length;
    const all = Object.values(MINIGAMES).filter(m => m.minPlayers <= n);
    const played = this.game.minigamesPlayed;
    const pools = [
      all.filter(m => m.kind === kind && !played.includes(m.id)),
      all.filter(m => !played.includes(m.id)),
      all.filter(m => m.kind === kind),
      all,
    ];
    const pool = pools.find(p => p.length);
    return pool ? pick(pool).id : null;
  }

  startMinigameIntro(kind) {
    const id = this.pickMinigame(kind);
    if (!id) return this.startQuestion();
    this.game.minigame = { id, stage: 'intro', data: {}, ready: {}, awards: {}, results: null, deadline: null };
    this.game.minigamesPlayed.push(id);
    this.log(`Мини-игра: ${id}`);
    this.setPhase('minigame_intro', this.T.MINIGAME_INTRO, () => this.startMinigame());
  }

  startMinigame() {
    const g = this.game;
    const mg = g.minigame;
    if (!mg || g.phase !== 'minigame_intro') return;
    g.phase = 'minigame';
    if (this.connected().length < MINIGAMES[mg.id].minPlayers) {
      this.log(`Мини-игра ${mg.id}: недостаточно игроков, пропускаем`);
      return this.endMinigame();
    }
    MINIGAMES[mg.id].start(this.minigameCtx(), mg);
  }

  minigameCtx() {
    const engine = this;
    const mg = this.game.minigame;
    return {
      game: this.game,
      T: this.T,
      log: (...a) => this.log(...a),
      players: () => this.players(),
      connected: () => this.connected(),
      allConnected: (pred) => this.allConnected(pred),
      broadcast: () => this.broadcast(),
      setStage(stage, ms, fn) {
        mg.stage = stage;
        engine.setTimer(ms, fn);
        mg.deadline = engine.game.deadline;
        engine.broadcast();
      },
      award(pid, pts) {
        if (!engine.game.players[pid] || !pts) return;
        mg.awards[pid] = (mg.awards[pid] || 0) + pts;
      },
      reveal(ms = engine.T.MINIGAME_REVEAL) {
        if (mg.stage === 'reveal') return;
        mg.results = {};
        Object.entries(mg.awards).forEach(([pid, pts]) => {
          const p = engine.game.players[pid];
          if (!p) return;
          const capped = Math.min(C.MINIGAME_MAX_POINTS, pts);
          p.score += capped;
          mg.results[pid] = capped;
        });
        engine.log(`Мини-игра ${mg.id}: итоги ${JSON.stringify(mg.results)}`);
        this.setStage('reveal', ms, () => engine.endMinigame());
      },
    };
  }

  minigameAction(pid, payload) {
    const g = this.game;
    const mg = g.minigame;
    if (!mg || g.phase !== 'minigame' || !g.players[pid]) return;
    const fn = MINIGAMES[mg.id].actions?.[payload.action];
    if (typeof fn === 'function') fn(this.minigameCtx(), mg, pid, payload);
  }

  minigameReady(pid) {
    const g = this.game;
    if (g.phase !== 'minigame_intro' || !g.minigame || !g.players[pid]) return;
    g.minigame.ready[pid] = true;
    this.broadcast();
    if (this.allConnected(id => g.minigame.ready[id])) this.startMinigame();
  }

  endMinigame() {
    this.game.minigame = null;
    this.startQuestion();
  }

  // Игрок отвалился — возможно, теперь «все остальные уже сходили»
  onPlayerLeft(pid) {
    const g = this.game;
    if (g.phase === 'question' && this.allConnected(id => g.answers[id])) this.revealQuestion();
    else if (g.phase === 'final_race' && this.allConnected(id => g.finalRace.answers[id])) this.revealFinal();
    else if (g.phase === 'minigame_intro' && this.allConnected(id => g.minigame.ready[id])) this.startMinigame();
    else if (g.phase === 'minigame' && g.minigame) {
      const mod = MINIGAMES[g.minigame.id];
      const ctx = this.minigameCtx();
      mod.onDisconnect?.(ctx, g.minigame, pid);
      if (g.minigame) mod.checkDone?.(ctx, g.minigame);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Финальная гонка
  // ═══════════════════════════════════════════════════════════════════════

  startFinalRace() {
    const positions = {};
    this.players().forEach(p => {
      positions[p.id] = C.FINAL_START.find(([min]) => p.score >= min)[1];
    });
    this.game.finalRace = { positions, start: { ...positions }, round: 0, question: null, answers: {}, result: null };
    this.log(`Финальная гонка! Старт: ${JSON.stringify(positions)}`);
    this.setPhase('final_race_intro', this.T.FINAL_INTRO, () => this.finalQuestion());
  }

  finalQuestion() {
    const fr = this.game.finalRace;
    fr.round++;
    fr.question = this.nextQuestion();
    fr.answers = {};
    fr.result = null;
    this.log(`Финал, раунд ${fr.round}: ${fr.question.text}`);
    this.setPhase('final_race', this.T.FINAL_QUESTION, () => this.revealFinal());
  }

  revealFinal() {
    const g = this.game;
    const fr = g.finalRace;
    if (g.phase !== 'final_race') return;
    const correct = fr.question.correct;
    const right = Object.entries(fr.answers)
      .filter(([, a]) => a.answerIndex === correct)
      .sort((a, b) => a[1].t - b[1].t);
    const steps = {};
    right.forEach(([pid], i) => {
      steps[pid] = i === 0 ? 2 : 1;
      fr.positions[pid] = (fr.positions[pid] || 0) + steps[pid];
    });
    fr.result = {
      correctIndex: correct,
      answers: Object.fromEntries(Object.entries(fr.answers).map(([id, a]) => [id, a.answerIndex])),
      firstId: right[0]?.[0] || null,
      steps,
    };

    const finished = Object.values(fr.positions).some(pos => pos >= C.FINAL_STEPS);
    const next = (finished || fr.round >= C.FINAL_MAX_ROUNDS)
      ? () => this.declareWinner()
      : () => this.finalQuestion();
    this.setPhase('final_result', this.T.FINAL_RESULT, next);
  }

  declareWinner() {
    const g = this.game;
    const fr = g.finalRace;
    const lastT = (pid) => (fr.result?.steps[pid] ? fr.answers[pid].t : Infinity);
    // Порядок: дальше по трассе → больше очков → раньше ответил в последнем раунде
    const ranking = this.players()
      .map(p => ({ id: p.id, position: fr.positions[p.id] || 0, score: p.score }))
      .sort((a, b) => (b.position - a.position) || (b.score - a.score) || (lastT(a.id) - lastT(b.id)));
    g.winner = { id: ranking[0]?.id || null, ranking };
    this.log('Победитель:', g.players[g.winner.id]?.name);
    this.setPhase('winner', null);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Ведущий (большой экран)
  // ═══════════════════════════════════════════════════════════════════════

  resetGame(keepPlayers) {
    this.clearTimer();
    if (keepPlayers) {
      const kept = {};
      this.players().filter(p => p.connected).forEach(p => {
        Object.assign(p, { score: 0, hindrance: null, helpsUsed: 0, helpActive: true });
        kept[p.id] = p;
      });
      this.game = this.createGame(kept);
      for (const s of this.sockets.values()) {
        if (s.playerId && !kept[s.playerId]) s.playerId = null;
      }
    } else {
      this.game = this.createGame();
      for (const [sid, s] of this.sockets) {
        if (s.role === 'phone') { s.playerId = null; this.send(sid, 'session_reset', {}); }
      }
    }
    this.log(keepPlayers ? 'Новая партия с теми же игроками' : 'Полный сброс');
    this.broadcast();
  }

  // Пропустить текущий таймер (ведущий решил, что пора дальше)
  skip() {
    if (!this.timerFn) return;
    const fn = this.timerFn;
    this.clearTimer();
    this.log('Ведущий пропустил этап');
    fn();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // Представления состояния
  // ═══════════════════════════════════════════════════════════════════════

  publicState() {
    const g = this.game;
    const qPhase = g.phase === 'question' || g.phase === 'question_result';
    const mg = g.minigame;
    const fr = g.finalRace;
    const pub = (q) => q && { id: q.id, text: q.text, answers: q.answers };

    return {
      phase:    g.phase,
      serverNow: this.now(),
      deadline: g.deadline,
      duration: g.duration,
      config: {
        totalQuestions: C.TOTAL_QUESTIONS,
        minigameSpots:  C.MINIGAME_SPOTS,
        finalSteps:     C.FINAL_STEPS,
        minPlayers:     C.MIN_PLAYERS,
        maxPlayers:     C.MAX_PLAYERS,
        helpMax:        C.HELP_MAX,
      },
      characters: CHARACTERS,
      questionNumber: g.questionNumber,
      players: this.players().map(p => ({
        id: p.id, name: p.name, character: p.character, score: p.score,
        connected: p.connected,
        hindranceLevel: p.hindrance?.level || 0,
        helpsUsed: p.helpsUsed,
      })),
      question:       qPhase ? pub(g.question) : null,
      answeredIds:    g.phase === 'question' ? Object.keys(g.answers)
                    : g.phase === 'final_race' ? Object.keys(fr.answers) : [],
      questionResult: g.phase === 'question_result' ? g.questionResult : null,
      minigame: mg && {
        id: mg.id,
        kind: MINIGAMES[mg.id].kind,
        stage: mg.stage,
        deadline: mg.deadline,
        readyIds: Object.keys(mg.ready),
        results: mg.results,
        data: mg.stage === 'intro' ? {} : MINIGAMES[mg.id].publicData(mg),
      },
      finalRace: fr && {
        positions: fr.positions,
        start:     fr.start,
        round:     fr.round,
        question:  pub(fr.question),
        result:    g.phase === 'final_result' ? fr.result : null,
      },
      winner: g.winner,
    };
  }

  privateState(p) {
    const g = this.game;
    const mg = g.minigame;
    let answer = null;
    if (g.phase === 'question' || g.phase === 'question_result') answer = g.answers[p.id]?.answerIndex ?? null;
    if (g.phase === 'final_race' || g.phase === 'final_result') answer = g.finalRace.answers[p.id]?.answerIndex ?? null;
    return {
      id: p.id,
      answer,
      hindrance: g.phase === 'question' ? p.hindrance : null,
      helpActive: p.helpActive,
      minigame: mg && mg.stage !== 'intro'
        ? MINIGAMES[mg.id].privateData(mg, p.id)
        : null,
    };
  }
}

// ═════════════════════════════════════════════════════════════════════════
// Обработчики событий от клиентов
// ═════════════════════════════════════════════════════════════════════════

const HANDLERS = {
  // Первое сообщение клиента: кто я
  hello(sid, s, { role, token }) {
    if (role === 'screen') {
      s.role = 'screen';
      this.send(sid, 'welcome', { playerId: null });
    } else {
      s.role = 'phone';
      const p = this.findByToken(token);
      if (p) {
        this.bindPlayer(sid, s, p);
        this.log(`Переподключился: ${p.name}`);
      }
      this.send(sid, 'welcome', { playerId: p?.id || null, phase: this.game.phase });
    }
    this.broadcast();
  },

  join(sid, s, { name, token }) {
    const g = this.game;
    const existing = this.findByToken(token);
    if (existing) {
      this.bindPlayer(sid, s, existing);
      this.send(sid, 'joined', { playerId: existing.id });
      return this.broadcast();
    }
    if (g.phase !== 'lobby') return this.error(sid, 'Игра уже идёт — дождись следующей партии');
    if (typeof token !== 'string' || token.length < 8) return this.error(sid, 'Ошибка сессии, обнови страницу');
    const clean = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 16);
    if (!clean) return this.error(sid, 'Нужно имя');
    if (this.players().length >= C.MAX_PLAYERS) return this.error(sid, `В игре уже ${C.MAX_PLAYERS} игроков`);
    if (this.players().some(p => p.name.toLowerCase() === clean.toLowerCase())) {
      return this.error(sid, 'Такое имя уже занято');
    }
    const p = this.createPlayer(clean, token);
    g.players[p.id] = p;
    this.bindPlayer(sid, s, p);
    this.log(`Присоединился: ${p.name}`);
    this.send(sid, 'joined', { playerId: p.id });
    this.broadcast();
  },

  leave(sid, s) {
    if (this.game.phase !== 'lobby' || !s.playerId) return;
    const p = this.game.players[s.playerId];
    this.removeFromLobby(s.playerId);
    this.log(`Вышел из лобби: ${p?.name}`);
    this.send(sid, 'session_reset', {});
    this.broadcast();
  },

  select_character(sid, s, { characterId }) {
    const p = this.game.players[s.playerId];
    if (!p) return this.error(sid, 'Сначала войди');
    if (this.game.phase !== 'lobby') return;
    if (!CHARACTERS.some(c => c.id === characterId)) return this.error(sid, 'Нет такого персонажа');
    if (this.players().some(o => o.id !== p.id && o.character === characterId)) {
      return this.error(sid, 'Персонаж уже занят');
    }
    p.character = characterId;
    this.broadcast();
  },

  answer(sid, s, { answerIndex }) {
    if (s.playerId) this.answer(s.playerId, answerIndex);
  },

  mg_ready(sid, s) {
    if (s.playerId) this.minigameReady(s.playerId);
  },

  mg_action(sid, s, payload) {
    if (s.playerId) this.minigameAction(s.playerId, payload);
  },

  // ── Только для большого экрана ───────────────────────────────────────────
  start_game(sid, s) {
    if (s.role !== 'screen') return;
    if (this.game.phase !== 'lobby') return this.error(sid, 'Игра уже началась');
    const ready = this.connected();
    if (ready.length < C.MIN_PLAYERS) return this.error(sid, `Нужно минимум ${C.MIN_PLAYERS} игрока`);
    if (!ready.every(p => p.character)) return this.error(sid, 'Не все выбрали персонажа');
    this.startGame();
  },

  reset_game(sid, s, { keepPlayers }) {
    if (s.role !== 'screen') return;
    this.resetGame(!!keepPlayers);
  },

  host_skip(sid, s) {
    if (s.role !== 'screen') return;
    this.skip();
  },
};

// ═════════════════════════════════════════════════════════════════════════

function validateQuestions(raw, log) {
  const ok = [];
  (raw || []).forEach((q, i) => {
    const valid = q && q.text && Array.isArray(q.answers) && q.answers.length === 4 &&
      Number.isInteger(Number(q.correct)) && q.correct >= 0 && q.correct < 4;
    if (valid) ok.push({ id: q.id ?? i + 1, text: q.text, answers: q.answers, correct: Number(q.correct) });
    else log('[GAME]', `Вопрос #${i + 1} пропущен: неверный формат`, q);
  });
  if (ok.length < C.TOTAL_QUESTIONS + 5) {
    log('[GAME]', `Внимание: всего ${ok.length} вопросов — в финале возможны повторы`);
  }
  return ok;
}

module.exports = { Engine };
