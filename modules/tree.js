import { showConfirm, showPrompt, showAlert } from './modal.js';
import { showContextMenu } from './contextmenu.js';

export function renderTree(rootNode, container, callbacks) {
  container.innerHTML = '';

  const rootZone = document.createElement('div');
  rootZone.className = 'root-drop-zone';
  rootZone.innerHTML = '<span class="root-slash">/ </span><span class="root-name">' + rootNode.handle.name + '</span>';
  rootZone.ondragover  = (e) => { e.preventDefault(); e.stopPropagation(); rootZone.classList.add('drag-over'); };
  rootZone.ondragleave = () => rootZone.classList.remove('drag-over');
  rootZone.ondrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    rootZone.classList.remove('drag-over');
    const filename = e.dataTransfer.getData('text/plain');
    if (filename) callbacks.onMove(filename, rootNode.handle, 'raíz');
  };
  container.appendChild(rootZone);

  for (const child of rootNode.children) {
    container.appendChild(_node(child, rootNode.handle, callbacks));
  }
}

function _node(node, parentDirHandle, cb) {
  const li = document.createElement('li');
  if (node.kind === 'dir') {
    const details = document.createElement('details');
    if (node.expanded) details.open = true;
    details.ontoggle = () => { node.expanded = details.open; };
    const summary = document.createElement('summary');
    summary.textContent = node.name;
    summary.oncontextmenu = async (e) => {
      e.preventDefault();
      await _dirMenu(node.handle, cb, e.clientX, e.clientY);
    };
    summary.ondragover  = (e) => { e.preventDefault(); e.stopPropagation(); summary.style.background = 'var(--accent)'; summary.style.color = 'var(--bg)'; };
    summary.ondragleave = () => { summary.style.background = ''; summary.style.color = ''; };
    summary.ondrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      summary.style.background = '';
      summary.style.color = '';
      const filename = e.dataTransfer.getData('text/plain');
      if (filename) cb.onMove(filename, node.handle, node.name);
    };
    const ul = document.createElement('ul');
    for (const child of node.children) ul.appendChild(_node(child, node.handle, cb));
    details.appendChild(summary);
    details.appendChild(ul);
    li.appendChild(details);
  } else {
    const unsupported = node.type === 'binary';
    const span = document.createElement('span');
    span.className = 'file-item' + (unsupported ? ' file-unsupported' : '');
    span.dataset.filename = node.name;
    span.title = node.name;
    if (unsupported) {
      span.onclick = () => showAlert('Tipo de archivo no soportado: ' + node.name);
    } else {
      span.draggable = true;
      span.ondragstart = (e) => { e.dataTransfer.setData('text/plain', node.name); };
      span.onclick = () => cb.onFileClick(node.handle, node.name.replace('.md', ''));
    }
    span.oncontextmenu = async (e) => {
      e.preventDefault();
      await _fileMenu(node, parentDirHandle, cb, e.clientX, e.clientY);
    };

    const nameEl = document.createElement('span');
    nameEl.className = 'file-name';
    const showExt = localStorage.getItem('show-extensions') === 'true';
    nameEl.textContent = showExt ? node.name : node.name.replace(/\.\w+$/, '');

    span.appendChild(nameEl);
    li.appendChild(span);
  }
  return li;
}

async function _fileMenu(node, parentDirHandle, cb, x, y) {
  const items = node.type === 'binary'
    ? [{ label: 'Eliminar', value: 'delete' }]
    : [{ label: 'Duplicar', value: 'duplicate' }, { label: 'Eliminar', value: 'delete' }];
  const choice = await showContextMenu(x, y, items);
  if (choice === 'duplicate') cb.onDuplicate(parentDirHandle, node.handle, node.name);
  if (choice === 'delete') {
    if (await showConfirm('Eliminar "' + node.name + '"?')) cb.onDelete(parentDirHandle, node.name);
  }
}

async function _dirMenu(dirHandle, cb, x, y) {
  const choice = await showContextMenu(x, y, [
    { label: '+ Archivo .md', value: 'file' },
    { label: '+ Carpeta',     value: 'dir'  },
  ]);
  if (choice === 'file') {
    const name = await showPrompt('Nombre del archivo (sin .md):');
    if (name && name.trim()) cb.onCreateFile(dirHandle, name.trim());
  } else if (choice === 'dir') {
    const name = await showPrompt('Nombre de la carpeta:');
    if (name && name.trim()) cb.onCreateDir(dirHandle, name.trim());
  }
}

export function setActiveFile(container, filename) {
  container.querySelectorAll('.file-item').forEach(el => {
    const isMd = el.dataset.filename === filename + '.md';
    const isOther = !isMd && el.dataset.filename === filename;
    el.classList.toggle('active', isMd);
    el.classList.toggle('active-other', isOther);
  });
}
