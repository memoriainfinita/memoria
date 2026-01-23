# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
memoria/
├── .github/                    # GitHub configuration and documentation
│   └── copilot-instructions.md # Project setup guide for Claude
├── .vscode/                    # VS Code workspace settings
│   └── tasks.json              # Build/launch task definitions
├── .planning/                  # Planning documents (generated)
│   └── codebase/               # Codebase analysis (this directory)
├── index.html                  # Application entry point and UI structure
├── app.js                      # Core application logic and event handlers
├── style.css                   # Complete styling
├── README.md                   # User-facing documentation
└── LICENSE                     # License file
```

## Directory Purposes

**`.github/`:**
- Purpose: Project-level configuration and documentation
- Contains: Copilot instructions, project scaffolding checklist
- Key files: `copilot-instructions.md` - scaffolding and setup guide

**`.vscode/`:**
- Purpose: Developer workspace configuration
- Contains: Task definitions for local development
- Key files: `tasks.json` - defines "Abrir index.html en navegador" task

**`.planning/`:**
- Purpose: Generated planning and analysis documents
- Contains: Codebase mapping documentation
- Key files: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md (when created)

## Key File Locations

**Entry Points:**
- `index.html`: Application bootstrap and DOM structure
  - Loads marked.js library from CDN
  - Links style.css for styling
  - Includes app.js as main application script
  - Establishes HTML structure for editor interface

**Configuration:**
- `.vscode/tasks.json`: Development environment configuration
- `README.md`: User-facing project documentation

**Core Logic:**
- `app.js`: All application business logic (~137 lines)
  - File system operations
  - Note management
  - DOM manipulation
  - Event handling

**Styling:**
- `style.css`: Complete stylesheet (~13 lines)
  - Flexbox layout for editor/sidebar
  - Button and input styling
  - Preview panel styling

**Documentation:**
- `README.md`: User guide and feature overview
- `.github/copilot-instructions.md`: Development instructions

## Naming Conventions

**Files:**
- HTML: Single file `index.html` as convention
- JavaScript: `app.js` for main application file
- CSS: `style.css` for stylesheet
- Documentation: markdown files with descriptive names (README.md, CLAUDE.md)

**Directories:**
- Configuration: Leading dot (`.github`, `.vscode`)
- Planning: `.planning/` for generated analysis
- Semantic names: kebab-case not used; single-word directories preferred

**CSS Classes:**
- Kebab-case: `notes-list`, `note-item`, `note-title`, `note-content`, `md-link`
- Convention: Semantic naming reflecting HTML purpose

**JavaScript Variables:**
- Identifiers: camelCase for consistency
  - `currentHandle`: File System API directory handle
  - `currentNote`: File System API file handle
  - `notesList`: DOM element reference
  - `searchInput`: DOM element reference

**JavaScript Functions:**
- camelCase naming convention
- Action-oriented names: `openFolder()`, `listNotes()`, `openNote()`, `saveNote()`, `renderPreview()`
- Async functions: Standard naming, async keyword used appropriately

## Where to Add New Code

**New Feature:**
- Primary code: Add function to `app.js`
  - Example: New export feature would be `exportNote()` function in app.js
  - Attach to event handler via `getElementById()` and `.onclick`
- Styling: Extend `style.css` with new classes
- UI: Add HTML elements to `index.html`

**New UI Component:**
- Implementation: Add HTML to `index.html` section
- Styling: Add CSS class to `style.css`
- JavaScript: Add event handler in `app.js`
- Pattern: Establish DOM element reference at top of `app.js` (lines 8-12)

**Utilities:**
- Shared helpers: Currently inline in `app.js`
- For larger utilities: Consider extracting to separate `utils.js` file
- Future pattern: Import from utils module if modularization needed

**Testing:**
- Location: Currently untested codebase
- Future pattern: Consider `tests/` directory if test suite added
- Test file naming: `test-feature.html` for browser-based tests

## Special Directories

**`.planning/codebase/`:**
- Purpose: Generated codebase analysis documents
- Generated: Yes (created by mapping process)
- Committed: Yes (analysis documents are tracked in git)
- Contents: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md (as created)

**`node_modules/` or similar:**
- Not present: Application has no build process, no package manager
- External dependencies: Only marked.js via CDN link in index.html

## Application Architecture at a Glance

**Single HTML File Pattern:**
- No separate template files
- All UI defined inline in `index.html`
- Simplifies deployment: Copy single HTML file to web server

**Single JavaScript File Pattern:**
- All logic in `app.js`
- Global variables: `notes`, `currentHandle`, `currentNote` at module level
- No module system or bundling required
- No imports/exports (vanilla JavaScript)

**Global State:**
```javascript
let notes = [];                    // Array of FileHandle objects
let currentHandle = null;          // Directory FileHandle
let currentNote = null;            // Active file FileHandle
```

**DOM Reference Cache:**
```javascript
const notesList = document.getElementById('notes-list');      // Sidebar
const noteTitle = document.getElementById('note-title');      // Title input
const noteContent = document.getElementById('note-content');  // Editor textarea
const saveNoteBtn = document.getElementById('save-note');     // Save button
const preview = document.getElementById('preview');           // Preview panel
const searchInput = document.getElementById('search');        // Search input
```

## File Interaction Flow

```
Browser Load
  ↓
index.html parsed
  ↓
style.css linked and applied
  ↓
marked.js library loaded (CDN)
  ↓
app.js executed
  ├─ DOM references established
  ├─ Event handlers attached
  └─ Ready for user interaction
      ↓
    User clicks "Abrir carpeta"
      ↓
    File System API picker → currentHandle set → listNotes()
      ↓
    User clicks note in list
      ↓
    openNote(fileHandle) → renderPreview()
      ↓
    User types in editor
      ↓
    noteContent.oninput → renderPreview() [live update]
      ↓
    User clicks "Guardar"
      ↓
    saveNote() → listNotes() [refresh sidebar]
```

---

*Structure analysis: 2026-01-23*
