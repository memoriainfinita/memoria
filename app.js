// Memoria - app web portable para notas Markdown
// Funcionalidad básica: abrir carpeta, listar, editar, guardar y enlazar notas

let notes = [];
let currentHandle = null;
let currentNote = null;

const notesList = document.getElementById('notes-list');
const noteTitle = document.getElementById('note-title');
const noteContent = document.getElementById('note-content');
const saveNoteBtn = document.getElementById('save-note');
const preview = document.getElementById('preview');
const searchInput = document.getElementById('search');
// Eliminado toggleEditorBtn

// Abrir carpeta de notas
async function openFolder() {
  if ('showDirectoryPicker' in window) {
    currentHandle = await window.showDirectoryPicker();
    await listNotes();
  } else {
    alert('Tu navegador no soporta acceso a archivos locales. Usa Chrome o Edge.');
  }
}

document.getElementById('open-folder').onclick = openFolder;

// Listar archivos .md
async function listNotes() {
  notes = [];
  notesList.innerHTML = '';
  for await (const entry of currentHandle.values()) {
    if (entry.kind === 'file' && entry.name.endsWith('.md')) {
      notes.push(entry);
      const item = document.createElement('div');
      item.textContent = entry.name.replace('.md', '');
      item.className = 'note-item';
      item.onclick = () => openNote(entry);
      notesList.appendChild(item);
    }
  }
}

// Abrir nota
async function openNote(fileHandle) {
  const file = await fileHandle.getFile();
  const text = await file.text();
  currentNote = fileHandle;
  noteTitle.value = fileHandle.name.replace('.md', '');
  noteContent.value = text;
  preview.style.display = '';
  noteContent.style.display = 'none';
  renderPreview();
}

// Guardar nota
async function saveNote() {
  if (!currentNote) return;
  const writable = await currentNote.createWritable();
  await writable.write(noteContent.value);
  await writable.close();
  await listNotes();
}

saveNoteBtn.onclick = saveNote;
noteContent.oninput = renderPreview;
// Eliminado toggleEditorBtn.onclick
noteTitle.oninput = () => {
  // Renombrar archivo (no soportado nativamente por File System Access API)
};

// Buscar notas
searchInput.oninput = function() {
  const q = searchInput.value.toLowerCase();
  for (const item of notesList.children) {
    item.style.display = item.textContent.toLowerCase().includes(q) ? '' : 'none';
  }
};

// Renderizar Markdown y enlaces tipo [[nota]]
function renderPreview() {
  let md = noteContent.value.replace(/\[\[(.+?)\]\]/g, (match, p1) => {
    return `<a href=\"#\" class=\"md-link\" data-note=\"${p1}\">[[${p1}]]</a>`;
  });
  preview.innerHTML = marked.parse(md);
  // Enlazar clicks en [[nota]]
  preview.querySelectorAll('.md-link').forEach(link => {
    link.onclick = async (e) => {
      e.preventDefault();
      const name = link.dataset.note;
      const found = notes.find(n => n.name.replace('.md', '') === name);
      if (found) openNote(found);
      else alert('Nota no encontrada: ' + name);
    };
  });

  // Doble clic en el preview: transformar el preview en el editor
  preview.ondblclick = function(e) {
    preview.style.display = 'none';
    noteContent.style.display = '';
    noteContent.focus();
    // Opcional: posicionar el cursor en la línea clicada
    let clickedElem = e.target;
    let clickedText = clickedElem.innerText || clickedElem.textContent || '';
    let allLines = noteContent.value.split('\n');
    let idx = allLines.findIndex(line => line.trim() === clickedText.trim());
    if (idx >= 0) {
      let pos = 0;
      for (let i = 0; i < idx; i++) pos += allLines[i].length + 1;
      noteContent.setSelectionRange(pos, pos);
    }
  };

  // Doble clic en el preview: mostrar editor y posicionar cursor
  preview.ondblclick = function(e) {
    // Obtener el texto clicado
    let clickedElem = e.target;
    // Buscar el texto dentro del elemento clicado
    let clickedText = clickedElem.innerText || clickedElem.textContent || '';
    // Buscar la posición en el texto original
    let allLines = noteContent.value.split('\n');
    let idx = allLines.findIndex(line => line.trim() === clickedText.trim());
    // Mostrar editor y ocultar preview
    noteContent.style.display = '';
    preview.style.display = 'none';
    toggleEditorBtn.textContent = 'Ocultar editor';
    // Posicionar el cursor si se encontró la línea
    if (idx >= 0) {
      let pos = 0;
      for (let i = 0; i < idx; i++) pos += allLines[i].length + 1;
      noteContent.focus();
      noteContent.setSelectionRange(pos, pos);
    } else {
      noteContent.focus();
    }
  };
}
