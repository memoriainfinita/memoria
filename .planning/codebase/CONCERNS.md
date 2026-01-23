# Codebase Concerns

**Analysis Date:** 2026-01-23

## Tech Debt

**Duplicate Event Handler Code:**
- Issue: The `preview.ondblclick` event handler is defined twice (lines 98-112 and 115-136 in `app.js`)
- Files: `app.js` (lines 98-136)
- Impact: Only the second handler executes; the first definition is completely overwritten. This creates confusion about intended behavior and wastes code.
- Fix approach: Remove lines 98-112 (the first definition). Consolidate logic into single handler starting at line 115.

**Incomplete Feature Implementation:**
- Issue: Title editing is non-functional. The `noteTitle.oninput` handler (lines 68-70) has a comment stating "Renombrar archivo (no soportado nativamente por File System Access API)" but no actual implementation.
- Files: `app.js` (lines 68-70)
- Impact: Users cannot rename notes through the title field. Title changes are ignored, causing confusion about whether edits persist.
- Fix approach: Either (1) implement file rename using File System Access API's `move()` method, or (2) remove the title input field and display filename instead, or (3) add visual feedback that title field is read-only.

**External Dependency Without Fallback:**
- Issue: Markdown parsing relies on `marked.js` from CDN (line 24 in `index.html`) with no offline fallback or error handling.
- Files: `index.html` (line 24), `app.js` (line 85)
- Impact: If CDN is unavailable, `marked.parse()` will fail silently (undefined function), breaking preview rendering with no user feedback.
- Fix approach: Add error handling for CDN failure, include fallback markdown parser, or bundle marked.js locally.

## Known Bugs

**Preview Display Logic Error:**
- Symptoms: Preview is hidden by default (`noteContent.style.display = 'none'` on line 52), but the UI shows a preview box that appears empty or not interactive until double-clicked.
- Files: `app.js` (lines 51-52), `index.html` (line 19)
- Trigger: Open any markdown note; the preview appears but is not shown to user until they double-click.
- Workaround: Double-click the preview area to toggle to editor view, then click elsewhere to return to preview. Line 51 sets `preview.style.display = ''` (empty string), which shows the element.
- Actual issue: Logic is inverted—preview should be shown by default for new users; only the textarea should be hidden initially.

**Reference Error on Double-Click:**
- Symptoms: When double-clicking preview, console error occurs: "toggleEditorBtn is not defined" (line 126 in `app.js`).
- Files: `app.js` (line 126)
- Trigger: Double-click anywhere in the preview panel after opening a note.
- Impact: Error prevents cursor positioning and button text update in the double-click handler, though preview toggle itself still works.
- Root cause: Variable `toggleEditorBtn` referenced but never defined in HTML or JavaScript. The comment on line 14 says "Eliminado toggleEditorBtn" (Removed toggleEditorBtn), but code still references it.

**Missing Search Result Count:**
- Symptoms: Search input filters notes but provides no feedback on matching results (e.g., how many notes matched).
- Files: `app.js` (lines 73-78)
- Trigger: Type in search box after opening notes list.
- Impact: Users cannot tell if search found 0 results or if they typed the query wrong.

## Security Considerations

**XSS Vulnerability in Link Injection:**
- Risk: User-provided note names in `[[note-name]]` syntax are injected into `data-note` attribute without escaping (line 83 in `app.js`).
- Files: `app.js` (line 83)
- Current mitigation: `data-note` is read-only and only used for lookup, not executed as code. However, if attribute is exposed in HTML output or debugging tools, special characters could cause issues.
- Recommendations: Use `setAttribute()` or template literals with proper escaping; validate note names to alphanumeric + hyphens/underscores only.

**Unsafe innerHTML with User Content:**
- Risk: `marked.parse(md)` output is set directly to `preview.innerHTML` (line 85 in `app.js`) without sanitization.
- Files: `app.js` (line 85)
- Current mitigation: Markdown parser (marked.js) defaults to escaping HTML, but configuration is unknown; custom HTML in markdown could inject scripts.
- Recommendations: Use `marked` security option (`breaks: true, gfm: true`); sanitize output with DOMPurify; use `textContent` for plaintext rendering only.

**File System Access Permissions Not Validated:**
- Risk: App assumes `showDirectoryPicker()` permission is granted without fallback or retry handling.
- Files: `app.js` (lines 17-24)
- Current mitigation: Browser will prompt user for permission, but app provides only one error message ("Tu navegador no soporta..."), not distinguishing between unsupported browser and denied permission.
- Recommendations: Add explicit permission check; provide user-friendly error messages for denied permission vs. unsupported feature.

## Performance Bottlenecks

**Inefficient Search Implementation:**
- Problem: Search filter iterates through DOM elements on every keystroke (line 73-78 in `app.js`), re-rendering visibility for all items even if only one character changed.
- Files: `app.js` (lines 73-78)
- Cause: No debouncing, no caching of filtered results, loop runs on `oninput` (fires before input settles).
- Improvement path: Add debounce (200-300ms); cache visible items; use `filter()` on `notes` array instead of DOM.
- Impact: With 1000+ notes, search becomes noticeably sluggish.

**No Memoization for Note List Lookup:**
- Problem: `analyzeAllInterpretations()` function (if implemented) or link lookup searches entire `notes` array every time (line 91 in `app.js`), using `.find()` with string comparison.
- Files: `app.js` (line 91)
- Cause: No indexing or Map-based lookup structure.
- Improvement path: Build `noteMap = Map(notes.map(n => [n.name.replace('.md', ''), n]))` on `listNotes()`; use `noteMap.get(name)` for O(1) lookup instead of O(n).
- Impact: With 100+ notes, link navigation becomes sluggish.

**Repeated DOM Queries:**
- Problem: `document.getElementById()` calls on lines 8-12 are executed at module load, but if page structure changes or elements are added dynamically, stale references could cause issues. No caching of frequently-accessed elements.
- Files: `app.js` (lines 8-12)
- Improvement path: Cache references once; use event delegation for dynamic elements; store in object for clarity.

## Fragile Areas

**Double-Defined Event Handler:**
- Files: `app.js` (lines 98-136)
- Why fragile: Second definition overwrites first; developer cannot tell which version is "correct" without testing. Maintenance nightmare—any fix to line 98-112 will have no effect.
- Safe modification: Delete the duplicate (lines 98-112). Keep only the second definition (lines 115-136). Test double-click behavior before committing.
- Test coverage: No automated tests for preview toggle behavior; relies on manual testing.

**Markdown Rendering Without Error Boundary:**
- Files: `app.js` (line 85)
- Why fragile: If `marked.parse()` throws or is undefined (CDN down), entire note preview breaks with no fallback.
- Safe modification: Wrap in try-catch; provide plaintext fallback; validate `marked` is loaded before calling.
- Test coverage: No tests for CDN failure scenarios.

**File Title Input with Dead Code:**
- Files: `app.js` (lines 68-70)
- Why fragile: Input field exists but does nothing; users will try to rename and be confused. Future maintenance might attempt to implement rename without seeing the comment explaining why it doesn't exist.
- Safe modification: Either implement rename feature properly or remove the input field entirely. Add clear comment if intentionally disabled.
- Test coverage: No tests for title input behavior.

## Scaling Limits

**Note List DOM Rendering:**
- Current capacity: ~1000 notes render smoothly
- Limit: Beyond 5000+ notes, DOM creation in `listNotes()` becomes slow (lines 32-42 in `app.js`); all elements created and inserted individually.
- Scaling path: Implement virtual scrolling; render only visible items; use pagination; batch DOM inserts using `DocumentFragment`.

**Search Performance:**
- Current capacity: ~500 notes filter in <100ms
- Limit: 5000+ notes cause noticeable lag in search (filter loop runs on every keystroke).
- Scaling path: Implement server-side search (if moved to backend); add debouncing; use Web Workers for filtering on large lists.

## Dependencies at Risk

**marked.js from CDN (jsdelivr):**
- Risk: CDN availability not guaranteed; no versioning in URL (always fetches latest), could introduce breaking changes.
- Impact: App becomes non-functional if CDN is down or marked.js API changes in major version.
- Migration plan: Bundle marked.js locally; use specific version number (`@version` in CDN URL); add fallback CDN (unpkg or cdnjs).

**File System Access API Browser Support:**
- Risk: `showDirectoryPicker()` not supported in Firefox, Safari, or older Chrome versions.
- Impact: ~30% of users cannot use app in unsupported browsers; only single error message provided.
- Migration plan: Detect browser; provide clear messaging; add fallback using `<input type="file">` for limited functionality in unsupported browsers.

## Missing Critical Features

**No Undo/Redo:**
- Problem: Users cannot undo edits to markdown content. Accidental changes are permanent unless manually reverted.
- Blocks: Data loss scenarios; no recovery from mistaken deletions.
- Recommendation: Implement undo stack in memory; consider periodic auto-save backups.

**No Auto-Save:**
- Problem: Users must manually click "Guardar" (Save) button. Closing browser tab without saving loses all changes.
- Blocks: Productivity workflow; data loss risk.
- Recommendation: Implement auto-save with debounce (save after 5 seconds of inactivity); show unsaved indicator.

**No File Deletion:**
- Problem: No delete button; users must use file explorer to delete notes.
- Blocks: Full note management workflow; clutters workspace with unwanted notes.
- Recommendation: Add delete button with confirmation dialog.

**No Renaming Support:**
- Problem: Title input field (line 18 in `index.html`) exists but does not rename files (see Tech Debt section).
- Blocks: Organizing notes; correcting misspelled filenames.
- Recommendation: Implement rename using File System Access API `move()` method or create-copy-delete pattern.

**No Multi-Note Editing:**
- Problem: Can only view one note at a time; cannot compare or edit multiple notes simultaneously.
- Blocks: Cross-referencing between notes; viewing linked content.
- Recommendation: Add split-pane view or tab interface.

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: `renderPreview()`, search filter logic, link navigation, note list rendering, file I/O operations
- Files: `app.js` (entire file lacks test coverage)
- Risk: Bugs in core functionality (link resolution, preview rendering) go unnoticed until user reports them
- Priority: **High** — these are critical paths used on every note interaction

**No Integration Tests:**
- What's not tested: File system operations (open, save, list), CDN dependency, preview with markdown edge cases
- Files: `app.js` (file I/O operations, lines 17-63)
- Risk: File saving could fail silently; corrupt note content; lose unsaved changes
- Priority: **High** — data loss is critical

**No Browser Compatibility Tests:**
- What's not tested: Preview rendering in Firefox/Safari, File System Access fallback behavior, mobile responsiveness
- Files: `index.html`, `style.css`, `app.js` (entire app)
- Risk: Feature silently fails in unsupported browsers without user feedback
- Priority: **Medium** — affects user experience across browsers

**No Error Scenario Tests:**
- What's not tested: CDN failure, permission denied, corrupted markdown, file system errors, invalid note names
- Files: `app.js` (error handling throughout)
- Risk: App crashes or behaves unpredictably in error conditions
- Priority: **Medium** — improves robustness

---

*Concerns audit: 2026-01-23*
