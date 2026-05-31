// hooks/useSounds.js  (client-screen)
//
// Управляет музыкой и звуковыми эффектами на большом экране.
//
// Использование:
//   const sounds = useSounds(assets);
//   sounds.playMusic('question');   // запускает фоновую музыку
//   sounds.playSfx('correct');      // одноразовый звук
//   sounds.playVoice('intro', 1);   // реплика Ананси: anansi/intro_01.mp3
//   sounds.stopMusic();
//   sounds.setVolume(0.5);          // 0..1
//
// Все методы безопасны — если файла нет (url=null), просто ничего не делают.

import { useRef, useEffect, useCallback } from 'react';

export default function useSounds(assets) {
  const musicRef   = useRef(null);   // текущий Audio для музыки
  const volumeRef  = useRef(0.5);

  // Предзагружаем SFX при появлении ассетов
  const sfxCache = useRef({});
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

  // ── Музыка ────────────────────────────────────────────────────────────────
  const playMusic = useCallback((trackKey) => {
    const url = assets?.sounds?.music?.[trackKey];
    if (!url) return;

    // Не перезапускаем, если уже играет тот же трек
    if (musicRef.current?.src?.endsWith(url) && !musicRef.current.paused) return;

    stopMusic();
    const audio = new Audio(url);
    audio.loop   = true;
    audio.volume = volumeRef.current;
    audio.play().catch(() => {});   // autoplay policy — молча игнорируем
    musicRef.current = audio;
  }, [assets]);

  const stopMusic = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  }, []);

  const setVolume = useCallback((v) => {
    volumeRef.current = v;
    if (musicRef.current) musicRef.current.volume = v;
  }, []);

  // ── SFX ───────────────────────────────────────────────────────────────────
  const playSfx = useCallback((key) => {
    const audio = sfxCache.current[key];
    if (!audio) return;
    // Клонируем чтобы можно было играть несколько раз одновременно
    const clone = audio.cloneNode();
    clone.volume = volumeRef.current;
    clone.play().catch(() => {});
  }, []);

  // ── Голосовые реплики Ананси ──────────────────────────────────────────────
  // voices/anansi/intro_01.mp3 → playVoice('intro', 1)
  // voices/anansi/help_01.mp3  → playVoice('help', 1)
  // Если номер не передан — играет случайную реплику с этим ключом
  const playVoice = useCallback((key, num) => {
    const voiceMap = assets?.voices?.anansi || {};

    let url = null;
    if (num !== undefined) {
      // Ищем конкретный номер: intro_01, intro_1, intro_001
      const padded = String(num).padStart(2, '0');
      url = voiceMap[`${key}_${padded}`] || voiceMap[`${key}_${num}`];
    } else {
      // Случайная реплика с этим ключом
      const candidates = Object.entries(voiceMap)
        .filter(([k]) => k.startsWith(key + '_'))
        .map(([, v]) => v);
      if (candidates.length) {
        url = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }

    if (!url) return;
    const audio = new Audio(url);
    audio.volume = volumeRef.current;
    audio.play().catch(() => {});
  }, [assets]);

  // Очищаем при размонтировании
  useEffect(() => () => stopMusic(), [stopMusic]);

  return { playMusic, stopMusic, playSfx, playVoice, setVolume };
}
