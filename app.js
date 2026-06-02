import { selectFolder, buildTree, readFile, writeFile, createFile, deleteEntry, createDir, buildIndex, findHandleInTree, findDirHandleForFile } from './modules/fileSystem.js';
import { renderTree, setActiveFile } from './modules/tree.js';
import { openInEditor, getContent, showEditor, showPreview, jumpToLine } from './modules/editor.js';
import { renderTabs } from './modules/tabs.js';
import { searchFull, renderResults } from './modules/search.js';
import { renderLinks, findBacklinks, renderBacklinks } from './modules/links.js';
import { showAlert, showConfirm, showPrompt } from './modules/modal.js';
import { dbGet, dbSet } from './modules/persist.js';

// --- State ---
const state = {
  dirHandle: null,
  tree: null,
  tabs: [],
  activeTab: -1,
  searchIndex: [],
  lastModified: {}
};

// --- DOM refs ---
const treeEl        = document.getElementById('tree');
const tabBarEl      = document.getElementById('tab-bar');
const noteContent   = document.getElementById('note-content');
const previewEl     = document.getElementById('preview');
const backlinksEl   = document.getElementById('backlinks');
const searchEl      = document.getElementById('search');
const toggleBtn     = document.getElementById('toggle-view');
const settingsPanel = document.getElementById('settings-panel');
const openFolderBtn = document.getElementById('open-folder');
const saveBtn       = document.getElementById('save-btn');
const sidebarEl     = document.getElementById('sidebar');
const resizeHandle  = document.getElementById('sidebar-resize');
const reconnectBar  = document.getElementById('reconnect-bar');
const reconnectName = document.getElementById('reconnect-name');
const reconnectBtn  = document.getElementById('reconnect-btn');

// --- Sidebar visibility ---
const isMobile = window.matchMedia('(max-width: 768px)').matches;
let _sidebarVisible = localStorage.getItem('sidebar-visible') !== null
  ? localStorage.getItem('sidebar-visible') === 'true'
  : !isMobile;

function _updateSidebarVisibility() {
  sidebarEl.style.display    = _sidebarVisible ? '' : 'none';
  resizeHandle.style.display = _sidebarVisible ? '' : 'none';
  localStorage.setItem('sidebar-visible', _sidebarVisible);
}

document.getElementById('sidebar-toggle').onclick = () => {
  _sidebarVisible = !_sidebarVisible;
  _updateSidebarVisibility();
};

// Restore sidebar width
const savedWidth = localStorage.getItem('sidebar-width');
if (savedWidth) sidebarEl.style.width = savedWidth + 'px';
_updateSidebarVisibility();

// --- Sidebar resize ---
let _resizing = false;
const mainEl = document.querySelector('main');

resizeHandle.addEventListener('mousedown', () => {
  _resizing = true;
  resizeHandle.classList.add('active');
  document.body.style.cursor     = 'col-resize';
  document.body.style.userSelect = 'none';
});

document.addEventListener('mousemove', (e) => {
  if (!_resizing) return;
  const rect = mainEl.getBoundingClientRect();
  const w = Math.max(150, Math.min(500, e.clientX - rect.left));
  sidebarEl.style.width = w + 'px';
});

document.addEventListener('mouseup', () => {
  if (!_resizing) return;
  _resizing = false;
  resizeHandle.classList.remove('active');
  document.body.style.cursor     = '';
  document.body.style.userSelect = '';
  localStorage.setItem('sidebar-width', sidebarEl.offsetWidth);
});

// --- Folder open ---
openFolderBtn.onclick = async () => {
  try {
    openFolderBtn.textContent = 'Cargando...';
    openFolderBtn.disabled = true;
    const handle = await selectFolder();
    await _loadFolder(handle, true);
  } catch (e) {
    if (e.name !== 'AbortError') await showAlert('Error: ' + e.message);
  } finally {
    openFolderBtn.textContent = 'Abrir carpeta';
    openFolderBtn.disabled = false;
  }
};

// --- Load folder (shared by open + restore) ---
async function _loadFolder(handle, saveHandle = false) {
  state.dirHandle  = handle;
  state.tree       = await buildTree(handle);
  state.searchIndex= await buildIndex(state.tree);
  _refreshTree();
  reconnectBar.hidden = true;
  if (saveHandle) {
    await dbSet('dirHandle', handle);
    localStorage.removeItem('persist-tabs');
    localStorage.removeItem('persist-active-tab');
  }
}

// --- Persist session state ---
function _savePersistState() {
  localStorage.setItem('persist-tabs',       JSON.stringify(state.tabs.map(t => t.name)));
  localStorage.setItem('persist-active-tab', String(state.activeTab));
}

// --- Session restore on load ---
async function _restoreSession() {
  try {
    const handle = await dbGet('dirHandle');
    if (!handle) return;
    const perm = await handle.queryPermission({ mode: 'readwrite' });
    if (perm === 'denied') { await dbSet('dirHandle', null); return; }
    if (perm === 'granted') {
      await _loadFolder(handle);
      await _restoreTabs();
      return;
    }
    // 'prompt' — needs user gesture
    reconnectName.textContent = handle.name;
    reconnectBar.hidden = false;
    reconnectBtn.onclick = async () => {
      const granted = await handle.requestPermission({ mode: 'readwrite' });
      if (granted === 'granted') {
        reconnectBar.hidden = true;
        await _loadFolder(handle);
        await _restoreTabs();
      }
    };
  } catch (_) {}
}

async function _restoreTabs() {
  const names    = JSON.parse(localStorage.getItem('persist-tabs') || '[]');
  const activeIdx= parseInt(localStorage.getItem('persist-active-tab') || '0');
  for (const name of names) {
    const h = findHandleInTree(state.tree, name + '.md');
    if (h) await _openFile(h, name);
  }
  if (state.tabs.length > 0) {
    _switchTab(Math.min(activeIdx, state.tabs.length - 1));
  }
}

// --- Tree ---
function _refreshTree() {
  renderTree(state.tree, treeEl, {
    onFileClick:  _openFile,
    onDelete:     _deleteFile,
    onDuplicate:  _duplicateFile,
    onCreateFile: _newFile,
    onCreateDir:  _newDir,
    onMove:       _moveFile
  });
  if (state.activeTab >= 0) setActiveFile(treeEl, state.tabs[state.activeTab].name);
}

// --- Open file ---
async function _openFile(handle, name) {
  const existing = state.tabs.findIndex(t => t.handle === handle);
  if (existing >= 0) { _switchTab(existing); return; }
  const file = await handle.getFile();
  state.lastModified[name] = file.lastModified;
  const content = await file.text();
  const isMd = /\.(md|markdown|mdx)$/.test(handle.name);
  state.tabs.push({ handle, name, content, dirty: false, isMd });
  _switchTab(state.tabs.length - 1);
}

async function _openFileByName(name) {
  const handle = findHandleInTree(state.tree, name + '.md');
  if (handle) await _openFile(handle, name);
  else await showAlert('Nota no encontrada: ' + name);
}

// --- Tab management ---
function _switchTab(idx) {
  if (state.activeTab >= 0 && state.tabs[state.activeTab]) {
    state.tabs[state.activeTab].content = getContent();
  }
  state.activeTab = idx;
  const tab = state.tabs[idx];
  openInEditor(tab.content);
  setActiveFile(treeEl, tab.name);
  _renderCurrentNote();
  _renderTabs();
}

function _renderTabs() {
  renderTabs(tabBarEl, state.tabs, state.activeTab, _switchTab, _requestClose);
  _updateSaveBtn();
  _savePersistState();
}

function _updateSaveBtn() {
  const tab = state.activeTab >= 0 ? state.tabs[state.activeTab] : null;
  saveBtn.disabled = !tab;
  saveBtn.classList.toggle('dirty', !!(tab && tab.dirty));
}

async function _requestClose(idx) {
  const tab = state.tabs[idx];
  if (tab.dirty && !await showConfirm('Cerrar "' + tab.name + '" sin guardar?')) return;
  if (state.activeTab >= 0 && state.tabs[state.activeTab]) {
    state.tabs[state.activeTab].content = getContent();
  }
  state.tabs.splice(idx, 1);
  let newActive;
  if (state.tabs.length === 0) newActive = -1;
  else if (state.activeTab === idx) newActive = Math.min(idx, state.tabs.length - 1);
  else if (state.activeTab > idx) newActive = state.activeTab - 1;
  else newActive = state.activeTab;
  state.activeTab = -1;
  if (newActive >= 0) {
    _switchTab(newActive);
  } else {
    openInEditor('');
    previewEl.innerHTML  = '';
    backlinksEl.innerHTML= '';
    setActiveFile(treeEl, '');
    _renderTabs();
  }
}

// --- Highlight.js ---
const EXT_LANG = {
  js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript',
  py: 'python',
  sh: 'bash', bash: 'bash',
  ps1: 'powershell',
  bat: 'dos',
  rb: 'ruby',
  php: 'php',
  java: 'java',
  c: 'c', h: 'c',
  cpp: 'cpp', cc: 'cpp',
  go: 'go',
  rs: 'rust',
  swift: 'swift',
  kt: 'kotlin',
  sql: 'sql',
  json: 'json',
  yaml: 'yaml', yml: 'yaml',
  toml: 'toml',
  xml: 'xml',
  css: 'css',
  html: 'xml',
};

function _renderCode(container, content, filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const lang = EXT_LANG[ext];
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  if (lang) {
    try {
      code.innerHTML = hljs.highlight(content, { language: lang }).value;
    } catch (_) {
      code.textContent = content;
    }
  } else {
    code.textContent = content;
  }
  pre.appendChild(code);
  container.innerHTML = '';
  container.appendChild(pre);
}

// --- Render current note ---
function _renderCurrentNote() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (tab.isMd) {
    const allNames = state.searchIndex.map(e => e.name);
    renderLinks(tab.content, allNames, previewEl, _openFileByName, (text) => jumpToLine(text));
    const refs = findBacklinks(tab.name, state.searchIndex);
    renderBacklinks(refs, backlinksEl, _openFileByName);
  } else {
    _renderCode(previewEl, tab.content, tab.handle.name);
    backlinksEl.innerHTML = '';
  }
}

// --- Save ---
async function _save() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  tab.content = getContent();
  await writeFile(tab.handle, tab.content);
  tab.dirty = false;
  const entry = state.searchIndex.find(e => e.name === tab.name);
  if (entry) entry.content = tab.content;
  _renderTabs();
  _renderCurrentNote();
}

// --- Live update ---
noteContent.oninput = () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (!tab.dirty) { tab.dirty = true; _renderTabs(); }
  if (tab.isMd) {
    const allNames = state.searchIndex.map(e => e.name);
    renderLinks(getContent(), allNames, previewEl, _openFileByName, (text) => jumpToLine(text));
  } else {
    const pre = previewEl.querySelector('pre.plain-text');
    if (pre) pre.textContent = getContent();
  }
};

// --- Toggle editor/preview ---
toggleBtn.onclick = () => {
  if (noteContent.hidden) showEditor(); else showPreview();
};

// --- Search ---
searchEl.oninput = () => {
  const q = searchEl.value.trim();
  if (!q) { _refreshTree(); return; }
  const results = searchFull(q, state.searchIndex);
  renderResults(results, treeEl, _openFileByName);
};

// --- File operations ---
async function _deleteFile(dirHandle, name) {
  await deleteEntry(dirHandle, name);
  const idx = state.tabs.findIndex(t => t.name === name.replace('.md', ''));
  if (idx >= 0) {
    state.tabs.splice(idx, 1);
    if (state.activeTab === idx) {
      state.activeTab = -1;
      if (state.tabs.length > 0) _switchTab(Math.max(0, idx - 1));
      else { openInEditor(''); previewEl.innerHTML = ''; backlinksEl.innerHTML = ''; }
    } else if (state.activeTab > idx) state.activeTab--;
  }
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
  _renderTabs();
}

async function _duplicateFile(dirHandle, handle, name) {
  const content = await readFile(handle);
  const base = name.replace('.md', '');
  const newName = base + '-copia';
  const newHandle = await createFile(dirHandle, newName);
  await writeFile(newHandle, content);
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
}

async function _newFile(dirHandle, name) {
  const handle = await createFile(dirHandle, name);
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
  await _openFile(handle, name);
}

async function _newDir(dirHandle, name) {
  await createDir(dirHandle, name);
  state.tree = await buildTree(state.dirHandle);
  _refreshTree();
}

async function _moveFile(filename, targetDirHandle, targetDirName) {
  const srcDirHandle = findDirHandleForFile(state.tree, filename);
  if (srcDirHandle && await srcDirHandle.isSameEntry(targetDirHandle)) return;
  if (!await showConfirm('Mover "' + filename + '" a "' + targetDirName + '"?')) return;
  const srcHandle = findHandleInTree(state.tree, filename);
  if (!srcHandle) return;
  const content = await readFile(srcHandle);
  const newHandle = await createFile(targetDirHandle, filename);
  await writeFile(newHandle, content);
  if (srcDirHandle) await deleteEntry(srcDirHandle, filename);
  const tabIdx = state.tabs.findIndex(t => t.name === filename.replace('.md', ''));
  if (tabIdx >= 0) {
    state.tabs.splice(tabIdx, 1);
    if (state.activeTab === tabIdx) state.activeTab = -1;
    else if (state.activeTab > tabIdx) state.activeTab--;
  }
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
  _renderTabs();
  if (state.activeTab < 0 && state.tabs.length > 0) _switchTab(0);
}

document.getElementById('new-file-btn').onclick = async () => {
  if (!state.dirHandle) return;
  const name = await showPrompt('Nombre del archivo (sin .md):');
  if (name && name.trim()) _newFile(state.dirHandle, name.trim());
};

// --- Save button ---
saveBtn.onclick = () => _save();

// --- Keybindings ---
const KB_DEFAULTS = {
  save:         'ctrl+s',
  search:       'ctrl+f',
  closeTab:     'ctrl+w',
  toggleSidebar:'ctrl+b',
  newFile:      'ctrl+n',
  toggleEditor: 'ctrl+e',
};

let kb = Object.assign({}, KB_DEFAULTS, JSON.parse(localStorage.getItem('keybindings') || '{}'));

function _keyCombo(e) {
  const parts = [];
  if (e.ctrlKey || e.metaKey) parts.push('ctrl');
  if (e.altKey)   parts.push('alt');
  if (e.shiftKey) parts.push('shift');
  const key = e.key.toLowerCase();
  if (!['control','alt','shift','meta'].includes(key)) parts.push(key);
  return parts.join('+');
}

function _comboLabel(combo) {
  return combo.split('+').map(p =>
    p === 'ctrl' ? 'Ctrl' : p === 'alt' ? 'Alt' : p === 'shift' ? 'Shift' : p.toUpperCase()
  ).join('+');
}

function _initKeyInputs() {
  document.querySelectorAll('.key-input').forEach(input => {
    const action = input.dataset.action;
    input.value = _comboLabel(kb[action] || KB_DEFAULTS[action]);
    input.addEventListener('focus', () => { input.value = ''; input.placeholder = 'Pulsa tecla...'; });
    input.addEventListener('keydown', (e) => {
      e.preventDefault();
      const combo = _keyCombo(e);
      if (combo === 'escape') { input.value = _comboLabel(kb[action]); input.blur(); return; }
      if (!combo.includes('+') || combo.split('+').length < 2) return;
      kb[action] = combo;
      localStorage.setItem('keybindings', JSON.stringify(kb));
      input.value = _comboLabel(combo);
      input.placeholder = '';
      input.blur();
    });
    input.addEventListener('blur', () => { input.placeholder = ''; input.value = _comboLabel(kb[action]); });
  });
}

document.addEventListener('keydown', (e) => {
  if (!document.getElementById('modal-overlay').hidden) return;
  if (e.target.classList.contains('key-input')) return;
  const combo = _keyCombo(e);
  if (combo === kb.save)          { e.preventDefault(); _save(); }
  if (combo === kb.search)        { e.preventDefault(); searchEl.focus(); searchEl.select(); }
  if (combo === kb.closeTab)      { e.preventDefault(); if (state.activeTab >= 0) _requestClose(state.activeTab); }
  if (combo === kb.toggleSidebar) { e.preventDefault(); _sidebarVisible = !_sidebarVisible; _updateSidebarVisibility(); }
  if (combo === kb.newFile)       { e.preventDefault(); document.getElementById('new-file-btn').click(); }
  if (combo === kb.toggleEditor)  { e.preventDefault(); toggleBtn.click(); }
});

// --- Settings ---
document.getElementById('settings-btn').onclick = () => { settingsPanel.hidden = !settingsPanel.hidden; };
document.getElementById('close-settings').onclick = () => { settingsPanel.hidden = true; };

const autosaveToggle   = document.getElementById('autosave-toggle');
const autosaveInterval = document.getElementById('autosave-interval');
let _autosaveTimer = null;

function _setupAutosave() {
  clearInterval(_autosaveTimer);
  const enabled = localStorage.getItem('autosave') === 'true';
  const secs    = parseInt(localStorage.getItem('autosave-interval') || '30');
  autosaveToggle.checked = enabled;
  autosaveInterval.value = secs;
  if (enabled) _autosaveTimer = setInterval(_save, secs * 1000);
}

autosaveToggle.onchange = () => { localStorage.setItem('autosave', autosaveToggle.checked); _setupAutosave(); };
autosaveInterval.onchange = () => { localStorage.setItem('autosave-interval', autosaveInterval.value); _setupAutosave(); };

// --- Theme ---
function _hexToRgb(hex) { return [1,3,5].map(i => parseInt(hex.slice(i, i+2), 16)); }
function _rgbToHex(r,g,b) { return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,v)).toString(16).padStart(2,'0')).join(''); }

function _applyTheme(bg, accent) {
  const [r,g,b] = _hexToRgb(bg);
  const lum = 0.299*r + 0.587*g + 0.114*b;
  const dark = lum < 128;
  const s1 = dark ? 7 : -7, s2 = dark ? 15 : -15, s3 = dark ? 32 : -32;
  const root = document.documentElement;
  root.style.setProperty('--bg',       bg);
  root.style.setProperty('--bg-2',     _rgbToHex(r+s1, g+s1, b+s1));
  root.style.setProperty('--bg-3',     _rgbToHex(r+s2, g+s2, b+s2));
  root.style.setProperty('--border',   _rgbToHex(r+s3, g+s3, b+s3));
  root.style.setProperty('--text',     dark ? '#d4d4d4' : '#1e1e1e');
  root.style.setProperty('--text-dim', dark ? '#858585' : '#555555');
  root.style.setProperty('--accent',   accent);
}

const GFONTS = {
  "'JetBrains Mono', monospace": 'JetBrains+Mono:wght@400;700',
  "'Inter', sans-serif":         'Inter:wght@400;700',
};

function _loadFont(fontValue) {
  const gfont = GFONTS[fontValue];
  if (gfont && !document.getElementById('gfont-' + gfont)) {
    const link = Object.assign(document.createElement('link'), { id: 'gfont-' + gfont, rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=' + gfont + '&display=swap' });
    document.head.appendChild(link);
  }
}

function _loadCustomFont(name) {
  let link = document.getElementById('gfont-custom');
  if (!link) { link = Object.assign(document.createElement('link'), { id: 'gfont-custom', rel: 'stylesheet' }); document.head.appendChild(link); }
  link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name) + ':wght@400;700&display=swap';
}

function _applyFont(fontValue, isCustom) {
  if (isCustom) { _loadCustomFont(fontValue); document.body.style.fontFamily = "'" + fontValue + "', system-ui, sans-serif"; }
  else { _loadFont(fontValue); document.body.style.fontFamily = fontValue; }
}

function _loadSettings() {
  const bg     = localStorage.getItem('theme-bg')     || '#1e1e1e';
  const accent = localStorage.getItem('theme-accent') || '#569cd6';
  const preset = localStorage.getItem('font-preset')  || "'Consolas', 'Menlo', monospace";
  const custom = localStorage.getItem('font-custom')  || '';

  document.getElementById('setting-bg').value     = bg;
  document.getElementById('setting-accent').value = accent;
  _applyTheme(bg, accent);

  const fontSize = parseInt(localStorage.getItem('font-size') || '16');
  const fsEl = document.getElementById('setting-fontsize');
  fsEl.value = fontSize;
  document.getElementById('setting-fontsize-label').textContent = fontSize + 'px';
  document.documentElement.style.fontSize = fontSize + 'px';

  const presetEl = document.getElementById('setting-font-preset');
  const customEl = document.getElementById('setting-font-custom');
  if (preset === 'custom') {
    presetEl.value = 'custom'; customEl.hidden = false; customEl.value = custom; _applyFont(custom, true);
  } else {
    presetEl.value = preset; customEl.hidden = true; _applyFont(preset, false);
  }

  document.getElementById('show-extensions-toggle').checked = localStorage.getItem('show-extensions') === 'true';
}

document.getElementById('show-extensions-toggle').onchange = (e) => {
  localStorage.setItem('show-extensions', e.target.checked);
  _refreshTree();
};

document.getElementById('setting-fontsize').oninput = (e) => {
  const size = e.target.value;
  document.documentElement.style.fontSize = size + 'px';
  document.getElementById('setting-fontsize-label').textContent = size + 'px';
  localStorage.setItem('font-size', size);
};

document.getElementById('setting-bg').oninput = (e) => {
  _applyTheme(e.target.value, document.getElementById('setting-accent').value);
  localStorage.setItem('theme-bg', e.target.value);
};
document.getElementById('setting-accent').oninput = (e) => {
  _applyTheme(document.getElementById('setting-bg').value, e.target.value);
  localStorage.setItem('theme-accent', e.target.value);
};
document.getElementById('setting-font-preset').onchange = (e) => {
  const customEl = document.getElementById('setting-font-custom');
  if (e.target.value === 'custom') { customEl.hidden = false; customEl.focus(); }
  else { customEl.hidden = true; _applyFont(e.target.value, false); localStorage.setItem('font-preset', e.target.value); localStorage.removeItem('font-custom'); }
};
document.getElementById('setting-font-custom').oninput = (e) => {
  const name = e.target.value.trim();
  if (!name) return;
  _applyFont(name, true); localStorage.setItem('font-preset', 'custom'); localStorage.setItem('font-custom', name);
};

// --- External file change detection ---
window.addEventListener('focus', async () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  try {
    const file = await tab.handle.getFile();
    if (file.lastModified !== state.lastModified[tab.name]) {
      state.lastModified[tab.name] = file.lastModified;
      if (!tab.dirty || await showConfirm('"' + tab.name + '" fue modificado externamente. Recargar?')) {
        tab.content = await file.text(); tab.dirty = false;
        openInEditor(tab.content); _renderCurrentNote(); _renderTabs();
      }
    }
  } catch (_) {}
});

// --- Init ---
_loadSettings();
_setupAutosave();
_initKeyInputs();
_restoreSession();
window.addEventListener('beforeunload', () => clearInterval(_autosaveTimer));
