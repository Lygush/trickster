// «Три тропинки» — короткая мини-игра на удачу.
//
// Каждый выбирает одну из трёх троп. Выборы видны всем (можно идти за толпой).
// Верная тропа: +1 очко; если на верной тропе ты один — +2.

const { PATH_FLAVORS, ANANSI_PATH_LINES } = require('../content');
const { pick } = require('../utils');

module.exports = {
  id: 'three_paths',
  kind: 'short',
  minPlayers: 2,

  start(ctx, mg) {
    mg.data = {
      paths:      pick(PATH_FLAVORS),
      winPath:    Math.floor(Math.random() * 3),
      choices:    {},
      anansiLine: pick(ANANSI_PATH_LINES),
    };
    ctx.log(`Three Paths: верная тропа = ${mg.data.winPath}`);
    ctx.setStage('choose', ctx.T.THREE_PATHS, () => this.finish(ctx, mg));
  },

  actions: {
    choose(ctx, mg, pid, { pathIndex }) {
      if (mg.stage !== 'choose') return;
      if (!Number.isInteger(pathIndex) || pathIndex < 0 || pathIndex > 2) return;
      if (mg.data.choices[pid] !== undefined) return;
      mg.data.choices[pid] = pathIndex;
      ctx.broadcast();
      module.exports.checkDone(ctx, mg);
    },
  },

  checkDone(ctx, mg) {
    if (mg.stage === 'choose' && ctx.allConnected(pid => mg.data.choices[pid] !== undefined)) {
      this.finish(ctx, mg);
    }
  },

  finish(ctx, mg) {
    if (mg.stage !== 'choose') return;
    const { choices, winPath } = mg.data;
    const winners = Object.keys(choices).filter(pid => choices[pid] === winPath);
    const pts = winners.length === 1 ? 2 : 1;
    winners.forEach(pid => ctx.award(pid, pts));
    mg.data.revealed = true;
    ctx.reveal();
  },

  publicData(mg) {
    const { winPath, ...rest } = mg.data;
    return mg.data.revealed ? mg.data : rest;
  },

  privateData(mg, pid) {
    return { myChoice: mg.data.choices?.[pid] ?? null };
  },
};
