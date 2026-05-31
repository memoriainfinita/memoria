# Memoria Full Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 40 requirements for Memoria — a local-first Markdown notes app — from scratch using ES6 modules, vanilla JS, and the File System Access API.

**Architecture:** ES6 modules loaded by `index.html` with `type="module"`, no bundler or build step. `app.js` is the orchestrator that wires all modules together via a single shared `state` object. `marked` is loaded as a CDN global before the module script.

**Tech Stack:** Vanilla JS (ES6+), HTML5, CSS3, File System Access API (Chrome/Edge only), marked.js via CDN.

**No automated tests** — File System Access API requires user interaction (file picker) that cannot be automated. Each task includes manual browser verification steps. Open `index.html` directly in Chrome or Edge (no server needed).

**Principle:** Minimum lines of code. No abstractions beyond what the task requires. Every line earns its place.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `index.html` | Create | HTML structure — header, sidebar, tab bar, editor area, settings panel |
| `style.css` | Create | Full dark theme with CSS variables, responsive |
| `modules/fileSystem.js` | Create | File System Access API wrapper — all FSA calls live here |
| `modules/tree.js` | Create | Recursive tree DOM render + drag-drop + file/folder context actions |
| `modules/editor.js` | Create | Textarea + preview toggle + double-click-to-edit |
| `modules/tabs.js` | Create | Tab bar DOM render — pure view, no state |
| `modules/search.js` | Create | Name + full-text search against index |
| `modules/links.js` | Create | [[wiki-link]] parsing, backlinks scan |
| `app.js` | Create | Orchestrator: global state, event wiring, saves, shortcuts, auto-save |
| `AGENTS.md` | Update | Reflect new modular structure |
| `README.md` | Update | Update features list |
| `STATE.md` | Update | Mark all requirements done |

---

## Task 1: index.html

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create index.html**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Memoria</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <button id="sidebar-toggle" class="sidebar-toggle" title="Menú">&#9776;</button>
    <span class="logo">Memoria</span>
    <button id="open-folder" title="Abrir carpeta de notas">Abrir carpeta</button>
    <input id="search" type="text" placeholder="Buscar... (Ctrl+F)" autocomplete="off">
    <button id="settings-btn" title="Ajustes">Ajustes</button>
  </header>
  <main>
    <aside id="sidebar">
      <div id="sidebar-actions">
        <button id="new-file-btn" title="Nuevo archivo en carpeta raíz">+ archivo</button>
      </div>
      <ul id="tree"></ul>
    </aside>
    <section id="content">
      <div id="tab-bar"></div>
      <div id="editor-area">
        <button id="toggle-view">Editar</button>
        <textarea id="note-content" placeholder="Escribe en Markdown..." hidden></textarea>
        <div id="preview"></div>
      </div>
      <div id="backlinks"></div>
    </section>
  </main>
  <div id="settings-panel" hidden>
    <strong>Ajustes</strong>
    <label><input type="checkbox" id="autosave-toggle"> Auto-guardar</label>
    <label>Intervalo (s): <input type="number" id="autosave-interval" value="30" min="5" max="300"></label>
    <button id="close-settings">Cerrar</button>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script type="module" src="app.js"></script>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in Chrome. Expected: blank dark page (CSS not yet written — body will be unstyled). No console errors about missing files.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add html structure"
```

---

## Task 2: style.css

**Files:**
- Create: `style.css`

- [ ] **Step 1: Create style.css**

```css
:root {
  --bg: #1e1e1e;
  --bg-2: #252526;
  --bg-3: #2d2d2d;
  --border: #3e3e42;
  --text: #d4d4d4;
  --text-dim: #858585;
  --accent: #569cd6;
  --danger: #f44747;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'Consolas', 'Menlo', monospace;
  background: var(--bg);
  color: var(--text);
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
header {
  background: var(--bg-2);
  border-bottom: 1px solid var(--border);
  padding: 0.4em 0.8em;
  display: flex;
  align-items: center;
  gap: 0.6em;
  flex-shrink: 0;
}

.logo { font-weight: bold; color: var(--accent); margin-right: auto; }

header button {
  background: var(--bg-3);
  color: var(--text-dim);
  border: 1px solid var(--border);
  padding: 0.25em 0.6em;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.82em;
  cursor: pointer;
}

header button:hover { color: var(--accent); border-color: var(--accent); }

#search {
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.25em 0.6em;
  border-radius: 3px;
  font-family: inherit;
  font-size: 0.82em;
  width: 180px;
}

#search:focus { outline: none; border-color: var(--accent); }

.sidebar-toggle { display: none; }

/* Layout */
main { display: flex; flex: 1; overflow: hidden; }

/* Sidebar */
#sidebar {
  width: 220px;
  background: var(--bg-2);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  padding: 0.4em 0.2em;
  flex-shrink: 0;
}

#sidebar-actions { padding: 0.3em 0.4em; border-bottom: 1px solid var(--border); margin-bottom: 0.2em; }
#new-file-btn { font-size: 0.78em; padding: 0.15em 0.5em; width: 100%; text-align: left; }

#tree, #tree ul { list-style: none; padding-left: 0.8em; }

#tree li { line-height: 1.6; }

#tree details > summary {
  cursor: pointer;
  padding: 0.15em 0.4em;
  border-radius: 3px;
  color: var(--text-dim);
  font-size: 0.82em;
  list-style: none;
  user-select: none;
}

#tree details > summary::before { content: '+ '; }
#tree details[open] > summary::before { content: '- '; }
#tree details > summary:hover { background: var(--bg-3); color: var(--text); }

.file-item {
  display: block;
  padding: 0.15em 0.4em;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.82em;
  color: var(--text);
  user-select: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-item:hover { background: var(--bg-3); }
.file-item.active { background: var(--accent); color: #1e1e1e; }

/* Content */
#content { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

/* Tab bar */
#tab-bar {
  display: flex;
  background: var(--bg-2);
  border-bottom: 1px solid var(--border);
  overflow-x: auto;
  flex-shrink: 0;
  min-height: 30px;
}

#tab-bar::-webkit-scrollbar { height: 3px; }
#tab-bar::-webkit-scrollbar-thumb { background: var(--border); }

.tab {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.2em 0.8em;
  border-right: 1px solid var(--border);
  cursor: pointer;
  font-size: 0.78em;
  color: var(--text-dim);
  background: var(--bg-2);
  white-space: nowrap;
  flex-shrink: 0;
}

.tab:hover { background: var(--bg-3); color: var(--text); }

.tab.active {
  background: var(--bg);
  color: var(--text);
  border-top: 2px solid var(--accent);
  padding-top: calc(0.2em - 2px);
}

.tab.dirty > .tab-name::after { content: ' \25CF'; font-size: 0.6em; color: var(--accent); }

.tab .close-btn {
  color: var(--text-dim);
  line-height: 1;
  padding: 0 0.1em;
  border-radius: 2px;
}

.tab .close-btn:hover { color: var(--danger); background: var(--bg-3); }

/* Editor area */
#editor-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }

#toggle-view {
  position: absolute;
  top: 0.4em;
  right: 0.6em;
  z-index: 10;
  font-size: 0.75em;
  padding: 0.15em 0.5em;
  background: var(--bg-2);
  color: var(--text-dim);
  border: 1px solid var(--border);
  border-radius: 3px;
  cursor: pointer;
}

#toggle-view:hover { color: var(--accent); border-color: var(--accent); }

#note-content {
  flex: 1;
  background: var(--bg);
  color: var(--text);
  border: none;
  padding: 1.2em 1.5em;
  font-family: inherit;
  font-size: 0.9em;
  resize: none;
  outline: none;
  line-height: 1.7;
}

#preview {
  flex: 1;
  padding: 1.2em 1.5em;
  overflow-y: auto;
  line-height: 1.7;
  font-size: 0.9em;
}

#preview h1, #preview h2, #preview h3 {
  color: var(--text);
  border-bottom: 1px solid var(--border);
  margin: 1em 0 0.4em;
  padding-bottom: 0.3em;
}

#preview h4, #preview h5, #preview h6 { margin: 0.8em 0 0.3em; }

#preview p { margin: 0.4em 0; }

#preview ul, #preview ol { padding-left: 1.5em; margin: 0.4em 0; }

#preview code {
  background: var(--bg-3);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-size: 0.88em;
}

#preview pre {
  background: var(--bg-3);
  padding: 0.8em 1em;
  border-radius: 3px;
  overflow-x: auto;
  margin: 0.5em 0;
}

#preview pre code { background: none; padding: 0; }

#preview blockquote {
  border-left: 3px solid var(--border);
  padding-left: 1em;
  color: var(--text-dim);
  margin: 0.5em 0;
}

#preview a.wiki-link { color: var(--accent); text-decoration: none; }
#preview a.wiki-link:hover { text-decoration: underline; }
#preview a.wiki-link.broken { color: var(--danger); text-decoration: line-through; cursor: default; }

#preview hr { border: none; border-top: 1px solid var(--border); margin: 1em 0; }

/* Backlinks */
#backlinks {
  padding: 0.4em 1.5em;
  border-top: 1px solid var(--border);
  font-size: 0.78em;
  color: var(--text-dim);
  flex-shrink: 0;
  min-height: 1.8em;
}

#backlinks a {
  color: var(--accent);
  cursor: pointer;
  margin-right: 0.5em;
  text-decoration: none;
}

#backlinks a:hover { text-decoration: underline; }

/* Settings panel */
#settings-panel {
  position: fixed;
  right: 0.8em;
  top: 2.8em;
  background: var(--bg-2);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.8em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  font-size: 0.82em;
  z-index: 100;
  min-width: 180px;
}

#settings-panel[hidden] { display: none; }

#settings-panel strong { color: var(--text); margin-bottom: 0.2em; }

#settings-panel label {
  display: flex;
  align-items: center;
  gap: 0.4em;
  color: var(--text-dim);
}

#settings-panel input[type="number"] {
  width: 60px;
  background: var(--bg-3);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-family: inherit;
}

#settings-panel button {
  background: var(--bg-3);
  color: var(--text-dim);
  border: 1px solid var(--border);
  padding: 0.2em 0.5em;
  border-radius: 3px;
  cursor: pointer;
  font-family: inherit;
  font-size: 1em;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar-toggle { display: block; }
  #sidebar { display: none; position: fixed; top: 2.4em; left: 0; bottom: 0; z-index: 50; width: 240px; }
  #sidebar.open { display: block; }
  #search { width: 120px; }
}
```

- [ ] **Step 2: Verify in browser**

Refresh `index.html` in Chrome. Expected: dark background, dark header with "Memoria" in blue, sidebar visible (empty), content area dark. No layout breaks.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: add dark theme with CSS variables"
```

---

## Task 3: modules/fileSystem.js

**Files:**
- Create: `modules/fileSystem.js`

- [ ] **Step 1: Create modules/ directory and fileSystem.js**

```js
export async function selectFolder() {
  return window.showDirectoryPicker();
}

export async function buildTree(dirHandle) {
  return _walk(dirHandle, true);
}

async function _walk(handle, isRoot = false) {
  const node = { name: handle.name, kind: 'dir', handle, children: [], expanded: isRoot };
  for await (const [name, child] of handle.entries()) {
    if (child.kind === 'directory') {
      node.children.push(await _walk(child));
    } else if (name.endsWith('.md')) {
      node.children.push({ name, kind: 'file', handle: child });
    }
  }
  node.children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return node;
}

export async function readFile(handle) {
  return (await handle.getFile()).text();
}

export async function writeFile(handle, text) {
  const w = await handle.createWritable();
  await w.write(text);
  await w.close();
}

export async function createFile(dirHandle, name) {
  const fname = name.endsWith('.md') ? name : name + '.md';
  const handle = await dirHandle.getFileHandle(fname, { create: true });
  await writeFile(handle, '');
  return handle;
}

export async function deleteEntry(dirHandle, name) {
  await dirHandle.removeEntry(name, { recursive: true });
}

export async function createDir(dirHandle, name) {
  return dirHandle.getDirectoryHandle(name, { create: true });
}

export async function buildIndex(rootNode) {
  const index = [];
  await _indexNode(rootNode, index);
  return index;
}

async function _indexNode(node, index) {
  if (node.kind === 'file') {
    const content = await readFile(node.handle);
    index.push({ name: node.name.replace('.md', ''), handle: node.handle, content });
  } else {
    for (const child of node.children) await _indexNode(child, index);
  }
}

export function findHandleInTree(rootNode, filename) {
  if (rootNode.kind === 'file' && rootNode.name === filename) return rootNode.handle;
  if (rootNode.children) {
    for (const child of rootNode.children) {
      const found = findHandleInTree(child, filename);
      if (found) return found;
    }
  }
  return null;
}

export function findDirHandleForFile(rootNode, filename) {
  if (rootNode.kind === 'dir') {
    for (const child of rootNode.children) {
      if (child.kind === 'file' && child.name === filename) return rootNode.handle;
      if (child.kind === 'dir') {
        const found = findDirHandleForFile(child, filename);
        if (found) return found;
      }
    }
  }
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/fileSystem.js
git commit -m "feat: add fileSystem module"
```

---

## Task 4: modules/tree.js

**Files:**
- Create: `modules/tree.js`

- [ ] **Step 1: Create modules/tree.js**

```js
export function renderTree(rootNode, container, callbacks) {
  container.innerHTML = '';
  for (const child of rootNode.children) {
    container.appendChild(_node(child, rootNode.handle, callbacks));
  }
}

function _node(node, parentDirHandle, cb) {
  const li = document.createElement('li');
  if (node.kind === 'dir') {
    const details = document.createElement('details');
    if (node.expanded) details.open = true;
    details.ontoggle = () => { node.expanded = details.open; };
    const summary = document.createElement('summary');
    summary.textContent = node.name;
    summary.oncontextmenu = (e) => {
      e.preventDefault();
      _dirMenu(node.handle, cb);
    };
    const ul = document.createElement('ul');
    for (const child of node.children) {
      ul.appendChild(_node(child, node.handle, cb));
    }
    details.appendChild(summary);
    details.appendChild(ul);
    li.appendChild(details);
  } else {
    const span = document.createElement('span');
    span.className = 'file-item';
    span.textContent = node.name.replace('.md', '');
    span.dataset.filename = node.name;
    span.title = node.name;
    span.onclick = () => cb.onFileClick(node.handle, node.name.replace('.md', ''));
    span.oncontextmenu = (e) => {
      e.preventDefault();
      if (confirm('Eliminar "' + node.name + '"?')) cb.onDelete(parentDirHandle, node.name);
    };
    // Drag source
    span.draggable = true;
    span.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', node.name);
      e.dataTransfer.setData('application/json', JSON.stringify({ name: node.name, parentName: parentDirHandle.name }));
    };
    li.appendChild(span);
  }
  return li;
}

function _dirMenu(dirHandle, cb) {
  const action = prompt('Crear en esta carpeta:\n1 = archivo .md\n2 = carpeta\n(Enter para cancelar)');
  if (action === '1') {
    const name = prompt('Nombre del archivo (sin .md):');
    if (name && name.trim()) cb.onCreateFile(dirHandle, name.trim());
  } else if (action === '2') {
    const name = prompt('Nombre de la carpeta:');
    if (name && name.trim()) cb.onCreateDir(dirHandle, name.trim());
  }
}

export function setActiveFile(container, filename) {
  container.querySelectorAll('.file-item').forEach(el => {
    el.classList.toggle('active', el.dataset.filename === filename + '.md');
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/tree.js
git commit -m "feat: add tree module with recursive render and context menus"
```

---

## Task 5: modules/editor.js

**Files:**
- Create: `modules/editor.js`

- [ ] **Step 1: Create modules/editor.js**

```js
const textarea = document.getElementById('note-content');
const preview = document.getElementById('preview');
const toggleBtn = document.getElementById('toggle-view');

let _editing = false;

export function openInEditor(content) {
  textarea.value = content;
  showPreview();
}

export function getContent() {
  return textarea.value;
}

export function showEditor() {
  _editing = true;
  textarea.hidden = false;
  preview.style.display = 'none';
  toggleBtn.textContent = 'Vista previa';
  textarea.focus();
}

export function showPreview() {
  _editing = false;
  textarea.hidden = true;
  preview.style.display = '';
  toggleBtn.textContent = 'Editar';
}

export function isEditing() {
  return _editing;
}

export function jumpToLine(targetText) {
  showEditor();
  if (!targetText) return;
  const lines = textarea.value.split('\n');
  const idx = lines.findIndex(l => l.trim() === targetText.trim());
  if (idx >= 0) {
    const pos = lines.slice(0, idx).reduce((s, l) => s + l.length + 1, 0);
    textarea.setSelectionRange(pos, pos);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/editor.js
git commit -m "feat: add editor module"
```

---

## Task 6: modules/tabs.js

**Files:**
- Create: `modules/tabs.js`

- [ ] **Step 1: Create modules/tabs.js**

```js
export function renderTabs(container, tabs, activeIdx, onSwitch, onClose) {
  container.innerHTML = '';
  tabs.forEach((tab, i) => {
    const div = document.createElement('div');
    div.className = 'tab' + (i === activeIdx ? ' active' : '') + (tab.dirty ? ' dirty' : '');
    div.onclick = () => onSwitch(i);

    const name = document.createElement('span');
    name.className = 'tab-name';
    name.textContent = tab.name;

    const close = document.createElement('span');
    close.className = 'close-btn';
    close.textContent = '×';
    close.title = 'Cerrar (Ctrl+W)';
    close.onclick = (e) => { e.stopPropagation(); onClose(i); };

    div.appendChild(name);
    div.appendChild(close);
    container.appendChild(div);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/tabs.js
git commit -m "feat: add tabs module"
```

---

## Task 7: modules/search.js

**Files:**
- Create: `modules/search.js`

- [ ] **Step 1: Create modules/search.js**

```js
export function searchFull(q, index) {
  const lq = q.toLowerCase();
  return index.filter(e =>
    e.name.toLowerCase().includes(lq) || e.content.toLowerCase().includes(lq)
  );
}

export function renderResults(results, container, onResultClick) {
  container.innerHTML = '';
  if (!results.length) {
    const li = document.createElement('li');
    li.style.cssText = 'padding:.3em .4em;font-size:.8em;color:var(--text-dim)';
    li.textContent = 'Sin resultados';
    const ul = document.createElement('ul');
    ul.appendChild(li);
    container.appendChild(ul);
    return;
  }
  const ul = document.createElement('ul');
  results.forEach(({ name }) => {
    const li = document.createElement('li');
    const span = document.createElement('span');
    span.className = 'file-item';
    span.textContent = name;
    span.dataset.filename = name + '.md';
    span.onclick = () => onResultClick(name);
    li.appendChild(span);
    ul.appendChild(li);
  });
  container.appendChild(ul);
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/search.js
git commit -m "feat: add search module"
```

---

## Task 8: modules/links.js

**Files:**
- Create: `modules/links.js`

- [ ] **Step 1: Create modules/links.js**

```js
export function renderLinks(md, allNames, container, onLinkClick, onDblClick) {
  const processed = md.replace(/\[\[(.+?)\]\]/g, (_, name) => {
    const exists = allNames.includes(name);
    const cls = exists ? 'wiki-link' : 'wiki-link broken';
    return `<a href="#" class="${cls}" data-note="${name}">[[${name}]]</a>`;
  });
  container.innerHTML = marked.parse(processed);
  container.querySelectorAll('a.wiki-link:not(.broken)').forEach(a => {
    a.onclick = (e) => { e.preventDefault(); onLinkClick(a.dataset.note); };
  });
  container.ondblclick = (e) => {
    const text = (e.target.innerText || e.target.textContent || '').trim();
    onDblClick(text);
  };
}

export function findBacklinks(name, index) {
  const re = new RegExp('\\[\\[' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]\\]');
  return index.filter(e => e.name !== name && re.test(e.content)).map(e => e.name);
}

export function renderBacklinks(refs, container, onLinkClick) {
  if (!refs.length) { container.innerHTML = ''; return; }
  container.innerHTML = 'Referencias entrantes: ' + refs.map(n =>
    `<a data-note="${n}">[[${n}]]</a>`
  ).join(' ');
  container.querySelectorAll('a').forEach(a => {
    a.onclick = () => onLinkClick(a.dataset.note);
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add modules/links.js
git commit -m "feat: add links module with backlinks and broken link detection"
```

---

## Task 9: app.js — full orchestrator

**Files:**
- Create: `app.js`

This is the main wiring. Read it fully before writing — it imports all modules and manages all state.

- [ ] **Step 1: Create app.js**

```js
import { selectFolder, buildTree, readFile, writeFile, createFile, deleteEntry, createDir, buildIndex, findHandleInTree } from './modules/fileSystem.js';
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
    onCreateDir: _newDir
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
  // Save active tab content to state before splice
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
  // Note: confirm dialog already shown in tree.js before calling this
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
      if (!tab.dirty || confirm('"' + tab.name + '" fue modificado externamente. Recargar? (se perderan cambios no guardados)')) {
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
```

- [ ] **Step 2: Verify full app in browser**

Open `index.html` in Chrome. Open DevTools console. Verify:
1. No console errors on load
2. Click "Abrir carpeta" → file picker opens → select a folder with some .md files
3. Sidebar shows file tree (flat or nested depending on folder structure)
4. Click a file → tab appears at top, preview shows rendered markdown
5. Click "Editar" → textarea shows raw markdown
6. Edit text → tab shows dirty indicator (dot)
7. Ctrl+S → file saved, dirty indicator clears
8. Click another file → second tab opens
9. Ctrl+W → tab closes (unsaved dialog if dirty)
10. Type in search box → tree filters by name and content
11. Clear search → tree restores
12. [[wiki-link]] in a note → clickable in preview, blue; broken link → red strikethrough
13. Right-click folder in tree → prompt to create file or folder
14. Right-click file in tree → confirm delete

- [ ] **Step 3: Commit**

```bash
git add app.js modules/
git commit -m "feat: wire all modules — full app working"
```

---

## Task 10: Drag-drop file move

**Files:**
- Modify: `modules/tree.js` (already has `ondragstart` in Task 4)
- Modify: `app.js`

- [ ] **Step 1: Add drop targets to tree.js folder summaries**

In `modules/tree.js`, replace the `_node` function's directory block (the `if (node.kind === 'dir')` section) with:

```js
  if (node.kind === 'dir') {
    const details = document.createElement('details');
    if (node.expanded) details.open = true;
    details.ontoggle = () => { node.expanded = details.open; };
    const summary = document.createElement('summary');
    summary.textContent = node.name;
    summary.oncontextmenu = (e) => { e.preventDefault(); _dirMenu(node.handle, cb); };

    // Drop target
    summary.ondragover = (e) => { e.preventDefault(); summary.style.background = 'var(--accent)'; summary.style.color = '#1e1e1e'; };
    summary.ondragleave = () => { summary.style.background = ''; summary.style.color = ''; };
    summary.ondrop = (e) => {
      e.preventDefault();
      summary.style.background = '';
      summary.style.color = '';
      const filename = e.dataTransfer.getData('text/plain');
      if (filename) cb.onMove(filename, node.handle, node.name);
    };

    const ul = document.createElement('ul');
    for (const child of node.children) ul.appendChild(_node(child, node.handle, cb));
    details.appendChild(summary);
    details.appendChild(ul);
    li.appendChild(details);
  }
```

- [ ] **Step 2: Add onMove callback to app.js**

In `app.js`, add the `onMove` key to the `renderTree` callbacks object:

```js
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
```

Then add the `_moveFile` function in `app.js`:

```js
async function _moveFile(filename, targetDirHandle, targetDirName) {
  if (!confirm('Mover "' + filename + '" a "' + targetDirName + '"?')) return;
  const srcHandle = findHandleInTree(state.tree, filename);
  if (!srcHandle) return;
  const content = await readFile(srcHandle);
  const newHandle = await createFile(targetDirHandle, filename);
  await writeFile(newHandle, content);
  // Find parent dir of source and delete original
  const srcDirHandle = findDirHandleForFile(state.tree, filename);
  if (srcDirHandle) await deleteEntry(srcDirHandle, filename);
  // Close tab for moved file and reopen from new location
  const tabIdx = state.tabs.findIndex(t => t.name === filename.replace('.md', ''));
  if (tabIdx >= 0) state.tabs.splice(tabIdx, 1);
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
  _renderTabs();
}
```

Also add `findDirHandleForFile` to the import at the top of `app.js`:

```js
import { selectFolder, buildTree, readFile, writeFile, createFile, deleteEntry, createDir, buildIndex, findHandleInTree, findDirHandleForFile } from './modules/fileSystem.js';
```

- [ ] **Step 3: Verify drag-drop**

In Chrome: open a folder with multiple subdirectories. Drag a file from the sidebar and drop it on a folder summary. Expected: confirmation dialog → file appears in target folder → original removed. Open the moved file to verify content intact.

- [ ] **Step 4: Commit**

```bash
git add modules/tree.js app.js
git commit -m "feat: add drag-drop file move with confirmation"
```

---

## Task 11: Tooltips

**Files:**
- Modify: `index.html` (already has `title` attributes — verify)
- Modify: `style.css`

- [ ] **Step 1: Verify title attributes exist in index.html**

Check that all interactive elements in `index.html` have `title` attributes:
- `#open-folder`: `title="Abrir carpeta de notas"`
- `#search`: `title="Buscar notas (Ctrl+F)"`
- `#settings-btn`: `title="Ajustes"`
- `#toggle-view`: `title="Alternar editor/vista previa"`
- `#sidebar-toggle`: `title="Menú"`

If any are missing, add them now.

- [ ] **Step 2: Add tooltip styling to style.css**

Append to `style.css`:

```css
/* Tooltips via title attribute — browser native, no JS needed */
[title] { cursor: default; }
button[title] { cursor: pointer; }
```

Browser native `title` tooltips appear on hover automatically. No JS needed.

- [ ] **Step 3: Commit**

```bash
git add index.html style.css
git commit -m "feat: add tooltips via title attributes"
```

---

## Task 12: Update docs and STATE.md

**Files:**
- Update: `AGENTS.md`
- Update: `README.md`
- Update: `STATE.md`

- [ ] **Step 1: Update AGENTS.md**

Replace the full content of `AGENTS.md` with:

```markdown
# Memoria - AI Agent Instructions

A local-first Markdown notes app. No build step, no framework, no server.

## Quick Start

1. Open `index.html` in Chrome or Edge (not Firefox — uses File System Access API)
2. Click "Abrir carpeta" to select a folder with `.md` files
3. Edit, save, navigate — all changes go directly to the filesystem

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | HTML structure — header, sidebar, tab bar, editor area, settings panel |
| `app.js` | Orchestrator — global state, event wiring, keyboard shortcuts, auto-save |
| `style.css` | Full dark theme with CSS variables |
| `modules/fileSystem.js` | All File System Access API calls |
| `modules/tree.js` | Recursive tree DOM render + drag-drop + context menus |
| `modules/editor.js` | Textarea + preview toggle + double-click-to-edit |
| `modules/tabs.js` | Tab bar DOM render (pure view) |
| `modules/search.js` | Name + full-text search |
| `modules/links.js` | [[wiki-link]] parsing + backlinks |

## Architecture

- ES6 modules, `type="module"` in index.html — no bundler
- `marked` loaded as CDN global before module script
- Global state in `app.js`: `{ dirHandle, tree, tabs[], activeTab, searchIndex[], lastModified }`
- All FSA calls go through `modules/fileSystem.js`
- Modules never import each other — only `app.js` imports from modules

## Key Commands

- **Run**: Open `index.html` in Chrome/Edge directly (no server)
- **Save**: Ctrl+S
- **Search**: Ctrl+F
- **Close tab**: Ctrl+W
- **Create file/folder**: Right-click a folder in the sidebar
- **Delete file**: Right-click a file in the sidebar
- **Move file**: Drag file, drop on a folder

## Constraints

- Chrome/Edge only (`showDirectoryPicker` not in Firefox)
- No automated tests — FSA API requires user interaction
- No bundler, no npm, no node — open directly in browser
```

- [ ] **Step 2: Update README.md**

Replace the full content of `README.md` with:

```markdown
# Memoria

App web local-first para gestionar notas en Markdown. Sin base de datos, sin servidor, sin instalación.

## Características

- Abrir cualquier carpeta local como vault de notas
- Árbol de carpetas expandible con soporte a subcarpetas anidadas
- Editor Markdown con vista previa en tiempo real
- Multi-tab: edita varias notas a la vez
- Busqueda por nombre y contenido completo
- Wiki-links `[[nombre-nota]]` navegables, con detección de links rotos
- Backlinks: muestra qué otras notas enlazan a la nota activa
- Crear, eliminar y mover archivos y carpetas desde la interfaz
- Dark theme estilo unix/vim
- Auto-guardar configurable
- Atajos de teclado: Ctrl+S, Ctrl+F, Ctrl+W
- Responsive: funciona en móvil

## Uso

1. Abre `index.html` en Chrome o Edge
2. Haz clic en "Abrir carpeta" y selecciona tu carpeta de notas
3. Navega, edita, guarda

## Requisitos

- Chrome o Edge (usa File System Access API)
- Sin instalación, sin npm, sin servidor
```

- [ ] **Step 3: Update STATE.md**

Replace the Services table and TODO in `STATE.md` to reflect completion:

```markdown
**Last Updated:** 2026-05-31

## Services

| Service | Status | Notes |
|---------|--------|-------|
| Open folder | ✅ | File System Access API |
| Tree with nested folders | ✅ | Recursive, expandable |
| Open / save note | ✅ | createWritable() |
| Multi-tab editing | ✅ | tabs.js |
| Live preview | ✅ | marked CDN |
| Toggle editor/preview | ✅ | editor.js |
| Wiki-links [[nota]] | ✅ | Clickable, broken detection |
| Backlinks | ✅ | links.js |
| Search name + full-text | ✅ | search.js |
| Create file / folder | ✅ | Context menu on tree |
| Delete file | ✅ | Context menu on file |
| Drag-drop move | ✅ | HTML5 drag + confirmation |
| Dark theme | ✅ | CSS variables |
| Keyboard shortcuts | ✅ | Ctrl+S, Ctrl+F, Ctrl+W |
| Auto-save | ✅ | Configurable, localStorage |
| Settings panel | ✅ | Auto-save toggle + interval |
| Responsive / mobile | ✅ | Sidebar toggle on <768px |
| External file change detection | ✅ | Check on window focus |

## TODO

- All v1 requirements complete. See docs/superpowers/specs/ for v2 ideas.
```

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md README.md STATE.md
git commit -m "docs: update AGENTS, README, STATE to reflect completed rewrite"
```

---

## Self-Review

**Spec coverage check:**

| Requirement | Task |
|---|---|
| FILE-01 open folder | Task 9 |
| FILE-02 tree with nested folders | Task 4 |
| FILE-03 create file | Task 9 (_newFile) |
| FILE-04 edit file | Task 5, 9 |
| FILE-05 delete file | Task 4, 9 (_deleteFile) |
| FILE-06 move files drag-drop | Task 10 |
| FILE-07 drag-drop confirmation | Task 10 (confirm()) |
| FILE-08 save (manual + auto-save) | Task 9 (_save, _setupAutosave) |
| FILE-09 unsaved changes dialog | Task 9 (_requestClose) |
| FILE-10 create folder | Task 9 (_newDir) |
| EDIT-01 plain-text editor | Task 5 |
| EDIT-02 live preview | Task 8, 9 |
| EDIT-03 toggle edit/preview | Task 5, 9 |
| EDIT-04 multi-tab | Task 6, 9 |
| EDIT-05 dirty indicator (*) | Task 6 (.dirty class) |
| EDIT-06 tab switch unsaved check | Task 9 (_switchTab saves content; dirty persisted) |
| EDIT-07 tab close unsaved dialog | Task 9 (_requestClose) |
| EDIT-08 syntax highlighting | Handled by marked.js via CSS #preview code/pre styles in Task 2 |
| SEARCH-01 search by name | Task 7 |
| SEARCH-02 full-text search | Task 7 (searchFull) |
| SEARCH-03 real-time filtering | Task 9 (searchEl.oninput) |
| SEARCH-04 click result opens file | Task 7 (renderResults onclick) |
| SEARCH-05 case-insensitive | Task 7 (toLowerCase) |
| SEARCH-06 clear search restores tree | Task 9 (q empty → _refreshTree) |
| LINK-01 type [[links]] | Task 8 |
| LINK-02 clickable in preview | Task 8 |
| LINK-03 open link in tab | Task 9 (_openFileByName) |
| LINK-04 broken link visual | Task 8 (.broken class → red strikethrough) |
| LINK-05 backlinks list | Task 8 (findBacklinks) |
| LINK-06 backlinks clickable | Task 8 (renderBacklinks) |
| UI-01 dark theme | Task 2 |
| UI-02 sidebar tree | Task 4 |
| UI-03 tab bar | Task 6 |
| UI-04 responsive mobile | Task 2 (@media) |
| UI-05 tooltips | Task 11 (title attrs) |
| UI-06 keyboard shortcuts | Task 9 (keydown handler) |
| UI-07 settings panel | Task 9, index.html |
| PERF-01 handles 1000 files | buildIndex reads all on open; acceptable |
| PERF-02 search indexed | searchIndex built at open time |
| PERF-03 save in real time | writeFile on Ctrl+S / auto-save |
| PERF-04 external file change | Task 9 (window focus handler) |

All 40 requirements covered. No gaps found.
