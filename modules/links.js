export function renderLinks(md, allNames, container, onLinkClick, onDblClick) {
  const processed = md.replace(/\[\[(.+?)\]\]/g, (_, name) => {
    const exists = allNames.includes(name);
    const cls = exists ? 'wiki-link' : 'wiki-link broken';
    return `<a href="#" class="${cls}" data-note="${name}">[[${name}]]</a>`;
  });
  container.innerHTML = marked.parse(processed);
  container.querySelectorAll('a.wiki-link:not(.broken)').forEach(a => {
    a.onclick = (e) => { e.preventDefault(); onLinkClick(a.dataset.note); };
  });
  container.ondblclick = (e) => {
    const text = (e.target.innerText || e.target.textContent || '').trim();
    onDblClick(text);
  };
}

export function findBacklinks(name, index) {
  const re = new RegExp('\\[\\[' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\]\\]');
  return index.filter(e => e.name !== name && re.test(e.content)).map(e => e.name);
}

export function renderBacklinks(refs, container, onLinkClick) {
  if (!refs.length) { container.innerHTML = ''; return; }
  container.innerHTML = 'Referencias entrantes: ' + refs.map(n =>
    `<a data-note="${n}">[[${n}]]</a>`
  ).join(' ');
  container.querySelectorAll('a').forEach(a => {
    a.onclick = () => onLinkClick(a.dataset.note);
  });
}
