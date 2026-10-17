// test/simulate.js — прогон полных партий ботами на виртуальном времени.
//
//   node test/simulate.js            — серия партий с проверками
//
// Не требует socket.io: работает напрямую с Engine. Время виртуальное,
// поэтому партия из ~15 минут проходит за доли секунды.

const assert = require('assert');
const { Engine } = require('../src/engine');
const C = require('../src/config');
const MINIGAMES = require('../src/minigames');
const QUESTIONS = require('../data/questions.json');

// ── Виртуальные часы ─────────────────────────────────────────────────────────
function makeClock() {
  let now = 1_000_000, seq = 0;
  const queue = new Map();
  return {
    now: () => now,
    setTimeout(fn, ms) { const id = ++seq; queue.set(id, { at: now + ms, fn, id }); return id; },
    clearTimeout(id) { queue.delete(id); },
    step() {
      if (!queue.size) return false;
      const next = [...queue.values()].sort((a, b) => a.at - b.at || a.id - b.id)[0];
      queue.delete(next.id);
      now = Math.max(now, next.at);
      next.fn();
      return true;
    },
    pending: () => queue.size,
  };
}

// ── Бот-телефон ──────────────────────────────────────────────────────────────
class Bot {
  constructor(sim, name, opts = {}) {
    Object.assign(this, { sim, name, token: 'tok_' + name + '_xxxxxxxx', opts });
    this.sid = sim.newSid();
    this.state = null; this.playerId = null; this.events = [];
    this.done = new Set();
  }
  connect() {
    this.sid = this.sim.newSid();
    this.sim.bind(this.sid, this);
    this.sim.engine.connect(this.sid);
    this.emit('hello', { role: 'phone', token: this.token });
  }
  emit(ev, p) { this.sim.engine.handle(this.sid, ev, p); }
  later(ms, fn) { this.sim.clock.setTimeout(fn, ms); }
  once(key, ms, fn) { if (this.done.has(key)) return; this.done.add(key); this.later(ms, fn); }
  rnd(n) { return Math.floor(Math.random() * n); }

  receive(event, data) {
    this.events.push(event);
    if (event === 'welcome' && !data.playerId) this.emit('join', { name: this.name, token: this.token });
    if (event === 'joined' || (event === 'welcome' && data.playerId)) this.playerId = data.playerId;
    if (event === 'session_reset') { this.playerId = null; this.later(50, () => this.emit('join', { name: this.name, token: this.token })); }
    if (event === 'game_state') { this.state = data; this.act(data); }
  }

  act(st) {
    const me = st.me;
    if (!me) return;
    const mine = st.players.find(p => p.id === me.id);
    if (st.phase === 'lobby' && !mine.character) {
      const taken = st.players.map(p => p.character);
      const free = st.characters.find(c => !taken.includes(c.id));
      this.once('char' + st.serverNow, 30 + this.rnd(200), () => this.emit('select_character', { characterId: free.id }));
    }
    if (st.phase === 'question' && me.answer === null) {
      const q = st.question;
      const h = me.hindrance;
      const key = `q${q.id}_${h?.resetPending ? 'r' : ''}`;
      const wait = Math.max(0, (h?.lockedUntil || 0) - st.serverNow) + 300 + this.rnd(4000);
      const skill = this.opts.skill ?? 0.6;
      this.once(key, wait, () => {
        const correct = QUESTIONS.find(x => x.id === q.id).correct;
        this.emit('answer', { answerIndex: Math.random() < skill ? correct : (correct + 1) % 4 });
      });
    }
    if (st.phase === 'final_race' && me.answer === null) {
      const q = st.finalRace.question;
      this.once(`f${st.finalRace.round}`, 200 + this.rnd(3000), () => {
        const correct = QUESTIONS.find(x => x.id === q.id).correct;
        this.emit('answer', { answerIndex: Math.random() < 0.7 ? correct : (correct + 2) % 4 });
      });
    }
    if (st.phase === 'minigame_intro') this.once('ready' + st.questionNumber, 500 + this.rnd(2000), () => this.emit('mg_ready'));
    if (st.phase === 'minigame') this.playMinigame(st, st.minigame, me.minigame || {});
  }

  playMinigame(st, mg, priv) {
    const others = st.players.filter(p => p.id !== this.playerId);
    const k = `${mg.id}_${st.questionNumber}_${mg.stage}`;
    const act = (action, payload = {}) => this.emit('mg_action', { action, ...payload });
    switch (mg.id) {
      case 'three_paths':
        if (mg.stage === 'choose' && priv.myChoice === null) this.once(k, 500 + this.rnd(3000), () => act('choose', { pathIndex: this.rnd(3) }));
        break;
      case 'personality_vote':
        if (mg.stage === 'vote' && priv.myVote === null) this.once(k, 500 + this.rnd(3000), () => act('vote', { targetId: others[this.rnd(others.length)].id }));
        break;
      case 'spy':
        assert(!('word' in mg.data) || mg.data.revealed, 'слово шпиона утекло в публичное состояние');
        assert(!('spyId' in mg.data) || mg.data.revealed, 'шпион утёк в публичное состояние');
        if (mg.stage === 'discuss') this.once(k, 1000 + this.rnd(5000), () => act('ready'));
        if (mg.stage === 'vote') {
          this.once(k, 500 + this.rnd(3000), () => act('vote', { targetId: others[this.rnd(others.length)].id }));
          if (priv.role === 'spy') this.once(k + 'g', 800, () => act('guess', { word: priv.options[this.rnd(priv.options.length)] }));
        }
        break;
      case 'aanansi_story':
        if (mg.stage === 'write') this.once(k, 2000 + this.rnd(8000), () => act('submit', { text: `${this.name} рассказывает: и тогда паук всех перехитрил!` }));
        if (mg.stage === 'vote') {
          const opts = mg.data.entries.filter(e => e.id !== priv.myEntryId);
          if (opts.length) this.once(k, 500 + this.rnd(3000), () => act('vote', { entryId: opts[this.rnd(opts.length)].id }));
        }
        break;
      case 'crocodile':
        assert(!mg.data.word || mg.data.revealed, 'слово крокодила утекло в публичное состояние');
        if (mg.stage === 'show' && priv.role === 'guesser') {
          const n = mg.data.guesses.length;
          this.once(k + n, 2000 + this.rnd(6000), () => {
            const word = this.sim.engine.game.minigame?.data.word;
            act('guess', { text: Math.random() < 0.15 && word ? word.toUpperCase() : 'банан' });
          });
        }
        if (mg.stage === 'show' && priv.role === 'showman') {
          assert(priv.word, 'ведущий не видит слово');
          if (mg.data.skips === 0) this.once(k + 'skip', 3000, () => act('skip_word'));
        }
        break;
    }
  }
}

// ── Симуляция ────────────────────────────────────────────────────────────────
class Sim {
  constructor() {
    this.clock = makeClock();
    this.sockets = new Map();
    this.sidSeq = 0;
    this.logs = [];
    this.screenStates = [];
    this.engine = new Engine({
      questions: QUESTIONS,
      scheduler: this.clock,
      log: (...a) => this.logs.push(a.join(' ')),
      send: (sid, ev, data) => {
        const target = this.sockets.get(sid);
        if (target === 'screen') { if (ev === 'game_state') this.screenStates.push(data); }
        else target?.receive(ev, JSON.parse(JSON.stringify(data)));
      },
    });
    this.screenSid = this.newSid();
    this.sockets.set(this.screenSid, 'screen');
    this.engine.connect(this.screenSid);
    this.engine.handle(this.screenSid, 'hello', { role: 'screen' });
  }
  newSid() { return 's' + (++this.sidSeq); }
  bind(sid, bot) { this.sockets.set(sid, bot); }
  screen(ev, p) { this.engine.handle(this.screenSid, ev, p); }
  run(until, maxSteps = 200000) {
    for (let i = 0; i < maxSteps; i++) {
      if (until()) return true;
      if (!this.clock.step()) return until();
    }
    throw new Error('Слишком много шагов — игра зависла? Фаза: ' + this.engine.game.phase);
  }
}

function playGame({ names, forceMinigames, disconnectTest = false, sim = null, bots = null }) {
  sim = sim || new Sim();
  if (!bots) {
    bots = names.map((n, i) => new Bot(sim, n, { skill: i === 0 ? 0.95 : 0.35 }));
    bots.forEach(b => b.connect());
  }
  if (forceMinigames) {
    const queue = [...forceMinigames];
    sim.engine.pickMinigame = () => queue.shift() || 'three_paths';
  }

  sim.run(() => sim.engine.players().length === bots.length && sim.engine.players().every(p => p.character));
  sim.screen('start_game');
  assert.strictEqual(sim.engine.game.phase, 'intro', 'игра не стартовала');

  const seenPhases = new Set();
  const seenMinigames = new Set();
  let reconnected = false;

  sim.run(() => {
    const g = sim.engine.game;
    seenPhases.add(g.phase);
    if (g.minigame) seenMinigames.add(g.minigame.id);

    if (disconnectTest && !reconnected && g.phase === 'question' && g.questionNumber === 5) {
      // Игрок «закрыл вкладку» и вернулся через секунду — с тем же token
      const b = bots[1];
      const before = sim.engine.game.players[b.playerId];
      const scoreBefore = before.score;
      sim.engine.disconnect(b.sid);
      assert.strictEqual(before.connected, false);
      reconnected = true;
      b.later(1000, () => {
        b.connect();
        const after = sim.engine.game.players[b.playerId];
        assert.strictEqual(after, before, 'после переподключения игрок другой');
        assert.strictEqual(after.score, scoreBefore, 'очки потерялись при переподключении');
        assert.strictEqual(after.connected, true);
      });
    }
    return g.phase === 'winner';
  });

  const g = sim.engine.game;
  assert(g.winner?.id, 'нет победителя');
  const ranking = g.winner.ranking;
  assert.strictEqual(ranking[0].id, g.winner.id);
  for (let i = 1; i < ranking.length; i++) {
    const a = ranking[i - 1], b = ranking[i];
    assert(a.position > b.position || (a.position === b.position && a.score >= b.score), 'рейтинг отсортирован неверно');
  }
  assert.strictEqual(g.minigamesPlayed.length, C.MINIGAME_SPOTS.length, 'сыграно не 3 мини-игры');
  ['question', 'question_result', 'minigame_intro', 'minigame', 'final_race_intro', 'final_race', 'final_result', 'winner']
    .forEach(ph => assert(seenPhases.has(ph), `фаза ${ph} не встретилась`));
  const errs = sim.logs.filter(l => l.includes('Ошибка'));
  assert.strictEqual(errs.length, 0, 'ошибки в логе:\n' + errs.join('\n'));
  // Вопросы в партии не повторяются
  assert.strictEqual(g.usedQuestionIds.size, g.questionNumber + g.finalRace.round, 'вопросы повторились');
  return { sim, bots, g, seenMinigames };
}

module.exports = { Sim, Bot, playGame, makeClock };
if (require.main !== module) return;

// ── Тесты ────────────────────────────────────────────────────────────────────
let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ✓', name); }
  catch (e) { console.error('  ✗', name, '\n    ', e.stack); process.exitCode = 1; }
}

console.log('Симуляция партий «Сквозь чащу»');

test('2 игрока, полная партия', () => {
  playGame({ names: ['Аня', 'Боря'] });
});

test('5 игроков, все мини-игры по очереди (2 партии подряд с теми же игроками)', () => {
  const order = ['spy', 'three_paths', 'aanansi_story', 'personality_vote', 'crocodile', 'spy'];
  const first = playGame({ names: ['Аня', 'Боря', 'Вика', 'Гоша', 'Даша'], forceMinigames: order.slice(0, 3) });
  first.sim.screen('reset_game', { keepPlayers: true });
  assert.strictEqual(first.sim.engine.game.phase, 'lobby');
  assert.strictEqual(first.sim.engine.players().length, 5, 'игроки не сохранились');
  assert(first.sim.engine.players().every(p => p.score === 0 && p.character), 'сброс очков/персонажей');
  const second = playGame({ names: [], forceMinigames: order.slice(3), sim: first.sim, bots: first.bots });
  const all = new Set([...first.seenMinigames, ...second.seenMinigames]);
  Object.keys(MINIGAMES).forEach(id => assert(all.has(id), `мини-игра ${id} не сыграна`));
});

test('Переподключение посреди партии сохраняет игрока', () => {
  playGame({ names: ['Аня', 'Боря', 'Вика'], disconnectTest: true });
});

test('Шпион не выбирается при 2 игроках', () => {
  const sim = new Sim();
  ['А1', 'Б1'].forEach(n => new Bot(sim, n).connect());
  for (let i = 0; i < 50; i++) assert.notStrictEqual(sim.engine.pickMinigame('long'), 'spy');
});

test('Помехи лидеру и помощь отстающему срабатывают', () => {
  let hind = 0, help = 0;
  for (let i = 0; i < 6; i++) {
    const { sim } = playGame({ names: ['Профи', 'Новичок', 'Средний'] });
    hind += sim.logs.filter(l => l.includes('Помеха ур.')).length;
    help += sim.logs.filter(l => l.includes('Ананси подтолкнул')).length;
    sim.engine.players().forEach(p => assert(p.helpsUsed <= C.HELP_MAX, 'превышен лимит помощи'));
  }
  assert(hind > 0, 'помехи ни разу не сработали');
  assert(help > 0, 'помощь ни разу не сработала');
});

test('Только экран может стартовать и сбрасывать игру', () => {
  const sim = new Sim();
  const bots = ['А', 'Б'].map(n => new Bot(sim, n));
  bots.forEach(b => b.connect());
  sim.run(() => sim.engine.players().every(p => p.character) && sim.engine.players().length === 2);
  bots[0].emit('start_game');
  assert.strictEqual(sim.engine.game.phase, 'lobby');
  bots[0].emit('reset_game', {});
  assert.strictEqual(sim.engine.players().length, 2);
});

test('Нельзя войти с занятым именем и сверх лимита', () => {
  const sim = new Sim();
  const a = new Bot(sim, 'Аня'); a.connect();
  const dup = new Bot(sim, 'аня'); dup.token = 'other_token_123'; dup.connect();
  sim.run(() => true);
  assert.strictEqual(sim.engine.players().length, 1);
  assert(dup.events.includes('game_error'));
  for (let i = 0; i < 6; i++) new Bot(sim, 'X' + i).connect();
  assert.strictEqual(sim.engine.players().length, C.MAX_PLAYERS);
});

console.log(`\n${passed} тестов пройдено${process.exitCode ? ', есть ошибки' : ''}`);
