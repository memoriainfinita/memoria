# Memoria — Complete Implementation Design

**Date:** 2026-05-31
**Status:** Approved
**Scope:** All remaining requirements (31/40 pending)

---

## Principle

Minimal code, no invented wheels. Every line earns its place. Vanilla JS + HTML5 + CSS3, no bundler, no framework. Runs directly in Chrome/Edge via `type=module`.

---

## Architecture

ES6 modules loaded by `index.html`. No build step.

```
index.html          — structure + module entry point
app.js              — orchestrator: global state, wires modules together
style.css           — dark theme + responsive (CSS variables)
modules/
  fileSystem.js     — File System Access API wrapper
  tree.js           — tree data structure + recursive DOM render
  editor.js         — editor textarea + marked preview + toggle
  tabs.js           — tab bar + multi-tab state + unsaved detection
  search.js         — name filter + full-text index
  links.js          — [[wiki-link]] parsing + backlinks scan
```

### Global State (app.js)

```js
const state = {
  dirHandle: null,       // root FileSystemDirectoryHandle
  tree: null,            // root Node
  tabs: [],              // [{ handle, name, content, dirty }]
  activeTab: null,       // index into tabs[]
  searchIndex: []        // [{ name, content }] built on folder open
};
```

---

## Modules

### fileSystem.js

Wraps File System Access API. All FSA calls live here.

- `selectFolder()` → FileSystemDirectoryHandle
- `buildTree(dirHandle)` → Node tree (recursive)
- `readFile(handle)` → string
- `writeFile(handle, text)` → void
- `createFile(dirHandle, name)` → FileSystemFileHandle
- `deleteEntry(dirHandle, name)` → void
- `createDir(dirHandle, name)` → FileSystemDirectoryHandle

No UI. No DOM. Pure async functions.

### tree.js

- `Node` class: `{ name, kind, handle, children[], expanded }`
- `renderTree(node, container)` — recursive `<ul>/<li>`, `<details>/<summary>` for folders
- Emits events (custom DOM events) for: `node-click`, `node-dblclick`, `node-create`, `node-delete`, `node-drop`
- Drag-drop via HTML5 drag events. Confirmation before move.
- No direct file I/O — calls fileSystem.js

### editor.js

Thin wrapper over the existing editor logic, refactored:

- `openInEditor(handle, name, content)` — sets textarea + renders preview
- `renderPreview(md)` — marked parse + [[link]] replacement
- `toggleView()` — switches textarea ↔ preview
- `getContent()` → current textarea value
- Double-click preview → jump to editor line (existing logic, kept)

### tabs.js

- `openTab(handle, name, content)` — adds tab, activates it
- `switchTab(index)` — saves current, loads new (unsaved check)
- `closeTab(index)` — unsaved dialog if dirty
- `markDirty(index)` — adds `*` to tab label
- Renders tab bar as `<div class="tab-bar"><button>` elements
- Keyboard: Ctrl+W closes active tab

### search.js

- `buildIndex(tree)` — walks tree, reads all .md files, stores `{ name, content }`
- `searchName(q)` → filtered file list (existing logic, kept)
- `searchFull(q)` → files where content includes q (case-insensitive)
- `renderResults(matches, container)` — shows name + snippet
- Ctrl+F focuses search input

### links.js

- `parseLinks(md)` → array of `[[target]]` strings found in text
- `renderLinks(md, allNames)` → md with [[x]] replaced by `<a>` (existing logic, kept + extended)
- `findBacklinks(name, searchIndex)` → array of files that reference `[[name]]`
- `renderBacklinks(refs, container)` — appends backlinks section to preview
- Broken link detection: if target not in allNames, add `.broken` class (red, no navigation)

---

## HTML Structure

```html
<header>
  <h1>Memoria</h1>
  <button id="open-folder">Abrir carpeta</button>
  <input id="search" placeholder="Buscar...">
</header>
<main>
  <aside id="sidebar">
    <div id="tree"></div>
  </aside>
  <section id="content">
    <div id="tab-bar"></div>
    <div id="editor-area">
      <textarea id="note-content"></textarea>
      <div id="preview"></div>
    </div>
    <div id="backlinks"></div>
  </section>
</main>
```

No title input (rename not supported by FSA API — removed, not no-op).

---

## CSS / Dark Theme

CSS variables, single stylesheet:

```css
:root {
  --bg: #1e1e1e;
  --bg-2: #252526;
  --bg-3: #2d2d2d;
  --border: #3e3e42;
  --text: #d4d4d4;
  --accent: #569cd6;
  --danger: #f44747;
}
```

Responsive: below 768px sidebar collapses to a toggle button. No media-query frameworks.

---

## Implementation Waves

### Wave 1 — Foundation
Files: `fileSystem.js`, `tree.js`, `style.css`, `index.html` restructure

Delivers: folder open → recursive tree render → dark theme.
Requirements: FILE-01, FILE-02, FILE-10, UI-01, UI-02.

### Wave 2 — Editor & Tabs
Files: `tabs.js`, `editor.js`, `app.js` wiring

Delivers: multi-tab editing, unsaved detection, save per tab, Ctrl+S.
Requirements: FILE-04, FILE-08, FILE-09, EDIT-01–07, UI-03.

### Wave 3 — File Ops + Search + Links (parallel)
Files: `fileSystem.js` (create/delete/move), `search.js`, `links.js`

Delivers: create/delete/move files+folders, full-text search, backlinks, broken link indicator.
Requirements: FILE-03, FILE-05, FILE-06, FILE-07, SEARCH-01–06, LINK-01–06.

### Wave 4 — Polish
Files: `style.css`, `app.js`, `index.html`

Delivers: keyboard shortcuts (Ctrl+S, Ctrl+F, Ctrl+W), settings panel (auto-save), tooltips, responsive mobile, external file change detection.
Requirements: FILE-08 auto-save, UI-04–07, PERF-01–04.

---

## Agent Strategy

Each wave:
1. Implementer agent writes the wave
2. Reviewer agent (`/code-review`) checks correctness + cleanliness
3. If issues found: fixer agent addresses them
4. Loop until reviewer passes clean

Agents work on real files (no worktrees needed — waves are sequential, no parallel file conflicts).

---

## Out of Scope

Markdown WYSIWYG, database, cloud sync, graph view, plugins, collaboration. See REQUIREMENTS.md v2 section.
