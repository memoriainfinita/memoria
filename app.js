import { selectFolder, buildTree, readFile, writeFile, createFile, deleteEntry, createDir, buildIndex, findHandleInTree, findDirHandleForFile } from './modules/fileSystem.js';
import { renderTree, setActiveFile } from './modules/tree.js';
import { openInEditor, getContent, showEditor, showPreview, jumpToLine } from './modules/editor.js';
import { renderTabs } from './modules/tabs.js';
import { searchFull, renderResults } from './modules/search.js';
import { renderLinks, findBacklinks, renderBacklinks } from './modules/links.js';

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
const treeEl = document.getElementById('tree');
const tabBarEl = document.getElementById('tab-bar');
const noteContent = document.getElementById('note-content');
const previewEl = document.getElementById('preview');
const backlinksEl = document.getElementById('backlinks');
const searchEl = document.getElementById('search');
const toggleBtn = document.getElementById('toggle-view');
const settingsPanel = document.getElementById('settings-panel');
const openFolderBtn = document.getElementById('open-folder');

// --- Folder open ---
openFolderBtn.onclick = async () => {
  try {
    openFolderBtn.textContent = 'Cargando...';
    openFolderBtn.disabled = true;
    state.dirHandle = await selectFolder();
    state.tree = await buildTree(state.dirHandle);
    state.searchIndex = await buildIndex(state.tree);
    _refreshTree();
  } catch (e) {
    if (e.name !== 'AbortError') alert('Error: ' + e.message);
  } finally {
    openFolderBtn.textContent = 'Abrir carpeta';
    openFolderBtn.disabled = false;
  }
};

// --- Tree ---
function _refreshTree() {
  renderTree(state.tree, treeEl, {
    onFileClick: _openFile,
    onDelete: _deleteFile,
    onCreateFile: _newFile,
    onCreateDir: _newDir,
    onMove: _moveFile
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
  state.tabs.push({ handle, name, content, dirty: false });
  _switchTab(state.tabs.length - 1);
}

async function _openFileByName(name) {
  const handle = findHandleInTree(state.tree, name + '.md');
  if (handle) await _openFile(handle, name);
  else alert('Nota no encontrada: ' + name);
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
}

async function _requestClose(idx) {
  const tab = state.tabs[idx];
  if (tab.dirty && !confirm('Cerrar "' + tab.name + '" sin guardar?')) return;
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
    previewEl.innerHTML = '';
    backlinksEl.innerHTML = '';
    setActiveFile(treeEl, '');
    _renderTabs();
  }
}

// --- Render current note preview + backlinks ---
function _renderCurrentNote() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  const allNames = state.searchIndex.map(e => e.name);
  renderLinks(tab.content, allNames, previewEl, _openFileByName, (text) => jumpToLine(text));
  const refs = findBacklinks(tab.name, state.searchIndex);
  renderBacklinks(refs, backlinksEl, _openFileByName);
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

// --- Live update on input ---
noteContent.oninput = () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (!tab.dirty) { tab.dirty = true; _renderTabs(); }
  const allNames = state.searchIndex.map(e => e.name);
  renderLinks(getContent(), allNames, previewEl, _openFileByName, (text) => jumpToLine(text));
};

// --- Toggle editor/preview ---
toggleBtn.onclick = () => {
  const isHidden = noteContent.hidden;
  if (isHidden) showEditor(); else showPreview();
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
    } else if (state.activeTab > idx) {
      state.activeTab--;
    }
  }
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
  _renderTabs();
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
  if (!confirm('Mover "' + filename + '" a "' + targetDirName + '"?')) return;
  const srcHandle = findHandleInTree(state.tree, filename);
  if (!srcHandle) return;
  const content = await readFile(srcHandle);
  const newHandle = await createFile(targetDirHandle, filename);
  await writeFile(newHandle, content);
  const srcDirHandle = findDirHandleForFile(state.tree, filename);
  if (srcDirHandle) await deleteEntry(srcDirHandle, filename);
  const tabIdx = state.tabs.findIndex(t => t.name === filename.replace('.md', ''));
  if (tabIdx >= 0) state.tabs.splice(tabIdx, 1);
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
  _renderTabs();
}

// New file at root (for flat vaults with no subfolders)
document.getElementById('new-file-btn').onclick = () => {
  if (!state.dirHandle) return;
  const name = prompt('Nombre del archivo (sin .md):');
  if (name && name.trim()) _newFile(state.dirHandle, name.trim());
};

// --- Keyboard shortcuts ---
document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if (mod && e.key === 's') { e.preventDefault(); _save(); }
  if (mod && e.key === 'f') { e.preventDefault(); searchEl.focus(); searchEl.select(); }
  if (mod && e.key === 'w') { e.preventDefault(); if (state.activeTab >= 0) _requestClose(state.activeTab); }
});

// --- Settings ---
document.getElementById('settings-btn').onclick = () => {
  settingsPanel.hidden = !settingsPanel.hidden;
};
document.getElementById('close-settings').onclick = () => { settingsPanel.hidden = true; };

const autosaveToggle = document.getElementById('autosave-toggle');
const autosaveInterval = document.getElementById('autosave-interval');
let _autosaveTimer = null;

function _setupAutosave() {
  clearInterval(_autosaveTimer);
  const enabled = localStorage.getItem('autosave') === 'true';
  const secs = parseInt(localStorage.getItem('autosave-interval') || '30');
  autosaveToggle.checked = enabled;
  autosaveInterval.value = secs;
  if (enabled) _autosaveTimer = setInterval(_save, secs * 1000);
}

autosaveToggle.onchange = () => {
  localStorage.setItem('autosave', autosaveToggle.checked);
  _setupAutosave();
};

autosaveInterval.onchange = () => {
  localStorage.setItem('autosave-interval', autosaveInterval.value);
  _setupAutosave();
};

// --- Sidebar toggle (mobile) ---
document.getElementById('sidebar-toggle').onclick = () => {
  document.getElementById('sidebar').classList.toggle('open');
};

// --- External file change detection ---
window.addEventListener('focus', async () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  try {
    const file = await tab.handle.getFile();
    if (file.lastModified !== state.lastModified[tab.name]) {
      state.lastModified[tab.name] = file.lastModified;
      if (!tab.dirty || confirm('"' + tab.name + '" fue modificado externamente. Recargar?')) {
        tab.content = await file.text();
        tab.dirty = false;
        openInEditor(tab.content);
        _renderCurrentNote();
        _renderTabs();
      }
    }
  } catch (_) {}
});

// --- Init ---
_setupAutosave();
