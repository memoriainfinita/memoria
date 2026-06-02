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
- **Create file at root**: Click "+ archivo" button in sidebar
- **Delete file**: Right-click a file in the sidebar
- **Move file**: Drag file, drop on a folder

## Constraints

- Chrome/Edge only (`showDirectoryPicker` not in Firefox)
- No automated tests — FSA API requires user interaction
- No bundler, no npm, no node — open directly in browser
