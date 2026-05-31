# Memoria - State

**Last Updated:** 2026-05-31

---

## System

- **Stack:** Vanilla JS + HTML5 + CSS3, no frameworks
- **API:** File System Access API (Chromium only)
- **Deployment:** Static web app (index.html)
- **Browser:** Chrome/Edge (showDirectoryPicker)
- **File Format:** .md only

---

## Services

| Service | Status | Notes |
|---------|--------|-------|
| Open folder | ✅ | File System Access API |
| Tree with nested folders | ✅ | Recursive, expandable, details/summary |
| Open / save note | ✅ | createWritable() |
| Multi-tab editing | ✅ | tabs.js |
| Live preview | ✅ | marked CDN |
| Toggle editor/preview | ✅ | editor.js |
| Wiki-links [[nota]] | ✅ | Clickable, broken detection |
| Backlinks | ✅ | links.js |
| Search name + full-text | ✅ | search.js |
| Create file (root + subfolders) | ✅ | sidebar button + context menu |
| Create folder | ✅ | Context menu on tree folder |
| Delete file | ✅ | Context menu on file |
| Drag-drop file move | ✅ | HTML5 drag + confirmation |
| Dark theme | ✅ | CSS variables |
| Keyboard shortcuts | ✅ | Ctrl+S, Ctrl+F, Ctrl+W |
| Auto-save | ✅ | Configurable, localStorage |
| Settings panel | ✅ | Auto-save toggle + interval |
| Responsive / mobile | ✅ | Sidebar toggle on <768px |
| External file change detection | ✅ | Check on window focus |
| Tooltips | ✅ | Native title attributes |

---

## Preferences

- **UI:** Dark theme unix/vim aesthetic (CSS variables: --bg #1e1e1e, --accent #569cd6) — implemented 2026-05-31
- **Editor:** Markdown plain-text, preview separate
- **Navigation:** Tree-first (not journal)
- **Sync:** Local-first, no cloud v1

---

## Patterns

- [file-system] File System Access API for local folder access. Confirmed 2026-04.
- [markdown] marked library for MD rendering. Confirmed 2026-04.
- [links] Wiki-link syntax [[note]] parsed in renderPreview. Confirmed 2026-04.

---

## History

- **2026-05-31**: Full rewrite complete. Modular ES6 architecture (6 modules + app.js). All 40 v1 requirements implemented.
- **2026-05-31**: State auditado contra codigo real. Corregido: dark theme no implementado (CSS es tema claro). Añadidos: toggle editor/preview (implementado), rename no-op (campo visible pero sin funcion). listNotes() confirmado flat-only.
- **2026-04-25**: State reestructurado formato animus. Skill animus replicada a `.copilot/skills/animus`. Codebase: ~60% Phase 1, ~50% Phase 2, ~40% Phase 3.
- **2026-01-23**: Project initialized.

---

## TODO

- All 40 v1 requirements complete.
- v2 ideas: see docs/superpowers/specs/2026-05-31-memoria-complete-design.md