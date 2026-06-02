# Highlight.js Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add syntax highlighting to the preview panel for non-.md files using Highlight.js via CDN.

**Architecture:** Two CDN tags in index.html load hljs. A static extension→language map and a `_renderCode()` helper are added to app.js. Two existing code blocks that render non-.md files are replaced with calls to `_renderCode()`. One CSS rule prevents hljs from overriding the app's customizable background.

**Tech Stack:** Vanilla JS, Highlight.js 11.9.0 (CDN), no build step.

---

## File Map

| File | Change |
|------|--------|
| `index.html` | Add hljs CSS + JS CDN tags before the marked script tag |
| `style.css` | Add `pre code.hljs { background: transparent; }` after the `.plain-text` block |
| `app.js` | Add `EXT_LANG` map + `_renderCode()` helper; replace two render blocks |

---

### Task 1: Add Highlight.js CDN to index.html

**Files:**
- Modify: `index.html` — `<head>` for the CSS link, `<body>` for the JS script

- [ ] **Step 1: Add the CSS link in `<head>`**

In `index.html`, replace:
```html
  <link rel="stylesheet" href="style.css">
</head>
```
With:
```html
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
</head>
```

- [ ] **Step 2: Add the JS script in `<body>`**

In `index.html`, replace:
```html
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```
With:
```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
```

- [ ] **Step 2: Verify hljs loads**

Open `http://localhost:8080` in Chrome (server must be running: `python -m http.server 8080`).
Open DevTools console. Run: `hljs.versionString`
Expected: a version string like `"11.9.0"` (no error).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add highlight.js CDN"
```

---

### Task 2: Fix hljs background in style.css

**Files:**
- Modify: `style.css` — after the `.plain-text` block (~line 562)

- [ ] **Step 1: Add the override rule**

In `style.css`, after the closing `}` of `.plain-text` (line 562), add:

```css

/* Prevent hljs theme from overriding the app's customizable background */
pre code.hljs { background: transparent; }
```

- [ ] **Step 2: Verify visually**

Open a `.js` file in the app (after Task 3 is done — skip for now, come back after Task 3).

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: transparent hljs background to respect app theme"
```

---

### Task 3: Add EXT_LANG map and _renderCode() to app.js

**Files:**
- Modify: `app.js` — add before the `_renderCurrentNote` function (~line 240)

- [ ] **Step 1: Add EXT_LANG map**

In `app.js`, insert this block immediately before the `// --- Render current note ---` comment (line 239):

```js
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

```

- [ ] **Step 2: Verify no syntax errors**

Open `http://localhost:8080` in Chrome. Open DevTools console.
Expected: no errors on load.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add EXT_LANG map and _renderCode helper"
```

---

### Task 4: Wire _renderCode into _renderCurrentNote

**Files:**
- Modify: `app.js` — the `else` block inside `_renderCurrentNote()` (search for `previewEl.innerHTML = '<pre class="plain-text">`)

- [ ] **Step 1: Replace the else block**

In `_renderCurrentNote()`, replace:
```js
  } else {
    previewEl.innerHTML = '<pre class="plain-text"></pre>';
    previewEl.querySelector('pre').textContent = tab.content;
    backlinksEl.innerHTML = '';
  }
```
With:
```js
  } else {
    _renderCode(previewEl, tab.content, tab.handle.name);
    backlinksEl.innerHTML = '';
  }
```

- [ ] **Step 2: Test — known extension**

Open any `.js` file in the app. Switch to preview (button "Vista previa").
Expected: syntax-highlighted code with colored tokens.

- [ ] **Step 3: Test — unknown extension**

Open a `.log` or `.txt` file.
Expected: plain text, no error in console.

- [ ] **Step 4: Test — .md files unaffected**

Open any `.md` file. Verify markdown renders normally with no regression.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: wire highlight.js into _renderCurrentNote"
```

---

### Task 5: Wire _renderCode into live update (oninput)

**Files:**
- Modify: `app.js` — the `else` block inside `noteContent.oninput` (search for `previewEl.querySelector('pre.plain-text')`)

- [ ] **Step 1: Replace the else block**

In `noteContent.oninput`, replace:
```js
  } else {
    const pre = previewEl.querySelector('pre.plain-text');
    if (pre) pre.textContent = getContent();
  }
```
With:
```js
  } else {
    _renderCode(previewEl, getContent(), state.tabs[state.activeTab].handle.name);
  }
```

- [ ] **Step 2: Test live update**

Open a `.js` file, switch to editor (button "Editar"), type a line of JS code. Switch to preview.
Expected: live-highlighted output updates as you type.

- [ ] **Step 3: Test .md live update unaffected**

Open a `.md` file, type in editor. Preview should still render markdown normally.

- [ ] **Step 4: Return to Task 2 Step 2 — verify theme background**

Change the app background color in Settings to a light color (e.g. `#f5f5f5`).
Expected: the `<pre>` block background follows the app theme, not the hljs dark background.
Change it back to `#1e1e1e`.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: wire highlight.js into live update oninput"
```

---

### Task 6: Update STATE.md

**Files:**
- Modify: `STATE.md`

- [ ] **Step 1: Add entry to Services table**

In the Services table, add after the "Plain text files" row:

```
| Syntax highlighting (non-.md) | ✅ | highlight.js 11.9.0, lang by extension |
```

- [ ] **Step 2: Add entry to History**

Add at the top of the History section:

```
- **2026-06-02c**: Syntax highlighting for non-.md files via highlight.js 11.9.0 CDN. Extension→language map in app.js. github-dark theme, transparent background override in style.css.
```

- [ ] **Step 3: Commit**

```bash
git add STATE.md
git commit -m "docs: update STATE.md for highlight.js integration"
```
