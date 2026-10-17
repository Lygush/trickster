// config.js — все игровые константы и тайминги в одном месте.
//
// TIME_SCALE (env) — множитель для всех таймеров. Например TIME_SCALE=0.2
// ускоряет игру в 5 раз (удобно для отладки и автотестов).

const TIME_SCALE = Math.max(0.01, parseFloat(process.env.TIME_SCALE) || 1);
const sec = (s) => Math.round(s * 1000 * TIME_SCALE);

module.exports = {
  PORT: parseInt(process.env.PORT, 10) || 3001,
  TIME_SCALE,

  // ── Состав ──────────────────────────────────────────────────────────────
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 5,               // по числу персонажей

  // ── Основной маршрут ────────────────────────────────────────────────────
  TOTAL_QUESTIONS: 11,
  MINIGAME_SPOTS: [3, 6, 9],    // после этих вопросов — мини-игра
  MINIGAME_KINDS: ['short', 'long', 'short'], // тип мини-игры для каждой точки
  MINIGAME_MAX_POINTS: 3,       // максимум очков одному игроку за мини-игру

  // ── Помехи лидеру (отрыв от ближайшего преследователя) ─────────────────
  HINDRANCE_GAPS: [2, 4, 6],    // ≥2 → ур.1, ≥4 → ур.2, ≥6 → ур.3
  HINDRANCE_MAX_STREAK: 2,      // после 2 вопросов подряд с помехой — 1 вопрос передышки

  // ── Помощь отстающему ───────────────────────────────────────────────────
  HELP_GAP: 5,                  // отрыв лидера от игрока
  HELP_MAX: 3,                  // не более 3 раз за партию

  // ── Финальная гонка ─────────────────────────────────────────────────────
  FINAL_STEPS: 12,
  FINAL_START: [ [12, 4], [8, 3], [4, 2], [0, 1] ], // [минимум очков, стартовая клетка]
  FINAL_MAX_ROUNDS: 20,         // страховка: если никто не дошёл — побеждает самый дальний

  // ── Тайминги ────────────────────────────────────────────────────────────
  T: {
    INTRO:            sec(4),
    QUESTION:         sec(30),
    QUESTION_RESULT:  sec(9),
    MINIGAME_INTRO:   sec(12),   // правила; игроки могут нажать «Готов»
    FINAL_INTRO:      sec(6),
    FINAL_QUESTION:   sec(10),
    FINAL_RESULT:     sec(5),

    THREE_PATHS:      sec(20),
    VOTE:             sec(20),
    SPY_DISCUSS:      sec(90),
    SPY_VOTE:         sec(25),
    STORY_WRITE:      sec(60),
    STORY_VOTE:       sec(25),
    CROC_SHOW:        sec(60),
    MINIGAME_REVEAL:  sec(8),
    MINIGAME_REVEAL_LONG: sec(11),
  },
};
