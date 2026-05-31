# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- HTML5 - Markup for UI structure (`index.html`)
- CSS3 - Styling and layout (`style.css`)
- JavaScript (vanilla ES6+) - Application logic (`app.js`)

**Secondary:**
- Markdown - Note content format (user-created `.md` files)

## Runtime

**Environment:**
- Browser-based (no backend server required)
- Requires modern browser with ES6 support

**Package Manager:**
- None - No package manager or build tools used
- Lockfile: Not applicable (CDN-only dependencies)

## Frameworks

**Core:**
- Vanilla JavaScript - No framework dependency

**Markdown Parsing:**
- Marked.js v14+ (via CDN: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`) - Converts Markdown to HTML for preview

**Build/Dev:**
- None - Static HTML/CSS/JS, no build process

## Key Dependencies

**Critical:**
- Marked.js - Markdown parser library
  - Source: CDN (`https://cdn.jsdelivr.net/npm/marked/marked.min.js`)
  - Why it matters: Required for rendering Markdown previews in the note editor
  - Used in: `index.html` (line 24), `app.js` function `renderPreview()` (line 85)

**File System:**
- File System Access API - Browser native API for local file access
  - Implementation: `window.showDirectoryPicker()` in `app.js` (line 18)
  - Browser support: Chrome, Edge (requires modern browser)
  - Why it matters: Enables local folder access without backend infrastructure

## Configuration

**Environment:**
- No environment variables required
- No .env file used
- No configuration files

**Browser:**
- Requires permission to access local directories
- Language: Spanish (`lang="es"` in `index.html`)
- Viewport: Mobile-responsive metadata configured

## Platform Requirements

**Development:**
- Text editor (VS Code configured with `.vscode/tasks.json`)
- Modern web browser (Chrome, Edge recommended)
- No build tools or npm installation required

**Production/Deployment:**
- Static file hosting (any HTTP server)
- Python built-in server: `python -m http.server 8000`
- Can run locally by opening `index.html` directly in browser

## Application Architecture

**No Backend:** Purely client-side application
- File operations via File System Access API
- All data persists in local filesystem only
- No server communication or database

**Core Components:**
- `index.html` (27 lines) - UI structure with header, notes list, editor, preview
- `app.js` (138 lines) - File management, Markdown rendering, note linking
- `style.css` (12 lines) - Flexbox layout, color scheme, responsive design

## External Resources

**CDN Resources:**
- Marked.js: `https://cdn.jsdelivr.net/npm/marked/marked.min.js`

**No External Dependencies:**
- No npm packages
- No backend APIs
- No third-party services (database, auth, monitoring, etc.)
- No build process (webpack, Vite, Rollup, etc.)

---

*Stack analysis: 2026-01-23*
