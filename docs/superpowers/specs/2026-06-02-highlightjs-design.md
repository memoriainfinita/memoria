# Memoria — Highlight.js Integration Design

**Date:** 2026-06-02
**Status:** Approved
**Scope:** Syntax highlighting for non-.md files in preview panel

---

## Principle

Minimal change. No new modules. Two touch points in app.js, two CDN lines in index.html.

---

## Dependencies

Add to `index.html` before the marked `<script>`:

```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
```

Theme: `github-dark` — consistent with current dark theme (`--bg #1e1e1e`, `--accent #569cd6`).

---

## Architecture

No new module. All changes in `app.js`.

### Extension → Language Map

Static object in `app.js`:

```js
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
```

Extensions not in the map (txt, log, csv, ini, rst, org) fall back to plain `<pre>.textContent` — no highlight, no error.

### Helper function

```js
function _renderCode(container, content, filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const lang = EXT_LANG[ext];
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  if (lang) {
    code.innerHTML = hljs.highlight(content, { language: lang }).value;
  } else {
    code.textContent = content;
  }
  pre.appendChild(code);
  container.innerHTML = '';
  container.appendChild(pre);
}
```

---

## Touch Points

### 1. `_renderCurrentNote()` — app.js ~line 248

Replace:
```js
previewEl.innerHTML = '<pre class="plain-text"></pre>';
previewEl.querySelector('pre').textContent = tab.content;
```

With:
```js
_renderCode(previewEl, tab.content, tab.handle.name);
```

### 2. `noteContent.oninput` — app.js ~line 276

Replace:
```js
const pre = previewEl.querySelector('pre.plain-text');
if (pre) pre.textContent = getContent();
```

With:
```js
_renderCode(previewEl, getContent(), state.tabs[state.activeTab].handle.name);
```

---

## Behavior

- `.md` files: unchanged — marked renders as before
- Non-.md files with known extension: syntax-highlighted `<pre><code>` in preview
- Non-.md files with unknown extension: plain `<pre><code>` (same as today but wrapped in `<code>`)
- Live update while editing: re-renders highlight on each input event (same as current plain-text behavior)
- Toggle editor/preview: no change needed — `showPreview()` already reveals `#preview`

---

## Out of Scope

- Syntax highlighting inside the textarea (editor)
- Theme selection for highlight.js (one theme, matches the app theme)
- Line numbers
