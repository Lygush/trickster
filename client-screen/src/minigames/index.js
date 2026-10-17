// ─────────────────────────────────────────────────────────────────────────────
// РЕЕСТР МИНИ-ИГР  (client-screen)
//
// Чтобы добавить новую мини-игру:
//   1. Серверный модуль: server/src/minigames/<id>.js
//   2. Экран: src/minigames/<id>/ScreenView.jsx, телефон: client-phone/.../PhoneView.jsx
//   3. Название и правила — в shared/constants.js (MINIGAME_INFO)
//   4. Одна запись ниже. App трогать не нужно.
//
// stages — подписи стадий для шапки (ключ = mg.stage с сервера).
// ─────────────────────────────────────────────────────────────────────────────

import ThreePathsScreen      from './three_paths/ScreenView';
import SpyScreen             from './spy/ScreenView';
import PersonalityVoteScreen from './personality_vote/ScreenView';
import AanansiStoryScreen    from './aanansi_story/ScreenView';
import CrocodileScreen       from './crocodile/ScreenView';

const MINIGAMES = {
  three_paths:      { ScreenView: ThreePathsScreen,      stages: { choose: 'Выбор тропы', reveal: 'Итоги' } },
  personality_vote: { ScreenView: PersonalityVoteScreen, stages: { vote: 'Голосование', reveal: 'Итоги' } },
  spy:              { ScreenView: SpyScreen,             stages: { discuss: 'Обсуждение', vote: 'Голосование', reveal: 'Разоблачение' } },
  aanansi_story:    { ScreenView: AanansiStoryScreen,    stages: { write: 'Пишем', vote: 'Голосование', reveal: 'Авторы' } },
  crocodile:        { ScreenView: CrocodileScreen,       stages: { show: 'Показываем', reveal: 'Итоги' } },
};

export default MINIGAMES;
