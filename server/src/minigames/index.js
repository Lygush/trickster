// Реестр серверных мини-игр.
//
// Чтобы добавить мини-игру: создай модуль рядом (см. three_paths.js как образец)
// и добавь его в список ниже. Интерфейс модуля:
//   id, kind ('short'|'long'), minPlayers
//   start(ctx, mg)                         — инициализация mg.data и первой стадии
//   actions: { name(ctx, mg, pid, payload) } — действия с телефонов (событие mg_action)
//   checkDone(ctx, mg)                     — (опц.) проверка «все сделали ход»
//   onDisconnect(ctx, mg, pid)             — (опц.) реакция на уход игрока
//   publicData(mg)                         — что видят все (без секретов!)
//   privateData(mg, pid)                   — что видит конкретный игрок
// Очки начисляются через ctx.award(pid, pts) и применяются в ctx.reveal()
// с ограничением MINIGAME_MAX_POINTS на игрока.

const list = [
  require('./three_paths'),
  require('./personality_vote'),
  require('./spy'),
  require('./aanansi_story'),
  require('./crocodile'),
];

module.exports = Object.fromEntries(list.map(m => [m.id, m]));
