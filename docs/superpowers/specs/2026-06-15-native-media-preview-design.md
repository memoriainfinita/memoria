---
created: 2026-06-15
status: approved
---

# Native media preview — design

Previsualización nativa de archivos multimedia (imágenes, audio, vídeo, PDF) en modo solo-lectura, dentro de la app Memoria.

## Alcance

Formatos soportados en v1:

- imagen: png, jpg, jpeg, gif, webp, svg, bmp, ico, avif
- audio: mp3, wav, ogg, oga, flac, m4a, aac
- vídeo: mp4, webm, mov, mkv, m4v
- pdf

Fuera de alcance: edición de media, conversión, miniaturas en el árbol, persistencia de pestañas media entre recargas.

## 1. Clasificación de archivos (`fileSystem.js`)

Sustituir el flag binario `supported` por un campo `type` por nodo de archivo:

- `text` — whitelist actual de `isTextFile` + dotfiles + nombres conocidos. Editable.
- `media` — detectado por `isMediaFile()`.
- `binary` — el resto. Comportamiento "no soportado" actual (atenuado, no abre).

El nodo del árbol guarda solo `type`. La subcategoría (`image` | `audio` | `video` | `pdf`) se recalcula desde el nombre en `_openFile` (no se almacena en el nodo).

`buildIndex` / `_indexNode` indexan solo archivos `text`.

## 2. Modelo de pestañas (`app.js`)

Añadir discriminador `tab.type` = `'text'` | `'media'`.

- `text`: estructura actual (`content` string, `isMd`, `dirty`, editable).
- `media`: `content` = `{ url, kind }`, con `url = URL.createObjectURL(file)` y `kind` la subcategoría.

`_openFile` ramifica **antes** de leer el archivo: ya dispone del objeto `File` de `handle.getFile()`. Si el tipo es `media`, calcula `kind` desde el nombre y crea el object URL en vez de hacer `file.text()`.

Funciones con guard para `tab.type === 'media'`:

- `_switchTab` — no llama `getContent()`/`openInEditor()`; pinta el visor.
- `_save`, autosave, `noteContent.oninput`, `_renderPreview`, backlinks — no aplican a media.
- detección de cambio externo (`window.focus`) — omitir para media.
- `_updateSaveBtn` — `saveBtn.disabled = true` para media.

## 3. Render del visor (zona central)

`#preview` se reutiliza para texto y media; `#note-content` (textarea) y `#toggle-view` solo aplican a texto.

Función `_renderMedia(tab)` que construye el elemento en `previewEl` según `kind`:

- `image` → `<img>`, escalado a caber (max-width/height 100%, object-fit contain).
- `video` → `<video controls>`, mismos límites.
- `audio` → `<audio controls>`, centrado.
- `pdf` → `<iframe>` ocupando el panel.

`_switchTab` gestiona la visibilidad explícitamente:

- pestaña media: ocultar `note-content` y `toggle-view`, `preview.style.display = ''`, pintar media.
- pestaña texto: mostrar `toggle-view`; `openInEditor` ya restaura `note-content`/`preview` vía `showPreview`.

CSS: clase contenedora `.media-view` para centrado y límites.

Media ilegible (archivo corrupto): se deja degradar al icono de fallo nativo del navegador. `onerror` con mensaje queda como mejora posterior si molesta.

## 4. Operaciones de fichero binario-seguras

`_moveFile` y `_duplicateFile` hoy hacen `readFile` (texto) + `writeFile` (texto), lo que corrompe binarios.

- `writeFile` no cambia de firma: `createWritable().write()` acepta `Blob`.
- Añadir `readBlob(handle)` que devuelve el `File` directamente.
- En move/duplicate: si el archivo es `media` o `binary`, copiar con blob; si es `text`, copiar con texto como hoy.

Arregla el bug latente de dañar cualquier archivo no-texto al mover/duplicar.

## 5. Ciclo de vida de object URLs

Helper `_disposeTab(tab)`: si `tab.type === 'media'`, llama `URL.revokeObjectURL(tab.content.url)`.

Invocar antes de quitar la pestaña del array en: `_requestClose`, `_closeTabsKeeping`, `_closeAllTabs`, `_deleteFile`, `_moveFile` (cuando la pestaña se cierra).

## Árbol (`tree.js`)

Archivos `media` se tratan como `text` salvo edición: nombre normal (no atenuado), clickables (abren en visor), draggables, menú duplicar + eliminar. Archivos `binary` mantienen el comportamiento "no soportado" actual.

## Persistencia (sin cambios)

No se toca `_restoreTabs` ni `_savePersistState`. Las pestañas media no se restauran tras recargar (su nombre se guarda pero al restaurar busca `name + '.md'`, no la encuentra, y la salta sin error). Comportamiento aceptado.
