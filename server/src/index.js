// index.js — точка входа: Express (статика, QR, API) + Socket.io → Engine

const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const fs         = require('fs');
const os         = require('os');
const QRCode     = require('qrcode');

const C = require('./config');
const { Engine } = require('./engine');
const { buildAssetsConfig, ASSETS_DIR } = require('./assetsConfig');
const QUESTIONS = require('../data/questions.json');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });

// ── Статика клиентов ─────────────────────────────────────────────────────────
const SCREEN_BUILD = path.join(__dirname, '../../client-screen/build');
const PHONE_BUILD  = path.join(__dirname, '../../client-phone/build');

function serveClient(route, dir) {
  app.use(route, express.static(dir));
  app.get(`${route}/*`, (req, res) => {
    const index = path.join(dir, 'index.html');
    if (fs.existsSync(index)) res.sendFile(index);
    else res.status(503).send(`Клиент не собран: запусти npm run build в ${path.basename(path.dirname(dir))}`);
  });
}
serveClient('/screen', SCREEN_BUILD);
serveClient('/phone',  PHONE_BUILD);
app.get('/', (req, res) => res.redirect('/screen'));
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ── Ассеты ───────────────────────────────────────────────────────────────────
if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
app.use('/assets', express.static(ASSETS_DIR));
app.get('/api/assets', (req, res) => res.json(buildAssetsConfig()));

// ── QR / статус ──────────────────────────────────────────────────────────────
function getLocalIP() {
  if (process.env.HOST_IP) return process.env.HOST_IP;
  const candidates = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const iface of list || []) {
      if (iface.family !== 'IPv4' || iface.internal) continue;
      if (/^(192\.168\.|10\.)/.test(iface.address)) candidates.unshift(iface.address);
      else candidates.push(iface.address);
    }
  }
  return candidates[0] || '127.0.0.1';
}
const phoneUrl = () => `http://${getLocalIP()}:${C.PORT}/phone`;

app.get('/qr', async (req, res) => {
  try {
    const png = await QRCode.toBuffer(phoneUrl(), { width: 360, margin: 1 });
    res.set('Content-Type', 'image/png').send(png);
  } catch (e) {
    res.status(500).send('QR error');
  }
});

// ── Движок игры ──────────────────────────────────────────────────────────────
const engine = new Engine({
  questions: QUESTIONS,
  send: (sid, event, data) => io.to(sid).emit(event, data),
  log: (...a) => console.log(new Date().toLocaleTimeString(), ...a),
});

app.get('/status', (req, res) => res.json({
  ok: true, phase: engine.game.phase, players: engine.players().length,
}));

const CLIENT_EVENTS = [
  'hello', 'join', 'leave', 'select_character', 'answer', 'mg_ready', 'mg_action',
  'start_game', 'reset_game', 'host_skip',
];

io.on('connection', socket => {
  engine.connect(socket.id);
  socket.emit('server_info', { phoneUrl: phoneUrl(), ip: getLocalIP(), port: C.PORT });
  CLIENT_EVENTS.forEach(ev => socket.on(ev, payload => engine.handle(socket.id, ev, payload)));
  socket.on('disconnect', () => engine.disconnect(socket.id));
});

server.listen(C.PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  console.log(`
╔══════════════════════════════════════════╗
║        🕸️  СКВОЗЬ ЧАЩУ — СЕРВЕР  🕸️       ║
╠══════════════════════════════════════════╣
║  Большой экран → http://${ip}:${C.PORT}/screen
║  Телефоны      → http://${ip}:${C.PORT}/phone
║  Статус        → http://${ip}:${C.PORT}/status
╠══════════════════════════════════════════╣
║  Вопросов в базе: ${engine.allQuestions.length}${C.TIME_SCALE !== 1 ? `   TIME_SCALE=${C.TIME_SCALE}` : ''}
╚══════════════════════════════════════════╝
  `);
});
