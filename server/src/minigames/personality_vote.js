// «Голосование» — короткая мини-игра «угадай мнение стаи».
//
// Ананси задаёт вопрос про игроков. Каждый голосует за другого игрока
// (за себя нельзя). Кто проголосовал за того же, за кого большинство, — +1.
// «Избранник» получает метку Ананси, но очков не теряет.

const { VOTE_QUESTIONS } = require('../content');
const { pick } = require('../utils');

module.exports = {
  id: 'personality_vote',
  kind: 'short',
  minPlayers: 2,

  start(ctx, mg) {
    mg.data = { question: pick(VOTE_QUESTIONS), votes: {} };
    ctx.setStage('vote', ctx.T.VOTE, () => this.finish(ctx, mg));
  },

  actions: {
    vote(ctx, mg, pid, { targetId }) {
      if (mg.stage !== 'vote') return;
      if (targetId === pid || !ctx.game.players[targetId]) return;
      if (mg.data.votes[pid] !== undefined) return;
      mg.data.votes[pid] = targetId;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
  },

  checkDone(ctx, mg) {
    if (mg.stage === 'vote' && ctx.allConnected(pid => mg.data.votes[pid] !== undefined)) {
      this.finish(ctx, mg);
    }
  },

  finish(ctx, mg) {
    if (mg.stage !== 'vote') return;
    const counts = {};
    Object.values(mg.data.votes).forEach(t => { counts[t] = (counts[t] || 0) + 1; });
    const max = Math.max(0, ...Object.values(counts));
    const top = max > 0 ? Object.keys(counts).filter(id => counts[id] === max) : [];
    Object.entries(mg.data.votes).forEach(([voter, target]) => {
      if (top.includes(target)) ctx.award(voter, 1);
    });
    mg.data.counts = counts;
    mg.data.top    = top;
    mg.data.revealed = true;
    ctx.reveal();
  },

  publicData(mg) {
    const d = mg.data;
    if (d.revealed) return d;
    return { question: d.question, votedIds: Object.keys(d.votes) };
  },

  privateData(mg, pid) {
    return { myVote: mg.data.votes?.[pid] ?? null };
  },
};
