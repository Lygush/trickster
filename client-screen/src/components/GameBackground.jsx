import React from 'react';
import JungleScene from './JungleScene';

const PHASE_TO_BG = {
  lobby:            'lobby',
  character_select: 'lobby',
  intro:            'main',
  question:         'question',
  question_result:  'question',
  minigame_intro:   null,
  minigame:         null,
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
    return <JungleScene />;
  }

  return (
    <>
      {/* Фоновое изображение */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />
      {/* Лёгкий тёмный оверлей — только для читаемости текста */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'rgba(2, 8, 2, 0.35)',
      }} />
      {/* Виньетка по краям */}
      <svg
        style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
        viewBox="0 0 1280 720"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="vigBg" cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor="black" stopOpacity="0"/>
            <stop offset="100%" stopColor="black" stopOpacity="0.45"/>
          </radialGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#vigBg)"/>
      </svg>
    </>
  );
}
