export async function selectFolder() {
  return window.showDirectoryPicker();
}

function isTextFile(name) {
  if (/\.(md|txt|text|rst|org|html|htm|js|ts|jsx|tsx|css|scss|json|yaml|yml|toml|ini|xml|csv|log|py|sh|bat|ps1|rb|php|java|c|cpp|h|go|rs|swift|kt|sql)$/.test(name)) return true;
  // Dotfiles sin extensión adicional: .gitignore, .env, .bashrc, .npmrc
  if (/^\.[^.]+$/.test(name)) return true;
  // Nombres conocidos sin extensión
  if (/^(dockerfile|makefile|license|readme|changelog|authors|notice)$/i.test(name)) return true;
  return false;
}

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

export async function buildTree(dirHandle) {
  return _walk(dirHandle, true);
}

async function _walk(handle, isRoot = false) {
  const node = { name: handle.name, kind: 'dir', handle, children: [], expanded: isRoot };
  for await (const [name, child] of handle.entries()) {
    if (child.kind === 'directory') {
      node.children.push(await _walk(child));
    } else {
      node.children.push({ name, kind: 'file', handle: child, type: fileType(name) });
    }
  }
  node.children.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return node;
}

export async function readFile(handle) {
  return (await handle.getFile()).text();
}

export async function readBlob(handle) {
  return handle.getFile();
}

export async function writeFile(handle, text) {
  const w = await handle.createWritable();
  await w.write(text);
  await w.close();
}

export async function createFile(dirHandle, name) {
  // Solo añadir .md si el nombre no trae ya una extensión (preserva .js, .txt, etc.)
  const fname = /\.[^.]+$/.test(name) ? name : name + '.md';
  const handle = await dirHandle.getFileHandle(fname, { create: true });
  await writeFile(handle, '');
  return handle;
}

export async function deleteEntry(dirHandle, name) {
  await dirHandle.removeEntry(name, { recursive: true });
}

export async function createDir(dirHandle, name) {
  return dirHandle.getDirectoryHandle(name, { create: true });
}

export async function buildIndex(rootNode) {
  const index = [];
  await _indexNode(rootNode, index);
  return index;
}

async function _indexNode(node, index) {
  if (node.kind === 'file') {
    if (node.type !== 'text') return;
    const content = await readFile(node.handle);
    index.push({ name: node.name.replace(/\.md$/, ''), handle: node.handle, content });
  } else {
    for (const child of node.children) await _indexNode(child, index);
  }
}

export function findHandleInTree(rootNode, filename) {
  if (rootNode.kind === 'file' && rootNode.name === filename) return rootNode.handle;
  if (rootNode.children) {
    for (const child of rootNode.children) {
      const found = findHandleInTree(child, filename);
      if (found) return found;
    }
  }
  return null;
}

export function findDirHandleForFile(rootNode, filename) {
  if (rootNode.kind === 'dir') {
    for (const child of rootNode.children) {
      if (child.kind === 'file' && child.name === filename) return rootNode.handle;
      if (child.kind === 'dir') {
        const found = findDirHandleForFile(child, filename);
        if (found) return found;
      }
    }
  }
  return null;
}
