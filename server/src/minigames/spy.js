// «Шпион» — длинная мини-игра (от 3 игроков).
//
// Всем, кроме шпиона, показывается секретное слово. Шпион слова не знает.
// 1) discuss — обсуждение вслух (задавайте друг другу вопросы про слово).
//    Каждый может нажать «Готов голосовать»; когда готовы все — голосование.
// 2) vote — все голосуют, кто шпион. Шпион тоже голосует (чтобы не выдать себя)
//    и пытается угадать слово из списка вариантов.
// Очки: шпиона поймали (у него строго больше всех голосов) — каждый, кто голосовал
// за шпиона, +2. Не поймали — шпион +2. Шпион угадал слово — ещё +1.

const { SPY_WORDS, SPY_OPTIONS } = require('../content');
const { pick, shuffle } = require('../utils');

module.exports = {
  id: 'spy',
  kind: 'long',
  minPlayers: 3,

  start(ctx, mg) {
    const spy  = pick(ctx.connected());
    const word = pick(SPY_WORDS);
    const options = shuffle([word, ...shuffle(SPY_WORDS.filter(w => w !== word)).slice(0, SPY_OPTIONS - 1)]);
    mg.data = { spyId: spy.id, word, options, ready: {}, votes: {}, spyGuess: null };
    ctx.log(`Spy: шпион = ${spy.name}, слово = ${word}`);
    ctx.setStage('discuss', ctx.T.SPY_DISCUSS, () => this.startVote(ctx, mg));
  },

  startVote(ctx, mg) {
    if (mg.stage !== 'discuss') return;
    ctx.setStage('vote', ctx.T.SPY_VOTE, () => this.finish(ctx, mg));
  },

  actions: {
    ready(ctx, mg, pid) {
      if (mg.stage !== 'discuss' || mg.data.ready[pid]) return;
      mg.data.ready[pid] = true;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
    vote(ctx, mg, pid, { targetId }) {
      if (mg.stage !== 'vote') return;
      if (targetId === pid || !ctx.game.players[targetId]) return;
      if (mg.data.votes[pid] !== undefined) return;
      mg.data.votes[pid] = targetId;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
    guess(ctx, mg, pid, { word }) {
      if (mg.stage !== 'vote' || pid !== mg.data.spyId) return;
      if (mg.data.spyGuess !== null || !mg.data.options.includes(word)) return;
      mg.data.spyGuess = word;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
  },

  checkDone(ctx, mg) {
    const d = mg.data;
    if (mg.stage === 'discuss' && ctx.allConnected(pid => d.ready[pid])) {
      this.startVote(ctx, mg);
    } else if (mg.stage === 'vote') {
      const spyConnected = ctx.game.players[d.spyId]?.connected;
      const allVoted = ctx.allConnected(pid => d.votes[pid] !== undefined);
      if (allVoted && (!spyConnected || d.spyGuess !== null)) this.finish(ctx, mg);
    }
  },

  finish(ctx, mg) {
    if (mg.stage !== 'vote') return;
    const d = mg.data;
    const counts = {};
    Object.values(d.votes).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    const spyVotes = counts[d.spyId] || 0;
    const caught = spyVotes > 0 &&
      Object.entries(counts).every(([id, c]) => id === d.spyId || c < spyVotes);

    if (caught) {
      Object.entries(d.votes).forEach(([voter, t]) => {
        if (t === d.spyId && voter !== d.spyId) ctx.award(voter, 2);
      });
    } else {
      ctx.award(d.spyId, 2);
    }
    if (d.spyGuess === d.word) ctx.award(d.spyId, 1);

    d.counts   = counts;
    d.caught   = caught;
    d.revealed = true;
    ctx.log(`Spy: ${caught ? 'пойман' : 'ушёл'}, догадка шпиона: ${d.spyGuess}`);
    ctx.reveal(ctx.T.MINIGAME_REVEAL_LONG);
  },

  publicData(mg) {
    const d = mg.data;
    if (d.revealed) {
      return { spyId: d.spyId, word: d.word, votes: d.votes, counts: d.counts,
               caught: d.caught, spyGuess: d.spyGuess, revealed: true };
    }
    return {
      readyIds: Object.keys(d.ready),
      votedIds: Object.keys(d.votes),
      spyGuessed: d.spyGuess !== null,
    };
  },

  privateData(mg, pid) {
    const d = mg.data;
    const isSpy = pid === d.spyId;
    return {
      role:    isSpy ? 'spy' : 'civilian',
      word:    isSpy ? null : d.word,
      options: isSpy ? d.options : null,
      ready:   !!d.ready[pid],
      myVote:  d.votes[pid] ?? null,
      myGuess: isSpy ? d.spyGuess : null,
    };
  },
};
