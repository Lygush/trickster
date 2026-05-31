// assetsConfig.js — читает папку assets/ и отдаёт конфиг клиентам
//
// Клиенты запрашивают GET /api/assets и получают:
// {
//   backgrounds: { main, lobby, question, final_race, winner,
//                  minigames: { three_paths, spy, ... } },
//   characters:  { spider, frog, snake, beetle, lizard },
//   sounds:      { music: { lobby, question, minigame, final_race },
//                  sfx:   { correct, wrong, step, minigame_start, winner } },
//   voices:      { anansi: { intro_01, help_01, ... } },
// }
//
// Если файл не найден — поле null, клиент использует fallback (SVG / emoji / тишину).

const fs   = require('fs');
const path = require('path');

// BASE — папка assets/ рядом с корнем репозитория
const ASSETS_DIR = path.join(__dirname, '../../assets');

// Проверяем, существует ли файл, и возвращаем URL или null
function asset(relPath) {
  const abs = path.join(ASSETS_DIR, relPath);
  return fs.existsSync(abs) ? `/assets/${relPath}` : null;
}

// Возвращает map { имя_без_расширения: url } для всех файлов в папке
function scanDir(relDir, exts = ['.mp3', '.ogg', '.wav', '.png', '.jpg', '.webp']) {
  const absDir = path.join(ASSETS_DIR, relDir);
  if (!fs.existsSync(absDir)) return {};
  return fs.readdirSync(absDir).reduce((acc, file) => {
    const ext = path.extname(file).toLowerCase();
    if (exts.includes(ext)) {
      const key = path.basename(file, ext);
      acc[key] = `/assets/${relDir}/${file}`;
    }
    return acc;
  }, {});
}

function buildAssetsConfig() {
  return {
    backgrounds: {
      main:       asset('backgrounds/main.jpg')       || asset('backgrounds/main.png')       || asset('backgrounds/main.webp'),
      lobby:      asset('backgrounds/lobby.jpg')      || asset('backgrounds/lobby.png')      || asset('backgrounds/lobby.webp'),
      question:   asset('backgrounds/question.jpg')   || asset('backgrounds/question.png')   || asset('backgrounds/question.webp'),
      final_race: asset('backgrounds/final_race.jpg') || asset('backgrounds/final_race.png') || asset('backgrounds/final_race.webp'),
      winner:     asset('backgrounds/winner.jpg')     || asset('backgrounds/winner.png')     || asset('backgrounds/winner.webp'),
      minigames: {
        three_paths:      asset('backgrounds/minigames/three_paths.jpg')      || asset('backgrounds/minigames/three_paths.png'),
        spy:              asset('backgrounds/minigames/spy.jpg')              || asset('backgrounds/minigames/spy.png'),
        personality_vote: asset('backgrounds/minigames/personality_vote.jpg') || asset('backgrounds/minigames/personality_vote.png'),
        aanansi_story:    asset('backgrounds/minigames/aanansi_story.jpg')    || asset('backgrounds/minigames/aanansi_story.png'),
        crocodile:        asset('backgrounds/minigames/crocodile.jpg')        || asset('backgrounds/minigames/crocodile.png'),
      },
    },
    characters: {
      spider: asset('characters/spider.png') || asset('characters/spider.webp'),
      frog:   asset('characters/frog.png')   || asset('characters/frog.webp'),
      snake:  asset('characters/snake.png')  || asset('characters/snake.webp'),
      beetle: asset('characters/beetle.png') || asset('characters/beetle.webp'),
      lizard: asset('characters/lizard.png') || asset('characters/lizard.webp'),
    },
    sounds: {
      music: {
        lobby:      asset('sounds/music/lobby.mp3')      || asset('sounds/music/lobby.ogg'),
        question:   asset('sounds/music/question.mp3')   || asset('sounds/music/question.ogg'),
        minigame:   asset('sounds/music/minigame.mp3')   || asset('sounds/music/minigame.ogg'),
        final_race: asset('sounds/music/final_race.mp3') || asset('sounds/music/final_race.ogg'),
        winner:     asset('sounds/music/winner.mp3')     || asset('sounds/music/winner.ogg'),
      },
      sfx: {
        correct:        asset('sounds/sfx/correct.mp3')        || asset('sounds/sfx/correct.ogg'),
        wrong:          asset('sounds/sfx/wrong.mp3')          || asset('sounds/sfx/wrong.ogg'),
        step:           asset('sounds/sfx/step.mp3')           || asset('sounds/sfx/step.ogg'),
        tick:           asset('sounds/sfx/tick.mp3')           || asset('sounds/sfx/tick.ogg'),
        minigame_start: asset('sounds/sfx/minigame_start.mp3') || asset('sounds/sfx/minigame_start.ogg'),
        winner:         asset('sounds/sfx/winner.mp3')         || asset('sounds/sfx/winner.ogg'),
        hindrance:      asset('sounds/sfx/hindrance.mp3')      || asset('sounds/sfx/hindrance.ogg'),
        join:           asset('sounds/sfx/join.mp3')           || asset('sounds/sfx/join.ogg'),
      },
    },
    // Реплики Ананси — берём все файлы из voices/anansi/
    // Формат имён: <ключ>_<номер>.mp3  (например: intro_01.mp3, help_01.mp3)
    // Клиент сам знает, в каких ситуациях играть какой ключ.
    voices: {
      anansi: scanDir('voices/anansi', ['.mp3', '.ogg', '.wav']),
    },
  };
}

module.exports = { buildAssetsConfig, ASSETS_DIR };
