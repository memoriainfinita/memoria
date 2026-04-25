# Memoria - AI Agent Instructions

A portable Markdown notes app with wiki-links. No build step required.

## Quick Start

1. Open `index.html` directly in browser (Chrome/Edge recommended)
2. Click "Abrir carpeta de notas" to select a folder with `.md` files
3. Edit notes and save — changes write directly to filesystem

## Project Structure

| File | Purpose |
|------|---------|
| `index.html` | Main UI - sidebar + editor + preview |
| `app.js` | Core logic: file handling, search, wiki-link parsing |
| `style.css` | Basic styling |

## Key Commands

- **Run**: Open `index.html` in browser (no server needed)
- **Test**: Manual testing in browser - no automated tests exist

## Development Notes

- Uses File System Access API (`showDirectoryPicker`) — only works in Chromium browsers
- Wiki-links use `[[note-name]]` syntax, parsed in `app.js`
- No backend or database — all data stays in local filesystem
- Dependencies loaded via CDN: `marked` for Markdown rendering

## Common Patterns

- `currentHandle` — directory handle from File System Access API
- `currentNote` — currently open file handle
- `notes` array — list of file handles for `.md` files

## Relevant Docs

- [README.md](README.md) — User-facing documentation
- [frontmatter y backlinks es suficiente.txt](frontmatter%20y%20backlinks%20es%20suficiente.txt) — Feature notes