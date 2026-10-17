// ─────────────────────────────────────────────────────────────────────────────
// РЕЕСТР МИНИ-ИГР  (client-phone)
//
// PhoneView получает пропсы:
//   minigame — публичное состояние { id, stage, data, results }
//   stage    — текущая стадия (то же, что minigame.stage)
//   priv     — приватные данные игрока (роль, слово, свой выбор...)
//   me, players
//   onAction(action, payload) — действие на сервер (событие mg_action)
// Название и правила — в shared/constants.js (MINIGAME_INFO).
// ─────────────────────────────────────────────────────────────────────────────

import ThreePathsPhone      from './three_paths/PhoneView';
import SpyPhone             from './spy/PhoneView';
import PersonalityVotePhone from './personality_vote/PhoneView';
import AanansiStoryPhone    from './aanansi_story/PhoneView';
import CrocodilePhone       from './crocodile/PhoneView';

const MINIGAMES = {
  three_paths:      { PhoneView: ThreePathsPhone },
  personality_vote: { PhoneView: PersonalityVotePhone },
  spy:              { PhoneView: SpyPhone },
  aanansi_story:    { PhoneView: AanansiStoryPhone },
  crocodile:        { PhoneView: CrocodilePhone },
};

export default MINIGAMES;
