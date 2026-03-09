const state = {
  me: null,
  settings: null,
  portalState: { servers: [], services: [], meta: {} },
  metrics: null,
  authLogs: [],
  onlineUsers: [],
  domainChecks: [],
  users: [],
  discovery: [],
  search: '',
  widgetsCollapsed: false,
  localPrefs: loadLocalPrefs(),
  draggedServiceId: null,
  draggedFromServerId: null,
  settingsSaveTimer: null,
};

const I18N = {
  ru: {
    search: 'Поиск по серверам, сервисам, URL, заметкам, полям и ссылкам',
    widgets: 'Виджеты', settings: 'Настройки', import: 'Импорт', export: 'Экспорт', autodiscovery: 'Автопоиск',
    addServer: '+ Сервер', addService: '+ Сервис', server: 'Сервер', services: 'Сервисы', service: 'Сервис',
    online: 'Сейчас онлайн', authLog: 'Журнал входов', domainChecks: 'Домены и SSL', ssd: 'SSD', ram: 'RAM',
    noResults: 'Ничего не найдено. Измени поиск или добавь сервер/сервис.', noServices: 'В этом сервере пока нет сервисов.',
    noDescription: 'Без описания', notes: 'Заметки', open: 'Открыть', edit: 'Редактировать', delete: 'Удалить', duplicate: 'Дублировать',
    locale: 'Локализация', material: 'Материал', theme: 'Тема', flat: 'Плоский', glassLight: 'Светлое стекло', glassDark: 'Темное матовое стекло',
    dark: 'Темная', light: 'Светлая', system: 'Системная', appearance: 'Оформление', portal: 'Портал', users: 'Пользователи', telegram: 'Телеграм бот',
    badge: 'Бейдж', title: 'Заголовок', subtitle: 'Подзаголовок', footer: 'Подпись в футере',
    density: 'Плотность', comfortable: 'Комфортно', compact: 'Компактно', ultraCompact: 'Очень компактно',
    actionsStyle: 'Кнопки сервисов', iconsText: 'Иконки и текст', iconsOnly: 'Только иконки', compactMode: 'Компактно', actionVisibility: 'Показ кнопок', hover: 'По наведению', always: 'Всегда',
    widgetsVisibility: 'Виджеты', expanded: 'Развернуто', hidden: 'Скрыто',
    accent: 'Акцентный цвет', topGlow: 'Верхняя точка', leftGlow: 'Левая точка', bottomGlow: 'Правая нижняя точка', intensity: 'Интенсивность', sceneBackground: 'Фон сцены',
    reset: 'Сбросить', close: 'Закрыть', save: 'Сохранить', cancel: 'Отмена',
    profile: 'Профиль', avatar: 'Аватар', logout: 'Выйти',
    credentials: 'Поля доступа', links: 'Ссылки', addField: '+ Добавить поле', addLink: '+ Добавить ссылку',
    username: 'Логин', password: 'Пароль', role: 'Роль', active: 'Активен', disabled: 'Отключен', addUser: '+ Пользователь',
    addServerTitle: 'Добавить сервер', editServerTitle: 'Редактировать сервер', addServiceTitle: 'Добавить сервис', editServiceTitle: 'Редактировать сервис',
    ip: 'IP', baseUrl: 'Домен / URL', description: 'Описание', category: 'Категория', iconUrl: 'Иконка сервера (URL)', healthUrl: 'Health URL', checkMethod: 'Метод проверки', pinned: 'Закрепить', tags: 'Теги',
    selectAll: 'Выбрать все', clearAll: 'Снять все', refresh: 'Обновить', importSelected: 'Импортировать выбранное', selected: 'Выбрано', importToServer: 'Импортировать в сервер', noImportResults: 'Ничего не найдено для импорта',
    time: 'Время', event: 'Событие', status: 'Статус', domain: 'Домен', until: 'До',
    unresolved: 'Не резолвится', noSsl: 'Без SSL', expires: 'Истекает', allGood: 'OK',
    botToken: 'Bot token', chatId: 'Chat ID', threadId: 'Thread ID', enableTelegram: 'Включить Telegram', summarySchedule: 'Отправка сводки', schedule: 'Расписание', sendTest: 'Тест', every15m: 'Каждые 15 минут', every30m: 'Каждые 30 минут', hourly: 'Каждый час', daily: 'Каждый день', cron: 'Cron',
    addDomainHelp: 'Список доменов: по одному в строке, можно host:port',
    free: 'Свободно', used: 'Используется', total: 'Всего',
    serviceType: 'Сервис', databaseType: 'База данных', infraType: 'Инфраструктура', networkType: 'Сеть', aiType: 'AI', automationType: 'Автоматизация',
  },
  en: {
    search: 'Search servers, services, URL, notes, fields and links', widgets: 'Widgets', settings: 'Settings', import: 'Import', export: 'Export', autodiscovery: 'Autodiscovery',
    addServer: '+ Server', addService: '+ Service', server: 'Server', services: 'Services', service: 'Service', online: 'Online now', authLog: 'Auth log', domainChecks: 'Domains and SSL', ssd: 'SSD', ram: 'RAM',
    noResults: 'Nothing found. Change query or add a server/service.', noServices: 'No services in this server yet.', noDescription: 'No description', notes: 'Notes', open: 'Open', edit: 'Edit', delete: 'Delete', duplicate: 'Duplicate',
    locale: 'Locale', material: 'Material', theme: 'Theme', flat: 'Flat', glassLight: 'Light glass', glassDark: 'Dark frosted glass', dark: 'Dark', light: 'Light', system: 'System', appearance: 'Appearance', portal: 'Portal', users: 'Users', telegram: 'Telegram bot',
    badge: 'Badge', title: 'Title', subtitle: 'Subtitle', footer: 'Footer signature', density: 'Density', comfortable: 'Comfortable', compact: 'Compact', ultraCompact: 'Ultra compact',
    actionsStyle: 'Service buttons', iconsText: 'Icons and text', iconsOnly: 'Icons only', compactMode: 'Compact', actionVisibility: 'Button visibility', hover: 'On hover', always: 'Always', widgetsVisibility: 'Widgets', expanded: 'Expanded', hidden: 'Hidden',
    accent: 'Accent color', topGlow: 'Top glow', leftGlow: 'Left glow', bottomGlow: 'Bottom-right glow', intensity: 'Intensity', sceneBackground: 'Scene background', reset: 'Reset', close: 'Close', save: 'Save', cancel: 'Cancel',
    profile: 'Profile', avatar: 'Avatar', logout: 'Log out', credentials: 'Credentials', links: 'Links', addField: '+ Add field', addLink: '+ Add link',
    username: 'Username', password: 'Password', role: 'Role', active: 'Active', disabled: 'Disabled', addUser: '+ User', addServerTitle: 'Add server', editServerTitle: 'Edit server', addServiceTitle: 'Add service', editServiceTitle: 'Edit service',
    ip: 'IP', baseUrl: 'Domain / URL', description: 'Description', category: 'Category', iconUrl: 'Server icon (URL)', healthUrl: 'Health URL', checkMethod: 'Check method', pinned: 'Pinned', tags: 'Tags',
    selectAll: 'Select all', clearAll: 'Clear all', refresh: 'Refresh', importSelected: 'Import selected', selected: 'Selected', importToServer: 'Import into server', noImportResults: 'Nothing found for import',
    time: 'Time', event: 'Event', status: 'Status', domain: 'Domain', until: 'Valid until', unresolved: 'Unresolved', noSsl: 'No SSL', expires: 'Expires', allGood: 'OK',
    botToken: 'Bot token', chatId: 'Chat ID', threadId: 'Thread ID', enableTelegram: 'Enable Telegram', summarySchedule: 'Summary schedule', schedule: 'Schedule', sendTest: 'Send test', every15m: 'Every 15 min', every30m: 'Every 30 min', hourly: 'Hourly', daily: 'Daily', cron: 'Cron',
    addDomainHelp: 'One domain per line, optionally host:port', free: 'Free', used: 'Used', total: 'Total',
    serviceType: 'Service', databaseType: 'Database', infraType: 'Infra', networkType: 'Network', aiType: 'AI', automationType: 'Automation',
  }
};

function loadLocalPrefs() {
  const defaults = { themeMode: 'dark', materialMode: 'glass-dark', accent: '#9f7aea', glowTopColor: '#9f7aea', glowLeftColor: '#21c7b7', glowBottomColor: '#5d3891', glowTopStrength: 50, glowLeftStrength: 50, glowBottomStrength: 50 };
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem('portal-ui-prefs') || '{}')) }; } catch { return defaults; }
}
function saveLocalPrefs() { localStorage.setItem('portal-ui-prefs', JSON.stringify(state.localPrefs)); }
function lang() { return state.settings?.locale === 'en' ? 'en' : 'ru'; }
function t(key) { return I18N[lang()][key] || key; }
function esc(v) { return String(v ?? '').replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s])); }
function byOrder(a,b){ return (a.order||0) - (b.order||0); }
function isAdmin(){ return state.me?.role === 'admin'; }
function hexToRgbString(hex){ const clean = String(hex || '#000000').replace('#',''); const val = clean.length===3 ? clean.split('').map(x=>x+x).join('') : clean.padEnd(6,'0').slice(0,6); const int = parseInt(val,16); return `${(int>>16)&255} ${(int>>8)&255} ${int&255}`; }
function api(path, options={}) { return fetch(path, { headers: { 'Content-Type':'application/json', ...(options.headers||{}) }, ...options }).then(async r => { const ct = r.headers.get('content-type') || ''; const body = ct.includes('application/json') ? await r.json().catch(()=>({})) : await r.text(); if (!r.ok) throw new Error(body?.error || body || `HTTP ${r.status}`); return body; }); }
function apiForm(path, formData, options={}) { return fetch(path, { method:'POST', body:formData, ...options }).then(async r => { const body = await r.json().catch(()=>({})); if (!r.ok) throw new Error(body?.error || `HTTP ${r.status}`); return body; }); }
function serverServices(serverId){ return state.portalState.services.filter(s => s.serverId === serverId).sort(byOrder); }
function serviceMatches(service, server, q){ const blob = [service.name, service.url, service.description, service.category, service.notes, server?.name, server?.ip, server?.baseUrl, ...(service.credentials||[]).map(x=>`${x.label} ${x.value}`), ...(service.links||[]).map(x=>`${x.label} ${x.url}`)].join(' ').toLowerCase(); return blob.includes(q); }
function visibleServers(){ const q = state.search.trim().toLowerCase(); const servers = [...state.portalState.servers].sort(byOrder); if (!q) return servers; return servers.filter(server => [server.name, server.ip, server.baseUrl, server.description, ...(server.tags||[])].join(' ').toLowerCase().includes(q) || serverServices(server.id).some(s=>serviceMatches(s,server,q))); }
function visibleServicesForServer(server){ const q = state.search.trim().toLowerCase(); const services = serverServices(server.id); return !q ? services : services.filter(s=>serviceMatches(s,server,q)); }
function normalizeIntensity(v){ return Math.max(0, Math.min(100, Number(v)||0)); }
function typeGlyph(type){ return ({ Database:'🗄', AI:'🧠', Automation:'⚙', Infra:'🧰', Network:'🌐', Service:'🔧' }[type] || '🔧'); }
function statusClass(item){ if (!item.ok) return 'bad'; if (!item.hasSsl) return 'warn'; if (item.daysLeft <= 14) return 'warn'; return 'good'; }
function debounce(fn, wait){ let tmr; return (...args)=>{ clearTimeout(tmr); tmr = setTimeout(()=>fn(...args), wait); }; }

async function loadAll(){
  const meRes = await api('/api/me');
  state.me = meRes.user; state.settings = meRes.settings;
  const [portalState, metrics, authLogs, onlineUsers, domainChecks] = await Promise.all([
    api('/api/state'),
    api('/api/system/metrics'),
    isAdmin()?api('/api/auth/logs?limit=20').catch(()=>[]):Promise.resolve([]),
    api('/api/auth/online-users').catch(()=>[]),
    api('/api/domain-checks').catch(()=>[]),
  ]);
  state.portalState = portalState; state.metrics = metrics; state.authLogs = authLogs; state.onlineUsers = onlineUsers; state.domainChecks = domainChecks;
  if (isAdmin()) state.users = await api('/api/users').catch(()=>[]);
  render();
}

function applyTheme(){
  const body = document.body;
  const mode = state.localPrefs.themeMode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : state.localPrefs.themeMode;
  body.classList.toggle('theme-light', mode === 'light');
  body.classList.toggle('theme-dark', mode !== 'light');
  body.classList.remove('density-comfortable','density-compact','density-ultra-compact');
  body.classList.add(`density-${state.settings?.densityMode || 'comfortable'}`);
  body.classList.remove('material-flat','material-glass-light','material-glass-dark');
  body.classList.add(`material-${state.localPrefs.materialMode || 'glass-dark'}`);
  body.classList.toggle('has-scene-image', !!state.settings?.backgroundImageUrl);
  document.documentElement.style.setProperty('--accent', state.localPrefs.accent);
  document.documentElement.style.setProperty('--glow-top-color', hexToRgbString(state.localPrefs.glowTopColor));
  document.documentElement.style.setProperty('--glow-left-color', hexToRgbString(state.localPrefs.glowLeftColor));
  document.documentElement.style.setProperty('--glow-bottom-color', hexToRgbString(state.localPrefs.glowBottomColor));
  document.documentElement.style.setProperty('--glow-top-strength', String(normalizeIntensity(state.localPrefs.glowTopStrength) / 100 * 0.48));
  document.documentElement.style.setProperty('--glow-left-strength', String(normalizeIntensity(state.localPrefs.glowLeftStrength) / 100 * 0.42));
  document.documentElement.style.setProperty('--glow-bottom-strength', String(normalizeIntensity(state.localPrefs.glowBottomStrength) / 100 * 0.42));
  const backdrop = document.getElementById('sceneBackdrop');
  if (backdrop) {
    backdrop.style.backgroundImage = state.settings?.backgroundImageUrl ? `url(${state.settings.backgroundImageUrl})` : 'none';
    backdrop.style.opacity = state.settings?.backgroundImageUrl ? (state.localPrefs.materialMode === 'flat' ? '.92' : '.94') : '.18';
  }
}

function render(){ applyTheme(); applyHeader(); renderWidgets(); renderServers(); renderFooter(); }
function applyHeader(){
  document.getElementById('portalBadgeText').textContent = state.settings.portalBadgeText || 'Portal';
  document.getElementById('portalTitle').textContent = state.settings.portalTitle || 'Portal';
  document.getElementById('portalSubtitle').textContent = state.settings.portalSubtitle || '';
  document.getElementById('searchInput').placeholder = t('search');
  document.getElementById('searchInput').value = state.search;
  document.getElementById('toggleWidgetsBtn').title = t('widgets');
  document.getElementById('settingsBtn').title = t('settings');
  document.getElementById('importBtn').title = t('import');
  document.getElementById('exportBtn').title = t('export');
  document.getElementById('discoveryBtn').textContent = t('autodiscovery');
  document.getElementById('addServerBtn').textContent = t('addServer');
  document.getElementById('addServiceBtn').textContent = t('addService');
  document.querySelectorAll('.admin-only').forEach(el => el.classList.toggle('hidden', !isAdmin()));
  const avatar = state.me?.avatarUrl ? `<img class="user-avatar" src="${esc(state.me.avatarUrl)}" alt="avatar" />` : `<span class="user-avatar avatar-fallback">${esc((state.me?.username||'?').slice(0,1).toUpperCase())}</span>`;
  document.getElementById('userArea').innerHTML = `<button class="btn user-chip" id="userMenuBtn">${avatar}<span class="muted">${esc(state.me?.username||'')}</span></button>`;
}
function renderFooter(){ const wrap=document.getElementById('footerWrap'); const text=String(state.settings.footerText||'').trim(); if(!text){ wrap.classList.add('hidden'); wrap.innerHTML=''; return; } wrap.classList.remove('hidden'); wrap.innerHTML=`<div class="panel footer-panel">${esc(text)}</div>`; }

function widgetCardBase(cls, title, inner){ return `<section class="panel widget-card ${cls}"><div class="widget-title">${title}</div>${inner}</section>`; }
function renderWidgets(){
  const wrap = document.getElementById('widgetsWrap'); const grid = document.getElementById('widgetsGrid');
  if (state.settings.widgetsMode === 'hidden' || state.widgetsCollapsed) { wrap.classList.add('hidden'); grid.innerHTML=''; return; }
  wrap.classList.remove('hidden');
  wrap.classList.toggle('compact', state.settings.widgetsMode === 'compact');
  const widgets = (state.settings.widgets||[]).filter(w=>w.enabled).sort(byOrder);
  grid.innerHTML = widgets.map(renderWidget).join('');
}
function renderWidget(widget){
  if (widget.type === 'ssd') {
    const d = state.metrics?.disk || {}; const pct = Number(d.percentUsed || 0);
    return widgetCardBase('widget-usage neutral', t('ssd'), `<div class="usage-value">${d.usedGb ?? '-'} <span>/ ${d.totalGb ?? '-'} Gb</span></div><div class="usage-bar"><span style="width:${pct}%"></span></div><div class="usage-foot muted">${t('free')} ${d.freeGb ?? '-'} Gb · ${pct}%</div>`);
  }
  if (widget.type === 'ram') {
    const d = state.metrics?.memory || {}; const pct = Number(d.percentUsed || 0);
    return widgetCardBase('widget-usage neutral', t('ram'), `<div class="usage-value">${d.usedGb ?? '-'} <span>/ ${d.totalGb ?? '-'} Gb</span></div><div class="usage-bar"><span style="width:${pct}%"></span></div><div class="usage-foot muted">${t('free')} ${d.freeGb ?? '-'} Gb · ${pct}%</div>`);
  }
  if (widget.type === 'auth-log') {
    const rows = (state.authLogs || []).slice(0, 8).map(i => `<tr><td>${new Date(i.time).toLocaleTimeString()}</td><td>${esc(i.username || '-')}</td><td>${esc(i.event || '-')}</td><td>${esc(i.ip || '-')}</td></tr>`).join('') || `<tr><td colspan="4" class="muted">—</td></tr>`;
    return widgetCardBase('widget-double', t('authLog'), `<table class="compact-table"><thead><tr><th>${t('time')}</th><th>${t('username')}</th><th>${t('event')}</th><th>IP</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
  if (widget.type === 'online-users') {
    const rows = (state.onlineUsers || []).slice(0, 8).map(i => `<tr><td>${esc(i.username || '-')}</td><td>${esc(i.ip || '-')}</td><td>${new Date(i.lastSeen).toLocaleTimeString()}</td><td class="status-good">●</td></tr>`).join('') || `<tr><td colspan="4" class="muted">—</td></tr>`;
    return widgetCardBase('widget-double', t('online'), `<table class="compact-table"><thead><tr><th>${t('username')}</th><th>IP</th><th>${t('time')}</th><th>${t('status')}</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
  if (widget.type === 'domain-ssl') {
    const rows = (state.domainChecks || []).map(i => { const status = !i.ok ? t('unresolved') : (i.hasSsl ? (i.daysLeft <= 14 ? `${t('expires')}: ${i.daysLeft}` : t('allGood')) : t('noSsl')); return `<tr><td>${esc(i.host)}</td><td>${esc(i.ip || '-')}</td><td>${i.hasSsl ? 'SSL' : '—'}</td><td>${esc(i.validTo ? new Date(i.validTo).toLocaleDateString() : '-')}</td><td class="status-${statusClass(i)}">${esc(status)}</td></tr>`; }).join('') || `<tr><td colspan="5" class="muted">—</td></tr>`;
    return widgetCardBase('widget-double', t('domainChecks'), `<table class="compact-table"><thead><tr><th>${t('domain')}</th><th>IP</th><th>SSL</th><th>${t('until')}</th><th>${t('status')}</th></tr></thead><tbody>${rows}</tbody></table>`);
  }
  return widgetCardBase('', esc(widget.type), '');
}

function renderServers(){ const root=document.getElementById('serversRoot'); const servers=visibleServers(); if(!servers.length){ root.innerHTML=`<section class="panel empty">${t('noResults')}</section>`; return; } root.innerHTML = servers.map(renderServer).join(''); attachServerHandlers(); }
function fallbackServerIcon(server){ return `<div class="server-icon">${esc((server.name||'S').slice(0,1).toUpperCase())}</div>`; }
function renderServer(server){
  const services = visibleServicesForServer(server); const expanded = state.search ? true : server.expanded !== false;
  const icon = server.iconUrl ? `<img class="server-icon" src="${esc(server.iconUrl)}" alt="${esc(server.name)}" />` : fallbackServerIcon(server);
  return `<section class="panel server-card" data-server-id="${esc(server.id)}"><div class="server-head" data-server-head="${esc(server.id)}"><div class="server-title">${icon}<div><h2>${esc(server.name)}</h2><div class="server-meta">${esc(server.ip||'')}${server.baseUrl ? ` · ${esc(server.baseUrl)}` : ''} · ${services.length} ${t('services').toLowerCase()}</div></div></div><div class="server-actions">${isAdmin()?`<button class="btn" data-action="edit-server" data-id="${esc(server.id)}">${t('edit')}</button>`:''}${isAdmin()?`<button class="btn icon-only danger" data-action="delete-server" data-id="${esc(server.id)}" title="${t('delete')}">🗑</button>`:''}<button class="btn icon-only chevron-btn" data-action="toggle-server" data-id="${esc(server.id)}" title="toggle"><span class="chevron ${expanded?'':'collapsed'}">⌄</span></button></div></div><div class="services-grid ${expanded?'':'hidden'}" data-service-dropzone="${esc(server.id)}">${services.length?services.map(renderServiceCard).join(''):`<div class="empty">${t('noServices')}</div>`}</div></section>`;
}
function renderServiceCard(service){
  const icon = service.iconUrl ? `<img class="service-icon" src="${esc(service.iconUrl)}" alt="${esc(service.name)}" />` : `<div class="service-icon icon-fallback">${esc((service.name||'S').slice(0,1).toUpperCase())}</div>`;
  const creds = (service.credentials||[]).slice(0,4).map(c=>`<div class="cred-row"><strong>${esc(c.label)}</strong><span class="cred-value-wrap">${c.secret ? `<button class="mini-icon-btn" data-secret-toggle title="show">◉</button><span class="secret-mask" data-secret-value="${esc(c.value)}">••••••••</span>` : `<span>${esc(c.value)}</span>`}${c.copyable!==false?`<button class="mini-icon-btn" data-copy="${esc(c.value)}" title="copy">⧉</button>`:''}</span></div>`).join('');
  const links = (service.links||[]).slice(0,4).map(l=>`<div class="link-row"><strong>${esc(l.label)}</strong><a class="service-link-cta" href="${esc(l.url)}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">${esc(l.label || t('open'))} ↗</a></div>`).join('');
  const style = state.settings.actionButtonsStyle || 'icons-with-text';
  const btnClass = style === 'icons-only' || style === 'compact' ? 'mini-btn icon-only' : 'mini-btn';
  const labels = style === 'icons-with-text' ? { edit:`✎ ${t('edit')}`, duplicate:'⧉', delete:'🗑' } : { edit:'✎', duplicate:'⧉', delete:'🗑' };
  const visibilityClass = state.settings.actionButtonsVisibility === 'hover' ? 'service-actions-hover' : '';
  return `<article class="panel service-card ${visibilityClass}" draggable="${isAdmin()}" data-service-id="${esc(service.id)}" data-server-id="${esc(service.serverId)}"><div class="service-top"><div class="service-title">${icon}<div><div class="service-name">${esc(service.name)}</div><div class="service-desc">${esc(service.description || t('noDescription'))}</div></div></div><div class="service-top-actions">${service.url?`<button class="btn service-open-cta" data-action="open-service" data-id="${esc(service.id)}">↗ ${t('open')}</button>`:''}<div class="dot"></div></div></div><div class="service-url">${esc(service.url || '')}</div>${creds || links ? `<div class="hr"></div>${creds}${links}` : ''}${service.notes ? `<div class="service-notes muted">${esc(service.notes)}</div>` : ''}<div class="action-row">${isAdmin()?`<button class="${btnClass}" data-action="edit-service" data-id="${esc(service.id)}">${labels.edit}</button>`:''}${isAdmin()?`<button class="${btnClass}" data-action="duplicate-service" data-id="${esc(service.id)}" title="${t('duplicate')}">${labels.duplicate}</button>`:''}${isAdmin()?`<button class="${btnClass} delete" data-action="delete-service" data-id="${esc(service.id)}">${labels.delete}</button>`:''}</div></article>`;
}

function attachServerHandlers(){
  document.querySelectorAll('[data-action]').forEach(el=>el.addEventListener('click', e => { e.stopPropagation(); const { action, id } = el.dataset; if (action === 'toggle-server') return toggleServer(id); if (action === 'edit-server') return openServerModal(id); if (action === 'delete-server') return deleteServer(id); if (action === 'edit-service') return openServiceModal(id); if (action === 'delete-service') return deleteService(id); if (action === 'open-service') return openService(id); if (action === 'duplicate-service') return duplicateService(id); }));
  document.querySelectorAll('[data-server-head]').forEach(head=>head.addEventListener('click', e=>{ if (e.target.closest('button,a,input,label')) return; toggleServer(head.dataset.serverHead); }));
  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click', e=>{ e.stopPropagation(); navigator.clipboard?.writeText(btn.dataset.copy || ''); btn.classList.add('copied'); setTimeout(()=>btn.classList.remove('copied'),600); }));
  document.querySelectorAll('[data-secret-toggle]').forEach(btn=>btn.addEventListener('click', e=>{ e.stopPropagation(); const valueEl = btn.parentElement.querySelector('[data-secret-value]'); if(!valueEl) return; const current = valueEl.textContent === '••••••••'; valueEl.textContent = current ? valueEl.dataset.secretValue : '••••••••'; }));
  document.querySelectorAll('.service-card').forEach(card=>{
    if (isAdmin()) {
      card.addEventListener('dragstart', ()=>{ state.draggedServiceId = card.dataset.serviceId; state.draggedFromServerId = card.dataset.serverId; card.classList.add('dragging'); });
      card.addEventListener('dragend', ()=>{ card.classList.remove('dragging'); state.draggedServiceId = null; state.draggedFromServerId = null; document.querySelectorAll('.drop-active').forEach(x=>x.classList.remove('drop-active')); });
    }
  });
  document.querySelectorAll('[data-service-dropzone]').forEach(zone=>{
    zone.addEventListener('dragover', e=>{ if (!state.draggedServiceId) return; e.preventDefault(); zone.classList.add('drop-active'); });
    zone.addEventListener('dragleave', ()=>zone.classList.remove('drop-active'));
    zone.addEventListener('drop', async e=>{ e.preventDefault(); zone.classList.remove('drop-active'); if(!state.draggedServiceId) return; const targetServerId = zone.dataset.serviceDropzone; const ids = Array.from(zone.querySelectorAll('.service-card')).map(x=>x.dataset.serviceId).filter(id=>id !== state.draggedServiceId); ids.push(state.draggedServiceId); await api('/api/reorder/services', { method:'POST', body: JSON.stringify({ sourceServerId: state.draggedFromServerId, targetServerId, movedServiceId: state.draggedServiceId, targetIds: ids }) }); await refreshState(); });
  });
}
async function toggleServer(id){ const server = state.portalState.servers.find(s=>s.id===id); await api(`/api/servers/${id}`, { method:'PUT', body: JSON.stringify({ expanded: !(server.expanded !== false) }) }); await refreshState(); }
function openService(id){ const service = state.portalState.services.find(s=>s.id===id); if(service?.url) window.open(service.url,'_blank','noopener,noreferrer'); }
async function deleteService(id){ if(!confirm(`${t('delete')} ${t('service').toLowerCase()}?`)) return; await api(`/api/services/${id}`, { method:'DELETE' }); await refreshState(); }
async function duplicateService(id){ await api(`/api/services/${id}/duplicate`, { method:'POST' }); await refreshState(); }
async function deleteServer(id){ if(!confirm(`${t('delete')} ${t('server').toLowerCase()}?`)) return; await api(`/api/servers/${id}?cascade=true`, { method:'DELETE' }); await refreshState(); }
function closeModal(){ document.getElementById('modalRoot').innerHTML=''; }
function openModal(inner){ document.getElementById('modalRoot').innerHTML = `<div class="modal-backdrop" id="modalBackdrop"><div class="panel modal">${inner}<button class="btn icon-only modal-close" id="closeModalBtn">✕</button></div></div>`; document.getElementById('closeModalBtn').onclick=closeModal; document.getElementById('modalBackdrop').addEventListener('click', e=>{ if(e.target.id==='modalBackdrop') closeModal(); }); }

function openServerModal(serverId=null){
  const server = serverId ? state.portalState.servers.find(s=>s.id===serverId) : { name:'', ip:'', baseUrl:'', description:'', iconUrl:'', tags:[] };
  openModal(`<h2>${serverId ? t('editServerTitle') : t('addServerTitle')}</h2><form id="serverForm" class="form-stack"><div class="form-grid"><label>${t('title')}<input class="input" name="name" value="${esc(server.name||'')}" required /></label><label>${t('ip')}<input class="input" name="ip" value="${esc(server.ip||'')}" /></label><label>${t('baseUrl')}<input class="input" name="baseUrl" value="${esc(server.baseUrl||'')}" /></label><label>${t('iconUrl')}<input class="input" name="iconUrl" value="${esc(server.iconUrl||'')}" /></label></div><label>${t('description')}<textarea name="description">${esc(server.description||'')}</textarea></label><label>${t('tags')}<input class="input" name="tags" value="${esc((server.tags||[]).join(', '))}" /></label><div class="form-actions"><button type="button" class="btn" id="cancelServerBtn">${t('cancel')}</button><button class="btn primary">${t('save')}</button></div></form>`);
  document.getElementById('cancelServerBtn').onclick=closeModal;
  document.getElementById('serverForm').onsubmit = async e => { e.preventDefault(); const form = new FormData(e.target); const payload = Object.fromEntries(form.entries()); payload.tags = String(payload.tags||'').split(',').map(x=>x.trim()).filter(Boolean); if(serverId) await api(`/api/servers/${serverId}`, { method:'PUT', body: JSON.stringify(payload) }); else await api('/api/servers', { method:'POST', body: JSON.stringify(payload) }); closeModal(); await refreshState(); };
}
function credentialRowHtml(item={}){ return `<div class="list-editor-row cred-item"><input class="input" name="credLabel" placeholder="Label" value="${esc(item.label||'')}" /><input class="input" name="credValue" placeholder="Value" value="${esc(item.value||'')}" /><label><input type="checkbox" name="credSecret" ${item.secret?'checked':''}/> Secret</label><label><input type="checkbox" name="credCopy" ${item.copyable!==false?'checked':''}/> Copy</label><button type="button" class="btn icon-only remove-row">✕</button></div>`; }
function linkRowHtml(item={}){ return `<div class="list-editor-row links link-item"><input class="input" name="linkLabel" placeholder="Label" value="${esc(item.label||'')}" /><input class="input" name="linkUrl" placeholder="URL" value="${esc(item.url||'')}" /><button type="button" class="btn icon-only remove-row">✕</button></div>`; }
function wireListEditor(root){ root.querySelectorAll('.remove-row').forEach(btn=>btn.onclick=()=>btn.parentElement.remove()); }
function collectCredentials(root){ return Array.from(root.querySelectorAll('.cred-item')).map((row, idx) => ({ id:`cred-${idx+1}-${Date.now()}`, label:row.querySelector('[name="credLabel"]').value.trim(), value:row.querySelector('[name="credValue"]').value, secret:row.querySelector('[name="credSecret"]').checked, copyable:row.querySelector('[name="credCopy"]').checked })).filter(x=>x.label || x.value); }
function collectLinks(root){ return Array.from(root.querySelectorAll('.link-item')).map((row, idx) => ({ id:`link-${idx+1}-${Date.now()}`, label:row.querySelector('[name="linkLabel"]').value.trim(), url:row.querySelector('[name="linkUrl"]').value.trim() })).filter(x=>x.label || x.url); }
function openServiceModal(serviceId=null){
  const service = serviceId ? state.portalState.services.find(s=>s.id===serviceId) : { serverId: state.portalState.servers[0]?.id || '', name:'', url:'', description:'', category:'', iconUrl:'', healthUrl:'', checkMethod:'auto', pinned:false, credentials:[], links:[], notes:'' };
  openModal(`<h2>${serviceId ? t('editServiceTitle') : t('addServiceTitle')}</h2><div class="help">Credentials маскируются в UI, но не являются vault-хранилищем.</div><form id="serviceForm" class="form-stack"><div class="form-grid"><label>${t('server')}<select class="select" name="serverId">${state.portalState.servers.sort(byOrder).map(s=>`<option value="${esc(s.id)}" ${s.id===service.serverId?'selected':''}>${esc(s.name)}</option>`).join('')}</select></label><label>${t('title')}<input class="input" name="name" value="${esc(service.name||'')}" required /></label><label>${t('baseUrl')}<input class="input" name="url" value="${esc(service.url||'')}" /></label><label>${t('category')}<input class="input" name="category" value="${esc(service.category||'')}" /></label><label>${t('healthUrl')}<input class="input" name="healthUrl" value="${esc(service.healthUrl||'')}" /></label><label>${t('iconUrl')}<input class="input" name="iconUrl" value="${esc(service.iconUrl||'')}" /></label></div><label>${t('description')}<textarea name="description">${esc(service.description||'')}</textarea></label><div class="form-grid"><label>${t('checkMethod')}<select class="select" name="checkMethod">${['auto','http','ping','disabled'].map(x=>`<option value="${x}" ${x===service.checkMethod?'selected':''}>${x}</option>`).join('')}</select></label><label><span>${t('pinned')}</span><input type="checkbox" name="pinned" ${service.pinned?'checked':''} /></label></div><label>${t('notes')}<textarea name="notes">${esc(service.notes||'')}</textarea></label><div class="hr"></div><div class="section-head"><h3>${t('credentials')}</h3><button type="button" class="btn" id="addCredBtn">${t('addField')}</button></div><div class="list-editor" id="credentialsEditor">${(service.credentials||[]).map(credentialRowHtml).join('')}</div><div class="hr"></div><div class="section-head"><h3>${t('links')}</h3><button type="button" class="btn" id="addLinkBtn">${t('addLink')}</button></div><div class="list-editor" id="linksEditor">${(service.links||[]).map(linkRowHtml).join('')}</div><div class="form-actions"><button type="button" class="btn" id="cancelServiceBtn">${t('cancel')}</button><button class="btn primary">${t('save')}</button></div></form>`);
  const credsRoot = document.getElementById('credentialsEditor'); const linksRoot = document.getElementById('linksEditor'); wireListEditor(document.getElementById('modalRoot'));
  document.getElementById('addCredBtn').onclick = ()=>{ credsRoot.insertAdjacentHTML('beforeend', credentialRowHtml()); wireListEditor(document.getElementById('modalRoot')); };
  document.getElementById('addLinkBtn').onclick = ()=>{ linksRoot.insertAdjacentHTML('beforeend', linkRowHtml()); wireListEditor(document.getElementById('modalRoot')); };
  document.getElementById('cancelServiceBtn').onclick=closeModal;
  document.getElementById('serviceForm').onsubmit = async e => { e.preventDefault(); const form = new FormData(e.target); const payload = Object.fromEntries(form.entries()); payload.pinned = !!form.get('pinned'); payload.credentials = collectCredentials(credsRoot); payload.links = collectLinks(linksRoot); if (serviceId) await api(`/api/services/${serviceId}`, { method:'PUT', body: JSON.stringify(payload) }); else await api('/api/services', { method:'POST', body: JSON.stringify(payload) }); closeModal(); await refreshState(); };
}

function rangeField(id,label,value,colorId,colorValue){
  return `<div class="intensity-row"><label for="${id}" class="field-label">${label}</label><input class="range-like" id="${id}" type="range" min="0" max="100" step="25" value="${value}" /><div class="range-value">${value}%</div><label class="color-chip-shell" style="--chip:${esc(colorValue)}"><input class="color-chip-input" id="${colorId}" type="color" value="${esc(colorValue)}" /><span class="color-chip"></span></label></div>`;
}
function colorButton(id, value){ return `<label class="color-chip-shell" style="--chip:${esc(value)}"><input class="color-chip-input" id="${id}" type="color" value="${esc(value)}" /><span class="color-chip"></span></label>`; }

function openSettingsModal(){
  const lp = state.localPrefs;
  const adminSection = isAdmin() ? `
    <div class="hr"></div>
    <div class="settings-shell admin-settings-grid">
      <div class="settings-col">
        <div class="section-head"><h3>${t('portal')}</h3></div>
        <label>${t('badge')}<input class="input live-setting" data-path="portalBadgeText" id="portalBadgeTextInput" value="${esc(state.settings.portalBadgeText||'')}" /></label>
        <label>${t('title')}<input class="input live-setting" data-path="portalTitle" id="portalTitleInput" value="${esc(state.settings.portalTitle||'')}" /></label>
        <label>${t('subtitle')}<textarea class="live-setting" data-path="portalSubtitle" id="portalSubtitleInput">${esc(state.settings.portalSubtitle||'')}</textarea></label>
        <label>${t('footer')}<input class="input live-setting" data-path="footerText" id="footerTextInput" value="${esc(state.settings.footerText||'')}" /></label>
      </div>
      <div class="settings-col">
        <div class="section-head"><h3>${t('widgets')}</h3></div>
        <label>${t('widgetsVisibility')}<select class="select live-setting" data-path="widgetsMode" id="widgetsModeInput">${[['expanded',t('expanded')],['compact',t('compact')],['hidden',t('hidden')]].map(([v,l])=>`<option value="${v}" ${(state.settings.widgetsMode||'expanded')===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>${t('density')}<select class="select live-setting" data-path="densityMode" id="densityModeInput">${[['comfortable',t('comfortable')],['compact',t('compact')],['ultra-compact',t('ultraCompact')]].map(([v,l])=>`<option value="${v}" ${state.settings.densityMode===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>${t('actionsStyle')}<select class="select live-setting" data-path="actionButtonsStyle" id="actionButtonsStyleInput">${[['icons-with-text',t('iconsText')],['icons-only',t('iconsOnly')],['compact',t('compactMode')]].map(([v,l])=>`<option value="${v}" ${state.settings.actionButtonsStyle===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>${t('actionVisibility')}<select class="select live-setting" data-path="actionButtonsVisibility" id="actionButtonsVisibilityInput">${[['always-visible',t('always')],['hover',t('hover')]].map(([v,l])=>`<option value="${v}" ${state.settings.actionButtonsVisibility===v?'selected':''}>${l}</option>`).join('')}</select></label>
      </div>
    </div>
    <div class="hr"></div>
    <div class="section-head"><h3>${t('telegram')}</h3></div>
    <div class="form-grid">
      <label><span>${t('enableTelegram')}</span><input type="checkbox" id="telegramEnabledInput" ${state.settings.telegram?.enabled?'checked':''} /></label>
      <label>${t('botToken')}<input class="input" id="telegramBotTokenInput" value="${esc(state.settings.telegram?.botToken||'')}" /></label>
      <label>${t('chatId')}<input class="input" id="telegramChatIdInput" value="${esc(state.settings.telegram?.chatId||'')}" /></label>
      <label>${t('threadId')}<input class="input" id="telegramThreadIdInput" value="${esc(state.settings.telegram?.threadId||'')}" /></label>
      <label><span>${t('summarySchedule')}</span><input type="checkbox" id="telegramScheduleEnabledInput" ${state.settings.telegram?.scheduleEnabled?'checked':''} /></label>
      <label>${t('schedule')}<select class="select" id="telegramScheduleTypeInput">${[['15m',t('every15m')],['30m',t('every30m')],['hourly',t('hourly')],['daily',t('daily')],['cron',t('cron')]].map(([v,l])=>`<option value="${v}" ${(state.settings.telegram?.scheduleType||'hourly')===v?'selected':''}>${l}</option>`).join('')}</select></label>
      <label>Cron<input class="input" id="telegramCronInput" value="${esc(state.settings.telegram?.scheduleCron||'0 * * * *')}" /></label>
      <button type="button" class="btn" id="telegramTestBtn">${t('sendTest')}</button>
    </div>
    <div class="hr"></div>
    <div class="section-head"><h3>${t('domainChecks')}</h3></div>
    <label>${t('addDomainHelp')}<textarea id="domainChecksInput">${(state.settings.domainChecks||[]).map(x=>x.host+((x.port&&x.port!==443)?`:${x.port}`:'')).join('\n')}</textarea></label>
    <div class="hr"></div>
    <div class="section-head"><h3>${t('users')}</h3><button class="btn" id="addUserBtn" type="button">${t('addUser')}</button></div>
    <div>${state.users.map(user=>`<div class="panel user-row"><div><strong>${esc(user.username)}</strong><div class="muted">${esc(user.role)} · ${user.isActive?t('active'):t('disabled')}</div></div><div class="user-actions"><button class="btn" type="button" data-user-action="toggle" data-id="${esc(user.id)}">${user.isActive?t('disabled'):t('active')}</button><button class="btn" type="button" data-user-action="password" data-id="${esc(user.id)}">${t('password')}</button>${user.id!==state.me.id?`<button class="btn danger" type="button" data-user-action="delete" data-id="${esc(user.id)}">${t('delete')}</button>`:''}</div></div>`).join('')||`<div class="empty">—</div>`}</div>
  ` : '';

  openModal(`<h2>${t('settings')}</h2>
    <div class="settings-shell">
      <div class="settings-col">
        <div class="section-head"><h3>${t('appearance')}</h3></div>
        <label>${t('locale')}<select class="select" id="localeInput">${['ru','en'].map(v=>`<option value="${v}" ${state.settings.locale===v?'selected':''}>${v==='ru'?'Русский':'English'}</option>`).join('')}</select></label>
        <label>${t('material')}<select class="select" id="materialMode">${[['flat',t('flat')],['glass-light',t('glassLight')],['glass-dark',t('glassDark')]].map(([v,l])=>`<option value="${v}" ${lp.materialMode===v?'selected':''}>${l}</option>`).join('')}</select></label>
        <label>${t('theme')}<select class="select" id="themeMode">${['dark','light','system'].map(v=>`<option value="${v}" ${lp.themeMode===v?'selected':''}>${t(v)}</option>`).join('')}</select></label>
        <label>${t('sceneBackground')}<input class="input" id="sceneBackgroundInput" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" /></label>
        ${state.settings.backgroundImageUrl?`<div class="background-preview"><img src="${esc(state.settings.backgroundImageUrl)}" alt="bg" /><button class="btn" type="button" id="clearBackgroundBtn">${t('delete')}</button></div>`:''}
      </div>
      <div class="settings-col compact-settings-col">
        <div class="section-head"><h3>${t('appearance')}</h3></div>
        <div class="compact-color-row"><label class="field-label">${t('accent')}</label><div class="color-inline">${colorButton('accentColor', lp.accent)}</div></div>
        ${rangeField('glowTopStrength',`${t('topGlow')} · ${t('intensity')}`,lp.glowTopStrength,'glowTopColor',lp.glowTopColor)}
        ${rangeField('glowLeftStrength',`${t('leftGlow')} · ${t('intensity')}`,lp.glowLeftStrength,'glowLeftColor',lp.glowLeftColor)}
        ${rangeField('glowBottomStrength',`${t('bottomGlow')} · ${t('intensity')}`,lp.glowBottomStrength,'glowBottomColor',lp.glowBottomColor)}
      </div>
    </div>
    ${adminSection}
    <div class="form-actions"><button type="button" class="btn" id="settingsResetBtn">${t('reset')}</button><button type="button" class="btn" id="settingsCloseBtn">${t('close')}</button></div>`);

  bindSettingsModal();
}

const autosaveSettings = debounce(async ()=>{
  if (!isAdmin()) return;
  try { await api('/api/settings', { method:'PUT', body: JSON.stringify(state.settings) }); } catch (e) { console.error(e); }
}, 400);
const autosaveLocalPrefs = debounce(()=>saveLocalPrefs(), 150);
function bindSettingsModal(){
  document.getElementById('settingsCloseBtn').onclick = closeModal;
  document.getElementById('settingsResetBtn').onclick = ()=>{ state.localPrefs = loadLocalPrefs(); render(); closeModal(); openSettingsModal(); };
    const localBindings = [
    ['themeMode','themeMode'], ['materialMode','materialMode'], ['accentColor','accent'], ['glowTopColor','glowTopColor'], ['glowLeftColor','glowLeftColor'], ['glowBottomColor','glowBottomColor'], ['glowTopStrength','glowTopStrength'], ['glowLeftStrength','glowLeftStrength'], ['glowBottomStrength','glowBottomStrength']
  ];
  const applyVisualState = ()=>{ applyTheme(); applyHeader(); renderWidgets(); renderServers(); renderFooter(); updateSettingsModalValues(); };
  localBindings.forEach(([id,key])=>{ const el=document.getElementById(id); if(!el) return; const sync=()=>{ state.localPrefs[key] = el.type==='range' ? Number(el.value) : el.value; autosaveLocalPrefs(); applyVisualState(); }; el.addEventListener('input', sync); el.addEventListener('change', sync); });
  document.getElementById('localeInput').addEventListener('change', e=>{ state.settings.locale = e.target.value; applyHeader(); renderWidgets(); renderServers(); renderFooter(); autosaveSettings(); });
  document.querySelectorAll('.live-setting').forEach(el=>{
    const save = ()=>{ state.settings[el.dataset.path] = el.value; applyHeader(); renderFooter(); autosaveSettings(); };
    el.addEventListener('input', save); el.addEventListener('change', save);
  });
  ['widgetsModeInput','densityModeInput','actionButtonsStyleInput','actionButtonsVisibilityInput'].forEach(id=>{ const el=document.getElementById(id); if(!el) return; el.addEventListener('change', ()=>{ const map={widgetsModeInput:'widgetsMode',densityModeInput:'densityMode',actionButtonsStyleInput:'actionButtonsStyle',actionButtonsVisibilityInput:'actionButtonsVisibility'}; state.settings[map[id]] = el.value; applyTheme(); renderWidgets(); renderServers(); renderFooter(); autosaveSettings(); }); });
  const bgInput = document.getElementById('sceneBackgroundInput'); if(bgInput) bgInput.addEventListener('change', async ()=>{ const file=bgInput.files[0]; if(!file) return; const fd=new FormData(); fd.append('background', file); const res=await apiForm('/api/settings/background', fd); state.settings.backgroundImageUrl = res.backgroundImageUrl; applyTheme(); autosaveSettings(); closeModal(); openSettingsModal(); });
  const clearBg = document.getElementById('clearBackgroundBtn'); if(clearBg) clearBg.onclick = async()=>{ const settings=await fetch('/api/settings/background',{method:'DELETE'}).then(r=>r.json()); state.settings=settings; applyTheme(); closeModal(); openSettingsModal(); };
  const tgBtn=document.getElementById('telegramTestBtn'); if(tgBtn) tgBtn.onclick = async()=>{ syncTelegramFromForm(); await api('/api/telegram/test',{method:'POST'}); alert('OK'); };
  ['telegramEnabledInput','telegramBotTokenInput','telegramChatIdInput','telegramThreadIdInput','telegramScheduleEnabledInput','telegramScheduleTypeInput','telegramCronInput','domainChecksInput'].forEach(id=>{ const el=document.getElementById(id); if(!el) return; const fn=()=>{ syncTelegramFromForm(); autosaveSettings(); }; el.addEventListener(el.type==='checkbox'?'change':'input', fn); });
  const addUserBtn=document.getElementById('addUserBtn'); if(addUserBtn) addUserBtn.onclick=()=>openAddUserModal();
  document.querySelectorAll('[data-user-action]').forEach(btn=>btn.onclick=()=>handleUserAction(btn.dataset.userAction, btn.dataset.id));
}
function updateSettingsModalValues(){ document.querySelectorAll('.range-value').forEach(el=>{ const input = el.previousElementSibling; if(input?.type==='range') el.textContent=`${input.value}%`; }); document.querySelectorAll('.color-chip').forEach(btn=>{ const id=btn.dataset.colorBtn; const input=document.getElementById(id); if(input) btn.style.setProperty('--chip', input.value); }); }
function syncTelegramFromForm(){ if(!isAdmin()) return; const tg = state.settings.telegram || {}; state.settings.telegram = { ...tg, enabled:document.getElementById('telegramEnabledInput').checked, botToken:document.getElementById('telegramBotTokenInput').value, chatId:document.getElementById('telegramChatIdInput').value, threadId:document.getElementById('telegramThreadIdInput').value, scheduleEnabled:document.getElementById('telegramScheduleEnabledInput').checked, scheduleType:document.getElementById('telegramScheduleTypeInput').value, scheduleCron:document.getElementById('telegramCronInput').value }; state.settings.domainChecks = document.getElementById('domainChecksInput').value.split('\n').map((line, idx)=>{ const raw=line.trim(); if(!raw) return null; const [host, port] = raw.split(':'); return { id:`dom-${idx+1}`, host, port: port ? Number(port) : 443 }; }).filter(Boolean); }
function openAddUserModal(){ openModal(`<h2>${t('addUser')}</h2><form id="addUserForm" class="form-stack"><label>${t('username')}<input class="input" name="username" required /></label><label>${t('password')}<input class="input" type="password" name="password" required /></label><label>${t('role')}<select class="select" name="role"><option value="viewer">viewer</option><option value="admin">admin</option></select></label><div class="form-actions"><button type="button" class="btn" id="cancelAddUserBtn">${t('cancel')}</button><button class="btn primary">${t('save')}</button></div></form>`); document.getElementById('cancelAddUserBtn').onclick=()=>{ closeModal(); openSettingsModal(); }; document.getElementById('addUserForm').onsubmit=async e=>{ e.preventDefault(); const form=new FormData(e.target); await api('/api/users',{method:'POST', body:JSON.stringify(Object.fromEntries(form.entries()))}); await refreshState(); closeModal(); openSettingsModal(); }; }
async function handleUserAction(action,id){ if(action==='toggle'){ const user=state.users.find(x=>x.id===id); await api(`/api/users/${id}`,{method:'PUT', body:JSON.stringify({ username:user.username, role:user.role, isActive:!user.isActive })}); } if(action==='password'){ const password=prompt(t('password')); if(password) await api(`/api/users/${id}/password`,{method:'PUT', body:JSON.stringify({ password })}); } if(action==='delete'){ if(confirm(t('delete')+'?')) await api(`/api/users/${id}`,{method:'DELETE'}); } await refreshState(); closeModal(); openSettingsModal(); }

async function refreshState(){
  state.portalState = await api('/api/state');
  state.metrics = await api('/api/system/metrics').catch(()=>state.metrics);
  state.onlineUsers = await api('/api/auth/online-users').catch(()=>state.onlineUsers);
  state.domainChecks = await api('/api/domain-checks').catch(()=>state.domainChecks);
  state.settings = await api('/api/settings').catch(()=>state.settings);
  if (isAdmin()) state.authLogs = await api('/api/auth/logs?limit=20').catch(()=>state.authLogs);
  if (isAdmin()) state.users = await api('/api/users').catch(()=>state.users);
  render();
}

function openUserQuickMenu(){
  openModal(`<h2>${t('profile')}</h2><div class="form-stack"><div class="panel profile-card">${state.me.avatarUrl?`<img class="user-avatar large" src="${esc(state.me.avatarUrl)}" alt="avatar" />`:`<div class="user-avatar avatar-fallback large">${esc((state.me.username||'?').slice(0,1).toUpperCase())}</div>`}<div><strong>${esc(state.me.username)}</strong><div class="muted">${esc(state.me.role)}</div></div></div><label>${t('avatar')}<input class="input" id="quickAvatarInput" type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" /></label><div class="form-actions"><button class="btn" id="profileUploadBtn">${t('save')}</button><button class="btn" id="profileSettingsBtn">${t('settings')}</button><button class="btn danger" id="logoutBtn">${t('logout')}</button></div></div>`);
  document.getElementById('profileSettingsBtn').onclick = ()=>{ closeModal(); openSettingsModal(); };
  document.getElementById('profileUploadBtn').onclick = async()=>{ const file=document.getElementById('quickAvatarInput').files[0]; if(!file) return; const fd=new FormData(); fd.append('avatar', file); await apiForm(`/api/users/${state.me.id}/avatar`, fd); closeModal(); await loadAll(); };
  document.getElementById('logoutBtn').onclick = async()=>{ await api('/api/logout',{method:'POST'}); location.href='/login.html'; };
}

async function openDiscoveryModal(){
  const containers = await api('/api/discovery/docker');
  state.discovery = containers.map(c=>({ ...c, selected:false }));
  renderDiscoveryModal();
}
function renderDiscoveryModal(){
  const q = state.discoverySearch || '';
  const items = state.discovery.filter(x => [x.name,x.image,x.url,x.category].join(' ').toLowerCase().includes(q.toLowerCase()));
  openModal(`<h2>${t('autodiscovery')}</h2><div class="discovery-toolbar"><input class="input" id="discoverySearch" placeholder="search" value="${esc(q)}" /><div class="row-actions"><button class="btn" id="discoverySelectAllBtn">${t('selectAll')}</button><button class="btn" id="discoveryClearAllBtn">${t('clearAll')}</button><button class="btn" id="discoveryRefreshBtn">${t('refresh')}</button></div></div><div class="discovery-toolbar"><label>${t('importToServer')}<select class="select" id="discoveryServerId">${state.portalState.servers.sort(byOrder).map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('')}</select></label><div class="muted">${t('selected')}: ${state.discovery.filter(x=>x.selected).length}</div><button class="btn primary" id="discoveryImportBtn">${t('importSelected')}</button></div><div class="discovery-list">${items.length?items.map(item=>`<div class="panel discovery-item ${item.selected?'selected':''}" data-discovery-id="${esc(item.id)}"><label class="checkbox-shell"><input class="checkbox-big" type="checkbox" ${item.selected?'checked':''} data-discovery-check="${esc(item.id)}" /></label><div><strong>${esc(item.name)}</strong><div class="muted">${esc(item.image)}</div><div class="muted">${esc(item.url||'')}</div></div><div class="type-badge icon-only" title="${esc(item.category)}">${typeGlyph(item.category)}</div></div>`).join(''):`<div class="empty">${t('noImportResults')}</div>`}</div>`);
  document.getElementById('discoverySearch').oninput = e=>{ state.discoverySearch = e.target.value; renderDiscoveryModal(); };
  document.getElementById('discoverySelectAllBtn').onclick = ()=>{ state.discovery.forEach(x=>x.selected=true); renderDiscoveryModal(); };
  document.getElementById('discoveryClearAllBtn').onclick = ()=>{ state.discovery.forEach(x=>x.selected=false); renderDiscoveryModal(); };
  document.getElementById('discoveryRefreshBtn').onclick = openDiscoveryModal;
  document.querySelectorAll('[data-discovery-check]').forEach(el=>el.onchange=()=>{ const item=state.discovery.find(x=>x.id===el.dataset.discoveryCheck); item.selected = el.checked; renderDiscoveryModal(); });
  document.querySelectorAll('.discovery-item').forEach(el=>el.onclick=e=>{ if(e.target.closest('input,button,select')) return; const item=state.discovery.find(x=>x.id===el.dataset.discoveryId); item.selected = !item.selected; renderDiscoveryModal(); });
  document.getElementById('discoveryImportBtn').onclick = async()=>{ const selected = state.discovery.filter(x=>x.selected); if(!selected.length) return alert(t('noImportResults')); await api('/api/discovery/import',{method:'POST', body:JSON.stringify({ serverId: document.getElementById('discoveryServerId').value, items:selected })}); closeModal(); await refreshState(); };
}

async function exportState(){ const data=await api('/api/export'); const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='portal-state.json'; a.click(); URL.revokeObjectURL(url); }
async function importState(file){ if(!file) return; const text=await file.text(); await api('/api/import',{method:'POST', body:text}); await refreshState(); }

function wireStaticHandlers(){
  document.getElementById('searchInput').addEventListener('input', e=>{ state.search=e.target.value; renderServers(); });
  document.getElementById('toggleWidgetsBtn').onclick=()=>{ state.widgetsCollapsed=!state.widgetsCollapsed; renderWidgets(); };
  document.getElementById('settingsBtn').onclick=openSettingsModal;
  document.getElementById('userArea').addEventListener('click', e=>{ if(e.target.closest('#userMenuBtn')) openUserQuickMenu(); });
  document.getElementById('discoveryBtn').onclick=openDiscoveryModal;
  document.getElementById('exportBtn').onclick=exportState;
  document.getElementById('importBtn').onclick=()=>document.getElementById('importFileInput').click();
  document.getElementById('importFileInput').onchange=e=>importState(e.target.files[0]);
  document.getElementById('addServerBtn').onclick=()=>openServerModal();
  document.getElementById('addServiceBtn').onclick=()=>openServiceModal();
}

loadAll().then(()=>{ wireStaticHandlers(); window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', ()=>{ if(state.localPrefs.themeMode==='system') render(); }); }).catch(err=>{ console.error(err); location.href='/login.html'; });
