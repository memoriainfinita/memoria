export function renderTree(rootNode, container, callbacks) {
  container.innerHTML = '';
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
    summary.oncontextmenu = (e) => {
      e.preventDefault();
      _dirMenu(node.handle, cb);
    };
    // Drop target
    summary.ondragover = (e) => { e.preventDefault(); summary.style.background = 'var(--accent)'; summary.style.color = '#1e1e1e'; };
    summary.ondragleave = () => { summary.style.background = ''; summary.style.color = ''; };
    summary.ondrop = (e) => {
      e.preventDefault();
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
    const span = document.createElement('span');
    span.className = 'file-item';
    span.textContent = node.name.replace('.md', '');
    span.dataset.filename = node.name;
    span.title = node.name;
    span.onclick = () => cb.onFileClick(node.handle, node.name.replace('.md', ''));
    span.oncontextmenu = (e) => {
      e.preventDefault();
      if (confirm('Eliminar "' + node.name + '"?')) cb.onDelete(parentDirHandle, node.name);
    };
    span.draggable = true;
    span.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', node.name);
    };
    li.appendChild(span);
  }
  return li;
}

function _dirMenu(dirHandle, cb) {
  const action = prompt('Crear en esta carpeta:\n1 = archivo .md\n2 = carpeta\n(Enter para cancelar)');
  if (action === '1') {
    const name = prompt('Nombre del archivo (sin .md):');
    if (name && name.trim()) cb.onCreateFile(dirHandle, name.trim());
  } else if (action === '2') {
    const name = prompt('Nombre de la carpeta:');
    if (name && name.trim()) cb.onCreateDir(dirHandle, name.trim());
  }
}

export function setActiveFile(container, filename) {
  container.querySelectorAll('.file-item').forEach(el => {
    el.classList.toggle('active', el.dataset.filename === filename + '.md');
  });
}
