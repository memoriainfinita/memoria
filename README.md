# Memoria

Editor de notas y archivos de texto local-first. Sin base de datos, sin servidor, sin instalación. Trabaja directamente con tus archivos.

Compatible con vaults de Obsidian y cualquier carpeta con archivos de texto.

## Características

- Abre cualquier carpeta local — los archivos se leen y escriben directamente en disco
- Árbol de carpetas expandible con subcarpetas anidadas
- Editor con vista previa en tiempo real
- Archivos Markdown: render completo, wiki-links `[[nombre]]`, backlinks, frontmatter YAML ignorado en preview
- Archivos de texto plano y código: se muestran sin procesar, tal cual
- Multi-tab: edita varios archivos a la vez
- Búsqueda por nombre y contenido completo
- Crear, duplicar, eliminar y mover archivos y carpetas desde la interfaz
- Drag & drop para mover archivos entre carpetas y de vuelta a la raíz
- Menú contextual (botón derecho) en archivos y carpetas
- Sidebar redimensionable y ocultable
- Persistencia de sesión: restaura la carpeta y pestañas abiertas al recargar
- Tema personalizable: color de fondo, acento, tipografía y tamaño de texto
- Atajos de teclado configurables desde Ajustes
- Auto-guardar configurable
- Responsive: funciona en móvil

## Formatos soportados

Markdown: `.md` `.markdown` `.mdx`

Texto plano: `.txt` `.text` `.rst` `.org` `.log` `.csv`

Código: `.js` `.ts` `.jsx` `.tsx` `.html` `.htm` `.css` `.scss` `.json` `.yaml` `.yml` `.toml` `.ini` `.xml` `.py` `.sh` `.bat` `.ps1` `.rb` `.php` `.java` `.c` `.cpp` `.h` `.go` `.rs` `.swift` `.kt` `.sql`

## Uso

Requiere un servidor local por la restricción de ES6 modules en Chrome con `file://`.

**Python:**
```bash
cd memoria
python -m http.server 8080
```
Luego abre `http://localhost:8080` en Chrome o Edge.

**Node:**
```bash
npx serve .
```

1. Haz clic en **Abrir carpeta** y selecciona tu carpeta de notas
2. Navega el árbol, abre archivos, edita y guarda
3. Al recargar, la sesión se restaura automáticamente

## Atajos de teclado

| Atajo | Acción |
|-------|--------|
| Ctrl+S | Guardar |
| Ctrl+F | Buscar |
| Ctrl+W | Cerrar pestaña |
| Ctrl+B | Toggle sidebar |
| Ctrl+N | Nuevo archivo |
| Ctrl+E | Alternar editor / vista previa |

Todos los atajos son configurables desde el panel de Ajustes.

## Requisitos

- Chrome o Edge — usa [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API) (no disponible en Firefox)
- Sin npm, sin build step, sin dependencias locales

## Arquitectura

```
index.html          — estructura HTML
app.js              — orquestador: estado global, eventos, atajos, ajustes
style.css           — dark theme con CSS variables
modules/
  fileSystem.js     — File System Access API
  tree.js           — árbol recursivo + drag-drop + menús contextuales
  editor.js         — editor / preview toggle
  tabs.js           — barra de pestañas
  search.js         — búsqueda nombre + full-text
  links.js          — [[wiki-links]] + backlinks + strip frontmatter
  modal.js          — modal propio (reemplaza alert/confirm/prompt)
  contextmenu.js    — menú contextual posicionado en cursor
  persist.js        — IndexedDB para persistencia de sesión
```

ES6 modules sin bundler. `marked` cargado como CDN global.
