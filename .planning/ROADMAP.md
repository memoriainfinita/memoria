# Roadmap: Memoria

**Target:** MVP v1 con gestión de archivos, editor, búsqueda, y links simples.

**Timeline:** Quick delivery (4 phases, ~2-3 sprints)

---

## Phase 1: Foundation - File System & Tree Navigation

**Goal:** User can select a local folder and see all files/folders in an expandable tree, with basic file operations.

**Requirements Covered:**
- FILE-01, FILE-02, FILE-03, FILE-05, FILE-06, FILE-07, FILE-10
- UI-01, UI-02

**Tasks:**
1. Implement File System Access API integration (folder selection)
2. Build recursive tree data structure from folder contents
3. Create tree UI component (expandable/collapsable folders)
4. Implement "Create new file" functionality
5. Implement "Delete file" with confirmation dialog
6. Implement "Create new folder" functionality
7. Implement drag-drop for files/folders with confirmation
8. Add dark theme CSS foundation (ui-tokens: colors, spacing)

**Success Criteria:**
- User can select any local folder and see complete file/folder tree
- Tree renders correctly for nested structures (tested to 5+ levels)
- Create/delete/drag-drop work without data loss
- No console errors; graceful error handling for permission denied
- Tree UI is responsive (mobile: collapses sidebar)

**Definition of Done:**
- All FILE-XX and UI-01,02 requirements checkable
- Code reviewed
- Manual testing in Chrome + Firefox
- Performance: Tree renders <100ms for 500 files

---

## Phase 2: Editor Core - Markdown Editing & Multi-Tab

**Goal:** User can open files in editor, write/preview Markdown, and have multiple files open in tabs simultaneously.

**Requirements Covered:**
- EDIT-01 to EDIT-08
- FILE-04, FILE-08, FILE-09
- UI-03, UI-04

**Tasks:**
1. Create editor pane layout (right side of tree)
2. Implement Markdown editor (plain-text, syntax highlighting)
3. Implement live preview pane (HTML rendering of Markdown)
4. Create tab system (header with file tabs, close buttons, unsaved indicator)
5. Implement "Switch between Edit/Preview" views
6. Implement save functionality (FILE-08): write changes back to disk
7. Implement unsaved changes detection and "Save changes?" dialog
8. Add auto-save feature with configurable interval (localStorage for setting)
9. Implement Markdown syntax highlighting (basic CSS classes + highlighting)
10. Make responsive: on mobile, hide tree, show file list header

**Success Criteria:**
- User can open file, edit Markdown, and see preview update in real-time
- Multi-tab works: open 3+ files, switch between them, edits persist
- Auto-save saves changes to disk without user action
- Unsaved changes marked with * in tab
- Preview renders all Markdown features correctly (headers, lists, code blocks, etc)
- Keyboard shortcut Ctrl+S works for save
- No data loss on tab switching or close

**Definition of Done:**
- All EDIT-XX and save-related FILE-XX requirements checkable
- Editor handles large files (100KB+) without lag
- Syntax highlighting doesn't break code readability
- Manual testing: open 5 files, edit simultaneously, verify save order

---

## Phase 3: Search & Links - Finding & Connecting Notes

**Goal:** User can search for notes and create/navigate between them using `[[wiki-links]]` syntax.

**Requirements Covered:**
- SEARCH-01 to SEARCH-06
- LINK-01 to LINK-06
- FILE-XX (already done)

**Tasks:**
1. Implement full-text search indexing (build index from all .md files)
2. Create search input field (in UI header or left panel)
3. Implement real-time search filtering (as user types)
4. Show search results with file preview snippet
5. Click result opens file in tab
6. Implement `[[wiki-link]]` regex parsing in preview
7. Render links as clickable HTML anchors in preview
8. Implement link click handler: open referenced file in new tab
9. Implement "Link broken" detection: show warning if referenced file doesn't exist
10. Implement backlinks feature: scan all files for incoming links, display in preview
11. Make backlinks clickable (navigate to referencing file)
12. Add keyboard shortcut for search (Ctrl+F or Cmd+F)

**Success Criteria:**
- Search finds files by name AND content within <100ms
- Search is case-insensitive
- Search results show relevant snippets
- Links in preview are blue/underlined and clickable
- Clicking link opens file in new tab
- Broken links show visual indicator
- Backlinks list displays all referencing notes
- No broken links create errors; show graceful "File not found" message
- Search works with 1000+ files

**Definition of Done:**
- All SEARCH-XX and LINK-XX requirements checkable
- Backlinks accurate (test: create reciprocal links, verify both directions)
- Performance: search index updates <500ms when file saved
- Manual testing: complex note networks (circular refs, deep chains)

---

## Phase 4: Polish & Performance - UI Refinement & Responsive

**Goal:** Complete MVP with polished UI, responsive design, and performance optimization. Deliver complete working application.

**Requirements Covered:**
- UI-05, UI-06, UI-07 (settings, keyboard shortcuts, tooltips)
- PERF-01 to PERF-04
- All remaining FILE/EDIT/SEARCH requirements

**Tasks:**
1. Add keyboard shortcuts reference/help (? key)
2. Implement Settings panel: auto-save toggle + interval selector
3. Improve responsive design: mobile layout with hamburger menu
4. Add tooltips to action buttons (hover shows description)
5. Optimize search performance: memoize index, lazy load file contents
6. Implement file change detection: notify user if external editor modifies file
7. Add "Reload file?" dialog if file changed externally
8. Optimize tree rendering: virtualization for large trees
9. Add loading indicators: "Loading vault..." progress
10. Test across browsers: Chrome, Firefox, Safari, Edge
11. Implement error boundaries: graceful handling of edge cases
12. Add visual feedback: animations for state changes (subtle)
13. Document keyboard shortcuts in app (Settings panel)
14. Performance profiling and optimization
15. Final UI polish: spacing, colors, typography alignment

**Success Criteria:**
- App is fully responsive (tested on iPhone, iPad, desktop)
- Settings persist across sessions (localStorage)
- Keyboard shortcuts work consistently
- All tooltips appear without typos
- External file changes detected and handled
- No console warnings or errors
- Performance metrics: tree render <100ms, search <100ms, preview render <200ms
- Tested on minimum 4 browsers
- User can work through complete workflow: select folder → open file → edit → search → navigate links → save

**Definition of Done:**
- All 40 requirements checked and verified
- Code is production-ready (no debug logs, clean)
- Browser compatibility verified
- Responsive design tested on 3+ devices
- Performance benchmarks met
- Ready for user testing / beta release

---

## Summary

| Phase | Goal | Requirements | Status |
|-------|------|--------------|--------|
| 1 | Foundation: Files & Tree | 10 req | Pending |
| 2 | Editor: Markdown & Tabs | 12 req | Pending |
| 3 | Search & Links | 12 req | Pending |
| 4 | Polish & Performance | 6 req | Pending |

**Total Requirements Mapped:** 40/40 ✓

**MVP Scope:** All 4 phases = complete v1 with all table-stakes features

**Not in MVP (v2+):** Graphs, advanced tagging, collaboration, cloud sync, AI features, plugins

---

*Roadmap created: 2026-01-23*
*Last updated: 2026-01-23 after initial planning*
