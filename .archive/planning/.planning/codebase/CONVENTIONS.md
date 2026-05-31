# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- HTML: `index.html` (single file, lowercase)
- JavaScript: `app.js` (single file, lowercase with camelCase for variables/functions)
- CSS: `style.css` (single file, lowercase)
- Markdown: `README.md` (uppercase)

**Functions:**
- camelCase: `openFolder()`, `listNotes()`, `openNote()`, `saveNote()`, `renderPreview()`
- No prefix for public functions
- Event handlers: named as `functionName()` and assigned to event properties (e.g., `openFolder` assigned to `openFolder.onclick`)
- Async functions: use `async` keyword, typically return Promises (e.g., `async function openNote(fileHandle)`)

**Variables:**
- camelCase for all variables: `currentHandle`, `currentNote`, `notes`, `notesList`, `noteTitle`, `noteContent`
- DOM element references stored in camelCase: `notesList`, `noteTitle`, `noteContent`, `saveNoteBtn`, `preview`, `searchInput`
- Local variables in loops: `entry`, `item`, `found`, `name`, `q`, `clickedElem`, `clickedText`, `allLines`, `idx`, `pos`
- Global state variables: `notes` (array), `currentHandle` (File System handle), `currentNote` (File handle)

**Types:**
- No TypeScript; vanilla JavaScript with dynamic typing
- Comments indicate expected types contextually (e.g., `fileHandle` parameter name implies File System Handle)

## Code Style

**Formatting:**
- No formatter configured (no .prettierrc, no eslint config)
- Indentation: 2 spaces (observed in HTML and CSS)
- Line length: Mixed; some lines exceed 80 characters (lines 82-83 in `app.js`)
- Semicolons: Inconsistently used; some statements have them, others don't (mixed ASI style)
- Spacing: Space before opening brace in if statements not consistently observed

**Linting:**
- No linting configured (no .eslintrc, no ESLint setup)
- Code style is ad-hoc and inconsistent

## Import Organization

**Order:**
- CDN dependencies loaded in `<script>` tags at end of `index.html` before app.js
- No ES6 import/export syntax used
- Single global scope: `marked` library available as global variable in `app.js`

**Script Loading Order (index.html):**
```html
1. <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
2. <script src="app.js"></script>
```

**Dependencies:**
- `marked.js` from CDN: Used for Markdown parsing (line 85: `marked.parse(md)`)
- Web APIs: File System Access API (lines 18-19), no other external libraries

## Error Handling

**Patterns:**
- Minimal error handling throughout codebase
- File operations have no try-catch (e.g., `openNote()` lines 45-54, `saveNote()` lines 57-63)
- User feedback: Single `alert()` on missing notes (line 93: `alert('Nota no encontrada: ' + name)`)
- Browser compatibility check: Simple `if` statement (line 18: `if ('showDirectoryPicker' in window)`)
- No validation of returned values or edge cases
- CDN failure not handled; if `marked` is undefined, code silently fails

**Anti-pattern observed:**
- Code relies on global state without defensive checks
- Async operations don't handle rejection/errors

## Logging

**Framework:** None; console logging not used in production code

**Patterns:**
- No structured logging
- No debug mode or log levels
- Comments indicate functionality instead of logging (lines 1-2 comment describes app purpose)

## Comments

**When to Comment:**
- File header with brief description (lines 1-2 in `app.js`)
- Inline comments for clarification on non-obvious code (lines 14, 67 reference removed features)
- Comments in Spanish mixed with code (e.g., "// Eliminado toggleEditorBtn" line 14, "// Renombrar archivo..." line 69)
- No JSDoc comments; no function documentation

**Style:**
- Single-line comments with `//`
- Spanish language comments (app is bilingual Spanish/English)

## Function Design

**Size:**
- Small functions: Most functions 5-15 lines (e.g., `saveNote()` is 6 lines)
- Larger functions: `renderPreview()` is 57 lines with nested event handlers
- Exception: `renderPreview()` contains multiple event handler definitions (lines 81-137), including duplicate code

**Parameters:**
- Minimal parameters; most functions take 0-1 parameter
- File operations accept `fileHandle` parameter (File System Access API object)
- Event handlers take no parameters (lines 17-24, but some receive `e` for event object)
- No destructuring; parameters passed as-is

**Return Values:**
- Most functions are void (no return statement)
- Async functions implicitly return Promise
- No explicit error returns; relies on exceptions (which are rarely caught)

**Async/Await Pattern:**
- Used consistently in file operations (lines 17-24, 29-42, 45-54, 57-63)
- For-await loop for directory iteration (line 32: `for await (const entry of currentHandle.values())`)

## Module Design

**Exports:**
- No explicit exports; single global scope
- All functions and variables are implicitly global
- DOM element caching at module level (lines 8-12)

**Module Initialization:**
- Event handler assignment in module scope (lines 26, 65-66, 73-78)
- No initialization function; code executes immediately on page load

## Specific Code Patterns Observed

**Event Handler Assignment Pattern (lines 26, 65):**
```javascript
document.getElementById('open-folder').onclick = openFolder;
saveNoteBtn.onclick = saveNote;
```

**Input Event Handlers with Inline Functions (lines 66, 68, 73):**
```javascript
noteContent.oninput = renderPreview;
noteTitle.oninput = () => { /* handler */ };
searchInput.oninput = function() { /* handler */ };
```

**Async File Operations Pattern (lines 17-24):**
```javascript
async function openFolder() {
  if ('showDirectoryPicker' in window) {
    currentHandle = await window.showDirectoryPicker();
    await listNotes();
  } else {
    alert('Tu navegador no soporta acceso a archivos locales. Usa Chrome o Edge.');
  }
}
```

**String Interpolation Mix:**
- Template literals not consistently used; some concatenation (line 93: `'Nota no encontrada: ' + name`)
- Modern syntax when needed (e.g., no template literals observed in codebase actually)

**Search Filter Pattern (lines 73-78):**
```javascript
searchInput.oninput = function() {
  const q = searchInput.value.toLowerCase();
  for (const item of notesList.children) {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
};
```

---

*Convention analysis: 2026-01-23*
