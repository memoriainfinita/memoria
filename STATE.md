---
created: 2026-06-04
last_updated: 2026-06-13
---

# Memoria - State

**Last Updated:** 2026-06-13

---

## System

- **Stack:** Vanilla JS + HTML5 + CSS3, no frameworks
- **API:** File System Access API (Chromium only)
- **Deployment:** Static web app (index.html)
- **Browser:** Chrome/Edge (showDirectoryPicker)
- **File Format:** .md, .txt, .html, .js, .ts, .css, .json, .yaml, .yml, .toml, .ini, .xml, .csv, .log, .py, .sh, .bat, .ps1, .rb, .php, .java, .c, .cpp, .h, .go, .rs, .swift, .kt, .sql, .rst, .org
- **Dev server:** python -m http.server 8080 (required — ES6 modules blocked on file://)

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
| Keyboard shortcuts | ✅ | Ctrl+S/F/W/B/N/E — configurable desde Settings |
| Auto-save | ✅ | Configurable, localStorage |
| Settings panel | ✅ | Fondo, acento, fuente, tamaño texto, autosave, atajos |
| Responsive / mobile | ✅ | Sidebar toggle siempre visible |
| External file change detection | ✅ | Check on window focus |
| Tooltips | ✅ | Native title attributes |
| Session persistence | ✅ | IndexedDB (folder handle) + localStorage (tabs, width) |
| Sidebar resizable | ✅ | Drag handle, persiste ancho |
| Custom modal | ✅ | Reemplaza alert/confirm/prompt del sistema |
| Context menu | ✅ | Right-click archivos (duplicar/eliminar) y carpetas (crear) |
| Duplicate file | ✅ | Via context menu, sufijo -copia |
| Move to root | ✅ | Drag & drop a zona raíz en sidebar |
| Frontmatter strip | ✅ | YAML frontmatter oculto en preview, intacto en editor |
| Plain text files | ✅ | Archivos no-.md se muestran sin render |
| Syntax highlighting (non-.md) | ✅ | highlight.js 11.9.0, lang by extension |
| Theme customization | ✅ | Color fondo+acento (dark/light adapt), fuente, tamaño |
| Save button | ✅ | Header, se activa (azul) cuando hay cambios sin guardar |

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

- **2026-06-13**: Limpieza de slop y bugs tras revisión de código. Markdown reducido a solo `.md` (quitado `.markdown`/`.mdx` de buildTree e isMd). Fix createFile: forzaba `.md` a todo, ahora solo lo añade si el nombre no trae extensión; duplicar y mover archivos no-`.md` ya no los renombra a `.md`. `_duplicateFile` preserva la extensión original. Eliminado `showChoice` (modal.js, sin uso). Render de preview unificado en `_renderPreview` (se duplicaba entre switch y oninput). EXT_LANG ampliado: jsx, tsx, scss, ini. Color hardcodeado en tree.js drag-over → `var(--bg)`. test.md archivado en `.archive` y borrado de raíz. README: `cd` corregido y formatos markdown actualizados a solo `.md`. Resaltado de `.ps1`/`.bat` añadido (scripts powershell+dos del CDN highlight.js; toml→ini). Abrir otra carpeta ahora avisa y cierra las pestañas anteriores (`_closeAllTabs`).
- **2026-06-03**: Syntax highlighting for non-.md files via highlight.js 11.9.0 CDN. Extension→language map in app.js. github-dark theme, transparent background override in style.css.
- **2026-06-02b**: Sidebar active highlight para archivos no-.md (clase `active-other`, accent al 30%). Toggle "Mostrar extensiones" en Settings (localStorage `show-extensions`), re-renderiza árbol al cambiar.
- **2026-06-02**: Major UX session. Added: sidebar to search+open-folder, folder visuals (▶/▼), custom modal system, context menus (right-click), save button, sidebar toggle+resize+persist, session persistence (IndexedDB), settings expansion (theme colors, font, font-size), configurable keybindings (Ctrl+B/N/E added), frontmatter strip in preview, plain text file support (20+ extensions), duplicate file, move-to-root drop zone, fixed same-dir move bug.
- **2026-05-31**: Full rewrite complete. Modular ES6 architecture (6 modules + app.js). All 40 v1 requirements implemented.
- **2026-05-31**: State auditado contra codigo real. Corregido: dark theme no implementado (CSS es tema claro). Añadidos: toggle editor/preview (implementado). listNotes() confirmado flat-only.
- **2026-04-25**: State reestructurado formato animus. Skill animus replicada a `.copilot/skills/animus`. Codebase: ~60% Phase 1, ~50% Phase 2, ~40% Phase 3.
- **2026-01-23**: Project initialized.

---

## TODO

- All 40 v1 requirements complete.
- v2 ideas: see docs/superpowers/specs/2026-05-31-memoria-complete-design.md

### Pendientes (2026-06-13)
- [ ] Mostrar en el árbol los archivos no soportados (p.ej. imágenes), visibles aunque no se puedan abrir, para que las carpetas con solo imágenes no aparezcan vacías.
- [ ] Menú contextual en pestañas (botón derecho): cerrar todas, cerrar las de la izquierda, cerrar las de la derecha (estilo Chrome).
- [x] Al abrir otra carpeta: avisar al usuario (con aviso reforzado si hay cambios sin guardar) y empezar limpio, cerrando las pestañas de la carpeta anterior. Hecho 2026-06-13.