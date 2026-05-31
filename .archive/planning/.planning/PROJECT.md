# Memoria

## What This Is

Memoria es un gestor de notas minimalista y local-first para trabajar con archivos Markdown. El usuario elige una carpeta en su PC, y Memoria carga todos los archivos (.md) permitiendo verlos, editarlos, organizarlos en un árbol de carpetas, buscarlos y crear enlaces entre notas—todo sin base de datos, totalmente portable, con UI estilo unix minimalista y responsive.

## Core Value

**Gestión simple y rápida de archivos Markdown locales con navegación intuitiva por carpetas y búsqueda potente, manteniendo los datos bajo control total del usuario.**

## Requirements

### Validated

- ✓ Carga de carpeta local en navegador (File System Access API)
- ✓ Visualización de árbol de archivos/carpetas anidadas
- ✓ Editor Markdown con preview simultáneo
- ✓ Sistema de búsqueda full-text en nombres y contenido

*(Estas capabilities existen en el codebase actual y serán base para la reconstrucción)*

### Active

#### Core Features (MVP v1)

- [ ] Cargar carpeta local y mostrar estructura en árbol anidado
- [ ] Crear nuevos archivos .md desde la interfaz
- [ ] Editar archivos con editor Markdown + live preview
- [ ] Eliminar archivos con confirmación
- [ ] Mover/reorganizar archivos y carpetas (drag-drop + confirmación)
- [ ] Buscar notas por nombre y contenido en tiempo real
- [ ] Crear enlaces `[[nombre-nota]]` que sean navegables en preview
- [ ] Mostrar backlinks: "Referenciado por: [[nota-x]], [[nota-y]]"
- [ ] Multi-tab: abrir varios archivos simultáneamente para comparar/editar
- [ ] Auto-save configurable (on/off, intervalo)
- [ ] Interfaz responsive (desktop + mobile)
- [ ] Tema oscuro minimalista con estética unix/vim/nano

#### Future Considerations (v2+)

- [ ] Exportar notas a otros formatos (PDF, HTML)
- [ ] Historial de versiones (git-like)
- [ ] Graph visualization avanzada
- [ ] AI-powered features (transcripción local, búsqueda NL)
- [ ] Sincronización P2P para colaboración local
- [ ] App móvil nativa (no web wrapper)
- [ ] Plugin ecosystem
- [ ] Soporte para sincronización con cloud (pero local-first)

### Out of Scope

- **Base de datos propietaria** — Solo archivos .md locales; portabilidad es critical
- **Colaboración cloud real-time** — Local-first primero; sync P2P para colaboración futura
- **Graph view complejo** — Backlinks simples suficientes para v1
- **Tagging system** — Folders + búsqueda cubren v1; tags en v2 si se necesita
- **Plugin ecosystem** — Mantener simple; si crece lo consideramos
- **WYSIWYG editor** — Markdown plain-text first (preview existe pero no editor visual)
- **Web clipper** — Captura de web demasiado diferente al core
- **Encryption** — Local-first == offline-safe; encryption en sync futura si needed
- **Multi-usuario colaborativo** — v2+; por ahora persona individual

## Context

### Market Position

Memoria ocupa un espacio único en el landscape 2025:
- **Más simple que Obsidian**: Sin plugins, sin vault config, sin curva de aprendizaje
- **Más poderosa que Bear/Apple Notes**: Links + backlinks + búsqueda avanzada
- **Más ágil que Notion**: Local, portable, no requiere signup
- **Diferente a Logseq**: Tree-first, no journal-first; multi-tab limpio

### User Journey

1. Descarga/abre Memoria
2. Selecciona carpeta de Obsidian (o cualquier carpeta con .md)
3. Ve árbol de carpetas anidadas a la izquierda
4. Hace click en un archivo → abre en tab
5. Lee en preview o cambia a edit
6. Busca notas y hace click en `[[links]]`
7. Guarda (auto o manual) → cambios persisten en archivos
8. Abre Obsidian / editor de texto / o app nueva con mismos archivos

### Competitive Advantages

- **Tree navigation limpia** — Mejor UX que Obsidian para vaults grandes
- **Multi-tab limpio** — Comparar notas fácil (VSCode-like)
- **Drag-drop con confirmación** — Reorganizar carpetas seguro
- **Compatible Obsidian vaults** — Carga vaults existentes sin conversión
- **Responsive out-of-box** — Mobile experience pensada desde v1
- **Zero setup** — Elige carpeta, listo (vs Obsidian que requiere vault + config)
- **Aesthetic unix** — UI minimalista neo-brutalist + estilo vim/nano

## Constraints

- **Tech Stack**: Vanilla JavaScript (ES6+) + HTML5 + CSS3, no frameworks
- **Deployment**: Static web app (serverless); no backend needed
- **Browser Support**: Modern browsers con File System Access API (Chrome, Edge, Firefox)
- **File Format**: Markdown (.md) solamente en v1; otros formatos futura
- **Sync**: Archivo es fuente de verdad; si otro editor modifica mientras Memoria abierto → preguntar al usuario
- **Performance**: Debe manejar vaults de 100-1000 archivos sin lag
- **Portability**: No datos en cloud; todo en archivo local o browser localStorage para settings

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first (no cloud sync v1) | Simplicidad + portabilidad máxima; sync es feature emergente | ✓ Alineado con MVP |
| File System Access API (no IndexedDB) | Usuario ve archivos reales en su PC; no locked in | ✓ Portabilidad garantizada |
| Markdown plain-text (no WYSIWYG) | Todos los editors entienden .md; máxima compatibilidad | ✓ Obsidian-compatible |
| Tree-first navigation | Vaults grandes necesitan exploración visual; search complementa | ✓ Diferenciador vs Notion |
| Multi-tab instead of single-view | Comparar notas es workflow común; tabs familiar (VSCode pattern) | — Pending (validate UX) |
| Auto-save configurable | Algunos quieren manual, otros automático; dejar elegir | ✓ Flexible |
| Backlinks simple (no graph) | Graph es nice-to-have; backlinks list cubren v1 | ✓ MVP scope |
| Responsive from start | Mobile capture-heavy; web-first but mobile-capable | ✓ Competitive advantage |

---

*Last updated: 2026-01-23 after initialization*
