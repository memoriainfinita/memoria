let _menu = null;
let _resolve = null;

function _getMenu() {
  if (_menu) return _menu;
  _menu = document.createElement('div');
  _menu.id = 'context-menu';
  document.body.appendChild(_menu);
  document.addEventListener('mousedown', (e) => {
    if (_menu && !_menu.contains(e.target)) _close(null);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') _close(null);
  });
  return _menu;
}

function _close(val) {
  if (_menu) _menu.hidden = true;
  if (_resolve) { _resolve(val); _resolve = null; }
}

export function showContextMenu(x, y, items) {
  const menu = _getMenu();
  menu.innerHTML = '';
  for (const item of items) {
    const btn = document.createElement('button');
    btn.textContent = item.label;
    btn.onclick = () => _close(item.value);
    menu.appendChild(btn);
  }
  menu.hidden = false;
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
  requestAnimationFrame(() => {
    const rect = menu.getBoundingClientRect();
    if (rect.right  > window.innerWidth)  menu.style.left = (x - rect.width)  + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top  = (y - rect.height) + 'px';
  });
  return new Promise(r => { _resolve = r; });
}
