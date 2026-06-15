# Native Media Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Previsualizar archivos multimedia (imagen, audio, vídeo, PDF) en modo solo-lectura dentro de la app Memoria.

**Architecture:** Se sustituye el flag binario `supported` por una clasificación de tres tipos (`text` | `media` | `binary`). Los archivos `media` abren como pestañas de tipo `media` que muestran un elemento HTML nativo (`<img>`/`<audio>`/`<video>`/`<iframe>`) alimentado por un object URL, en lugar del editor de texto. El modelo de pestañas gana un discriminador `tab.type` que ramifica las funciones que asumían texto editable.

**Tech Stack:** Vanilla JS (ES6 modules), File System Access API, sin frameworks ni test runner. Verificación manual en navegador Chromium vía `python -m http.server`.

---

## Verificación: preparación

No hay test runner. Cada tarea se verifica manualmente en el navegador.

**Antes de empezar**, prepara una carpeta de prueba (p.ej. `~/memoria-media-test/`) con al menos:
- una imagen: `foto.png` (o `.jpg`)
- un audio: `son.mp3`
- un vídeo: `clip.mp4`
- un PDF: `doc.pdf`
- un binario no soportado: `archivo.zip`
- una nota: `nota.md`

**Servidor de desarrollo** (requerido — los módulos ES6 no cargan en `file://`):

```bash
cd "C:/Users/mykl/OneDrive/Scriptorium/DOCS/CODING GIT/MEMORIA markdown"
python -m http.server 8080
```

Abrir `http://localhost:8080`, pulsar "Abrir carpeta", elegir la carpeta de prueba. Tras cada tarea, recargar la página (Ctrl+R) antes de verificar.

---

## Estructura de archivos

- `modules/fileSystem.js` — clasificación `fileType()`, `mediaKind()`, lectura binaria `readBlob()`, índice solo-texto.
- `modules/tree.js` — render del árbol según `type` (binary = no soportado; text/media = abribles).
- `app.js` — `tab.type`, apertura ramificada, visor de media, guards, disposal de object URLs, copia binaria-segura.
- `modules/editor.js` — `showEditor`/`showPreview` restauran la visibilidad del botón de alternar.
- `style.css` — clase `.media-view` y elementos media.

---

## Task 1: Clasificación de archivos en tres tipos

Reemplaza el flag `supported` (booleano) por `type` (`text` | `media` | `binary`) y actualiza a todos sus consumidores en la misma tarea para no romper el árbol.

**Files:**
- Modify: `modules/fileSystem.js`
- Modify: `modules/tree.js`

- [ ] **Step 1: Añadir detección de media y `fileType` en `fileSystem.js`**

Insertar después de la función `isTextFile` (tras la línea 12), antes de `buildTree`:

```js
const MEDIA_EXT = {
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', webp: 'image',
  svg: 'image', bmp: 'image', ico: 'image', avif: 'image',
  mp3: 'audio', wav: 'audio', ogg: 'audio', oga: 'audio', flac: 'audio',
  m4a: 'audio', aac: 'audio',
  mp4: 'video', webm: 'video', mov: 'video', mkv: 'video', m4v: 'video',
  pdf: 'pdf',
};

export function mediaKind(name) {
  const ext = name.split('.').pop().toLowerCase();
  return MEDIA_EXT[ext] || null;
}

export function fileType(name) {
  if (isTextFile(name)) return 'text';
  if (mediaKind(name)) return 'media';
  return 'binary';
}
```

- [ ] **Step 2: Usar `type` en `_walk`**

En `modules/fileSystem.js`, reemplazar la línea que crea el nodo de archivo (línea 24):

```js
node.children.push({ name, kind: 'file', handle: child, supported: isTextFile(name) });
```

por:

```js
node.children.push({ name, kind: 'file', handle: child, type: fileType(name) });
```

- [ ] **Step 3: Indexar solo archivos de texto**

En `modules/fileSystem.js`, dentro de `_indexNode`, reemplazar (línea 68):

```js
    if (node.supported === false) return;
```

por:

```js
    if (node.type !== 'text') return;
```

- [ ] **Step 4: Añadir `readBlob` para lectura binaria**

En `modules/fileSystem.js`, insertar tras la función `readFile` (tras la línea 36):

```js
export async function readBlob(handle) {
  return handle.getFile();
}
```

- [ ] **Step 5: Actualizar `tree.js` para distinguir `binary`**

En `modules/tree.js`, reemplazar la línea 54:

```js
    const unsupported = node.supported === false;
```

por:

```js
    const unsupported = node.type === 'binary';
```

Y en `_fileMenu`, reemplazar la línea 83:

```js
  const items = node.supported === false
```

por:

```js
  const items = node.type === 'binary'
```

- [ ] **Step 6: Verificación manual**

Recargar `http://localhost:8080` con la carpeta de prueba abierta. Comprobar en el árbol:
- `nota`, `foto.png`, `son.mp3`, `clip.mp4`, `doc.pdf` se ven con color normal (no atenuados).
- `archivo.zip` se ve atenuado y en itálica; al clicarlo avisa "Tipo de archivo no soportado".
- Click derecho en `foto.png` muestra menú con "Duplicar" y "Eliminar".
- Click derecho en `archivo.zip` muestra solo "Eliminar".
- Click en `foto.png` aún muestra texto ilegible en el panel (se arregla en Task 2) — esto es esperado, no debe dar error en consola más allá del render.

- [ ] **Step 7: Commit**

```bash
git add modules/fileSystem.js modules/tree.js
git commit -m "refactor: classify files as text/media/binary"
```

---

## Task 2: Pestañas y visor multimedia

Introduce `tab.type`, abre archivos media como pestañas media, renderiza el elemento HTML correspondiente, gestiona la visibilidad editor/visor y protege con guards las funciones que asumen texto.

**Files:**
- Modify: `app.js`
- Modify: `modules/editor.js`
- Modify: `style.css`

- [ ] **Step 1: Importar las nuevas funciones de `fileSystem.js`**

En `app.js`, reemplazar la línea 1:

```js
import { selectFolder, buildTree, readFile, writeFile, createFile, deleteEntry, createDir, buildIndex, findHandleInTree, findDirHandleForFile } from './modules/fileSystem.js';
```

por:

```js
import { selectFolder, buildTree, readFile, writeFile, createFile, deleteEntry, createDir, buildIndex, findHandleInTree, findDirHandleForFile, mediaKind, readBlob, fileType } from './modules/fileSystem.js';
```

- [ ] **Step 2: Ramificar `_openFile` para crear pestañas media**

En `app.js`, reemplazar la función `_openFile` completa (líneas 192-201):

```js
async function _openFile(handle, name) {
  const existing = state.tabs.findIndex(t => t.handle === handle);
  if (existing >= 0) { _switchTab(existing); return; }
  const file = await handle.getFile();
  state.lastModified[name] = file.lastModified;
  const content = await file.text();
  const isMd = /\.md$/.test(handle.name);
  state.tabs.push({ handle, name, content, dirty: false, isMd });
  _switchTab(state.tabs.length - 1);
}
```

por:

```js
async function _openFile(handle, name) {
  const existing = state.tabs.findIndex(t => t.handle === handle);
  if (existing >= 0) { _switchTab(existing); return; }
  const file = await handle.getFile();
  const kind = mediaKind(handle.name);
  if (kind) {
    const url = URL.createObjectURL(file);
    state.tabs.push({ handle, name, type: 'media', content: { url, kind }, dirty: false });
  } else {
    state.lastModified[name] = file.lastModified;
    const content = await file.text();
    const isMd = /\.md$/.test(handle.name);
    state.tabs.push({ handle, name, type: 'text', content, dirty: false, isMd });
  }
  _switchTab(state.tabs.length - 1);
}
```

- [ ] **Step 3: Añadir helpers de visibilidad y render de media**

En `app.js`, insertar estas funciones justo antes de `_renderCurrentNote` (antes de la línea 359, `// --- Render current note ---`):

```js
// --- Media view ---
function _showMediaView() {
  noteContent.hidden = true;
  toggleBtn.style.display = 'none';
  previewEl.style.display = '';
}

function _renderMedia(tab) {
  const { url, kind } = tab.content;
  let el;
  if (kind === 'image') {
    el = document.createElement('img');
    el.src = url;
  } else if (kind === 'audio') {
    el = document.createElement('audio');
    el.controls = true;
    el.src = url;
  } else if (kind === 'video') {
    el = document.createElement('video');
    el.controls = true;
    el.src = url;
  } else {
    el = document.createElement('iframe');
    el.src = url;
  }
  el.className = 'media-el media-' + kind;
  const wrap = document.createElement('div');
  wrap.className = 'media-view';
  wrap.appendChild(el);
  previewEl.innerHTML = '';
  previewEl.appendChild(wrap);
}
```

- [ ] **Step 4: Ramificar `_switchTab`**

En `app.js`, reemplazar la función `_switchTab` completa (líneas 210-220):

```js
function _switchTab(idx) {
  if (state.activeTab >= 0 && state.tabs[state.activeTab]) {
    state.tabs[state.activeTab].content = getContent();
  }
  state.activeTab = idx;
  const tab = state.tabs[idx];
  openInEditor(tab.content);
  setActiveFile(treeEl, tab.name);
  _renderCurrentNote();
  _renderTabs();
}
```

por:

```js
function _switchTab(idx) {
  const prev = state.activeTab >= 0 ? state.tabs[state.activeTab] : null;
  if (prev && prev.type !== 'media') {
    prev.content = getContent();
  }
  state.activeTab = idx;
  const tab = state.tabs[idx];
  if (tab.type === 'media') {
    _showMediaView();
  } else {
    openInEditor(tab.content);
  }
  setActiveFile(treeEl, tab.name);
  _renderCurrentNote();
  _renderTabs();
}
```

`openInEditor` llama a `showPreview`, que en el Step 10 restaura la visibilidad del botón de alternar; por eso la rama de texto no necesita un helper aparte.

- [ ] **Step 5: Guard en `_renderCurrentNote`**

En `app.js`, reemplazar la función `_renderCurrentNote` completa (líneas 360-370):

```js
function _renderCurrentNote() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  _renderPreview(tab.content);
  if (tab.isMd) {
    const refs = findBacklinks(tab.name, state.searchIndex);
    renderBacklinks(refs, backlinksEl, _openFileByName);
  } else {
    backlinksEl.innerHTML = '';
  }
}
```

por:

```js
function _renderCurrentNote() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (tab.type === 'media') {
    _renderMedia(tab);
    backlinksEl.innerHTML = '';
    return;
  }
  _renderPreview(tab.content);
  if (tab.isMd) {
    const refs = findBacklinks(tab.name, state.searchIndex);
    renderBacklinks(refs, backlinksEl, _openFileByName);
  } else {
    backlinksEl.innerHTML = '';
  }
}
```

- [ ] **Step 6: Guard en `_save`**

En `app.js`, reemplazar el inicio de `_save` (líneas 373-376):

```js
async function _save() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  tab.content = getContent();
```

por:

```js
async function _save() {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (tab.type === 'media') return;
  tab.content = getContent();
```

- [ ] **Step 7: Guard en el `oninput` del editor**

En `app.js`, reemplazar el handler `noteContent.oninput` (líneas 386-391):

```js
noteContent.oninput = () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (!tab.dirty) { tab.dirty = true; _renderTabs(); }
  _renderPreview(getContent());
};
```

por:

```js
noteContent.oninput = () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (tab.type === 'media') return;
  if (!tab.dirty) { tab.dirty = true; _renderTabs(); }
  _renderPreview(getContent());
};
```

- [ ] **Step 8: Guard en `_updateSaveBtn`**

En `app.js`, reemplazar la función `_updateSaveBtn` (líneas 272-276):

```js
function _updateSaveBtn() {
  const tab = state.activeTab >= 0 ? state.tabs[state.activeTab] : null;
  saveBtn.disabled = !tab;
  saveBtn.classList.toggle('dirty', !!(tab && tab.dirty));
}
```

por:

```js
function _updateSaveBtn() {
  const tab = state.activeTab >= 0 ? state.tabs[state.activeTab] : null;
  saveBtn.disabled = !tab || tab.type === 'media';
  saveBtn.classList.toggle('dirty', !!(tab && tab.dirty));
}
```

- [ ] **Step 9: Guard en la detección de cambio externo**

En `app.js`, reemplazar el inicio del handler `window.addEventListener('focus', ...)` (líneas 664-667):

```js
window.addEventListener('focus', async () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  try {
```

por:

```js
window.addEventListener('focus', async () => {
  if (state.activeTab < 0) return;
  const tab = state.tabs[state.activeTab];
  if (tab.type === 'media') return;
  try {
```

- [ ] **Step 10: Restaurar la visibilidad del toggle en `editor.js`**

El botón `toggle-view` se oculta en las pestañas media. Para que cualquier camino de texto (incluido el estado vacío que llama `openInEditor('')`) lo recupere sin tocar varios sitios, `showEditor` y `showPreview` restauran su `display`.

En `modules/editor.js`, reemplazar las funciones `showEditor` y `showPreview` (líneas 14-25):

```js
export function showEditor() {
  textarea.hidden = false;
  preview.style.display = 'none';
  toggleBtn.textContent = 'Vista previa';
  textarea.focus();
}

export function showPreview() {
  textarea.hidden = true;
  preview.style.display = '';
  toggleBtn.textContent = 'Editar';
}
```

por:

```js
export function showEditor() {
  textarea.hidden = false;
  preview.style.display = 'none';
  toggleBtn.style.display = '';
  toggleBtn.textContent = 'Vista previa';
  textarea.focus();
}

export function showPreview() {
  textarea.hidden = true;
  preview.style.display = '';
  toggleBtn.style.display = '';
  toggleBtn.textContent = 'Editar';
}
```

- [ ] **Step 11: Proteger el botón de alternar contra pestañas media**

La keybinding Ctrl+E (app.js) hace `toggleBtn.click()` aunque el botón esté oculto. Sin guard, en una pestaña media mostraría el editor de texto vacío y haría desaparecer el media. El guard en `onclick` cubre tanto el botón como la keybinding.

En `app.js`, reemplazar el handler `toggleBtn.onclick` (líneas 394-396):

```js
toggleBtn.onclick = () => {
  if (noteContent.hidden) showEditor(); else showPreview();
};
```

por:

```js
toggleBtn.onclick = () => {
  if (state.activeTab >= 0 && state.tabs[state.activeTab].type === 'media') return;
  if (noteContent.hidden) showEditor(); else showPreview();
};
```

- [ ] **Step 12: Añadir estilos del visor en `style.css`**

En `style.css`, añadir al final del archivo:

```css
/* --- Media view --- */
.media-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
.media-view .media-el { max-width: 100%; max-height: 100%; }
.media-view img.media-image,
.media-view video.media-video { object-fit: contain; }
.media-view audio.media-audio { width: 80%; }
.media-view iframe.media-pdf { width: 100%; height: 100%; border: none; }
```

- [ ] **Step 13: Verificación manual**

Recargar la página con la carpeta de prueba abierta. Comprobar:
- Click en `foto.png` → se muestra la imagen escalada; el botón "Editar/Vista previa" desaparece; "Guardar" queda deshabilitado.
- Click en `son.mp3` → aparece un reproductor de audio funcional.
- Click en `clip.mp4` → aparece un reproductor de vídeo funcional.
- Click en `doc.pdf` → el PDF se muestra en el panel.
- Click en `nota` → vuelve el editor de texto y el botón de alternar; la edición y el preview siguen funcionando.
- Con `foto.png` activa, pulsar Ctrl+E → no pasa nada (la imagen sigue visible, no aparece editor vacío).
- Con `nota` activa, Ctrl+E sigue alternando editor/preview normalmente.
- Alternar entre pestaña media y pestaña de texto varias veces sin que se quede el visor "pegado" ni desaparezca el toggle en texto.
- Consola sin errores.

- [ ] **Step 14: Commit**

```bash
git add app.js modules/editor.js style.css
git commit -m "feat: preview media files (image/audio/video/pdf) in read-only viewer"
```

---

## Task 3: Liberar object URLs al cerrar pestañas

Cada `createObjectURL` reserva memoria hasta `revokeObjectURL`. Esta tarea añade un helper y lo invoca en todos los puntos donde una pestaña media desaparece.

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Añadir el helper `_disposeTab`**

En `app.js`, insertar justo después de `_closeAllTabs` (tras la línea 118):

```js
// --- Dispose tab resources (object URLs) ---
function _disposeTab(tab) {
  if (tab && tab.type === 'media') URL.revokeObjectURL(tab.content.url);
}
```

- [ ] **Step 2: Disponer en `_closeAllTabs`**

En `app.js`, reemplazar la función `_closeAllTabs` (líneas 111-118):

```js
function _closeAllTabs() {
  state.tabs = [];
  state.activeTab = -1;
  openInEditor('');
  previewEl.innerHTML   = '';
  backlinksEl.innerHTML = '';
  _renderTabs();
}
```

por:

```js
function _closeAllTabs() {
  state.tabs.forEach(_disposeTab);
  state.tabs = [];
  state.activeTab = -1;
  openInEditor('');
  previewEl.innerHTML   = '';
  backlinksEl.innerHTML = '';
  _renderTabs();
}
```

- [ ] **Step 3: Disponer en `_requestClose`**

En `app.js`, dentro de `_requestClose`, reemplazar (líneas 278-284):

```js
async function _requestClose(idx) {
  const tab = state.tabs[idx];
  if (tab.dirty && !await showConfirm('Cerrar "' + tab.name + '" sin guardar?')) return;
  if (state.activeTab >= 0 && state.tabs[state.activeTab]) {
    state.tabs[state.activeTab].content = getContent();
  }
  state.tabs.splice(idx, 1);
```

por:

```js
async function _requestClose(idx) {
  const tab = state.tabs[idx];
  if (tab.dirty && !await showConfirm('Cerrar "' + tab.name + '" sin guardar?')) return;
  if (state.activeTab >= 0 && state.tabs[state.activeTab] && state.tabs[state.activeTab].type !== 'media') {
    state.tabs[state.activeTab].content = getContent();
  }
  _disposeTab(tab);
  state.tabs.splice(idx, 1);
```

- [ ] **Step 4: Disponer en `_closeTabsKeeping`**

En `app.js`, dentro de `_closeTabsKeeping`, reemplazar (líneas 249-254):

```js
  if (state.activeTab >= 0 && state.tabs[state.activeTab]) {
    state.tabs[state.activeTab].content = getContent();
  }
  const activeRef = state.activeTab >= 0 ? state.tabs[state.activeTab] : null;
  const focusRef  = state.tabs[focusIdx];
  state.tabs = state.tabs.filter((_, i) => keep.has(i));
```

por:

```js
  if (state.activeTab >= 0 && state.tabs[state.activeTab] && state.tabs[state.activeTab].type !== 'media') {
    state.tabs[state.activeTab].content = getContent();
  }
  toClose.forEach(_disposeTab);
  const activeRef = state.activeTab >= 0 ? state.tabs[state.activeTab] : null;
  const focusRef  = state.tabs[focusIdx];
  state.tabs = state.tabs.filter((_, i) => keep.has(i));
```

- [ ] **Step 5: Disponer en `_deleteFile`**

En `app.js`, dentro de `_deleteFile`, reemplazar (líneas 409-411):

```js
  const idx = state.tabs.findIndex(t => t.name === name.replace('.md', ''));
  if (idx >= 0) {
    state.tabs.splice(idx, 1);
```

por:

```js
  const idx = state.tabs.findIndex(t => t.name === name.replace('.md', ''));
  if (idx >= 0) {
    _disposeTab(state.tabs[idx]);
    state.tabs.splice(idx, 1);
```

- [ ] **Step 6: Disponer en `_moveFile`**

En `app.js`, dentro de `_moveFile`, reemplazar (líneas 460-462):

```js
  const tabIdx = state.tabs.findIndex(t => t.name === filename.replace('.md', ''));
  if (tabIdx >= 0) {
    state.tabs.splice(tabIdx, 1);
```

por:

```js
  const tabIdx = state.tabs.findIndex(t => t.name === filename.replace('.md', ''));
  if (tabIdx >= 0) {
    _disposeTab(state.tabs[tabIdx]);
    state.tabs.splice(tabIdx, 1);
```

- [ ] **Step 7: Verificación manual**

Recargar la página. Abrir `foto.png`, `son.mp3`, `clip.mp4` en pestañas. Cerrar cada una con su botón de cerrar y con el menú contextual ("Cerrar otras", "Cerrar a la derecha"). Comprobar:
- Cerrar pestañas media no produce errores en consola.
- Abrir otra carpeta con pestañas media abiertas no produce errores.
- Tras abrir y cerrar media repetidamente, la app sigue respondiendo y el resto de pestañas se mantienen.

- [ ] **Step 8: Commit**

```bash
git add app.js
git commit -m "fix: revoke object URLs when closing media tabs"
```

---

## Task 4: Copia binaria-segura en mover y duplicar

Hoy mover/duplicar lee y escribe como texto, lo que corrompe binarios. Esta tarea ramifica para usar blobs en archivos no-texto.

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Copia binaria en `_duplicateFile`**

En `app.js`, reemplazar la función `_duplicateFile` completa (líneas 424-434):

```js
async function _duplicateFile(dirHandle, handle, name) {
  const content = await readFile(handle);
  const dot  = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext  = dot > 0 ? name.slice(dot)    : '';
  const newHandle = await createFile(dirHandle, base + '-copia' + ext);
  await writeFile(newHandle, content);
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
}
```

por:

```js
async function _duplicateFile(dirHandle, handle, name) {
  const data = fileType(name) === 'text' ? await readFile(handle) : await readBlob(handle);
  const dot  = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext  = dot > 0 ? name.slice(dot)    : '';
  const newHandle = await createFile(dirHandle, base + '-copia' + ext);
  await writeFile(newHandle, data);
  state.tree = await buildTree(state.dirHandle);
  state.searchIndex = await buildIndex(state.tree);
  _refreshTree();
}
```

- [ ] **Step 2: Copia binaria en `_moveFile`**

En `app.js`, dentro de `_moveFile`, reemplazar (líneas 456-458):

```js
  const content = await readFile(srcHandle);
  const newHandle = await createFile(targetDirHandle, filename);
  await writeFile(newHandle, content);
```

por:

```js
  const data = fileType(filename) === 'text' ? await readFile(srcHandle) : await readBlob(srcHandle);
  const newHandle = await createFile(targetDirHandle, filename);
  await writeFile(newHandle, data);
```

- [ ] **Step 3: Verificación manual**

Recargar la página. Comprobar:
- Click derecho en `foto.png` → "Duplicar". Aparece `foto-copia.png` en el árbol. Abrirla → se ve la imagen intacta (no corrupta).
- Crear una subcarpeta (click derecho en raíz → "+ Carpeta"), arrastrar `clip.mp4` a esa carpeta, confirmar. Abrir el vídeo movido → reproduce correctamente.
- Duplicar `nota` (texto) → `nota-copia` sigue mostrando el texto correcto (no se rompió el camino de texto).

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "fix: copy non-text files as blobs when moving or duplicating"
```

---

## Notas de cierre

Al terminar las cuatro tareas, actualizar `STATE.md`:
- Nueva fila en **Services**: `Previsualización multimedia | ✅ | Imagen/audio/vídeo/PDF, visor solo-lectura`.
- Entrada en **History** con fecha 2026-06-15 describiendo la clasificación text/media/binary, el visor y la copia binaria-segura.
- Marcar el TODO de previsualización nativa como hecho.

Limitaciones conocidas (no resolver aquí, anotar si se quiere TODO aparte):
- Las pestañas media no se restauran tras recargar (la restauración de pestañas sigue asumiendo `.md`).
- Media corrupto se muestra con el icono de fallo nativo del navegador (sin `onerror`).
