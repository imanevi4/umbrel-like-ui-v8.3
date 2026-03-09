const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const os = require('os');
const dns = require('dns').promises;
const tls = require('tls');
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const multer = require('multer');
const bcrypt = require('bcryptjs');

const PORT = parseInt(process.env.PORT || '3000', 10);
const SSL_ENABLED = String(process.env.SSL_ENABLED || 'true') === 'true';
const SESSION_SECRET = process.env.SESSION_SECRET || 'CHANGE_ME_TO_A_LONG_RANDOM_SECRET';
const ADMIN_BOOTSTRAP_USERNAME = process.env.ADMIN_BOOTSTRAP_USERNAME || '';
const ADMIN_BOOTSTRAP_PASSWORD_HASH = process.env.ADMIN_BOOTSTRAP_PASSWORD_HASH || '';

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const AVATAR_DIR = path.join(UPLOADS_DIR, 'avatars');
const BACKGROUND_DIR = path.join(UPLOADS_DIR, 'backgrounds');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const STATE_FILE = path.join(DATA_DIR, 'state.json');
const AUTH_LOG_FILE = path.join(DATA_DIR, 'auth-log.jsonl');
const SESSIONS_DIR = path.join(DATA_DIR, 'sessions');

for (const dir of [DATA_DIR, UPLOADS_DIR, AVATAR_DIR, BACKGROUND_DIR, SESSIONS_DIR]) fs.mkdirSync(dir, { recursive: true });

function safeJsonParse(raw, fallback) { try { return JSON.parse(raw); } catch { return fallback; } }
function readJson(file, fallback) { if (!fs.existsSync(file)) return fallback; return safeJsonParse(fs.readFileSync(file, 'utf8'), fallback); }
function writeJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2)); }
function generateId(prefix='id') { return `${prefix}_${Math.random().toString(36).slice(2,10)}_${Date.now().toString(36)}`; }
function nowIso() { return new Date().toISOString(); }
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

const upload = multer({
  dest: path.join(DATA_DIR, 'tmp'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ['image/jpeg', 'image/png'].includes(file.mimetype);
    cb(ok ? null : new Error('Only jpg/jpeg/png allowed'), ok);
  },
});

function defaultSettings() {
  return {
    locale: 'ru',
    portalBadgeText: 'IAM Umbrel-like Control Portal',
    portalTitle: 'Привет!',
    portalSubtitle: 'Группы серверов, сервисы, виджеты, поиск, автопоиск и управление доступом.',
    footerText: '',
    densityMode: 'comfortable',
    actionButtonsStyle: 'icons-with-text',
    actionButtonsVisibility: 'always-visible',
    widgetsMode: 'expanded',
    backgroundImageUrl: '',
    domainChecks: [{ id: 'dom-example', host: 'example.com', port: 443 }],
    widgets: [
      { id: 'widget-ssd', type: 'ssd', enabled: true, order: 1, size: 'sm' },
      { id: 'widget-ram', type: 'ram', enabled: true, order: 2, size: 'sm' },
      { id: 'widget-auth-log', type: 'auth-log', enabled: true, order: 3, size: 'lg' },
      { id: 'widget-online-users', type: 'online-users', enabled: true, order: 4, size: 'lg' },
      { id: 'widget-domain-ssl', type: 'domain-ssl', enabled: true, order: 5, size: 'lg' },
    ],
    telegram: {
      enabled: false,
      botToken: '',
      chatId: '',
      threadId: '',
      scheduleEnabled: false,
      scheduleType: 'hourly',
      scheduleCron: '0 * * * *',
      lastSummarySentAt: '',
      eventNotifications: {
        serviceDown: true,
        serviceRecovered: true,
        sslExpiring: true,
        sslExpired: true,
        authFailuresSpike: true,
        newLoginIp: true,
      },
      thresholds: { sslDaysLeft: 14, authFailuresPer10Min: 5 },
    },
  };
}
function normalizeSettings(input = {}) {
  const base = defaultSettings();
  const s = { ...base, ...input, telegram: { ...base.telegram, ...(input.telegram || {}), eventNotifications: { ...base.telegram.eventNotifications, ...(input.telegram?.eventNotifications || {}) }, thresholds: { ...base.telegram.thresholds, ...(input.telegram?.thresholds || {}) } } };
  s.widgets = Array.isArray(input.widgets) ? input.widgets : base.widgets;
  s.domainChecks = Array.isArray(input.domainChecks) ? input.domainChecks.map((d, i) => ({ id: d.id || `dom-${i+1}`, host: String(d.host || '').trim(), port: parseInt(d.port || 443, 10) || 443 })).filter(d => d.host) : base.domainChecks;
  return s;
}
function loadSettings() {
  const s = normalizeSettings(readJson(SETTINGS_FILE, defaultSettings()));
  writeJson(SETTINGS_FILE, s);
  return s;
}
function saveSettings(s) { writeJson(SETTINGS_FILE, normalizeSettings(s)); }

function defaultState() {
  return {
    servers: [{ id: 'srv-default', name: 'Default Server', ip: '11.22.33.44', baseUrl: 'https://example.com', description: 'Default group', expanded: true, order: 1, tags: [], iconUrl: '' }],
    services: [],
    meta: { version: 2, updatedAt: nowIso() },
  };
}
function normalizeState(input) {
  if (Array.isArray(input)) {
    const base = defaultState();
    base.services = input.map((item, idx) => ({
      id: item.id || generateId('svc'),
      serverId: 'srv-default',
      name: item.name || `Service ${idx + 1}`,
      url: item.url || '',
      description: item.description || '',
      category: item.category || '',
      iconUrl: item.iconUrl || '',
      healthUrl: item.healthUrl || '',
      checkMethod: ['auto','http','ping','disabled'].includes(item.checkMethod) ? item.checkMethod : 'auto',
      pinned: !!item.pinned,
      order: idx + 1,
      credentials: Array.isArray(item.credentials) ? item.credentials : [],
      links: Array.isArray(item.links) ? item.links : [],
      notes: item.notes || '',
    }));
    return base;
  }
  const raw = input && typeof input === 'object' ? input : defaultState();
  return {
    servers: Array.isArray(raw.servers) ? raw.servers.map((s, idx) => ({ id: s.id || generateId('srv'), name: s.name || `Server ${idx+1}`, ip: s.ip || '', baseUrl: s.baseUrl || '', description: s.description || '', expanded: s.expanded !== false, order: Number(s.order || idx + 1), tags: Array.isArray(s.tags) ? s.tags : [], iconUrl: s.iconUrl || '' })).sort((a,b)=>a.order-b.order) : defaultState().servers,
    services: Array.isArray(raw.services) ? raw.services.map((s, idx) => ({ id: s.id || generateId('svc'), serverId: s.serverId || raw.servers?.[0]?.id || 'srv-default', name: s.name || `Service ${idx+1}`, url: s.url || '', description: s.description || '', category: s.category || '', iconUrl: s.iconUrl || '', healthUrl: s.healthUrl || '', checkMethod: ['auto','http','ping','disabled'].includes(s.checkMethod) ? s.checkMethod : 'auto', pinned: !!s.pinned, order: Number(s.order || idx + 1), credentials: Array.isArray(s.credentials) ? s.credentials : [], links: Array.isArray(s.links) ? s.links : [], notes: s.notes || '' })) : [],
    meta: { version: 2, updatedAt: nowIso() },
  };
}
function loadState() { const state = normalizeState(readJson(STATE_FILE, defaultState())); writeJson(STATE_FILE, state); return state; }
function saveState(state) { writeJson(STATE_FILE, normalizeState(state)); }

function loadUsers() { const users = readJson(USERS_FILE, []); if (!Array.isArray(users)) return []; return users; }
function saveUsers(users) { writeJson(USERS_FILE, users); }
function ensureBootstrapAdmin() {
  if (!ADMIN_BOOTSTRAP_USERNAME || !ADMIN_BOOTSTRAP_PASSWORD_HASH) return;
  const users = loadUsers();
  if (!users.find(u => u.username === ADMIN_BOOTSTRAP_USERNAME)) {
    users.push({ id: generateId('usr'), username: ADMIN_BOOTSTRAP_USERNAME, passwordHash: ADMIN_BOOTSTRAP_PASSWORD_HASH, role: 'admin', isActive: true, avatarUrl: '', createdAt: nowIso() });
    saveUsers(users);
  }
}
ensureBootstrapAdmin();

function appendAuthLog(entry) { fs.appendFileSync(AUTH_LOG_FILE, `${JSON.stringify({ time: nowIso(), ...entry })}\n`); }
function readAuthLogs(limit = 100) {
  if (!fs.existsSync(AUTH_LOG_FILE)) return [];
  const lines = fs.readFileSync(AUTH_LOG_FILE, 'utf8').trim().split('\n').filter(Boolean);
  return lines.slice(-limit).map(line => safeJsonParse(line, null)).filter(Boolean).reverse();
}

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new FileStore({ path: SESSIONS_DIR, retries: 1, ttl: 60 * 60 * 24 * 7 }),
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: SSL_ENABLED, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 24 * 7 },
}));
app.use('/uploads', express.static(UPLOADS_DIR));
app.use((req, _res, next) => { if (req.session?.user) { req.session.lastSeen = Date.now(); req.session.lastIp = getClientIp(req); } next(); });

const loginRate = new Map();
function getClientIp(req) { return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim(); }
function requireAuth(req, res, next) { if (!req.session?.user) return res.redirect('/login.html'); next(); }
function requireApiAuth(req, res, next) { if (!req.session?.user) return res.status(401).json({ error: 'unauthorized' }); next(); }
function requireAdmin(req, res, next) { if (req.session?.user?.role !== 'admin') return res.status(403).json({ error: 'admin only' }); next(); }
const publicUser = (user) => ({ id: user.id, username: user.username, role: user.role, isActive: user.isActive, avatarUrl: user.avatarUrl || '', createdAt: user.createdAt });

function getOnlineUsers() {
  const users = loadUsers();
  const files = fs.existsSync(SESSIONS_DIR) ? fs.readdirSync(SESSIONS_DIR) : [];
  const now = Date.now();
  const active = [];
  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    try {
      const data = safeJsonParse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf8'), null);
      if (!data?.user) continue;
      if (now - (data.lastSeen || 0) > 15 * 60e3) continue;
      const user = users.find(u => u.id === data.user.id);
      active.push({ id: data.user.id, username: data.user.username, role: data.user.role, ip: data.lastIp || '', lastSeen: data.lastSeen, avatarUrl: user?.avatarUrl || '' });
    } catch {}
  }
  const dedupe = new Map();
  active.forEach(u => dedupe.set(u.id, u));
  return Array.from(dedupe.values());
}
function getMetrics() {
  const memTotal = os.totalmem();
  const memFree = os.freemem();
  let disk = { totalGb: null, usedGb: null, freeGb: null, percentUsed: null };
  try {
    const stat = fs.statfsSync('/');
    const total = stat.blocks * stat.bsize;
    const free = stat.bavail * stat.bsize;
    const used = total - free;
    disk = { totalGb: +(total / 2**30).toFixed(2), usedGb: +(used / 2**30).toFixed(2), freeGb: +(free / 2**30).toFixed(2), percentUsed: +((used / total) * 100).toFixed(1) };
  } catch {}
  return { memory: { totalGb: +(memTotal / 2**30).toFixed(2), usedGb: +((memTotal - memFree) / 2**30).toFixed(2), freeGb: +(memFree / 2**30).toFixed(2), percentUsed: +(((memTotal - memFree) / memTotal) * 100).toFixed(1) }, disk };
}
function reorderByIds(items, orderedIds) {
  const map = new Map(orderedIds.map((id, idx) => [id, idx + 1]));
  return items.map(item => ({ ...item, order: map.get(item.id) || item.order || 9999 })).sort((a, b) => a.order - b.order);
}

function telegramEnabled(settings) { const tg = settings.telegram || {}; return !!(tg.enabled && tg.botToken && tg.chatId); }
function postJson(url, body) { return new Promise((resolve, reject) => { const u = new URL(url); const data = Buffer.from(JSON.stringify(body)); const req = https.request({ hostname: u.hostname, port: 443, path: u.pathname + u.search, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } }, res => { let raw=''; res.on('data', d => raw += d); res.on('end', () => res.statusCode >= 400 ? reject(new Error(raw || `HTTP ${res.statusCode}`)) : resolve(safeJsonParse(raw, {}))); }); req.on('error', reject); req.write(data); req.end(); }); }
async function sendTelegramMessage(settings, text) { if (!telegramEnabled(settings)) return { ok: false, skipped: true }; const body = { chat_id: settings.telegram.chatId, text, disable_web_page_preview: true }; if (settings.telegram.threadId) body.message_thread_id = Number(settings.telegram.threadId); return postJson(`https://api.telegram.org/bot${settings.telegram.botToken}/sendMessage`, body); }
const runtimeMonitor = { lastServiceStates: new Map(), lastDomainStates: new Map(), authSpikeKeys: new Map(), knownLoginIps: new Map() };
function summarizePortal() {
  const settings = loadSettings();
  const metrics = getMetrics();
  const state = loadState();
  const online = getOnlineUsers();
  const logs = readAuthLogs(10).filter(x => x.event === 'login_failed');
  return [
    'Сводка портала',
    `Серверов: ${state.servers.length}`,
    `Сервисов: ${state.services.length}`,
    `SSD: ${metrics.disk.usedGb ?? '-'} / ${metrics.disk.totalGb ?? '-'} Gb (${metrics.disk.percentUsed ?? '-'}%)`,
    `RAM: ${metrics.memory.usedGb ?? '-'} / ${metrics.memory.totalGb ?? '-'} Gb (${metrics.memory.percentUsed ?? '-'}%)`,
    `Онлайн: ${online.length}`,
    `Ошибок входа: ${logs.length}`,
    `Доменов: ${(settings.domainChecks || []).length}`,
  ].join('\n');
}
function shouldSendScheduledSummary(settings) {
  const tg = settings.telegram || {};
  if (!telegramEnabled(settings) || !tg.scheduleEnabled) return false;
  const last = tg.lastSummarySentAt ? new Date(tg.lastSummarySentAt).getTime() : 0;
  const diff = Date.now() - last;
  const map = { '15m': 15*60e3, '30m': 30*60e3, hourly: 60*60e3, daily: 24*60*60e3 };
  return diff > (map[tg.scheduleType] || 60*60e3);
}
function httpCheck(target) { return new Promise(resolve => { try { const u = new URL(target); const lib = u.protocol === 'https:' ? https : http; const req = lib.request({ hostname: u.hostname, port: u.port || (u.protocol === 'https:' ? 443 : 80), path: `${u.pathname}${u.search || ''}`, method: 'GET', timeout: 5000, rejectUnauthorized: false }, res => { resolve({ ok: res.statusCode < 500, statusCode: res.statusCode }); res.resume(); }); req.on('timeout', () => { req.destroy(); resolve({ ok: false, error: 'timeout' }); }); req.on('error', err => resolve({ ok: false, error: err.message })); req.end(); } catch (e) { resolve({ ok: false, error: e.message }); } }); }
async function checkDomain(entry) {
  const host = String(entry.host || '').trim();
  const port = parseInt(entry.port || 443, 10) || 443;
  if (!host) return { host: '', port, ok: false, error: 'empty_host' };
  try {
    const looked = await dns.lookup(host);
    const ip = looked?.address || '';
    if (port !== 443) return { host, port, ip, ok: true, hasSsl: false, validTo: null, daysLeft: null };
    const tlsInfo = await new Promise(resolve => {
      const socket = tls.connect({ host, port, servername: host, rejectUnauthorized: false, timeout: 5000 }, () => {
        const cert = socket.getPeerCertificate();
        resolve({ cert }); socket.end();
      });
      socket.on('error', err => resolve({ error: err.message }));
      socket.on('timeout', () => { resolve({ error: 'timeout' }); socket.destroy(); });
    });
    if (tlsInfo.error || !tlsInfo.cert?.valid_to) return { host, port, ip, ok: true, hasSsl: false, error: tlsInfo.error || 'no_cert', validTo: null, daysLeft: null };
    const validTo = new Date(tlsInfo.cert.valid_to).toISOString();
    const daysLeft = Math.ceil((new Date(validTo).getTime() - Date.now()) / 86400000);
    return { host, port, ip, ok: true, hasSsl: true, validTo, daysLeft, issuer: tlsInfo.cert.issuer?.O || tlsInfo.cert.issuer?.CN || '' };
  } catch (e) {
    return { host, port, ok: false, hasSsl: false, error: e.message };
  }
}
async function monitorAndNotify() {
  const settings = loadSettings();
  const tg = settings.telegram || {};
  if (shouldSendScheduledSummary(settings)) {
    try { await sendTelegramMessage(settings, summarizePortal()); saveSettings({ ...settings, telegram: { ...tg, lastSummarySentAt: nowIso() } }); } catch {}
  }
  if (!telegramEnabled(settings)) return;
  const domains = await Promise.all((settings.domainChecks || []).map(checkDomain));
  for (const domain of domains) {
    const current = !domain.ok ? 'down' : (!domain.hasSsl ? 'no_ssl' : (domain.daysLeft <= 0 ? 'expired' : (domain.daysLeft <= (tg.thresholds?.sslDaysLeft || 14) ? 'expiring' : 'ok')));
    const prev = runtimeMonitor.lastDomainStates.get(domain.host);
    runtimeMonitor.lastDomainStates.set(domain.host, current);
    if (prev && prev !== current) {
      if ((current === 'expiring' && tg.eventNotifications?.sslExpiring) || (current === 'expired' && tg.eventNotifications?.sslExpired)) {
        sendTelegramMessage(settings, `SSL событие\n\nДомен: ${domain.host}\nСтатус: ${current}\nОсталось дней: ${domain.daysLeft ?? '-'}\nIP: ${domain.ip || '-'}`).catch(()=>{});
      }
    }
  }
  const state = loadState();
  for (const service of state.services.filter(s => s.checkMethod !== 'disabled' && (s.healthUrl || s.url))) {
    const result = await httpCheck(String(service.healthUrl || service.url));
    const current = result.ok ? 'up' : 'down';
    const prev = runtimeMonitor.lastServiceStates.get(service.id);
    runtimeMonitor.lastServiceStates.set(service.id, current);
    if (prev && prev !== current) {
      if (current === 'down' && tg.eventNotifications?.serviceDown) sendTelegramMessage(settings, `Сервис недоступен\n\nСервис: ${service.name}\nURL: ${service.url || service.healthUrl}`).catch(()=>{});
      if (current === 'up' && tg.eventNotifications?.serviceRecovered) sendTelegramMessage(settings, `Сервис восстановился\n\nСервис: ${service.name}\nURL: ${service.url || service.healthUrl}`).catch(()=>{});
    }
  }
  const logs = readAuthLogs(200);
  const recentFailed = logs.filter(x => x.event === 'login_failed' && new Date(x.time).getTime() >= Date.now() - 10 * 60e3);
  const grouped = new Map();
  recentFailed.forEach(item => grouped.set(item.ip || 'unknown', (grouped.get(item.ip || 'unknown') || 0) + 1));
  for (const [ip, count] of grouped.entries()) {
    const key = `${ip}:${Math.floor(Date.now() / (10*60e3))}`;
    if (count >= (tg.thresholds?.authFailuresPer10Min || 5) && !runtimeMonitor.authSpikeKeys.has(key) && tg.eventNotifications?.authFailuresSpike) {
      runtimeMonitor.authSpikeKeys.set(key, true);
      sendTelegramMessage(settings, `Подозрительная auth-активность\n\nIP: ${ip}\nНеуспешных входов за 10 минут: ${count}`).catch(()=>{});
    }
  }
}
setInterval(() => { monitorAndNotify().catch(()=>{}); }, 60e3);

app.get('/login.html', (_req, res) => res.sendFile(path.join(ROOT, 'public', 'login.html')));
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = loginRate.get(ip) || { count: 0, resetAt: now + 10 * 60e3 };
  if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + 10 * 60e3; }
  if (bucket.count >= 20) { appendAuthLog({ username: username || '', ip, event: 'login_rate_limited' }); return res.status(429).json({ error: 'Too many attempts' }); }
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user || !user.isActive || !bcrypt.compareSync(password || '', user.passwordHash || '')) {
    bucket.count += 1; loginRate.set(ip, bucket); appendAuthLog({ username: username || '', ip, event: 'login_failed' }); return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.user = { id: user.id, username: user.username, role: user.role };
  req.session.lastSeen = now; req.session.lastIp = ip; bucket.count = 0; loginRate.set(ip, bucket); appendAuthLog({ username: user.username, ip, event: 'login_success' });
  const known = runtimeMonitor.knownLoginIps.get(user.id) || new Set();
  const firstSeen = !known.has(ip); known.add(ip); runtimeMonitor.knownLoginIps.set(user.id, known);
  const settings = loadSettings();
  if (firstSeen && telegramEnabled(settings) && settings.telegram.eventNotifications?.newLoginIp) sendTelegramMessage(settings, `Новый IP входа\n\nПользователь: ${user.username}\nIP: ${ip}`).catch(()=>{});
  res.json({ ok: true });
});
app.post('/api/logout', requireApiAuth, (req, res) => { appendAuthLog({ username: req.session.user.username, ip: getClientIp(req), event: 'logout' }); req.session.destroy(() => res.json({ ok: true })); });
app.get('/api/me', requireApiAuth, (req, res) => { const user = loadUsers().find(u => u.id === req.session.user.id); res.json({ user: publicUser(user || req.session.user), settings: loadSettings() }); });
app.get('/api/users', requireApiAuth, requireAdmin, (_req, res) => res.json(loadUsers().map(publicUser)));
app.post('/api/users', requireApiAuth, requireAdmin, (req, res) => {
  const { username, password, role = 'viewer', isActive = true } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = loadUsers();
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'username exists' });
  const user = { id: generateId('usr'), username, passwordHash: bcrypt.hashSync(password, 12), role: role === 'admin' ? 'admin' : 'viewer', isActive: !!isActive, avatarUrl: '', createdAt: nowIso() };
  users.push(user); saveUsers(users); res.json(publicUser(user));
});
app.put('/api/users/:id', requireApiAuth, requireAdmin, (req, res) => {
  const users = loadUsers(); const idx = users.findIndex(u => u.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'not found' });
  users[idx] = { ...users[idx], username: req.body.username || users[idx].username, role: req.body.role === 'admin' ? 'admin' : 'viewer', isActive: req.body.isActive !== false };
  saveUsers(users); res.json(publicUser(users[idx]));
});
app.put('/api/users/:id/password', requireApiAuth, requireAdmin, (req, res) => { if (!req.body?.password) return res.status(400).json({ error: 'password required' }); const users = loadUsers(); const idx = users.findIndex(u => u.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'not found' }); users[idx].passwordHash = bcrypt.hashSync(req.body.password, 12); saveUsers(users); res.json({ ok: true }); });
app.delete('/api/users/:id', requireApiAuth, requireAdmin, (req, res) => { if (req.session.user.id === req.params.id) return res.status(400).json({ error: 'cannot delete self' }); saveUsers(loadUsers().filter(u => u.id !== req.params.id)); res.json({ ok: true }); });
app.post('/api/users/:id/avatar', requireApiAuth, upload.single('avatar'), (req, res) => { if (req.session.user.role !== 'admin' && req.session.user.id !== req.params.id) return res.status(403).json({ error: 'forbidden' }); const users = loadUsers(); const idx = users.findIndex(u => u.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'not found' }); const ext = req.file.mimetype === 'image/png' ? '.png' : '.jpg'; const fileName = `${req.params.id}${ext}`; fs.renameSync(req.file.path, path.join(AVATAR_DIR, fileName)); users[idx].avatarUrl = `/uploads/avatars/${fileName}`; saveUsers(users); res.json({ avatarUrl: users[idx].avatarUrl }); });
app.post('/api/settings/background', requireApiAuth, requireAdmin, upload.single('background'), (req, res) => {
  const ext = req.file.mimetype === 'image/png' ? '.png' : '.jpg';
  const fileName = `scene${ext}`;
  fs.renameSync(req.file.path, path.join(BACKGROUND_DIR, fileName));
  const settings = loadSettings();
  settings.backgroundImageUrl = `/uploads/backgrounds/${fileName}`;
  saveSettings(settings);
  res.json({ backgroundImageUrl: settings.backgroundImageUrl });
});
app.delete('/api/settings/background', requireApiAuth, requireAdmin, (_req, res) => { const settings = loadSettings(); settings.backgroundImageUrl = ''; saveSettings(settings); res.json(settings); });
app.get('/api/settings', requireApiAuth, (_req, res) => res.json(loadSettings()));
app.put('/api/settings', requireApiAuth, requireAdmin, (req, res) => { const next = normalizeSettings({ ...loadSettings(), ...req.body }); saveSettings(next); res.json(next); });
app.get('/api/state', requireApiAuth, (_req, res) => res.json(loadState()));
app.put('/api/state', requireApiAuth, requireAdmin, (req, res) => { const normalized = normalizeState(req.body); saveState(normalized); res.json(normalized); });
app.get('/api/export', requireApiAuth, (_req, res) => res.json(loadState()));
app.post('/api/import', requireApiAuth, requireAdmin, (req, res) => { const imported = normalizeState(req.body); saveState(imported); res.json(imported); });
app.post('/api/servers', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); const server = { id: generateId('srv'), name: req.body.name || 'Untitled Server', ip: req.body.ip || '', baseUrl: req.body.baseUrl || '', description: req.body.description || '', expanded: req.body.expanded !== false, order: state.servers.length + 1, tags: Array.isArray(req.body.tags) ? req.body.tags : [], iconUrl: req.body.iconUrl || '' }; state.servers.push(server); saveState(state); res.json(server); });
app.put('/api/servers/:id', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); const idx = state.servers.findIndex(s => s.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'not found' }); state.servers[idx] = { ...state.servers[idx], ...req.body, id: state.servers[idx].id }; saveState(state); res.json(state.servers[idx]); });
app.delete('/api/servers/:id', requireApiAuth, requireAdmin, (req, res) => { const cascade = String(req.query.cascade || 'false') === 'true'; const state = loadState(); const hasServices = state.services.some(s => s.serverId === req.params.id); if (hasServices && !cascade) return res.status(400).json({ error: 'server has services; use cascade=true' }); state.servers = state.servers.filter(s => s.id !== req.params.id); if (cascade) state.services = state.services.filter(s => s.serverId !== req.params.id); saveState(state); res.json({ ok: true }); });
app.post('/api/reorder/servers', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); state.servers = reorderByIds(state.servers, req.body.ids || []); saveState(state); res.json(state.servers); });
app.post('/api/services', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); if (!state.servers.find(s => s.id === req.body.serverId)) return res.status(400).json({ error: 'invalid serverId' }); const count = state.services.filter(s => s.serverId === req.body.serverId).length; const service = { id: generateId('svc'), serverId: req.body.serverId, name: req.body.name || 'Untitled Service', url: req.body.url || '', description: req.body.description || '', category: req.body.category || '', iconUrl: req.body.iconUrl || '', healthUrl: req.body.healthUrl || '', checkMethod: ['auto','http','ping','disabled'].includes(req.body.checkMethod) ? req.body.checkMethod : 'auto', pinned: !!req.body.pinned, order: count + 1, credentials: Array.isArray(req.body.credentials) ? req.body.credentials : [], links: Array.isArray(req.body.links) ? req.body.links : [], notes: req.body.notes || '' }; state.services.push(service); saveState(state); res.json(service); });
app.put('/api/services/:id', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); const idx = state.services.findIndex(s => s.id === req.params.id); if (idx < 0) return res.status(404).json({ error: 'not found' }); state.services[idx] = { ...state.services[idx], ...req.body, id: state.services[idx].id, credentials: Array.isArray(req.body.credentials) ? req.body.credentials : state.services[idx].credentials, links: Array.isArray(req.body.links) ? req.body.links : state.services[idx].links }; saveState(state); res.json(state.services[idx]); });
app.post('/api/services/:id/duplicate', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); const source = state.services.find(s => s.id === req.params.id); if (!source) return res.status(404).json({ error: 'not found' }); const order = state.services.filter(s => s.serverId === source.serverId).length + 1; const copy = { ...source, id: generateId('svc'), name: `${source.name} (копия)`, order }; state.services.push(copy); saveState(state); res.json(copy); });
app.post('/api/reorder/services', requireApiAuth, requireAdmin, (req, res) => {
  const { sourceServerId, targetServerId, movedServiceId, targetIds } = req.body || {};
  const state = loadState();
  if (movedServiceId && targetServerId) {
    const service = state.services.find(s => s.id === movedServiceId);
    if (!service) return res.status(404).json({ error: 'service not found' });
    service.serverId = targetServerId;
  }
  const groupTarget = state.services.filter(s => s.serverId === targetServerId);
  if (Array.isArray(targetIds) && targetServerId) {
    const reordered = reorderByIds(groupTarget, targetIds);
    const other = state.services.filter(s => s.serverId !== targetServerId);
    state.services = [...other, ...reordered];
  }
  if (sourceServerId && sourceServerId !== targetServerId) {
    const sourceGroup = state.services.filter(s => s.serverId === sourceServerId).sort((a,b)=>a.order-b.order).map((s, idx) => ({ ...s, order: idx + 1 }));
    const other = state.services.filter(s => s.serverId !== sourceServerId);
    state.services = [...other, ...sourceGroup];
  }
  saveState(state);
  res.json(state.services);
});
app.delete('/api/services/:id', requireApiAuth, requireAdmin, (req, res) => { const state = loadState(); state.services = state.services.filter(s => s.id !== req.params.id); saveState(state); res.json({ ok: true }); });
app.get('/api/domain-checks', requireApiAuth, async (_req, res) => res.json(await Promise.all((loadSettings().domainChecks || []).map(checkDomain))));
app.get('/api/system/metrics', requireApiAuth, (_req, res) => res.json(getMetrics()));
app.get('/api/auth/logs', requireApiAuth, requireAdmin, (req, res) => res.json(readAuthLogs(parseInt(req.query.limit || '50', 10))));
app.get('/api/auth/online-users', requireApiAuth, (_req, res) => res.json(getOnlineUsers()));

function dockerGet(pathname) { return new Promise((resolve, reject) => { const req = http.request({ socketPath: '/var/run/docker.sock', path: pathname, method: 'GET' }, r => { let data=''; r.on('data', c => data += c); r.on('end', () => r.statusCode >= 400 ? reject(new Error(data || `Docker API error ${r.statusCode}`)) : resolve(safeJsonParse(data, []))); }); req.on('error', reject); req.end(); }); }
function guessCategory(name, image) { const s = `${name} ${image}`.toLowerCase(); if (/postgres|mysql|maria|mongo|redis|valkey|weaviate/.test(s)) return 'Database'; if (/nginx|traefik|portainer/.test(s)) return 'Infra'; if (/ollama|openwebui|llm/.test(s)) return 'AI'; if (/n8n|workflow/.test(s)) return 'Automation'; if (/vpn|wireguard|wg/.test(s)) return 'Network'; return 'Service'; }
function guessUrl(container) { const ports = Array.isArray(container.Ports) ? container.Ports : []; const published = ports.find(p => p.PublicPort); return published ? `http://HOST:${published.PublicPort}` : ''; }
app.get('/api/discovery/docker', requireApiAuth, requireAdmin, async (_req, res) => { try { const containers = await dockerGet('/containers/json?all=1'); res.json(containers.map(c => ({ id: c.Id, name: (c.Names?.[0] || '').replace(/^\//, '') || c.Image, image: c.Image, url: guessUrl(c), category: guessCategory(c.Names?.[0] || '', c.Image || ''), status: c.State || '', ports: c.Ports || [] }))); } catch (e) { res.status(500).json({ error: `Docker autodiscovery unavailable: ${e.message}` }); } });
app.post('/api/discovery/import', requireApiAuth, requireAdmin, (req, res) => { const { serverId, items } = req.body || {}; const state = loadState(); if (!state.servers.find(s => s.id === serverId)) return res.status(400).json({ error: 'invalid serverId' }); let order = state.services.filter(s => s.serverId === serverId).length; for (const item of (items || [])) { order += 1; state.services.push({ id: generateId('svc'), serverId, name: item.name || item.image || 'Container', url: item.url || '', description: item.image ? `Docker image: ${item.image}` : '', category: item.category || 'Service', iconUrl: '', healthUrl: item.url || '', checkMethod: item.url ? 'auto' : 'disabled', pinned: false, order, credentials: [], links: [], notes: item.name ? `Docker: ${item.name}` : 'Docker autodiscovery import' }); } saveState(state); res.json(state); });
app.post('/api/telegram/test', requireApiAuth, requireAdmin, async (_req, res) => { try { res.json({ ok: true, result: await sendTelegramMessage(loadSettings(), 'Тест Telegram-уведомления из портала.') }); } catch (e) { res.status(400).json({ error: e.message }); } });
app.get('/health', (_req, res) => res.json({ ok: true, ssl: SSL_ENABLED, time: nowIso() }));
app.get('/', requireAuth, (_req, res) => res.sendFile(path.join(ROOT, 'public', 'index.html')));
app.use(express.static(path.join(ROOT, 'public')));
const serverFactory = () => {
  if (SSL_ENABLED) {
    const cert = path.join(ROOT, 'certs', 'fullchain.pem');
    const key = path.join(ROOT, 'certs', 'privkey.pem');
    if (!fs.existsSync(cert) || !fs.existsSync(key)) throw new Error('SSL_ENABLED=true but cert files are missing');
    return https.createServer({ cert: fs.readFileSync(cert), key: fs.readFileSync(key) }, app);
  }
  return http.createServer(app);
};
serverFactory().listen(PORT, '0.0.0.0', () => console.log(`Self-hosted portal listening on ${SSL_ENABLED ? 'https' : 'http'}://0.0.0.0:${PORT}`));
