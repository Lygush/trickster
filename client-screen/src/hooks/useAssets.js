// hooks/useAssets.js
//
// Загружает конфиг ассетов с сервера (/api/assets) один раз при старте.
// Возвращает объект assets с URL-ами или null для каждого ассета.
//
// Использование:
//   const assets = useAssets();
//   <img src={assets.characters.spider ?? undefined} />  // если null — не рендерим
//   <GameBackground phase={phase} assets={assets} />

import { useState, useEffect } from 'react';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.origin;

// Пустая структура — используется до загрузки и при ошибке
const EMPTY_ASSETS = {
  backgrounds: {
    main: null, lobby: null, question: null, final_race: null, winner: null,
    minigames: {
      three_paths: null, spy: null, personality_vote: null,
      aanansi_story: null, crocodile: null,
    },
  },
  characters: { spider: null, frog: null, snake: null, beetle: null, lizard: null },
  sounds: {
    music: { lobby: null, question: null, minigame: null, final_race: null, winner: null },
    sfx:   { correct: null, wrong: null, step: null, tick: null,
              minigame_start: null, winner: null, hindrance: null, join: null },
  },
  voices: { anansi: {} },
};

export default function useAssets() {
  const [assets, setAssets] = useState(EMPTY_ASSETS);

  useEffect(() => {
    fetch(`${SERVER_URL}/api/assets`)
      .then(r => r.json())
      .then(data => setAssets(data))
      .catch(err => console.warn('[useAssets] Не удалось загрузить конфиг ассетов:', err));
  }, []);

  return assets;
}
