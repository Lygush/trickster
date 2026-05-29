// ─────────────────────────────────────────────────────────────────────────────
// РЕЕСТР МИНИ-ИГР  (client-phone)
//
// Чтобы добавить новую мини-игру:
//   1. Создай папку src/minigames/<id>/
//   2. Положи туда PhoneView.jsx  (или null если телефон пассивен)
//   3. Добавь одну запись ниже — и всё.
//      App.jsx трогать не нужно.
// ─────────────────────────────────────────────────────────────────────────────

import ThreePathsPhone     from './three_paths/PhoneView';
import SpyPhone            from './spy/PhoneView';
import PersonalityVotePhone from './personality_vote/PhoneView';
import AanansiStoryPhone   from './aanansi_story/PhoneView';
import CrocodilePhone      from './crocodile/PhoneView';

/**
 * @typedef {Object} MinigameDef
 * @property {string}           id      — совпадает с ключом объекта и id на сервере
 * @property {string}           name    — отображаемое название
 * @property {string}           desc    — короткое описание для интро
 * @property {boolean}          short   — короткая (true) или длинная (false) мини-игра
 * @property {React.Component|null} PhoneView — компонент для телефона; null = заглушка WaitScreen
 */

/** @type {Record<string, MinigameDef>} */
const MINIGAMES = {
  three_paths: {
    id:        'three_paths',
    name:      'Три тропинки',
    desc:      'Ананси приготовил три тропинки. Выбери одну — удача решит всё!',
    short:     true,
    PhoneView: ThreePathsPhone,
  },

  personality_vote: {
    id:        'personality_vote',
    name:      'Голосование',
    desc:      'Ананси задаст вопрос о ком-то из игроков. Голосуем!',
    short:     true,
    PhoneView: PersonalityVotePhone,
  },

  spy: {
    id:        'spy',
    name:      'Шпион',
    desc:      'Среди вас есть шпион. Он не знает, что он шпион...',
    short:     false,
    PhoneView: SpyPhone,
  },

  aanansi_story: {
    id:        'aanansi_story',
    name:      'История Ананси',
    desc:      'Ананси начнёт историю. Придумайте финал!',
    short:     false,
    PhoneView: AanansiStoryPhone,
  },

  crocodile: {
    id:        'crocodile',
    name:      'Крокодил',
    desc:      'Покажи слово без слов. Только жесты!',
    short:     false,
    PhoneView: CrocodilePhone,
  },
};

export default MINIGAMES;
