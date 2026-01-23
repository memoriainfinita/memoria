# Requirements: Memoria

**Defined:** 2026-01-23
**Core Value:** Gestión simple y rápida de archivos Markdown locales con navegación intuitiva por carpetas y búsqueda potente

## v1 Requirements

MVP enfocado en gestión de archivos + búsqueda + links básicos. Sin base de datos, sin plugins, sin complejidad.

### File Management

- [ ] **FILE-01**: Usuario puede seleccionar carpeta local en su PC (File System Access API)
- [ ] **FILE-02**: Interfaz muestra árbol de carpetas y archivos anidados (expandible/colapsable)
- [ ] **FILE-03**: Usuario puede crear nuevo archivo .md desde la interfaz (con nombre)
- [ ] **FILE-04**: Usuario puede editar archivo Markdown en editor
- [ ] **FILE-05**: Usuario puede eliminar archivo con confirmación (prevenir accidentes)
- [ ] **FILE-06**: Usuario puede mover/reorganizar archivos entre carpetas (drag-drop)
- [ ] **FILE-07**: Drag-drop de archivos muestra confirmación antes de ejecutar
- [ ] **FILE-08**: Cambios se guardan automáticamente o manual (configurable)
- [ ] **FILE-09**: Al abandonar archivo sin guardar, pregunta "Guardar cambios?" (sí/no/cancelar)
- [ ] **FILE-10**: Usuario puede crear nuevas carpetas desde la interfaz

### Editor & Preview

- [ ] **EDIT-01**: Editor muestra Markdown plain-text (no WYSIWYG)
- [ ] **EDIT-02**: Vista preview muestra Markdown renderizado en tiempo real
- [ ] **EDIT-03**: Usuario puede cambiar entre modo Edit y modo Preview
- [ ] **EDIT-04**: Multi-tab: usuario puede abrir varios archivos simultáneamente
- [ ] **EDIT-05**: Tabs muestran nombre del archivo y indicador si hay cambios sin guardar (*)
- [ ] **EDIT-06**: Cambiar de tab pregunta guardar si hay cambios pendientes
- [ ] **EDIT-07**: Cerrar tab pregunta guardar si hay cambios pendientes
- [ ] **EDIT-08**: Editor soporta syntax highlighting básico para Markdown

### Search & Discovery

- [ ] **SEARCH-01**: Buscador en tiempo real que filtra notas por nombre
- [ ] **SEARCH-02**: Buscador también busca en contenido de archivos (full-text)
- [ ] **SEARCH-03**: Resultados de búsqueda se muestran mientras se escribe
- [ ] **SEARCH-04**: Hacer click en resultado de búsqueda abre ese archivo en tab
- [ ] **SEARCH-05**: Búsqueda es case-insensitive
- [ ] **SEARCH-06**: Limpiar búsqueda vuelve a mostrar árbol completo

### Linking & Navigation

- [ ] **LINK-01**: Usuario puede crear links con sintaxis `[[nombre-nota]]` en el editor
- [ ] **LINK-02**: En preview, links `[[nota]]` son clickeables (navegables)
- [ ] **LINK-03**: Click en link abre esa nota en un nuevo tab
- [ ] **LINK-04**: Si nota referenciada no existe, mostrar "Link roto" en preview
- [ ] **LINK-05**: Mostrar backlinks: "Referenciado por: [[nota-x]], [[nota-y]]" en preview
- [ ] **LINK-06**: Backlinks son clickeables (navegar de vuelta)

### User Interface

- [ ] **UI-01**: Interfaz dark theme minimalista (estilo unix/vim/nano)
- [ ] **UI-02**: Left panel: árbol de archivos/carpetas (ancho ajustable)
- [ ] **UI-03**: Right panel: editor/preview (tabs en top)
- [ ] **UI-04**: Responsive: funciona en móvil (reflow automático)
- [ ] **UI-05**: Tooltips para acciones principales (sin abrumar)
- [ ] **UI-06**: Keyboard shortcuts básicos (Ctrl+S = guardar, Ctrl+F = buscar)
- [ ] **UI-07**: Settings panel: auto-save on/off, intervalo (segundos)

### Performance & Reliability

- [ ] **PERF-01**: App maneja vaults de 100-1000 archivos sin lag perceptible
- [ ] **PERF-02**: Búsqueda full-text es rápida (indexada, no brute-force)
- [ ] **PERF-03**: Cambios se sincronizan con archivo local en tiempo real (sin delay)
- [ ] **PERF-04**: Si archivo es modificado externamente (otro editor), app detecta y pregunta qué hacer

## v2 Requirements

Features consideradas pero fuera de v1 scope.

### Advanced Organization

- **ORG-01**: Tagging system (tags a nivel archivo o dentro de notas)
- **ORG-02**: Filtro por tags
- **ORG-03**: Crear vistas personalizadas (ej: "Todas las notas con #urgent")

### Visualization & Graphs

- **GRAPH-01**: Graph view: visualizar conexiones entre notas
- **GRAPH-02**: Graph es interactive (click para navegar)
- **GRAPH-03**: Filtrar grafo por tags o criterios

### Export & Integration

- **EXPORT-01**: Exportar nota a PDF
- **EXPORT-02**: Exportar nota a HTML
- **EXPORT-03**: Exportar vault completo a archivo comprimido
- **IMPORT-01**: Importar archivos desde otra carpeta
- **SYNC-01**: Sincronización opcional con cloud (Google Drive, Dropbox, etc)

### Version Control & History

- **VCS-01**: Historial de versiones (git-like)
- **VCS-02**: Ver cambios entre versiones
- **VCS-03**: Revertir a versión anterior

### AI & Advanced Features

- **AI-01**: Transcripción local de audio (captura de voz)
- **AI-02**: Búsqueda natural ("Qué aprendí sobre X?")
- **AI-03**: Resúmenes automáticos de notas
- **COLLAB-01**: Sincronización P2P para colaboración local
- **MOBILE-01**: App móvil nativa (no web wrapper)
- **PLUGIN-01**: Plugin ecosystem para extensibilidad

## Out of Scope

| Feature | Reason |
|---------|--------|
| Base de datos propietaria | Portabilidad es core value; solo .md files |
| Colaboración cloud real-time | Local-first primero; P2P en v2+ |
| Encryption | Local storage = inherent privacy; encrypt sync en futuro |
| Web clipper | Diferente workflow; out of focus |
| Markdown WYSIWYG editor | Plain-text + preview es suficiente; WYSIWYG later |
| Comment threads | Colaboración futura; single-user v1 |
| Sharing links | Local-first; no share feature v1 |
| Mobile app | Web-responsive suffice; native app en v2 |
| Plugin ecosystem | Mantener simple; si hay demanda lo consideramos |

## Traceability

Mapeo de requirements a fases del roadmap (completado durante roadmap creation).

| Requirement | Phase | Status |
|-------------|-------|--------|
| FILE-01 to FILE-10 | Phase 1 | Pending |
| EDIT-01 to EDIT-08 | Phase 1-2 | Pending |
| SEARCH-01 to SEARCH-06 | Phase 2 | Pending |
| LINK-01 to LINK-06 | Phase 3 | Pending |
| UI-01 to UI-07 | Phase 1-4 | Pending |
| PERF-01 to PERF-04 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 40 total
- Mapped to phases: TBD
- Unmapped: TBD ⚠️

---

*Requirements defined: 2026-01-23*
*Last updated: 2026-01-23 after initialization*
