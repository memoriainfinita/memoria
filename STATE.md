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
| List .md files | ✅ | Flat list, no folders (listNotes() flat only) |
| Open note | ✅ | Loads content to editor |
| Save note | ✅ | createWritable() |
| Live preview | ✅ | marked library |
| Wiki-links | ✅ | [[nota]] navigable |
| Search by name | ✅ | Filter in sidebar |
| Toggle editor/preview | ✅ | Button #toggle-view, ondblclick en preview → editor |
| Rename note | ❌ | Campo visible pero no-op (FSA API no soporta rename) |
| Tree UI | ❌ | Not implemented |
| Multi-tab | ❌ | Not implemented |
| Backlinks | ❌ | Not implemented |

---

## Preferences

- **UI:** Tema claro (body #f7f7f7, sidebar #fff, header oscuro #222) — objetivo dark theme pendiente
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

- **2026-05-31**: State auditado contra codigo real. Corregido: dark theme no implementado (CSS es tema claro). Añadidos: toggle editor/preview (implementado), rename no-op (campo visible pero sin funcion). listNotes() confirmado flat-only.
- **2026-04-25**: State reestructurado formato animus. Skill animus replicada a `.copilot/skills/animus`. Codebase: ~60% Phase 1, ~50% Phase 2, ~40% Phase 3.
- **2026-01-23**: Project initialized.

---

## TODO

- [ ] Tree UI con carpetas anidadas
- [ ] Create new file (.md)
- [ ] Delete file con confirmación
- [ ] Create folder
- [ ] Drag-drop