// components/GameBackground.jsx
//
// Рендерит фон для текущей фазы игры.
// Если есть соответствующее изображение в assets — показывает его.
// Если нет — использует оригинальный JungleScene (SVG).
//
// Использование в App.jsx:
//   <GameBackground phase={phase} minigameId={currentMinigame?.id} assets={assets} />
//
// Вместо прямого <JungleScene /> везде.

import React from 'react';
import JungleScene from './JungleScene';

// Карта фаз → ключ в assets.backgrounds
const PHASE_TO_BG = {
  lobby:            'lobby',
  character_select: 'lobby',
  intro:            'main',
  question:         'question',
  question_result:  'question',
  minigame_intro:   null,   // берём из minigames[id]
  minigame:         null,   // берём из minigames[id]
  final_race_intro: 'final_race',
  final_race:       'final_race',
  winner:           'winner',
};

export default function GameBackground({ phase, minigameId, assets }) {
  const bgs = assets?.backgrounds;

  let imageUrl = null;

  if (phase === 'minigame_intro' || phase === 'minigame') {
    imageUrl = bgs?.minigames?.[minigameId] || bgs?.main || null;
  } else {
    const key = PHASE_TO_BG[phase];
    imageUrl = key ? (bgs?.[key] || bgs?.main || null) : (bgs?.main || null);
  }

  if (!imageUrl) {
    // Нет изображения — оригинальный SVG-фон
    return <JungleScene />;
  }

  return (
    <>
      {/* Фоновое изображение */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Тёмный оверлей для читаемости текста */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'rgba(2, 8, 2, 0.55)',
        }}
      />
      {/* Виньетка — такая же как в JungleScene */}
      <svg
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vigBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="black" stopOpacity="0"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.7"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#vigBg)"/>
      </svg>
    </>
  );
}
