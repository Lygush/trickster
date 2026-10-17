// utils.js — мелкие общие функции

const crypto = require('crypto');

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomId = () => crypto.randomBytes(6).toString('hex');

// Нормализация слова для сравнения: регистр, ё→е, только буквы/цифры
function normalizeWord(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]/g, '');
}

function levenshtein(a, b) {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[n];
}

// Угадал ли игрок слово: точное совпадение после нормализации,
// для длинных слов прощаем одну опечатку.
function wordMatches(guess, word) {
  const g = normalizeWord(guess);
  const w = normalizeWord(word);
  if (!g || !w) return false;
  if (g === w) return true;
  return w.length >= 5 && levenshtein(g, w) <= 1;
}

module.exports = { shuffle, pick, randomId, normalizeWord, levenshtein, wordMatches };
