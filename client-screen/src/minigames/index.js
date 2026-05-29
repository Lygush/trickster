// ─────────────────────────────────────────────────────────────────────────────
// РЕЕСТР МИНИ-ИГР  (client-screen)
//
// Чтобы добавить новую мини-игру:
//   1. Создай папку src/minigames/<id>/
//   2. Положи туда ScreenView.jsx
//   3. Добавь одну запись ниже — и всё.
//      App.jsx трогать не нужно.
// ─────────────────────────────────────────────────────────────────────────────

import ThreePathsScreen      from './three_paths/ScreenView';
import SpyScreen             from './spy/ScreenView';
import PersonalityVoteScreen from './personality_vote/ScreenView';
import AanansiStoryScreen    from './aanansi_story/ScreenView';
import CrocodileScreen       from './crocodile/ScreenView';

/**
 * @typedef {Object} MinigameDef
 * @property {string}               id          — совпадает с id на сервере
 * @property {string}               name        — отображаемое название
 * @property {string}               desc        — описание для интро
 * @property {boolean}              short       — короткая/длинная
 * @property {React.Component|null} ScreenView  — компонент для большого экрана
 */

/** @type {Record<string, MinigameDef>} */
const MINIGAMES = {
  three_paths: {
    id:          'three_paths',
    name:        'Три тропинки',
    desc:        'Ананси приготовил три тропинки. Выбери одну — удача решит всё!',
    short:       true,
    ScreenView:  ThreePathsScreen,
  },

  personality_vote: {
    id:          'personality_vote',
    name:        'Голосование',
    desc:        'Ананси задаст вопрос о ком-то из игроков. Голосуем!',
    short:       true,
    ScreenView:  PersonalityVoteScreen,
  },

  spy: {
    id:          'spy',
    name:        'Шпион',
    desc:        'Среди вас есть шпион. Он не знает, что он шпион...',
    short:       false,
    ScreenView:  SpyScreen,
  },

  aanansi_story: {
    id:          'aanansi_story',
    name:        'История Ананси',
    desc:        'Ананси начнёт историю. Придумайте финал!',
    short:       false,
    ScreenView:  AanansiStoryScreen,
  },

  crocodile: {
    id:          'crocodile',
    name:        'Крокодил',
    desc:        'Покажи слово без слов. Только жесты!',
    short:       false,
    ScreenView:  CrocodileScreen,
  },
};

export default MINIGAMES;
