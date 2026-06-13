export function renderTabs(container, tabs, activeIdx, onSwitch, onClose, onMenu) {
  container.innerHTML = '';
  tabs.forEach((tab, i) => {
    const div = document.createElement('div');
    div.className = 'tab' + (i === activeIdx ? ' active' : '') + (tab.dirty ? ' dirty' : '');
    div.onclick = () => onSwitch(i);
    div.oncontextmenu = (e) => { e.preventDefault(); onMenu(i, e.clientX, e.clientY); };

    const name = document.createElement('span');
    name.className = 'tab-name';
    name.textContent = tab.name;

    const close = document.createElement('span');
    close.className = 'close-btn';
    close.textContent = '×';
    close.title = 'Cerrar (Ctrl+W)';
    close.onclick = (e) => { e.stopPropagation(); onClose(i); };

    div.appendChild(name);
    div.appendChild(close);
    container.appendChild(div);
  });
}
