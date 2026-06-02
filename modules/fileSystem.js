export async function selectFolder() {
  return window.showDirectoryPicker();
}

export async function buildTree(dirHandle) {
  return _walk(dirHandle, true);
}

async function _walk(handle, isRoot = false) {
  const node = { name: handle.name, kind: 'dir', handle, children: [], expanded: isRoot };
  for await (const [name, child] of handle.entries()) {
    if (child.kind === 'directory') {
      node.children.push(await _walk(child));
    } else if (/\.(md|markdown|mdx|txt|text|rst|org|html|htm|js|ts|jsx|tsx|css|scss|json|yaml|yml|toml|ini|xml|csv|log|py|sh|bat|ps1|rb|php|java|c|cpp|h|go|rs|swift|kt|sql)$/.test(name)) {
      node.children.push({ name, kind: 'file', handle: child });
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

export async function writeFile(handle, text) {
  const w = await handle.createWritable();
  await w.write(text);
  await w.close();
}

export async function createFile(dirHandle, name) {
  const fname = name.endsWith('.md') ? name : name + '.md';
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
