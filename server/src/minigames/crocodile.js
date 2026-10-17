// «Крокодил» — длинная мини-игра.
//
// Ведущий видит слово на своём телефоне и показывает его жестами перед экраном.
// Остальные вводят догадки на телефонах (сколько угодно попыток).
// Угадал первым — +2, ведущему +1. Ведущий может дважды сменить слово.

const { CROC_WORDS } = require('../content');
const { pick, shuffle, wordMatches } = require('../utils');

const MAX_SKIPS   = 2;
const MAX_GUESSES = 12; // сколько последних догадок показываем

module.exports = {
  id: 'crocodile',
  kind: 'long',
  minPlayers: 2,

  start(ctx, mg) {
    const showman = pick(ctx.connected());
    const deck    = shuffle(CROC_WORDS);
    mg.data = { showmanId: showman.id, deck, word: deck.pop(), guesses: [], winnerId: null, skips: 0 };
    ctx.log(`Crocodile: ведущий = ${showman.name}, слово = ${mg.data.word}`);
    ctx.setStage('show', ctx.T.CROC_SHOW, () => this.finish(ctx, mg));
  },

  actions: {
    guess(ctx, mg, pid, { text }) {
      const d = mg.data;
      if (mg.stage !== 'show' || pid === d.showmanId) return;
      const t = String(text || '').trim().slice(0, 40);
      if (!t) return;
      d.guesses.push({ playerId: pid, text: t });
      if (d.guesses.length > MAX_GUESSES) d.guesses.shift();
      if (wordMatches(t, d.word)) {
        d.winnerId = pid;
        ctx.award(pid, 2);
        ctx.award(d.showmanId, 1);
        ctx.log(`Crocodile: ${ctx.game.players[pid]?.name} угадал`);
        return module.exports.finish(ctx, mg);
      }
      ctx.broadcast();
    },
    skip_word(ctx, mg, pid) {
      const d = mg.data;
      if (mg.stage !== 'show' || pid !== d.showmanId || d.skips >= MAX_SKIPS) return;
      d.skips++;
      d.word = d.deck.pop();
      d.guesses = [];
      ctx.broadcast();
    },
  },

  onDisconnect(ctx, mg, pid) {
    // Ведущий ушёл — показывать некому
    if (mg.stage === 'show' && pid === mg.data.showmanId) this.finish(ctx, mg);
  },

  finish(ctx, mg) {
    if (mg.stage !== 'show') return;
    mg.data.revealed = true;
    ctx.reveal();
  },

  publicData(mg) {
    const d = mg.data;
    const base = {
      showmanId: d.showmanId,
      wordShape: d.word.split(' ').map(w => w.length),
      guesses:   d.guesses,
      skips:     d.skips,
      maxSkips:  MAX_SKIPS,
    };
    return d.revealed ? { ...base, word: d.word, winnerId: d.winnerId, revealed: true } : base;
  },

  privateData(mg, pid) {
    const d = mg.data;
    return pid === d.showmanId ? { role: 'showman', word: d.word } : { role: 'guesser' };
  },
};
