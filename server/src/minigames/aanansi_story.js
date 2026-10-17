// «История Ананси» — длинная мини-игра.
//
// 1) write — Ананси начинает историю, каждый пишет продолжение (до 200 символов).
// 2) vote  — на экране анонимные варианты, каждый голосует за лучший (не за свой).
// 3) reveal — открываются авторы. Очки: +1 за каждый полученный голос (максимум 3).

const { STORY_PROMPTS } = require('../content');
const { pick, shuffle, randomId } = require('../utils');

const MAX_LEN = 200;

module.exports = {
  id: 'aanansi_story',
  kind: 'long',
  minPlayers: 2,

  start(ctx, mg) {
    mg.data = { prompt: pick(STORY_PROMPTS), submissions: {}, entries: [], votes: {} };
    ctx.setStage('write', ctx.T.STORY_WRITE, () => this.toVote(ctx, mg));
  },

  toVote(ctx, mg) {
    if (mg.stage !== 'write') return;
    const d = mg.data;
    d.entries = shuffle(Object.entries(d.submissions))
      .map(([authorId, text]) => ({ id: randomId(), authorId, text }));
    if (d.entries.length < 2) {
      // Голосовать не за что — сразу показываем то, что есть
      return this.finish(ctx, mg, true);
    }
    ctx.setStage('vote', ctx.T.STORY_VOTE, () => this.finish(ctx, mg));
  },

  actions: {
    submit(ctx, mg, pid, { text }) {
      if (mg.stage !== 'write' || mg.data.submissions[pid] !== undefined) return;
      const t = String(text || '').trim().slice(0, MAX_LEN);
      if (!t) return;
      mg.data.submissions[pid] = t;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
    vote(ctx, mg, pid, { entryId }) {
      if (mg.stage !== 'vote' || mg.data.votes[pid] !== undefined) return;
      const entry = mg.data.entries.find(e => e.id === entryId);
      if (!entry || entry.authorId === pid) return;
      mg.data.votes[pid] = entryId;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
  },

  // Может ли игрок голосовать (есть ли хоть одна чужая история)
  canVote(mg, pid) {
    return mg.data.entries.some(e => e.authorId !== pid);
  },

  checkDone(ctx, mg) {
    const d = mg.data;
    if (mg.stage === 'write' && ctx.allConnected(pid => d.submissions[pid] !== undefined)) {
      this.toVote(ctx, mg);
    } else if (mg.stage === 'vote' &&
               ctx.allConnected(pid => d.votes[pid] !== undefined || !this.canVote(mg, pid))) {
      this.finish(ctx, mg);
    }
  },

  finish(ctx, mg, force = false) {
    if (mg.stage !== 'vote' && !force) return;
    const d = mg.data;
    const counts = {};
    Object.values(d.votes).forEach(eid => { counts[eid] = (counts[eid] || 0) + 1; });
    d.entries.forEach(e => {
      e.votes = counts[e.id] || 0;
      if (e.votes > 0) ctx.award(e.authorId, e.votes);
    });
    d.entries.sort((a, b) => b.votes - a.votes);
    d.revealed = true;
    ctx.reveal(ctx.T.MINIGAME_REVEAL_LONG);
  },

  publicData(mg) {
    const d = mg.data;
    if (d.revealed) return { prompt: d.prompt, entries: d.entries, revealed: true };
    if (mg.stage === 'vote') {
      return {
        prompt: d.prompt,
        entries: d.entries.map(e => ({ id: e.id, text: e.text })),
        votedIds: Object.keys(d.votes),
      };
    }
    return { prompt: d.prompt, submittedIds: Object.keys(d.submissions) };
  },

  privateData(mg, pid) {
    const d = mg.data;
    return {
      mySubmission: d.submissions[pid] ?? null,
      myEntryId:    d.entries.find(e => e.authorId === pid)?.id ?? null,
      myVote:       d.votes[pid] ?? null,
    };
  },
};
