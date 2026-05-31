// hooks/useSounds.js  (client-phone)
//
// Телефонный клиент — только SFX (без фоновой музыки, она на экране).
// API идентично screen-версии, просто музыкальные методы — заглушки.
//
// Использование:
//   const sounds = useSounds(assets);
//   sounds.playSfx('correct');   // звук правильного ответа
//   sounds.playSfx('wrong');     // звук неправильного ответа
//   sounds.playSfx('tick');      // тик таймера

import { useRef, useEffect, useCallback } from 'react';

const SERVER_URL = process.env.REACT_APP_SERVER_URL || window.location.origin;

export default function useSounds(assets) {
  const volumeRef = useRef(0.7);
  const sfxCache  = useRef({});

  // Предзагрузка SFX
  useEffect(() => {
    if (!assets?.sounds?.sfx) return;
    Object.entries(assets.sounds.sfx).forEach(([key, url]) => {
      if (url && !sfxCache.current[key]) {
        const audio = new Audio(url);
        audio.preload = 'auto';
        sfxCache.current[key] = audio;
      }
    });
  }, [assets]);

  const playSfx = useCallback((key) => {
    const audio = sfxCache.current[key];
    if (!audio) return;
    const clone = audio.cloneNode();
    clone.volume = volumeRef.current;
    clone.play().catch(() => {});
  }, []);

  const setVolume = useCallback((v) => {
    volumeRef.current = v;
  }, []);

  // Заглушки для совместимости с интерфейсом
  const playMusic  = useCallback(() => {}, []);
  const stopMusic  = useCallback(() => {}, []);
  const playVoice  = useCallback(() => {}, []);

  return { playSfx, playMusic, stopMusic, playVoice, setVolume };
}
