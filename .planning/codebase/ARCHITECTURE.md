# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Single-Page Application (SPA) with File System Access API

**Key Characteristics:**
- Stateless file-based note management (no database)
- DOM-driven state synchronization with file system
- Direct file system access via browser File System Access API
- Markdown rendering with custom link syntax extension
- Real-time preview with editor/preview toggle

## Layers

**Presentation Layer:**
- Purpose: Render UI and handle user interactions
- Location: `index.html`, `style.css`
- Contains: HTML structure, CSS styling, DOM element references
- Depends on: marked.js CDN for Markdown parsing
- Used by: Application logic layer

**Application Logic Layer:**
- Purpose: Orchestrate core functionality and state management
- Location: `app.js`
- Contains: File operations, note management, event handlers, preview rendering
- Depends on: Presentation layer (DOM), marked.js for parsing, File System Access API
- Used by: Browser runtime

**External Library Layer:**
- Purpose: Markdown parsing and HTML rendering
- Library: marked.js (CDN: https://cdn.jsdelivr.net/npm/marked/marked.min.js)
- Used for: Converting Markdown to HTML, handling extended Markdown syntax

## Data Flow

**Note Loading Flow:**

1. User clicks "Abrir carpeta de notas" button
2. `openFolder()` (line 17) invokes `showDirectoryPicker()` via File System Access API
3. Directory handle stored in `currentHandle` global variable
4. `listNotes()` (line 29) iterates through directory entries
5. Markdown files collected in `notes` array (line 4)
6. UI list populated in `#notes-list` element with click handlers

**Note Opening Flow:**

1. User clicks note item in sidebar
2. `openNote(fileHandle)` (line 45) invoked with file entry
3. File contents read via `fileHandle.getFile()` and `.text()`
4. Content stored in `noteContent.value` (line 50)
5. Title extracted and displayed in `noteTitle.value` (line 49)
6. `renderPreview()` (line 81) generates HTML preview

**Note Saving Flow:**

1. User clicks "Guardar" button
2. `saveNote()` (line 57) opens writable stream via `createWritable()`
3. Content from `noteContent.value` written to file
4. `listNotes()` refreshed to reflect filesystem state

**State Management:**

- `notes` (line 4): Array of File System API FileHandle objects for all .md files
- `currentHandle` (line 5): Directory handle for the active folder
- `currentNote` (line 6): Active FileHandle for editing operations
- `noteContent.value`: Text buffer for current note (Markdown source)
- `noteTitle.value`: Current note title (filename without .md extension)

## Key Abstractions

**FileHandle System:**
- Purpose: Represents individual note files in filesystem
- Examples: Created by `listNotes()`, manipulated in `openNote()`, written in `saveNote()`
- Pattern: File System Access API FileHandle objects from `values()` iteration

**Notes Array:**
- Purpose: Maintains in-memory index of all discoverable notes for search and linking
- Examples: Used in `listNotes()` line 34, searched in `renderPreview()` line 91
- Pattern: Flat array of FileHandle objects, rebuilt on each directory refresh

**Preview Renderer:**
- Purpose: Transform raw Markdown content into rendered HTML with custom link handling
- Examples: Called on note open (line 53), on content input (line 66)
- Pattern: Single function `renderPreview()` that handles Markdown parsing and custom syntax

**Custom Link Syntax:**
- Purpose: Enable wiki-style bidirectional links between notes
- Examples: `[[note-name]]` in Markdown becomes clickable link
- Pattern: Regex replacement (line 82), custom click handlers (line 87-94)

## Entry Points

**Application Entry:**
- Location: `index.html` line 25 - `<script src="app.js"></script>`
- Triggers: Browser loads and parses HTML, then executes app.js
- Responsibilities: Establishes DOM element references (lines 8-12), attaches event handlers (line 26, 65, 73)

**User Entry Points:**

1. **Folder Opening:**
   - Location: `app.js` line 26 - `document.getElementById('open-folder').onclick = openFolder`
   - Triggers: User clicks "Abrir carpeta de notas" button
   - Responsibilities: Invoke system folder picker, load note directory

2. **Note Selection:**
   - Location: `app.js` line 38 - `item.onclick = () => openNote(entry)`
   - Triggers: User clicks note in sidebar
   - Responsibilities: Load file contents, render preview

3. **Save:**
   - Location: `app.js` line 65 - `saveNoteBtn.onclick = saveNote`
   - Triggers: User clicks "Guardar" button
   - Responsibilities: Write content to filesystem

4. **Search:**
   - Location: `app.js` line 73 - `searchInput.oninput`
   - Triggers: User types in search box
   - Responsibilities: Filter sidebar items by name

5. **Preview Interaction:**
   - Location: `app.js` line 87-94 - markdown link click handler
   - Triggers: User clicks `[[note]]` link in preview
   - Responsibilities: Navigate to linked note
   - Location: `app.js` line 98-136 - double-click handler
   - Triggers: User double-clicks preview area
   - Responsibilities: Switch to editor mode, position cursor

6. **Real-time Preview:**
   - Location: `app.js` line 66 - `noteContent.oninput = renderPreview`
   - Triggers: User types in editor
   - Responsibilities: Live update preview panel

## Error Handling

**Strategy:** Alert-based user notification with graceful fallbacks

**Patterns:**

- **Unsupported Browser:** Alert message (line 22) if File System Access API unavailable
- **Missing Links:** Alert notification (line 93) when referenced note not found
- **Null Guard:** Check `if (!currentNote)` (line 58) before attempting save

## Cross-Cutting Concerns

**Logging:** No dedicated logging. Errors surfaced via alert dialogs.

**Validation:** Implicit validation:
- File type checking: Filter for `.md` extension (line 33)
- No explicit input validation on title/content fields

**Authentication:** Not applicable - direct filesystem access, no user accounts

**File System Access Permissions:** Handled by browser security model:
- User grants permission once via system file picker dialog
- Subsequent operations use granted handle without re-prompting

---

*Architecture analysis: 2026-01-23*
