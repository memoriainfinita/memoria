# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Markdown Parsing:**
- Marked.js library - Converts Markdown to HTML for preview rendering
  - SDK/Client: marked.js via CDN
  - Usage: `marked.parse(md)` in `app.js` line 85
  - Integration point: `index.html` line 24 loads CDN resource

**No Other External Services:**
- No REST APIs
- No payment processors
- No analytics
- No third-party authentication
- No social media integrations
- No SaaS platforms

## Data Storage

**Databases:**
- None - Not used

**File Storage:**
- Local filesystem only
  - Access method: File System Access API (`window.showDirectoryPicker()`)
  - File format: `.md` (Markdown files)
  - Location: User-selected directory (persistent across sessions)
  - Client-side operations: Read, write, rename (rename not fully supported)
  - Implementation: `app.js` functions `openFolder()`, `listNotes()`, `openNote()`, `saveNote()`

**Caching:**
- None - Notes loaded from filesystem on demand
- In-memory note list: `notes = []` variable in `app.js` (line 4)

## Authentication & Identity

**Auth Provider:**
- None - No user authentication
- Access control: File system permissions handled by browser/OS
- Browser prompts user to grant folder access permission

**Implementation Approach:**
- File System Access API permissions flow (native browser dialog)
- User selects folder → Browser grants permission scope
- No login system required

## Monitoring & Observability

**Error Tracking:**
- None - No error tracking service

**Logs:**
- None - Application uses browser console only (no persistent logging)
- Browser DevTools for debugging only

## CI/CD & Deployment

**Hosting:**
- Static file server (no backend required)
- Options:
  - Direct file open in browser: `file:///path/to/index.html`
  - HTTP server: `python -m http.server 8000`
  - Any static file host (GitHub Pages, Netlify, etc.)

**CI Pipeline:**
- None - No automated testing or deployment pipeline

## Environment Configuration

**Required env vars:**
- None - No environment variables used

**Secrets location:**
- None - No secrets or credentials in application
- File access handled via browser permission system

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Browser APIs Used

**File System Access API:**
- `window.showDirectoryPicker()` - Select local directory (`app.js` line 18)
- `entry.values()` - Iterate directory contents (`app.js` line 32)
- `fileHandle.getFile()` - Read file content (`app.js` line 46)
- `fileHandle.createWritable()` - Write file content (`app.js` line 59)
- Browser requires HTTPS for production (localhost OK for development)

**DOM APIs:**
- Standard DOM manipulation (no special integrations)
- Event handling (click, input, double-click)

## Third-Party Services Summary

**Total External Dependencies:** 1
- Marked.js (CDN-loaded Markdown parser)

**Total APIs Used:** 0
- No REST/GraphQL APIs
- No external service integrations
- Browser APIs only (native functionality)

**Data Flow:**
```
User → Browser → File System Access API → Local Filesystem
                ↓
        Marked.js CDN → Parse Markdown
                ↓
        DOM Rendering → User sees preview
```

---

*Integration audit: 2026-01-23*
