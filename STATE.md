---
created: 2026-06-04
last_updated: 2026-06-16
---

# Memoria - State

**Last Updated:** 2026-06-16

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
| Archivos no soportados en árbol | ✅ | Visibles atenuados, click avisa, solo eliminar en menú |
| Menú contextual en pestañas | ✅ | Cerrar / otras / izquierda / derecha, confirma sin guardar |
| Previsualización multimedia | ✅ | Imagen/audio/vídeo/PDF, visor solo-lectura vía object URL |
| Barra de estado | ✅ | `#backlinks` de dos lados: links entrantes + tipo/encoding/posición cursor |

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

- **2026-06-17**: GitHub Pages activado (source `main` / raíz). Demo pública en https://memoriainfinita.github.io/memoria/, confirmada live (HTTP 200). Rutas de `index.html` ya eran relativas, sirve bien bajo el subpath `/memoria/`. La File System Access API funciona por el contexto seguro HTTPS (sigue siendo solo Chromium). Añadidos `favicon.svg` (M en acento `#569cd6` sobre `#1e1e1e`) y link en `<head>`, línea de demo en README, y campo Website del repo apuntando a la demo.
- **2026-06-16b**: Primera publicación en GitHub. Repo público https://github.com/memoriainfinita/memoria (GPL-3.0). Preparación previa al push: añadido `LICENSE` (texto oficial GPL-3.0), y `.claude/` (config personal de Claude Code) + `.archive/` (history y backups) sacados del control de versiones vía `git rm --cached` y añadidos a `.gitignore` (siguen en disco local). Repo pasó de 45 a 22 archivos versionados. Remoto `origin` configurado, `main` → `origin/main`.
- **2026-06-16**: Rediseño visual vía Claude Design (handoff bundle, dirección C "Editor pro"). `style.css` reemplazado drop-in (sin tocar DOM ni clases): JetBrains Mono, tonos secundarios derivados de `--bg` con `color-mix()` (al cambiar el fondo se recolorea todo el chrome), estética terminal. Original archivado en `.archive/style-pre-editorpro-2026-06-16.css`. Fixes tras pruebas en navegador: quitado `font-size: 15px` absoluto de `body` (rompía el slider de tamaño), quitado `max-width: 56em` de `#preview` (no ocupaba el contenedor), `#preview pre`/`code` con `font-family: inherit` (la fuente elegida en Ajustes ahora aplica al contenido de archivos de código/texto, no solo a la interfaz; `<pre>`/`<code>` usaban la monospace del navegador). `#backlinks` convertido en barra de estado de dos lados: izquierda links entrantes (badge `↩ LINKS` solo si hay refs), derecha tipo de archivo · `utf-8` · posición del cursor `línea:columna` (real en editor vía listeners keyup/click/select/input). Funciones nuevas en app.js: `_renderStatusBar`, `_statusFileType`, `_caretLineCol`, `_updateCaretSeg`; eliminado el uso de `renderBacklinks`. La barra se oculta (`:empty`) en pestañas media o sin archivo. Material del handoff en `_design-handoff/` (gitignored). Nota de proceso: durante el debug, Chrome headless con `--user-data-dir` persistente cacheaba el HTML de prueba y daba falsos negativos; resuelto con perfil limpio.
- **2026-06-15**: Previsualización nativa de multimedia. La clasificación de archivos pasa del flag `supported` a un campo `type` (`text` | `media` | `binary`) en fileSystem.js (`fileType`, `mediaKind`). Los archivos media (imagen: png/jpg/jpeg/gif/webp/svg/bmp/ico/avif; audio: mp3/wav/ogg/oga/flac/m4a/aac; vídeo: mp4/webm/mov/mkv/m4v; pdf) abren como pestañas `type:'media'` en un visor solo-lectura (`<img>`/`<audio controls>`/`<video controls>`/`<iframe>` alimentado por `URL.createObjectURL`); editor, guardar, autosave, backlinks y detección de cambio externo se omiten para media. `binary` mantiene el comportamiento "no soportado". Object URLs liberados con `_disposeTab` en todos los puntos de cierre (`_closeAllTabs`, `_requestClose`, `_closeTabsKeeping`, `_deleteFile`, `_moveFile`). Mover/duplicar usa `readBlob` para archivos no-texto (arregla la corrupción de binarios al copiarlos como texto). editor.js: `showEditor`/`showPreview` restauran la visibilidad del botón de alternar; Ctrl+E protegido en pestañas media (`toggleBtn.onclick` con guard). Spec y plan en docs/superpowers. Limitación conocida: las pestañas media no se restauran tras recargar (la restauración sigue asumiendo `.md`).
- **2026-06-13b**: Árbol muestra todos los archivos, no solo los de la whitelist (`_walk` ya no filtra; flag `supported` por nodo). No soportados: atenuados+itálica (`.file-unsupported`), sin drag, click avisa "Tipo de archivo no soportado", menú contextual solo "Eliminar"; `_indexNode` los salta para no leer binarios. Detección de texto extraída a `isTextFile()`: además de la whitelist, abre dotfiles sin extensión adicional (`.gitignore`, `.env`, `.bashrc`…) y nombres conocidos (`Dockerfile`, `Makefile`, `LICENSE`, `README`, `CHANGELOG`, `AUTHORS`, `NOTICE`). Menú contextual en pestañas (botón derecho): Cerrar / Cerrar otras / Cerrar a la izquierda / Cerrar a la derecha, vía `_tabMenu` + `_closeTabsKeeping`, que confirma si hay pestañas sin guardar.
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
- [x] Mostrar en el árbol los archivos no soportados (p.ej. imágenes), visibles aunque no se puedan abrir, para que las carpetas con solo imágenes no aparezcan vacías. Hecho 2026-06-13.
- [x] Menú contextual en pestañas (botón derecho): cerrar todas, cerrar las de la izquierda, cerrar las de la derecha (estilo Chrome). Hecho 2026-06-13.
- [x] Revisar el diseño de la app. El minimalismo gusta, pero se ve poco profesional. Hecho 2026-06-16 (dirección "Editor pro" vía Claude Design).
- [x] Previsualizar archivos que el navegador puede abrir de forma nativa (imágenes, vídeo, audio, PDF). Hecho 2026-06-15.
- [x] Al abrir otra carpeta: avisar al usuario (con aviso reforzado si hay cambios sin guardar) y empezar limpio, cerrando las pestañas de la carpeta anterior. Hecho 2026-06-13.

### Pendientes (2026-06-16)
- [ ] Números de línea al ver/editar archivos, toggleable desde Ajustes. Opciones de alcance: gutter en el editor (textarea, requiere desactivar wrap), numeración en archivos de código en preview, o ambos. Pendiente decidir alcance.
- [ ] Revisar el scroll horizontal en líneas largas: ahora aparece barra de desplazamiento lateral, y en archivos muy grandes dificulta la lectura. Decidir entre wrap de líneas largas u otra solución.