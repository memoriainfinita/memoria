# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Status:** Not configured

**Runner:**
- No test runner installed (no Jest, Vitest, Mocha, Jasmine, etc.)
- No test configuration files present (no jest.config.js, vitest.config.ts, etc.)

**Assertion Library:**
- None installed

**Run Commands:**
```bash
# No test suite exists
# Manual testing only: open index.html in browser and interact with UI
```

## Test File Organization

**Current State:**
- No test files exist
- No tests directory structure
- Codebase is 100% untested (0 automated tests)

**Recommended Location (for future implementation):**
- `tests/` directory at project root
- Format: `tests/test-<modulename>.html` or `tests/<modulename>.test.js`
- Example paths for future tests:
  - `tests/test-fileoperations.html` (File System Access operations)
  - `tests/test-preview.html` (Markdown rendering)
  - `tests/test-search.html` (Note filtering)

**Naming Convention:**
- Use `test-<feature>.html` or `test-<feature>.js` format
- Kebab-case for feature names
- Place in `tests/` directory

## Manual Testing Workflow

**Current Testing Method:**
1. Open `index.html` in Chrome or Edge browser
2. Click "Abrir carpeta de notas" (Open notes folder)
3. Select a folder containing `.md` files
4. Interact with UI to test functionality

**What Manual Testing Covers:**
- File System Access API prompt/permission
- Directory listing and note file detection
- Note preview rendering with Markdown
- Search filter by note name
- Double-click to toggle between preview and editor
- Link navigation with `[[note-name]]` syntax

**What Is NOT Tested:**
- Edge cases (malformed markdown, missing files, corrupted content)
- Browser compatibility (Firefox, Safari don't support File System Access API)
- Error scenarios (CDN down, permission denied, invalid file names)
- Performance with large note counts (1000+ notes)
- Accessibility (keyboard navigation, screen reader compatibility)

## Critical Test Gaps (HIGH PRIORITY)

**No Unit Tests For:**
- `renderPreview()` function (line 81-137 in `app.js`) - core markdown rendering logic
- `listNotes()` function (line 29-42) - directory listing and filtering
- `openNote()` function (line 45-54) - file loading
- `saveNote()` function (line 57-63) - file persistence
- Search filter logic (line 73-78) - note filtering
- Link resolution (line 91) - finding notes by name

**No Integration Tests For:**
- File System Access workflow (permission → list → open → save → reload)
- Markdown parsing with edge cases (code blocks, special characters, images)
- Preview toggle state management
- Search with partial matches and case-insensitivity
- Link navigation with missing note names

**No Error Scenario Tests For:**
- CDN unavailable (marked.js fails to load)
- File System Access API unsupported (Firefox, Safari)
- Permission denied by user
- File read/write errors
- Corrupted or invalid markdown content

## Test Implementation Strategy (For Future Development)

### Recommended Test Framework Choice

**Option 1: HTML Test Harness (Simplest)**
- No npm/build tools required
- Write tests in vanilla JavaScript inside HTML file
- Use simple assertion library (custom or lightweight)
- Run tests by opening HTML in browser
- Display results on page with visual pass/fail indicators

**Example test file structure (tests/test-preview.html):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Preview Rendering Tests</title>
</head>
<body>
  <h1>Markdown Preview Tests</h1>
  <button onclick="runAllTests()">Run All Tests</button>
  <div id="results"></div>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script>
    function runAllTests() {
      const results = [];

      // Test 1: Plain text rendering
      results.push(testPlainText());

      // Test 2: Link parsing [[note]]
      results.push(testLinkParsing());

      // Test 3: Markdown formatting
      results.push(testMarkdownFormatting());

      // Display results
      displayResults(results);
    }

    function testPlainText() {
      const input = 'Hello world';
      const output = marked.parse(input);
      const pass = output.includes('Hello world');
      return { name: 'Plain text rendering', pass };
    }

    function testLinkParsing() {
      const input = 'Check [[note-name]]';
      const output = marked.parse(input.replace(/\[\[(.+?)\]\]/g,
        (match, p1) => `<a data-note="${p1}">[[${p1}]]</a>`));
      const pass = output.includes('data-note=');
      return { name: 'Link parsing', pass };
    }

    function displayResults(results) {
      let html = '<h2>Results</h2>';
      let passed = 0;
      results.forEach(r => {
        passed += r.pass ? 1 : 0;
        html += `<div style="color: ${r.pass ? 'green' : 'red'}">
          ${r.pass ? '✓' : '✗'} ${r.name}
        </div>`;
      });
      html += `<p>Passed: ${passed}/${results.length}</p>`;
      document.getElementById('results').innerHTML = html;
    }
  </script>
</body>
</html>
```

**Option 2: Jest with Node.js (More Robust)**
- Requires npm setup and build tools
- Full test runner with coverage reporting
- Can test Node.js utilities if server-side code added
- Setup:
  ```bash
  npm install --save-dev jest
  npx jest --init
  npm test
  ```

### Test Coverage Goals

**High Priority (Core Functionality):**
- `renderPreview()`: Markdown rendering, link parsing, preview toggle
- `listNotes()`: Directory iteration, .md file filtering, DOM element creation
- `openNote()`: File read, state updates, preview display
- `saveNote()`: File write, error handling
- Search filter: Case-insensitive matching, visibility toggle

**Medium Priority (User Experience):**
- Event handler logic: Double-click toggle, link click navigation
- Error messages: Display for missing notes, unsupported browsers
- State management: currentNote, currentHandle, notes array

**Low Priority (Edge Cases):**
- Large note counts (1000+)
- Corrupted file content
- Special characters in note names
- Very long markdown documents

## Testing Best Practices for This Codebase

**Pattern: Setup DOM Elements**
```javascript
// Before each test, create minimal DOM structure
function setupTestDOM() {
  document.body.innerHTML = `
    <div id="notes-list"></div>
    <input type="text" id="note-title">
    <textarea id="note-content"></textarea>
    <div id="preview"></div>
    <input type="text" id="search">
  `;
  // Reset global references
  notesList = document.getElementById('notes-list');
  noteTitle = document.getElementById('note-title');
  noteContent = document.getElementById('note-content');
  preview = document.getElementById('preview');
  searchInput = document.getElementById('search');
}
```

**Pattern: Mock File System Access**
```javascript
// Create mock file handles for testing
function createMockFileHandle(name, content) {
  return {
    name: name,
    getFile: async () => ({
      text: async () => content
    }),
    createWritable: async () => ({
      write: async (data) => {},
      close: async () => {}
    })
  };
}
```

**Pattern: Test Async Functions**
```javascript
// Use async test wrapper
async function testOpenNote() {
  const mockFile = createMockFileHandle('test.md', '# Test\nContent');
  await openNote(mockFile);

  // Assert state updated
  assert(currentNote === mockFile);
  assert(noteContent.value === '# Test\nContent');
  assert(preview.style.display !== 'none');
}
```

**Pattern: Test DOM Manipulation**
```javascript
function testSearchFilter() {
  setupTestDOM();

  // Add test items
  notes = [
    { name: 'alpha.md' },
    { name: 'beta.md' },
    { name: 'gamma.md' }
  ];

  // Simulate listNotes() DOM creation
  notes.forEach(note => {
    const item = document.createElement('div');
    item.textContent = note.name.replace('.md', '');
    item.className = 'note-item';
    notesList.appendChild(item);
  });

  // Trigger search
  searchInput.value = 'al';
  searchInput.oninput();

  // Assert filtering
  const visible = Array.from(notesList.children)
    .filter(el => el.style.display !== 'none');
  assert(visible.length === 1);
  assert(visible[0].textContent === 'alpha');
}
```

## What Should NOT Be Mocked

**Real implementations to test:**
- `marked.parse()` for markdown rendering (use actual marked.js library)
- String manipulation logic (replace, split, includes)
- Array methods (find, map, filter)
- DOM manipulation (createElement, appendChild, innerHTML)
- Event handler logic and state transitions

**Acceptable mocks:**
- File System Access API (expensive, requires user interaction)
- Document.getElementById() if elements don't exist (optional)
- Window.alert() if testing error messages (use sinon or custom spy)

## Browser Testing

**Browsers to Test:**
- Chrome/Chromium (primary target, File System Access supported)
- Edge (supported, same engine as Chrome)
- Firefox (File System Access NOT supported - test fallback)
- Safari (File System Access NOT supported - test fallback)
- Mobile Chrome (touch support for note list)

**Manual Browser Test Checklist:**
- [ ] File System Access popup appears and works in Chrome/Edge
- [ ] Error message shown in Firefox/Safari
- [ ] Notes list scrolls if >10 items
- [ ] Search filters in real-time
- [ ] Double-click toggles preview/editor
- [ ] Links navigate to correct note
- [ ] Preview renders markdown formatting (bold, italic, code blocks)
- [ ] Save button persists content to file
- [ ] No JavaScript errors in console

## Debugging Tests

**Console Testing (For Manual Tests):**
```javascript
// Open browser DevTools (F12)
// Console tab
console.log('notes array:', notes);
console.log('currentNote:', currentNote);
console.log('preview HTML:', preview.innerHTML);

// Test functions directly
openFolder();  // Trigger folder picker
listNotes();   // Trigger note listing
renderPreview();  // Trigger preview render
```

**Visual Testing:**
- Note items appear in list sidebar
- Preview box renders HTML with proper styling
- Search hides/shows items as you type
- Double-click preview shows textarea

## Performance Testing (Manual)

**Test with Large Note Counts:**
```javascript
// Open DevTools Performance tab
// Run this in console:
for (let i = 0; i < 1000; i++) {
  const item = document.createElement('div');
  item.textContent = `Note ${i}`;
  item.className = 'note-item';
  notesList.appendChild(item);
}

// Measure search performance:
performance.mark('search-start');
searchInput.value = 'Note 5';
searchInput.oninput();
performance.mark('search-end');
performance.measure('search', 'search-start', 'search-end');
console.log(performance.getEntriesByName('search')[0].duration + 'ms');
```

**Baseline Expectations:**
- 1000 notes: list renders in <500ms
- Search with 1000 notes: filter completes in <100ms
- Preview render: <50ms for typical markdown

---

*Testing analysis: 2026-01-23*
